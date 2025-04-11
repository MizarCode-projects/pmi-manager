#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
API per lo scraping di contatti PMI italiane
"""

from flask import Flask, request, jsonify, send_from_directory
import os
import sys
import json
import csv
from datetime import datetime
import logging
import threading
import argparse

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_scraping.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("API_Scraping")

# Importa lo script di scraping reale
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from pmi_scraper_reale import PMIScraper

app = Flask(__name__, static_folder='.')

# Variabile globale per tenere traccia dello stato dello scraping
scraping_status = {
    "in_progress": False,
    "completed": False,
    "results": [],
    "error": None,
    "progress": 0
}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/scrape', methods=['POST'])
def scrape_companies():
    """
    Endpoint per lo scraping di contatti PMI italiane
    """
    global scraping_status
    
    try:
        data = request.json
        
        # Parametri di ricerca
        settore = data.get('settore', '')
        localita = data.get('localita', '')
        num_pages = int(data.get('num_pages', 3))
        
        # Resetta lo stato dello scraping
        scraping_status = {
            "in_progress": True,
            "completed": False,
            "results": [],
            "error": None,
            "progress": 0
        }
        
        # Avvia lo scraping in un thread separato
        thread = threading.Thread(target=run_scraping, args=(settore, localita, num_pages))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Scraping avviato'
        })
    
    except Exception as e:
        logger.error(f"Errore durante l'avvio dello scraping: {str(e)}")
        scraping_status["error"] = str(e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/scrape/status', methods=['GET'])
def get_scrape_status():
    """
    Endpoint per controllare lo stato dello scraping
    """
    global scraping_status
    
    return jsonify({
        'in_progress': scraping_status["in_progress"],
        'completed': scraping_status["completed"],
        'count': len(scraping_status["results"]),
        'results': scraping_status["results"],
        'error': scraping_status["error"],
        'progress': scraping_status["progress"]
    })

def run_scraping(settore, localita, num_pages):
    """
    Esegue lo scraping in un thread separato
    """
    global scraping_status
    
    try:
        # Nome file di output temporaneo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"temp_results_{timestamp}.csv"
        
        # Inizializza lo scraper
        scraper = PMIScraper(output_file=output_file)
        
        # Configura le fonti di dati
        sources = {
            'paginegialle': [
                {'settore': settore, 'località': localita, 'num_pages': num_pages}
            ]
        }
        
        # Aggiungi Europages solo se il settore è specificato
        if settore:
            sources['europages'] = [
                {'settore': settore, 'paese': 'Italia', 'num_pages': num_pages}
            ]
        
        # Esegui lo scraping
        scraper.run_scraping(sources)
        
        # Leggi i risultati dal file CSV
        results = []
        if os.path.exists(output_file):
            with open(output_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Converti il formato dei dati per adattarsi all'interfaccia
                    company = {
                        'Ragione Sociale': row.get('Ragione Sociale', ''),
                        'Settore': row.get('Settore', ''),
                        'Email': row.get('Email', ''),
                        'Telefono': row.get('Telefono', ''),
                        'Indirizzo': row.get('Indirizzo', ''),
                        'Città': row.get('Città', ''),
                        'Provincia': row.get('Provincia', ''),
                        'CAP': row.get('CAP', ''),
                        'Sito Web': row.get('Sito Web', ''),
                        'Descrizione': row.get('Descrizione', ''),
                        'Dipendenti': '',
                        'Fatturato': '',
                        'Stato': 'Non contattato',
                        'Data Ultimo Contatto': '',
                        'Note': f"Importato da {row.get('Fonte', '')} il {datetime.now().strftime('%d/%m/%Y')}"
                    }
                    results.append(company)
        
        # Aggiorna lo stato dello scraping
        scraping_status["in_progress"] = False
        scraping_status["completed"] = True
        scraping_status["results"] = results
        scraping_status["progress"] = 100
        
        logger.info(f"Scraping completato con successo. Trovate {len(results)} aziende.")
    
    except Exception as e:
        logger.error(f"Errore durante lo scraping: {str(e)}")
        scraping_status["in_progress"] = False
        scraping_status["error"] = str(e)

if __name__ == '__main__':
    import argparse
    
    # Configura il parser degli argomenti
    parser = argparse.ArgumentParser(description='API per lo scraping di contatti PMI italiane')
    parser.add_argument('--port', type=int, default=5000, help='Porta su cui avviare il server (default: 5000)')
    
    # Parsa gli argomenti
    args = parser.parse_args()
    
    # Avvia il server sulla porta specificata
    app.run(debug=True, port=args.port)
