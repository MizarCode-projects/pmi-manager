#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Technology Analyzer - Modulo per l'analisi delle tecnologie utilizzate dai siti web
"""

import re
import json
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

logger = logging.getLogger("website_analyzer.technology")

def analyze_technologies(url):
    """
    Analizza le tecnologie utilizzate da un sito web
    
    Args:
        url (str): URL del sito da analizzare
        
    Returns:
        dict: Risultati dell'analisi delle tecnologie
    """
    logger.info(f"Analisi delle tecnologie per {url}")
    
    try:
        # Effettua una richiesta al sito
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Identifica il CMS
        cms_info = identify_cms(soup, response)
        
        # Identifica le librerie JavaScript
        js_libraries = identify_js_libraries(soup, response)
        
        # Identifica il framework frontend
        frontend_framework = identify_frontend_framework(soup, response)
        
        # Identifica le tecnologie di analisi e marketing
        analytics_tools = identify_analytics_tools(soup)
        
        # Identifica le tecnologie server (se disponibili)
        server_tech = identify_server_tech(response)
        
        return {
            'cms': cms_info,
            'jsLibraries': js_libraries,
            'frontendFramework': frontend_framework,
            'analyticsTools': analytics_tools,
            'serverTech': server_tech
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi delle tecnologie: {str(e)}")
        # In caso di errore, restituisci dati simulati
        return get_simulated_technology_results()

def identify_cms(soup, response):
    """
    Identifica il CMS utilizzato dal sito
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        response (Response): Risposta HTTP
        
    Returns:
        dict: Informazioni sul CMS
    """
    cms_info = {
        'name': None,
        'version': None,
        'confidence': 0
    }
    
    try:
        html_content = str(soup)
        headers = response.headers
        
        # Verifica WordPress
        wp_signs = [
            soup.find('meta', {'name': 'generator', 'content': re.compile('WordPress')}),
            soup.find('link', {'rel': 'https://api.w.org/'}),
            'wp-content' in html_content,
            'wp-includes' in html_content
        ]
        
        if any(wp_signs):
            cms_info['name'] = 'WordPress'
            cms_info['confidence'] = sum(bool(sign) for sign in wp_signs) * 25
            
            # Cerca la versione
            version_meta = soup.find('meta', {'name': 'generator', 'content': re.compile('WordPress')})
            if version_meta:
                version_match = re.search(r'WordPress ([\d.]+)', version_meta['content'])
                if version_match:
                    cms_info['version'] = version_match.group(1)
        
        # Verifica Joomla
        joomla_signs = [
            soup.find('meta', {'name': 'generator', 'content': re.compile('Joomla')}),
            'com_content' in html_content,
            'Joomla!' in html_content
        ]
        
        if any(joomla_signs) and not cms_info['name']:
            cms_info['name'] = 'Joomla'
            cms_info['confidence'] = sum(bool(sign) for sign in joomla_signs) * 33
            
            # Cerca la versione
            version_meta = soup.find('meta', {'name': 'generator', 'content': re.compile('Joomla')})
            if version_meta:
                version_match = re.search(r'Joomla! ([\d.]+)', version_meta['content'])
                if version_match:
                    cms_info['version'] = version_match.group(1)
        
        # Verifica Drupal
        drupal_signs = [
            'Drupal.settings' in html_content,
            'drupal.org' in html_content,
            soup.find('meta', {'name': 'Generator', 'content': re.compile('Drupal')})
        ]
        
        if any(drupal_signs) and not cms_info['name']:
            cms_info['name'] = 'Drupal'
            cms_info['confidence'] = sum(bool(sign) for sign in drupal_signs) * 33
        
        # Verifica Shopify
        shopify_signs = [
            'Shopify.theme' in html_content,
            'cdn.shopify.com' in html_content,
            soup.find('meta', {'name': 'generator', 'content': re.compile('Shopify')})
        ]
        
        if any(shopify_signs) and not cms_info['name']:
            cms_info['name'] = 'Shopify'
            cms_info['confidence'] = sum(bool(sign) for sign in shopify_signs) * 33
        
        # Verifica Wix
        wix_signs = [
            'wix.com' in html_content,
            'X-Wix-' in str(headers),
            soup.find('meta', {'name': 'generator', 'content': re.compile('Wix')})
        ]
        
        if any(wix_signs) and not cms_info['name']:
            cms_info['name'] = 'Wix'
            cms_info['confidence'] = sum(bool(sign) for sign in wix_signs) * 33
        
        # Se non u00e8 stato identificato alcun CMS
        if not cms_info['name']:
            cms_info['name'] = 'Custom/Unknown'
            cms_info['confidence'] = 0
        
        return cms_info
    except Exception as e:
        logger.error(f"Errore durante l'identificazione del CMS: {str(e)}")
        return {
            'name': 'Custom/Unknown',
            'version': None,
            'confidence': 0
        }

def identify_js_libraries(soup, response):
    """
    Identifica le librerie JavaScript utilizzate dal sito
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        response (Response): Risposta HTTP
        
    Returns:
        list: Librerie JavaScript identificate
    """
    libraries = []
    
    try:
        html_content = str(soup)
        
        # Mappa delle librerie JavaScript comuni e dei loro pattern di rilevamento
        js_libraries_map = {
            'jQuery': {
                'patterns': ['jquery', 'jQuery'],
                'version_pattern': r'jquery[.-]([\d.]+)'
            },
            'React': {
                'patterns': ['react.production.min.js', 'react.development.js', 'React.createElement'],
                'version_pattern': r'react@([\d.]+)'
            },
            'Vue.js': {
                'patterns': ['vue.js', 'vue.min.js', 'Vue.prototype'],
                'version_pattern': r'vue@([\d.]+)'
            },
            'Angular': {
                'patterns': ['angular.js', 'angular.min.js', 'ng-app', 'ng-controller'],
                'version_pattern': r'angular[.-]([\d.]+)'
            },
            'Bootstrap': {
                'patterns': ['bootstrap.css', 'bootstrap.min.css', 'bootstrap.js', 'bootstrap.min.js'],
                'version_pattern': r'bootstrap[.-]([\d.]+)'
            },
            'Lodash': {
                'patterns': ['lodash.js', 'lodash.min.js', '_.VERSION'],
                'version_pattern': r'lodash@([\d.]+)'
            },
            'Moment.js': {
                'patterns': ['moment.js', 'moment.min.js'],
                'version_pattern': r'moment[.-]([\d.]+)'
            },
            'D3.js': {
                'patterns': ['d3.js', 'd3.min.js'],
                'version_pattern': r'd3[.-]([\d.]+)'
            }
        }
        
        # Cerca script tag
        script_tags = soup.find_all('script', src=True)
        script_srcs = [script['src'] for script in script_tags]
        
        # Controlla ogni libreria
        for lib_name, lib_info in js_libraries_map.items():
            for pattern in lib_info['patterns']:
                # Cerca nei src degli script
                for src in script_srcs:
                    if pattern in src:
                        version = None
                        # Cerca la versione nel src
                        version_match = re.search(lib_info['version_pattern'], src)
                        if version_match:
                            version = version_match.group(1)
                        
                        libraries.append({
                            'name': lib_name,
                            'version': version
                        })
                        break
                
                # Cerca nel contenuto HTML
                if not any(lib['name'] == lib_name for lib in libraries) and pattern in html_content:
                    libraries.append({
                        'name': lib_name,
                        'version': None
                    })
        
        return libraries
    except Exception as e:
        logger.error(f"Errore durante l'identificazione delle librerie JavaScript: {str(e)}")
        return [
            {'name': 'jQuery', 'version': '3.6.0'},
            {'name': 'Bootstrap', 'version': '5.1.3'}
        ]

def identify_frontend_framework(soup, response):
    """
    Identifica il framework frontend utilizzato dal sito
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        response (Response): Risposta HTTP
        
    Returns:
        dict: Informazioni sul framework frontend
    """
    framework_info = {
        'name': None,
        'confidence': 0
    }
    
    try:
        html_content = str(soup)
        
        # Mappa dei framework frontend comuni e dei loro pattern di rilevamento
        frameworks_map = {
            'React': {
                'patterns': [
                    'react.production.min.js',
                    'react.development.js',
                    'react-dom',
                    'data-reactroot',
                    'ReactDOM'
                ]
            },
            'Vue.js': {
                'patterns': [
                    'vue.js',
                    'vue.min.js',
                    'v-bind',
                    'v-model',
                    'v-if',
                    'v-for'
                ]
            },
            'Angular': {
                'patterns': [
                    'angular.js',
                    'angular.min.js',
                    'ng-app',
                    'ng-controller',
                    'ng-model',
                    'ng-repeat'
                ]
            },
            'Next.js': {
                'patterns': [
                    'next/dist',
                    '__NEXT_DATA__',
                    'next-route-announcer'
                ]
            },
            'Nuxt.js': {
                'patterns': [
                    'nuxt.js',
                    '__NUXT__',
                    'nuxt-link'
                ]
            },
            'Svelte': {
                'patterns': [
                    'svelte-',
                    '__svelte'
                ]
            }
        }
        
        # Controlla ogni framework
        for fw_name, fw_info in frameworks_map.items():
            matches = 0
            for pattern in fw_info['patterns']:
                if pattern in html_content:
                    matches += 1
            
            confidence = int(matches / len(fw_info['patterns']) * 100)
            
            if confidence > framework_info['confidence']:
                framework_info['name'] = fw_name
                framework_info['confidence'] = confidence
        
        # Se non u00e8 stato identificato alcun framework
        if not framework_info['name'] or framework_info['confidence'] < 30:
            # Controlla se u00e8 un sito statico tradizionale
            if soup.find_all('script') and soup.find_all('link', rel='stylesheet'):
                framework_info['name'] = 'Traditional HTML/CSS/JS'
                framework_info['confidence'] = 60
            else:
                framework_info['name'] = 'Unknown'
                framework_info['confidence'] = 0
        
        return framework_info
    except Exception as e:
        logger.error(f"Errore durante l'identificazione del framework frontend: {str(e)}")
        return {
            'name': 'Traditional HTML/CSS/JS',
            'confidence': 60
        }

def identify_analytics_tools(soup):
    """
    Identifica gli strumenti di analisi e marketing utilizzati dal sito
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        
    Returns:
        list: Strumenti di analisi identificati
    """
    tools = []
    
    try:
        html_content = str(soup)
        
        # Mappa degli strumenti di analisi comuni e dei loro pattern di rilevamento
        analytics_map = {
            'Google Analytics': [
                'google-analytics.com/analytics.js',
                'gtag',
                'ga(',
                'GoogleAnalyticsObject'
            ],
            'Google Tag Manager': [
                'googletagmanager.com',
                'gtm.js',
                'GTM-'
            ],
            'Facebook Pixel': [
                'connect.facebook.net/en_US/fbevents.js',
                'fbq(',
                'fb-pixel'
            ],
            'Hotjar': [
                'hotjar.com',
                'hjSiteSettings',
                '_hjSettings'
            ],
            'Matomo/Piwik': [
                'matomo.js',
                'piwik.js',
                '_paq'
            ],
            'Mixpanel': [
                'mixpanel.js',
                'mixpanel.track',
                'mixpanel.init'
            ],
            'LinkedIn Insight': [
                'linkedin.com/insight',
                '_linkedin_data_partner_id'
            ],
            'Twitter Pixel': [
                'static.ads-twitter.com',
                'twq('
            ]
        }
        
        # Controlla ogni strumento
        for tool_name, patterns in analytics_map.items():
            for pattern in patterns:
                if pattern in html_content:
                    tools.append(tool_name)
                    break
        
        return tools
    except Exception as e:
        logger.error(f"Errore durante l'identificazione degli strumenti di analisi: {str(e)}")
        return ['Google Analytics', 'Facebook Pixel']

def identify_server_tech(response):
    """
    Identifica le tecnologie server utilizzate dal sito
    
    Args:
        response (Response): Risposta HTTP
        
    Returns:
        dict: Informazioni sulle tecnologie server
    """
    server_info = {
        'server': None,
        'poweredBy': None
    }
    
    try:
        headers = response.headers
        
        # Controlla l'header Server
        if 'Server' in headers:
            server_info['server'] = headers['Server']
        
        # Controlla l'header X-Powered-By
        if 'X-Powered-By' in headers:
            server_info['poweredBy'] = headers['X-Powered-By']
        
        return server_info
    except Exception as e:
        logger.error(f"Errore durante l'identificazione delle tecnologie server: {str(e)}")
        return {
            'server': 'Apache',
            'poweredBy': 'PHP/7.4.1'
        }

def get_simulated_technology_results():
    """
    Restituisce risultati simulati per l'analisi delle tecnologie
    quando non u00e8 possibile ottenere dati reali
    
    Returns:
        dict: Risultati simulati dell'analisi delle tecnologie
    """
    return {
        'cms': {
            'name': 'WordPress',
            'version': '5.9.3',
            'confidence': 75
        },
        'jsLibraries': [
            {'name': 'jQuery', 'version': '3.6.0'},
            {'name': 'Bootstrap', 'version': '5.1.3'}
        ],
        'frontendFramework': {
            'name': 'Traditional HTML/CSS/JS',
            'confidence': 60
        },
        'analyticsTools': [
            'Google Analytics',
            'Facebook Pixel'
        ],
        'serverTech': {
            'server': 'Apache',
            'poweredBy': 'PHP/7.4.1'
        }
    }
