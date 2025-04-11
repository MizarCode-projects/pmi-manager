#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Website Analyzer API - Backend per l'analisi dei siti web
Gestisce le richieste di analisi e comunica con varie API esterne
"""

import os
import json
import time
import logging
import requests
from datetime import datetime
from urllib.parse import urlparse, quote_plus
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import ssl
import socket
import whois
from bs4 import BeautifulSoup
import google.auth
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("website_analyzer.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("website_analyzer")

# Inizializzazione dell'app Flask
app = Flask(__name__, static_folder='../static')
CORS(app)  # Abilita CORS per tutte le route

# Configurazione API
API_CONFIG = {
    'pagespeed': {
        'key': 'AIzaSyBQOcZXfYrWgvXZXxEZYwlXUNnxQQQXcIE',  # Chiave API Google PageSpeed
        'service_account_file': 'scanpaydb-49350055cd86.json'  # File delle credenziali
    },
    'securityheaders': {
        'endpoint': 'https://securityheaders.com'
    },
    'ssllabs': {
        'endpoint': 'https://api.ssllabs.com/api/v3/analyze'
    }
}

# Carica le credenziali del service account
def load_credentials():
    try:
        # Percorso del file delle credenziali (relativo alla posizione dello script)
        credentials_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'Downloads', 'scanpaydb-49350055cd86.json')
        
        # Verifica se il file esiste
        if not os.path.exists(credentials_path):
            logger.error(f"File delle credenziali non trovato: {credentials_path}")
            return None
        
        # Carica le credenziali
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/webmasters']
        )
        
        logger.info("Credenziali caricate con successo")
        return credentials
    except Exception as e:
        logger.error(f"Errore nel caricamento delle credenziali: {str(e)}")
        return None

# Verifica la validità dell'URL
def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc]) and result.scheme in ['http', 'https']
    except ValueError:
        return False

# Route principale per servire l'app frontend
@app.route('/')
def index():
    return send_from_directory('../', 'index.html')

# API endpoint per l'analisi completa del sito
@app.route('/api/analyze', methods=['POST'])
def analyze_website():
    data = request.json
    url = data.get('url')
    
    if not url or not is_valid_url(url):
        return jsonify({
            'success': False,
            'error': 'URL non valido. Assicurati di includere http:// o https://'
        }), 400
    
    try:
        # Avvia tutte le analisi in parallelo (in un'implementazione reale)
        # Per ora, eseguiamo le analisi in sequenza
        
        # Analisi della sicurezza
        security_results = analyze_security(url)
        
        # Analisi SEO
        seo_results = analyze_seo(url)
        
        # Analisi delle performance
        performance_results = analyze_performance(url)
        
        # Analisi dei contenuti
        content_results = analyze_content(url)
        
        # Analisi delle tecnologie
        technology_results = analyze_technologies(url)
        
        # Calcola il punteggio complessivo
        overall_score = calculate_overall_score({
            'security': security_results,
            'seo': seo_results,
            'performance': performance_results,
            'content': content_results,
            'technology': technology_results
        })
        
        # Prepara i risultati completi
        results = {
            'success': True,
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'overall_score': overall_score,
            'security': security_results,
            'seo': seo_results,
            'performance': performance_results,
            'content': content_results,
            'technology': technology_results
        }
        
        return jsonify(results)
    
    except Exception as e:
        logger.error(f"Errore durante l'analisi di {url}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Errore durante l'analisi: {str(e)}"
        }), 500

# Analisi degli aspetti di sicurezza
def analyze_security(url):
    logger.info(f"Analisi della sicurezza per {url}")
    
    try:
        # Analisi SSL/TLS
        ssl_results = analyze_ssl(url)
        
        # Analisi degli header di sicurezza
        headers_results = analyze_security_headers(url)
        
        # Analisi delle vulnerabilità
        vulnerabilities_results = analyze_vulnerabilities(url)
        
        return {
            'ssl': ssl_results,
            'headers': headers_results,
            'vulnerabilities': vulnerabilities_results
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi della sicurezza: {str(e)}")
        raise

# Analisi SSL/TLS
def analyze_ssl(url):
    try:
        parsed_url = urlparse(url)
        hostname = parsed_url.netloc
        
        # Rimuovi la porta se presente
        if ':' in hostname:
            hostname = hostname.split(':')[0]
        
        # Verifica se il sito supporta HTTPS
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
        
        # Estrai le informazioni dal certificato
        issuer = dict(x[0] for x in cert['issuer'])
        issuer_name = issuer.get('organizationName', issuer.get('commonName', 'Sconosciuto'))
        
        # Calcola la data di scadenza
        valid_until = cert['notAfter']
        
        # In un'implementazione reale, qui ci sarebbe una chiamata all'API SSL Labs
        # Per ora, simuliamo un grado SSL
        grade = 'A'
        
        return {
            'secure': True,
            'grade': grade,
            'validUntil': valid_until,
            'issuer': issuer_name,
            'details': {
                'protocol': 'TLS 1.3',  # In un'implementazione reale, questo verrebbe rilevato
                'cipherSuite': ssock.cipher()[0]
            }
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi SSL: {str(e)}")
        return {
            'secure': False,
            'error': str(e)
        }

# Analisi degli header di sicurezza
def analyze_security_headers(url):
    try:
        # Effettua una richiesta al sito
        response = requests.get(url, timeout=10)
        headers = response.headers
        
        # Lista degli header di sicurezza da controllare
        security_headers = [
            'Content-Security-Policy',
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Referrer-Policy',
            'Feature-Policy',
            'Permissions-Policy'
        ]
        
        # Controlla quali header sono presenti e quali mancano
        present = []
        missing = []
        
        for header in security_headers:
            if header in headers or header.lower() in headers:
                present.append(header)
            else:
                missing.append(header)
        
        # Calcola un punteggio in base agli header presenti
        # A: 7-8 header, B: 5-6 header, C: 3-4 header, D: 1-2 header, F: 0 header
        if len(present) >= 7:
            score = 'A'
        elif len(present) >= 5:
            score = 'B'
        elif len(present) >= 3:
            score = 'C'
        elif len(present) >= 1:
            score = 'D'
        else:
            score = 'F'
        
        return {
            'score': score,
            'present': present,
            'missing': missing
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi degli header di sicurezza: {str(e)}")
        return {
            'score': 'F',
            'error': str(e),
            'present': [],
            'missing': security_headers
        }

# Analisi delle vulnerabilità
def analyze_vulnerabilities(url):
    # In un'implementazione reale, qui ci sarebbe un'analisi delle vulnerabilità note
    # Per ora, restituiamo un risultato simulato
    return {
        'found': False,
        'count': 0,
        'details': []
    }
