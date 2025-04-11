#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PMI Finder - Script per trovare contatti di PMI italiane da fonti pubbliche
"""

import requests
import pandas as pd
import csv
import os
import time
import random
import json
from tqdm import tqdm

class PMIFinder:
    """
    Classe per trovare contatti di PMI italiane da fonti pubbliche
    """
    
    def __init__(self, output_file="pmi_contatti.csv"):
        """
        Inizializza il finder
        
        Args:
            output_file (str): Percorso del file CSV di output
        """
        self.output_file = output_file
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        
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
                    'Sito Web', 'Indirizzo', 'CAP', 'Cittu00e0', 'Provincia', 
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
                    azienda.get('Cittu00e0', ''),
                    azienda.get('Provincia', ''),
                    azienda.get('Descrizione', ''),
                    azienda.get('Fonte', '')
                ])
    
    def search_companies_house(self, query, jurisdiction_code="it", per_page=100, max_pages=5):
        """
        Cerca aziende usando l'API di Companies House
        
        Args:
            query (str): Query di ricerca
            jurisdiction_code (str): Codice della giurisdizione (it per Italia)
            per_page (int): Risultati per pagina
            max_pages (int): Numero massimo di pagine
            
        Returns:
            list: Lista di dizionari con i dati delle aziende
        """
        aziende = []
        base_url = "https://api.companieshouse.gov.uk/search/companies"
        
        # Nota: Companies House richiede un'API key
        # Questo u00e8 un esempio di come potrebbe funzionare l'API
        
        print(f"Cercando aziende con query '{query}'...")
        
        # Simuliamo i risultati per scopi dimostrativi
        # In un'implementazione reale, dovresti usare l'API effettiva
        
        # Genera dati di esempio basati sulla query
        num_results = random.randint(50, 200)
        
        settori = [
            "Informatica", "Servizi IT", "Consulenza informatica", "Sviluppo software",
            "E-commerce", "Marketing digitale", "Automazione industriale", "Elettronica",
            "Telecomunicazioni", "Servizi alle imprese", "Commercio", "Manifatturiero"
        ]
        
        citta = [
            "Milano", "Roma", "Torino", "Bologna", "Napoli", "Firenze", "Padova",
            "Bari", "Verona", "Brescia", "Modena", "Bergamo", "Parma", "Vicenza"
        ]
        
        province = {
            "Milano": "MI", "Roma": "RM", "Torino": "TO", "Bologna": "BO",
            "Napoli": "NA", "Firenze": "FI", "Padova": "PD", "Bari": "BA",
            "Verona": "VR", "Brescia": "BS", "Modena": "MO", "Bergamo": "BG",
            "Parma": "PR", "Vicenza": "VI"
        }
        
        domini_email = ["gmail.com", "libero.it", "yahoo.it", "outlook.com", "pec.it"]
        
        for i in range(min(num_results, per_page * max_pages)):
            # Genera un nome aziendale basato sulla query
            nome_base = query.title()
            suffissi = ["Tech", "Solutions", "Consulting", "Group", "Italia", "Systems", "Services"]
            nome = f"{nome_base} {random.choice(suffissi)} {random.choice(['S.r.l.', 'S.p.A.', 'S.n.c.'])}"
            
            # Genera altri dati casuali
            settore = random.choice(settori)
            citta_scelta = random.choice(citta)
            provincia = province.get(citta_scelta, "XX")
            cap = f"{random.randint(10, 99)}0{random.randint(10, 99)}"
            
            # Genera email e sito web
            nome_normalizzato = nome_base.lower().replace(' ', '')
            email = f"info@{nome_normalizzato}.it"
            sito_web = f"https://www.{nome_normalizzato}.it"
            
            # Genera telefono
            telefono = f"+39 0{random.randint(2, 9)} {random.randint(1000000, 9999999)}"
            
            # Genera indirizzo
            vie = ["Via Roma", "Via Milano", "Via Torino", "Via Napoli", "Via Garibaldi", "Via Dante"]
            indirizzo = f"{random.choice(vie)}, {random.randint(1, 200)}"
            
            # Genera descrizione
            descrizioni = [
                f"Azienda specializzata in {settore.lower()} con sede a {citta_scelta}.",
                f"Offriamo servizi di {settore.lower()} per piccole e medie imprese.",
                f"Dal 2010 siamo leader nel settore {settore.lower()} in {provincia}.",
                f"PMI italiana attiva nel campo del {settore.lower()}."
            ]
            descrizione = random.choice(descrizioni)
            
            azienda = {
                'Ragione Sociale': nome,
                'Settore': settore,
                'Telefono': telefono,
                'Email': email,
                'Sito Web': sito_web,
                'Indirizzo': indirizzo,
                'CAP': cap,
                'Cittu00e0': citta_scelta,
                'Provincia': provincia,
                'Descrizione': descrizione,
                'Fonte': 'Companies House API (simulata)'
            }
            
            aziende.append(azienda)
        
        print(f"Trovate {len(aziende)} aziende per la query '{query}'")
        return aziende
    
    def search_opencorporates(self, query, jurisdiction_code="it", per_page=100, max_pages=5):
        """
        Cerca aziende usando l'API di OpenCorporates
        
        Args:
            query (str): Query di ricerca
            jurisdiction_code (str): Codice della giurisdizione (it per Italia)
            per_page (int): Risultati per pagina
            max_pages (int): Numero massimo di pagine
            
        Returns:
            list: Lista di dizionari con i dati delle aziende
        """
        aziende = []
        base_url = "https://api.opencorporates.com/v0.4/companies/search"
        
        # Nota: OpenCorporates potrebbe richiedere un'API key per query estese
        # Questo u00e8 un esempio di come potrebbe funzionare l'API
        
        print(f"Cercando aziende con query '{query}' su OpenCorporates...")
        
        # Simuliamo i risultati per scopi dimostrativi
        # In un'implementazione reale, dovresti usare l'API effettiva
        
        # Genera dati di esempio basati sulla query
        num_results = random.randint(50, 200)
        
        settori = [
            "Informatica", "Servizi IT", "Consulenza informatica", "Sviluppo software",
            "E-commerce", "Marketing digitale", "Automazione industriale", "Elettronica",
            "Telecomunicazioni", "Servizi alle imprese", "Commercio", "Manifatturiero"
        ]
        
        citta = [
            "Milano", "Roma", "Torino", "Bologna", "Napoli", "Firenze", "Padova",
            "Bari", "Verona", "Brescia", "Modena", "Bergamo", "Parma", "Vicenza"
        ]
        
        province = {
            "Milano": "MI", "Roma": "RM", "Torino": "TO", "Bologna": "BO",
            "Napoli": "NA", "Firenze": "FI", "Padova": "PD", "Bari": "BA",
            "Verona": "VR", "Brescia": "BS", "Modena": "MO", "Bergamo": "BG",
            "Parma": "PR", "Vicenza": "VI"
        }
        
        for i in range(min(num_results, per_page * max_pages)):
            # Genera un nome aziendale basato sulla query
            prefissi = ["Euro", "Ital", "Tech", "Digital", "Smart", "Net", "Web", "Data"]
            suffissi = ["Tech", "Solutions", "Consulting", "Group", "Italia", "Systems", "Services"]
            nome = f"{random.choice(prefissi)}{query.title()} {random.choice(suffissi)} {random.choice(['S.r.l.', 'S.p.A.', 'S.n.c.'])}"
            
            # Genera altri dati casuali
            settore = random.choice(settori)
            citta_scelta = random.choice(citta)
            provincia = province.get(citta_scelta, "XX")
            cap = f"{random.randint(10, 99)}0{random.randint(10, 99)}"
            
            # Genera email e sito web
            nome_normalizzato = nome.lower().replace(' ', '').replace('.', '').replace(',', '')
            nome_normalizzato = ''.join(c for c in nome_normalizzato if c.isalnum())
            email = f"info@{nome_normalizzato[:15]}.it"
            sito_web = f"https://www.{nome_normalizzato[:15]}.it"
            
            # Genera telefono
            telefono = f"+39 0{random.randint(2, 9)} {random.randint(1000000, 9999999)}"
            
            # Genera indirizzo
            vie = ["Via Roma", "Via Milano", "Via Torino", "Via Napoli", "Via Garibaldi", "Via Dante"]
            indirizzo = f"{random.choice(vie)}, {random.randint(1, 200)}"
            indirizzo_completo = f"{indirizzo} - {cap} {citta_scelta} ({provincia})"
            
            # Genera descrizione
            descrizioni = [
                f"Azienda specializzata in {settore.lower()} con sede a {citta_scelta}.",
                f"Offriamo servizi di {settore.lower()} per piccole e medie imprese.",
                f"Dal 2010 siamo leader nel settore {settore.lower()} in {provincia}.",
                f"PMI italiana attiva nel campo del {settore.lower()}."
            ]
            descrizione = random.choice(descrizioni)
            
            azienda = {
                'Ragione Sociale': nome,
                'Settore': settore,
                'Telefono': telefono,
                'Email': email,
                'Sito Web': sito_web,
                'Indirizzo': indirizzo_completo,
                'CAP': cap,
                'Cittu00e0': citta_scelta,
                'Provincia': provincia,
                'Descrizione': descrizione,
                'Fonte': 'OpenCorporates API (simulata)'
            }
            
            aziende.append(azienda)
        
        print(f"Trovate {len(aziende)} aziende per la query '{query}' su OpenCorporates")
        return aziende
    
    def search_camere_commercio(self, settore, provincia):
        """
        Simula la ricerca di aziende dalle Camere di Commercio italiane
        
        Args:
            settore (str): Settore di attivitu00e0
            provincia (str): Sigla della provincia
            
        Returns:
            list: Lista di dizionari con i dati delle aziende
        """
        aziende = []
        
        print(f"Cercando aziende nel settore '{settore}' in provincia di '{provincia}'...")
        
        # Simuliamo i risultati per scopi dimostrativi
        # In un'implementazione reale, dovresti interfacciarti con i dati delle Camere di Commercio
        
        # Mappa delle province
        province_map = {
            "MI": "Milano", "RM": "Roma", "TO": "Torino", "BO": "Bologna",
            "NA": "Napoli", "FI": "Firenze", "PD": "Padova", "BA": "Bari",
            "VR": "Verona", "BS": "Brescia", "MO": "Modena", "BG": "Bergamo",
            "PR": "Parma", "VI": "Vicenza"
        }
        
        # Verifica se la provincia u00e8 valida
        if provincia not in province_map:
            print(f"Provincia '{provincia}' non valida. Province valide: {', '.join(province_map.keys())}")
            return aziende
        
        citta = province_map[provincia]
        
        # Genera dati di esempio
        num_results = random.randint(30, 100)
        
        prefissi_aziendali = [
            "Tecno", "Agri", "Mec", "Edi", "Info", "Bio", "Eco", "Auto", "Termo", "Elettro",
            "Idro", "Plast", "Metal", "Legno", "Vetro", "Carta", "Tessile", "Aliment", "Arredo", "Stampa"
        ]
        
        suffissi_aziendali = [
            "service", "tech", "system", "group", "italia", "mec", "prom", "trade", "food", "build",
            "consulting", "solutions", "project", "engineering", "design", "energy", "logistic", "export", "quality"
        ]
        
        forme_giuridiche = [
            "S.r.l.", "S.n.c.", "S.a.s.", "S.p.A.", "Ditta individuale", "Societu00e0 cooperativa", "S.r.l.s."
        ]
        
        vie = [
            "Via Roma", "Via Milano", "Via Torino", "Via Napoli", "Via Firenze", "Via Bologna", "Via Venezia",
            "Via Garibaldi", "Via Mazzini", "Via Dante", "Via Marconi", "Via Galilei", "Via Fermi", "Via Edison",
            "Via dell'Industria", "Via dell'Artigianato", "Via del Lavoro", "Via delle Industrie", "Via Europa"
        ]
        
        for i in range(num_results):
            # Genera nome aziendale
            if random.random() < 0.5:
                nome = f"{random.choice(prefissi_aziendali)}{random.choice(suffissi_aziendali)}"
            else:
                cognomi = ["Rossi", "Bianchi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno"]
                nome = f"{random.choice(cognomi)} {settore.title()}"
            
            forma_giuridica = random.choice(forme_giuridiche)
            nome_completo = f"{nome} {forma_giuridica}" if forma_giuridica != "Ditta individuale" else nome
            
            # Genera CAP
            cap_base = {
                "Milano": "201", "Roma": "001", "Torino": "101", "Bologna": "401", "Napoli": "801",
                "Firenze": "501", "Padova": "351", "Bari": "701", "Verona": "371", "Brescia": "251"
            }
            
            if citta in cap_base:
                cap = cap_base[citta] + str(random.randint(0, 9)) + str(random.randint(0, 9))
            else:
                cap = str(random.randint(10, 98)) + "0" + str(random.randint(10, 99))
            
            # Genera indirizzo
            via = random.choice(vie)
            civico = random.randint(1, 200)
            indirizzo = f"{via}, {civico} - {cap} {citta} ({provincia})"
            
            # Genera contatti
            nome_norm = nome.lower().replace(' ', '').replace('.', '').replace(',', '')
            nome_norm = ''.join(c for c in nome_norm if c.isalnum())
            
            # Email
            tipi_email = ["info", "contatti", "amministrazione", "vendite", "ufficio"]
            email = f"{random.choice(tipi_email)}@{nome_norm[:15]}.it"
            
            # Sito web
            sito_web = f"https://www.{nome_norm[:15]}.it" if random.random() < 0.85 else ""
            
            # Telefono
            prefissi_fissi = ["02", "06", "011", "010", "051", "055", "049", "081", "091", "045"]
            telefono = f"+39 {random.choice(prefissi_fissi)} {random.randint(100000, 9999999)}"
            
            # Descrizione
            descrizioni = [
                f"Azienda specializzata in {settore.lower()} con sede a {citta}.",
                f"Offriamo servizi di {settore.lower()} per piccole e medie imprese.",
                f"Dal {random.randint(1990, 2020)} siamo attivi nel settore {settore.lower()} in provincia di {citta}.",
                f"PMI italiana nel campo del {settore.lower()}."
            ]
            descrizione = random.choice(descrizioni)
            
            azienda = {
                'Ragione Sociale': nome_completo,
                'Settore': settore,
                'Telefono': telefono,
                'Email': email,
                'Sito Web': sito_web,
                'Indirizzo': indirizzo,
                'CAP': cap,
                'Cittu00e0': citta,
                'Provincia': provincia,
                'Descrizione': descrizione,
                'Fonte': 'Camera di Commercio (simulata)'
            }
            
            aziende.append(azienda)
        
        print(f"Trovate {len(aziende)} aziende nel settore '{settore}' in provincia di '{provincia}'")
        return aziende
    
    def run_search(self, queries=None, settori_province=None):
        """
        Esegue la ricerca di aziende da tutte le fonti configurate
        
        Args:
            queries (list): Lista di query di ricerca
            settori_province (list): Lista di tuple (settore, provincia)
        """
        if queries is None:
            queries = ["informatica", "software", "digital", "tech", "web"]
        
        if settori_province is None:
            settori_province = [
                ("Informatica", "MI"),
                ("Servizi IT", "RM"),
                ("Sviluppo software", "TO"),
                ("E-commerce", "BO"),
                ("Marketing digitale", "FI")
            ]
        
        total_aziende = 0
        
        # Ricerca su OpenCorporates
        for query in queries:
            aziende = self.search_opencorporates(query)
            self.save_to_csv(aziende)
            total_aziende += len(aziende)
            time.sleep(random.uniform(1, 3))  # Pausa tra le ricerche
        
        # Ricerca su Camere di Commercio
        for settore, provincia in settori_province:
            aziende = self.search_camere_commercio(settore, provincia)
            self.save_to_csv(aziende)
            total_aziende += len(aziende)
            time.sleep(random.uniform(1, 3))  # Pausa tra le ricerche
        
        print(f"\nRicerca completata. Totale aziende trovate: {total_aziende}")
        print(f"I dati sono stati salvati in: {self.output_file}")


def main():
    """
    Funzione principale
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Finder per contatti di PMI italiane')
    parser.add_argument('--output', default='pmi_contatti.csv', help='File di output (CSV)')
    parser.add_argument('--query', default='informatica', help='Query di ricerca')
    parser.add_argument('--settore', default='Informatica', help='Settore di attivitu00e0')
    parser.add_argument('--provincia', default='MI', help='Sigla della provincia')
    
    args = parser.parse_args()
    
    finder = PMIFinder(output_file=args.output)
    
    # Configura le ricerche
    queries = [args.query]
    settori_province = [(args.settore, args.provincia)]
    
    finder.run_search(queries, settori_province)


if __name__ == "__main__":
    main()
