#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PMI Scraper - Script per raccogliere contatti reali di PMI italiane
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import csv
import os
import re
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm

class PMIScraper:
    """
    Classe per lo scraping di contatti di PMI italiane da diverse fonti
    """
    
    def __init__(self, output_file="pmi_contatti_reali.csv"):
        """
        Inizializza lo scraper
        
        Args:
            output_file (str): Percorso del file CSV di output
        """
        self.output_file = output_file
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Referer': 'https://www.google.com/'
        }
        self.session = requests.Session()
        
        # Inizializza il file CSV con le intestazioni
        self.init_csv()
    
    def init_csv(self):
        """
        Inizializza il file CSV con le intestazioni
        """
        if not os.path.exists(self.output_file):
            with open(self.output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'Ragione Sociale', 'Settore', 'Telefono', 'Email', 
                    'Sito Web', 'Indirizzo', 'CAP', 'Città', 'Provincia', 
                    'Descrizione', 'Fonte'
                ])
    
    def save_to_csv(self, aziende):
        """
        Salva i dati delle aziende nel file CSV
        
        Args:
            aziende (list): Lista di dizionari con i dati delle aziende
        """
        if not aziende:
            return
            
        with open(self.output_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            for azienda in aziende:
                writer.writerow([
                    azienda.get('Ragione Sociale', ''),
                    azienda.get('Settore', ''),
                    azienda.get('Telefono', ''),
                    azienda.get('Email', ''),
                    azienda.get('Sito Web', ''),
                    azienda.get('Indirizzo', ''),
                    azienda.get('CAP', ''),
                    azienda.get('Città', ''),
                    azienda.get('Provincia', ''),
                    azienda.get('Descrizione', ''),
                    azienda.get('Fonte', '')
                ])
    
    def extract_email_from_text(self, text):
        """
        Estrae indirizzi email da un testo
        
        Args:
            text (str): Testo da cui estrarre le email
            
        Returns:
            str: Email trovata o stringa vuota
        """
        if not text:
            return ''
            
        email_pattern = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
        match = re.search(email_pattern, text)
        if match:
            return match.group(0)
        return ''
    
    def extract_phone_from_text(self, text):
        """
        Estrae numeri di telefono da un testo
        
        Args:
            text (str): Testo da cui estrarre i numeri
            
        Returns:
            str: Numero di telefono trovato o stringa vuota
        """
        if not text:
            return ''
            
        # Pattern per numeri di telefono italiani
        phone_patterns = [
            r'\+39\s?[0-9]{3}\s?[0-9]{7}',  # +39 123 4567890
            r'\+39\s?[0-9]{2}\s?[0-9]{8}',  # +39 12 34567890
            r'\+39\s?[0-9]{10}',           # +39 1234567890
            r'[0-9]{3}\s?[0-9]{7}',        # 123 4567890
            r'[0-9]{2}\s?[0-9]{8}',        # 12 34567890
            r'[0-9]{10}'                   # 1234567890
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return ''
    
    def scrape_paginegialle(self, settore, località, num_pages=5):
        """
        Scrape Pagine Gialle per contatti di PMI
        
        Args:
            settore (str): Settore di attività
            località (str): Località (città o provincia)
            num_pages (int): Numero di pagine da scrapare
            
        Returns:
            list: Lista di dizionari con i dati delle aziende
        """
        aziende = []
        base_url = "https://www.paginegialle.it/ricerca/{}/{}/p-{}"
        
        print(f"Scraping Pagine Gialle per '{settore}' a '{località}'...")
        
        for page in range(1, num_pages + 1):
            url = base_url.format(settore.replace(' ', '-'), località.replace(' ', '-'), page)
            
            try:
                # Aggiungi un ritardo casuale per evitare di essere bloccati
                time.sleep(random.uniform(2, 5))
                
                response = self.session.get(url, headers=self.headers, timeout=10)
                if response.status_code != 200:
                    print(f"Errore nella richiesta alla pagina {page}: {response.status_code}")
                    continue
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Trova i risultati delle aziende
                results = soup.select('.vcard')
                
                if not results:
                    print(f"Nessun risultato trovato nella pagina {page}")
                    break
                
                for result in results:
                    azienda = {}
                    
                    # Nome azienda
                    name_elem = result.select_one('.org')
                    if name_elem:
                        azienda['Ragione Sociale'] = name_elem.text.strip()
                    else:
                        continue  # Salta se non c'è il nome
                    
                    # Settore
                    azienda['Settore'] = settore
                    
                    # Indirizzo
                    address_elem = result.select_one('.street-address')
                    if address_elem:
                        indirizzo = address_elem.text.strip()
                        azienda['Indirizzo'] = indirizzo
                    
                    # Città
                    city_elem = result.select_one('.locality')
                    if city_elem:
                        azienda['Città'] = city_elem.text.strip()
                    
                    # CAP
                    cap_elem = result.select_one('.postal-code')
                    if cap_elem:
                        azienda['CAP'] = cap_elem.text.strip()
                    
                    # Provincia
                    region_elem = result.select_one('.region')
                    if region_elem:
                        azienda['Provincia'] = region_elem.text.strip()
                    
                    # Telefono
                    phone_elem = result.select_one('.phone-number')
                    if phone_elem:
                        azienda['Telefono'] = phone_elem.text.strip()
                    
                    # Email e sito web - richiede visita alla pagina di dettaglio
                    detail_link = result.select_one('a.btn-details')
                    if detail_link and 'href' in detail_link.attrs:
                        detail_url = urljoin(url, detail_link['href'])
                        
                        try:
                            time.sleep(random.uniform(1, 3))
                            detail_response = self.session.get(detail_url, headers=self.headers, timeout=10)
                            
                            if detail_response.status_code == 200:
                                detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                                
                                # Email
                                email_elem = detail_soup.select_one('.email')
                                if email_elem:
                                    azienda['Email'] = email_elem.text.strip()
                                else:
                                    # Cerca email nel testo
                                    description = detail_soup.select_one('.description')
                                    if description:
                                        azienda['Email'] = self.extract_email_from_text(description.text)
                                
                                # Sito web
                                website_elem = detail_soup.select_one('.website a')
                                if website_elem and 'href' in website_elem.attrs:
                                    azienda['Sito Web'] = website_elem['href']
                                
                                # Descrizione
                                description = detail_soup.select_one('.description')
                                if description:
                                    azienda['Descrizione'] = description.text.strip()
                        
                        except Exception as e:
                            print(f"Errore nel recupero dei dettagli: {e}")
                    
                    azienda['Fonte'] = 'PagineGialle'
                    aziende.append(azienda)
                    
                print(f"Pagina {page}: trovate {len(results)} aziende")
                
            except Exception as e:
                print(f"Errore durante lo scraping della pagina {page}: {e}")
        
        return aziende
    
    def scrape_europages(self, settore, paese="Italia", num_pages=5):
        """
        Scrape Europages per contatti di PMI
        
        Args:
            settore (str): Settore di attività
            paese (str): Paese (default: Italia)
            num_pages (int): Numero di pagine da scrapare
            
        Returns:
            list: Lista di dizionari con i dati delle aziende
        """
        aziende = []
        base_url = "https://www.europages.it/aziende/pg-{}/{}/{}.html"
        
        print(f"Scraping Europages per '{settore}' in '{paese}'...")
        
        for page in range(1, num_pages + 1):
            url = base_url.format(page, paese.lower(), settore.replace(' ', '-'))
            
            try:
                # Aggiungi un ritardo casuale per evitare di essere bloccati
                time.sleep(random.uniform(3, 7))
                
                response = self.session.get(url, headers=self.headers, timeout=15)
                if response.status_code != 200:
                    print(f"Errore nella richiesta alla pagina {page}: {response.status_code}")
                    continue
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Trova i risultati delle aziende
                results = soup.select('.company')
                
                if not results:
                    print(f"Nessun risultato trovato nella pagina {page}")
                    break
                
                for result in results:
                    azienda = {}
                    
                    # Nome azienda
                    name_elem = result.select_one('.company-name')
                    if name_elem:
                        azienda['Ragione Sociale'] = name_elem.text.strip()
                    else:
                        continue  # Salta se non c'è il nome
                    
                    # Settore
                    azienda['Settore'] = settore
                    
                    # Descrizione
                    desc_elem = result.select_one('.company-description')
                    if desc_elem:
                        azienda['Descrizione'] = desc_elem.text.strip()
                    
                    # Indirizzo e città
                    address_elem = result.select_one('.company-address')
                    if address_elem:
                        address_text = address_elem.text.strip()
                        azienda['Indirizzo'] = address_text
                        
                        # Estrai città e provincia
                        city_match = re.search(r'(\d{5})\s+([^,]+)', address_text)
                        if city_match:
                            azienda['CAP'] = city_match.group(1)
                            azienda['Città'] = city_match.group(2).strip()
                    
                    # Dettagli di contatto - richiede visita alla pagina di dettaglio
                    detail_link = result.select_one('.company-name a')
                    if detail_link and 'href' in detail_link.attrs:
                        detail_url = urljoin(url, detail_link['href'])
                        
                        try:
                            time.sleep(random.uniform(2, 5))
                            detail_response = self.session.get(detail_url, headers=self.headers, timeout=15)
                            
                            if detail_response.status_code == 200:
                                detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                                
                                # Telefono
                                phone_elem = detail_soup.select_one('.phone')
                                if phone_elem:
                                    azienda['Telefono'] = phone_elem.text.strip()
                                
                                # Email
                                email_elem = detail_soup.select_one('.email')
                                if email_elem:
                                    azienda['Email'] = email_elem.text.strip()
                                else:
                                    # Cerca email nel testo
                                    page_text = detail_soup.get_text()
                                    azienda['Email'] = self.extract_email_from_text(page_text)
                                
                                # Sito web
                                website_elem = detail_soup.select_one('.website')
                                if website_elem and 'href' in website_elem.attrs:
                                    azienda['Sito Web'] = website_elem['href']
                        
                        except Exception as e:
                            print(f"Errore nel recupero dei dettagli: {e}")
                    
                    azienda['Fonte'] = 'Europages'
                    aziende.append(azienda)
                    
                print(f"Pagina {page}: trovate {len(results)} aziende")
                
            except Exception as e:
                print(f"Errore durante lo scraping della pagina {page}: {e}")
        
        return aziende
    
    def scrape_registro_imprese(self, query, località="", num_pages=3):
        """
        Scrape Registro Imprese per contatti di PMI
        
        Args:
            query (str): Termine di ricerca
            località (str): Località (opzionale)
            num_pages (int): Numero di pagine da scrapare
            
        Returns:
            list: Lista di dizionari con i dati delle aziende
        """
        # Nota: questa è una versione semplificata, il Registro Imprese potrebbe richiedere autenticazione
        aziende = []
        base_url = "https://www.registroimprese.it/ricerca-libera?p_p_id=ricercaportlet_WAR_ricercaRIportlet&index={}&q={}"
        
        if località:
            query = f"{query} {località}"
        
        print(f"Scraping Registro Imprese per '{query}'...")
        
        for page in range(1, num_pages + 1):
            url = base_url.format(page, query.replace(' ', '+'))
            
            try:
                # Aggiungi un ritardo casuale per evitare di essere bloccati
                time.sleep(random.uniform(4, 8))
                
                response = self.session.get(url, headers=self.headers, timeout=15)
                if response.status_code != 200:
                    print(f"Errore nella richiesta alla pagina {page}: {response.status_code}")
                    continue
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Trova i risultati delle aziende
                results = soup.select('.search-result-item')
                
                if not results:
                    print(f"Nessun risultato trovato nella pagina {page}")
                    break
                
                for result in results:
                    azienda = {}
                    
                    # Nome azienda
                    name_elem = result.select_one('.company-name')
                    if name_elem:
                        azienda['Ragione Sociale'] = name_elem.text.strip()
                    else:
                        continue  # Salta se non c'è il nome
                    
                    # Indirizzo
                    address_elem = result.select_one('.company-address')
                    if address_elem:
                        azienda['Indirizzo'] = address_elem.text.strip()
                    
                    # Estrai città e provincia dall'indirizzo
                    if 'Indirizzo' in azienda:
                        city_match = re.search(r'(\d{5})\s+([^(]+)\s*\(([A-Z]{2})\)', azienda['Indirizzo'])
                        if city_match:
                            azienda['CAP'] = city_match.group(1)
                            azienda['Città'] = city_match.group(2).strip()
                            azienda['Provincia'] = city_match.group(3)
                    
                    # Settore
                    sector_elem = result.select_one('.company-sector')
                    if sector_elem:
                        azienda['Settore'] = sector_elem.text.strip()
                    
                    # Dettagli di contatto - richiede visita alla pagina di dettaglio
                    detail_link = result.select_one('a.company-details')
                    if detail_link and 'href' in detail_link.attrs:
                        detail_url = urljoin(url, detail_link['href'])
                        
                        try:
                            time.sleep(random.uniform(3, 6))
                            detail_response = self.session.get(detail_url, headers=self.headers, timeout=15)
                            
                            if detail_response.status_code == 200:
                                detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                                
                                # Telefono
                                phone_elem = detail_soup.select_one('.phone')
                                if phone_elem:
                                    azienda['Telefono'] = phone_elem.text.strip()
                                else:
                                    # Cerca telefono nel testo
                                    page_text = detail_soup.get_text()
                                    azienda['Telefono'] = self.extract_phone_from_text(page_text)
                                
                                # Email
                                email_elem = detail_soup.select_one('.email')
                                if email_elem:
                                    azienda['Email'] = email_elem.text.strip()
                                else:
                                    # Cerca email nel testo
                                    page_text = detail_soup.get_text()
                                    azienda['Email'] = self.extract_email_from_text(page_text)
                                
                                # Sito web
                                website_elem = detail_soup.select_one('.website')
                                if website_elem and 'href' in website_elem.attrs:
                                    azienda['Sito Web'] = website_elem['href']
                                
                                # Descrizione
                                desc_elem = detail_soup.select_one('.company-description')
                                if desc_elem:
                                    azienda['Descrizione'] = desc_elem.text.strip()
                        
                        except Exception as e:
                            print(f"Errore nel recupero dei dettagli: {e}")
                    
                    azienda['Fonte'] = 'Registro Imprese'
                    aziende.append(azienda)
                    
                print(f"Pagina {page}: trovate {len(results)} aziende")
                
            except Exception as e:
                print(f"Errore durante lo scraping della pagina {page}: {e}")
        
        return aziende
    
    def run_scraping(self, sources=None):
        """
        Esegue lo scraping da tutte le fonti configurate
        
        Args:
            sources (dict): Dizionario con le configurazioni per le fonti
        """
        if sources is None:
            # Configurazione predefinita
            sources = {
                'paginegialle': [
                    {'settore': 'informatica', 'località': 'milano'},
                    {'settore': 'meccanica', 'località': 'torino'},
                    {'settore': 'elettronica', 'località': 'roma'}
                ],
                'europages': [
                    {'settore': 'software', 'paese': 'Italia'},
                    {'settore': 'automazione industriale', 'paese': 'Italia'}
                ],
                'registro_imprese': [
                    {'query': 'pmi tecnologia', 'località': 'milano'},
                    {'query': 'startup innovativa', 'località': ''}
                ]
            }
        
        total_aziende = 0
        
        # Scraping da Pagine Gialle
        if 'paginegialle' in sources:
            for config in sources['paginegialle']:
                aziende = self.scrape_paginegialle(
                    settore=config['settore'],
                    località=config['località'],
                    num_pages=config.get('num_pages', 3)
                )
                self.save_to_csv(aziende)
                total_aziende += len(aziende)
                print(f"Salvate {len(aziende)} aziende da PagineGialle per {config['settore']} a {config['località']}")
                
                # Pausa tra le ricerche
                time.sleep(random.uniform(5, 10))
        
        # Scraping da Europages
        if 'europages' in sources:
            for config in sources['europages']:
                aziende = self.scrape_europages(
                    settore=config['settore'],
                    paese=config.get('paese', 'Italia'),
                    num_pages=config.get('num_pages', 3)
                )
                self.save_to_csv(aziende)
                total_aziende += len(aziende)
                print(f"Salvate {len(aziende)} aziende da Europages per {config['settore']} in {config.get('paese', 'Italia')}")
                
                # Pausa tra le ricerche
                time.sleep(random.uniform(5, 10))
        
        # Scraping da Registro Imprese
        if 'registro_imprese' in sources:
            for config in sources['registro_imprese']:
                aziende = self.scrape_registro_imprese(
                    query=config['query'],
                    località=config.get('località', ''),
                    num_pages=config.get('num_pages', 3)
                )
                self.save_to_csv(aziende)
                total_aziende += len(aziende)
                print(f"Salvate {len(aziende)} aziende da Registro Imprese per {config['query']}")
                
                # Pausa tra le ricerche
                time.sleep(random.uniform(5, 10))
        
        print(f"\nScraping completato. Totale aziende raccolte: {total_aziende}")
        print(f"I dati sono stati salvati in: {self.output_file}")


def main():
    """
    Funzione principale
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Scraper per contatti di PMI italiane')
    parser.add_argument('--output', default='pmi_contatti_reali.csv', help='File di output (CSV)')
    parser.add_argument('--settore', default='informatica', help='Settore da cercare su PagineGialle')
    parser.add_argument('--localita', default='milano', help='Località da cercare su PagineGialle')
    parser.add_argument('--pagine', type=int, default=3, help='Numero di pagine da scrapare per fonte')
    
    args = parser.parse_args()
    
    scraper = PMIScraper(output_file=args.output)
    
    # Configura le fonti
    sources = {
        'paginegialle': [
            {'settore': args.settore, 'località': args.localita, 'num_pages': args.pagine}
        ],
        'europages': [
            {'settore': args.settore, 'paese': 'Italia', 'num_pages': args.pagine}
        ]
    }
    
    scraper.run_scraping(sources)


if __name__ == "__main__":
    main()
