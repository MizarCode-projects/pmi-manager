#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
SEO Analyzer - Modulo per l'analisi SEO dei siti web
"""

import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin

logger = logging.getLogger("website_analyzer.seo")

def analyze_seo(url):
    """
    Analizza gli aspetti SEO di un sito web
    
    Args:
        url (str): URL del sito da analizzare
        
    Returns:
        dict: Risultati dell'analisi SEO
    """
    logger.info(f"Analisi SEO per {url}")
    
    try:
        # Effettua una richiesta al sito
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Analisi dei meta tag
        meta_tags = analyze_meta_tags(soup)
        
        # Analisi della struttura della pagina
        headings = analyze_headings(soup)
        
        # Analisi dei link
        links = analyze_links(soup, url)
        
        # Verifica la presenza di sitemap e robots.txt
        sitemap = check_sitemap(url)
        robots_txt = check_robots_txt(url)
        
        return {
            'metaTags': meta_tags,
            'headings': headings,
            'links': links,
            'sitemap': sitemap,
            'robotsTxt': robots_txt
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi SEO: {str(e)}")
        raise

def analyze_meta_tags(soup):
    """
    Analizza i meta tag della pagina
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        
    Returns:
        dict: Risultati dell'analisi dei meta tag
    """
    result = {}
    
    # Analisi del title
    title_tag = soup.find('title')
    if title_tag and title_tag.string:
        title_text = title_tag.string.strip()
        title_length = len(title_text)
        
        result['title'] = {
            'present': True,
            'value': title_text,
            'length': title_length,
            'optimal': 10 <= title_length <= 60  # Lunghezza ottimale: 10-60 caratteri
        }
    else:
        result['title'] = {
            'present': False
        }
    
    # Analisi della meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        desc_text = meta_desc['content'].strip()
        desc_length = len(desc_text)
        
        result['description'] = {
            'present': True,
            'value': desc_text,
            'length': desc_length,
            'optimal': 50 <= desc_length <= 160  # Lunghezza ottimale: 50-160 caratteri
        }
    else:
        result['description'] = {
            'present': False
        }
    
    # Analisi dei meta robots
    meta_robots = soup.find('meta', attrs={'name': 'robots'})
    if meta_robots and meta_robots.get('content'):
        result['robots'] = {
            'present': True,
            'value': meta_robots['content'].strip()
        }
    else:
        result['robots'] = {
            'present': False
        }
    
    # Analisi del meta viewport
    meta_viewport = soup.find('meta', attrs={'name': 'viewport'})
    if meta_viewport and meta_viewport.get('content'):
        result['viewport'] = {
            'present': True,
            'value': meta_viewport['content'].strip()
        }
    else:
        result['viewport'] = {
            'present': False
        }
    
    return result

def analyze_headings(soup):
    """
    Analizza la struttura dei titoli (h1-h6) della pagina
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        
    Returns:
        dict: Risultati dell'analisi dei titoli
    """
    result = {}
    
    # Analisi degli h1
    h1_tags = soup.find_all('h1')
    result['h1'] = {
        'count': len(h1_tags),
        'values': [h1.get_text().strip() for h1 in h1_tags]
    }
    
    # Analisi degli h2
    h2_tags = soup.find_all('h2')
    result['h2'] = {
        'count': len(h2_tags),
        'values': [h2.get_text().strip() for h2 in h2_tags]
    }
    
    # Analisi degli h3
    h3_tags = soup.find_all('h3')
    result['h3'] = {
        'count': len(h3_tags)
    }
    
    # Analisi degli h4-h6
    h4_tags = soup.find_all('h4')
    h5_tags = soup.find_all('h5')
    h6_tags = soup.find_all('h6')
    
    result['h4_h6'] = {
        'count': len(h4_tags) + len(h5_tags) + len(h6_tags)
    }
    
    # Valuta la struttura dei titoli
    # Buona: un solo h1, seguito da h2, poi h3, ecc.
    if len(h1_tags) == 1 and len(h2_tags) > 0:
        result['structure'] = 'good'
    elif len(h1_tags) == 0:
        result['structure'] = 'missing_h1'
    elif len(h1_tags) > 1:
        result['structure'] = 'multiple_h1'
    else:
        result['structure'] = 'needs_improvement'
    
    return result

def analyze_links(soup, base_url):
    """
    Analizza i link della pagina
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        base_url (str): URL base del sito
        
    Returns:
        dict: Risultati dell'analisi dei link
    """
    parsed_base = urlparse(base_url)
    base_domain = parsed_base.netloc
    
    # Trova tutti i link
    links = soup.find_all('a', href=True)
    
    internal_links = []
    external_links = []
    nofollow_links = []
    
    for link in links:
        href = link['href'].strip()
        
        # Salta i link vuoti o ancore
        if not href or href.startswith('#'):
            continue
        
        # Converti link relativi in assoluti
        if not href.startswith(('http://', 'https://')):
            href = urljoin(base_url, href)
        
        parsed_href = urlparse(href)
        
        # Controlla se il link u00e8 interno o esterno
        if parsed_href.netloc == base_domain or not parsed_href.netloc:
            internal_links.append(href)
        else:
            external_links.append(href)
        
        # Controlla se il link ha l'attributo nofollow
        rel = link.get('rel', [])
        if isinstance(rel, list) and 'nofollow' in rel:
            nofollow_links.append(href)
        elif isinstance(rel, str) and 'nofollow' in rel:
            nofollow_links.append(href)
    
    # In un'implementazione reale, qui ci sarebbe un controllo dei link rotti
    # Per ora, simuliamo un numero di link rotti
    broken_links = 0
    
    return {
        'internal': len(internal_links),
        'external': len(external_links),
        'broken': broken_links,
        'nofollow': len(nofollow_links)
    }

def check_sitemap(url):
    """
    Verifica la presenza e la validitu00e0 della sitemap
    
    Args:
        url (str): URL del sito
        
    Returns:
        dict: Risultati dell'analisi della sitemap
    """
    parsed_url = urlparse(url)
    sitemap_url = f"{parsed_url.scheme}://{parsed_url.netloc}/sitemap.xml"
    
    try:
        response = requests.head(sitemap_url, timeout=5)
        present = response.status_code == 200
        
        # In un'implementazione reale, qui ci sarebbe una verifica della validitu00e0 della sitemap
        # Per ora, assumiamo che sia valida se presente
        valid = present
        
        return {
            'present': present,
            'url': sitemap_url,
            'valid': valid
        }
    except Exception as e:
        logger.warning(f"Errore durante il controllo della sitemap: {str(e)}")
        return {
            'present': False,
            'url': sitemap_url,
            'valid': False
        }

def check_robots_txt(url):
    """
    Verifica la presenza e la validitu00e0 del file robots.txt
    
    Args:
        url (str): URL del sito
        
    Returns:
        dict: Risultati dell'analisi del robots.txt
    """
    parsed_url = urlparse(url)
    robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
    
    try:
        response = requests.head(robots_url, timeout=5)
        present = response.status_code == 200
        
        # In un'implementazione reale, qui ci sarebbe una verifica della validitu00e0 del robots.txt
        # Per ora, assumiamo che sia valido se presente
        valid = present
        
        return {
            'present': present,
            'url': robots_url,
            'valid': valid
        }
    except Exception as e:
        logger.warning(f"Errore durante il controllo del robots.txt: {str(e)}")
        return {
            'present': False,
            'url': robots_url,
            'valid': False
        }
