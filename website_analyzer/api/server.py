#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Website Analyzer API Server
Avvia il server Flask per l'API di analisi dei siti web
"""

import os
import sys
import logging
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Aggiungi la directory corrente al path di sistema
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importa i moduli di analisi
from analyzer_api import app, analyze_website
from seo_analyzer import analyze_seo
from performance_analyzer import analyze_performance
from content_analyzer import analyze_content
from technology_analyzer import analyze_technologies

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("website_analyzer.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("website_analyzer.server")

# Endpoint per verificare lo stato del server
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'version': '1.0.0',
        'endpoints': [
            '/api/analyze',
            '/api/status'
        ]
    })

# Endpoint per servire file statici
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../', path)

# Avvio del server
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Avvio del server Website Analyzer API sulla porta {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
