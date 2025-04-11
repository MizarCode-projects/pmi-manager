#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PMI Scraper Custom - Ricerca personalizzata di contatti PMI italiane
"""

import csv
import json
import logging
import os
import random
import time
from datetime import datetime

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pmi_scraper_custom.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("PMI_Scraper_Custom")

class PMIScraperCustom:
    """
    Classe per la ricerca personalizzata di contatti PMI italiane
    """
    
    def __init__(self, csv_path="pmi_data.csv"):
        """
        Inizializza lo scraper personalizzato
        
        Args:
            csv_path (str): Percorso del file CSV
        """
        self.csv_path = csv_path
        self.csv_file = None
        self.csv_writer = None
        
        # Verifica se il file esiste già
        file_exists = os.path.isfile(self.csv_path)
        
        # Apri il file in modalità append
        self.csv_file = open(self.csv_path, 'a', newline='', encoding='utf-8')
        self.csv_writer = csv.DictWriter(
            self.csv_file, 
            fieldnames=[
                'Ragione Sociale', 'Settore', 'Email', 'Telefono', 'Indirizzo', 'Città', 
                'Provincia', 'CAP', 'Sito Web', 'Descrizione', 'Dipendenti', 'Fatturato',
                'Stato', 'Data Ultimo Contatto', 'Note'
            ]
        )
        
        # Scrivi l'intestazione solo se il file è nuovo
        if not file_exists or os.path.getsize(self.csv_path) == 0:
            self.csv_writer.writeheader()
            logger.info(f"Creato nuovo file CSV: {self.csv_path}")
        else:
            logger.info(f"Aggiunta a file CSV esistente: {self.csv_path}")
    
    def search_companies(self, location=None, sector=None, size=None, count=10):
        """
        Simula una ricerca di aziende in base ai criteri specificati
        
        Args:
            location (str): Località (città o provincia)
            sector (str): Settore di attività
            size (str): Dimensione dell'azienda (micro, piccola, media, grande)
            count (int): Numero massimo di risultati
            
        Returns:
            list: Lista di dizionari contenenti i dati delle aziende trovate
        """
        logger.info(f"Ricerca aziende: location={location}, sector={sector}, size={size}, count={count}")
        
        # In un'implementazione reale, qui ci sarebbe una chiamata API o web scraping
        # Per questa demo, generiamo dati simulati basati sui criteri
        
        # Dati di esempio per la generazione
        settori = [
            "Tecnologia", "Manifatturiero", "Servizi", "Commercio", "Edilizia",
            "Ristorazione", "Turismo", "Agricoltura", "Trasporti", "Sanità"
        ]
        
        # Usa il settore specificato o scegli casualmente
        if sector:
            settori_filtrati = [s for s in settori if sector.lower() in s.lower()]
            settori = settori_filtrati if settori_filtrati else settori
        
        # Province italiane
        province = [
            "Milano", "Roma", "Napoli", "Torino", "Palermo", "Genova", "Bologna",
            "Firenze", "Bari", "Catania", "Venezia", "Verona", "Padova", "Brescia"
        ]
        
        # Usa la location specificata o scegli casualmente
        if location:
            province_filtrate = [p for p in province if location.lower() in p.lower()]
            province = province_filtrate if province_filtrate else province
        
        # Prefissi nomi aziende per settore
        prefissi_per_settore = {
            "Tecnologia": ["Tech", "Digital", "Soft", "Net", "Web", "Cyber", "Data", "Smart", "App"],
            "Manifatturiero": ["Mec", "Ind", "Prod", "Metal", "Plast", "Tec", "Fabbrica", "Lav"],
            "Servizi": ["Serv", "Consult", "Pro", "Support", "Assist", "Help", "Care", "Gest"],
            "Commercio": ["Market", "Shop", "Store", "Emporio", "Ingrosso", "Distrib", "Import", "Export"],
            "Edilizia": ["Costruzioni", "Edil", "Build", "Casa", "Immobil", "Progett", "Arch", "Ristrutt"],
            "Ristorazione": ["Food", "Gusto", "Sapore", "Cucina", "Delizie", "Chef", "Ristoro", "Tavola"],
            "Turismo": ["Travel", "Tour", "Visit", "Holiday", "Vacanze", "Trip", "Journey", "Viaggi"],
            "Agricoltura": ["Agri", "Farm", "Terra", "Natura", "Bio", "Eco", "Green", "Coltura"],
            "Trasporti": ["Trans", "Log", "Move", "Ship", "Delivery", "Express", "Trasfer", "Spedizioni"],
            "Sanità": ["Med", "Health", "Care", "Salute", "Vita", "Benessere", "Clinic", "Pharma"]
        }
        
        # Suffissi comuni per nomi aziende
        suffissi = ["Srl", "Spa", "Snc", "Sas", "Srls", "Group", "Italia", "International"]
        
        # Dimensioni aziende
        dimensioni = {
            "micro": {"dipendenti": (1, 9), "fatturato": (0.1, 2)},
            "piccola": {"dipendenti": (10, 49), "fatturato": (2, 10)},
            "media": {"dipendenti": (50, 249), "fatturato": (10, 50)},
            "grande": {"dipendenti": (250, 1000), "fatturato": (50, 500)}
        }
        
        # Filtra per dimensione se specificata
        dimensioni_filtrate = [size] if size and size in dimensioni else list(dimensioni.keys())
        
        # Genera i risultati
        results = []
        for _ in range(count):
            # Scegli un settore casuale tra quelli filtrati
            settore = random.choice(settori)
            
            # Scegli una provincia casuale tra quelle filtrate
            provincia = random.choice(province)
            
            # Genera un nome aziendale plausibile basato sul settore
            prefissi = prefissi_per_settore.get(settore, ["Azienda", "Impresa", "Società"])
            nome_base = random.choice(prefissi) + random.choice([""]) + random.choice([""]) + random.choice([" ", ""])
            nome_base += random.choice([""]) + random.choice([""]) + random.choice([""]) + random.choice([" ", ""])
            
            # Aggiungi un suffisso casuale
            nome = nome_base + " " + random.choice(suffissi)
            
            # Scegli una dimensione casuale tra quelle filtrate
            dim_key = random.choice(dimensioni_filtrate)
            dim_range = dimensioni[dim_key]
            
            # Genera il numero di dipendenti e il fatturato in base alla dimensione
            dipendenti = random.randint(dim_range["dipendenti"][0], dim_range["dipendenti"][1])
            fatturato = round(random.uniform(dim_range["fatturato"][0], dim_range["fatturato"][1]), 1)
            
            # Genera un indirizzo plausibile
            vie = ["Via Roma", "Via Milano", "Via Napoli", "Via Torino", "Via Garibaldi", "Via Dante", "Via Mazzini"]
            indirizzo = f"{random.choice(vie)}, {random.randint(1, 100)}"
            cap = f"{random.randint(10, 99)}0{random.randint(10, 99)}"
            
            # Genera un'email aziendale plausibile
            dominio = nome_base.lower().replace(" ", "") + ".it"
            email = f"info@{dominio}"
            
            # Genera un numero di telefono plausibile
            telefono = f"+39 0{random.randint(10, 99)} {random.randint(100000, 999999)}"
            
            # Genera un sito web plausibile
            sito_web = f"https://www.{dominio}"
            
            # Genera una descrizione plausibile
            descrizioni = [
                f"Azienda attiva nel settore {settore.lower()} con sede a {provincia}.",
                f"Dal {random.randint(1980, 2020)} offriamo servizi di qualità nel settore {settore.lower()}.",
                f"Azienda leader nel settore {settore.lower()} con {dipendenti} dipendenti.",
                f"Specialisti nel settore {settore.lower()} con un fatturato di circa {fatturato}M €."
            ]
            descrizione = random.choice(descrizioni)
            
            # Crea il risultato
            result = {
                'Ragione Sociale': nome,
                'Settore': settore,
                'Email': email,
                'Telefono': telefono,
                'Indirizzo': indirizzo,
                'Città': provincia,  # Semplificazione: usiamo la provincia come città
                'Provincia': provincia,
                'CAP': cap,
                'Sito Web': sito_web,
                'Descrizione': descrizione,
                'Dipendenti': dipendenti,
                'Fatturato': f"{fatturato}M €",
                'Stato': 'Non contattato',
                'Data Ultimo Contatto': '',
                'Note': ''
            }
            
            results.append(result)
            
            # Simula un ritardo di rete per rendere più realistico
            time.sleep(0.1)
        
        logger.info(f"Trovate {len(results)} aziende")
        return results
    
    def save_results(self, results):
        """
        Salva i risultati nel file CSV
        
        Args:
            results (list): Lista di dizionari contenenti i dati delle aziende
            
        Returns:
            int: Numero di aziende salvate
        """
        count = 0
        for company in results:
            try:
                self.csv_writer.writerow(company)
                count += 1
            except Exception as e:
                logger.error(f"Errore nel salvataggio dell'azienda {company.get('Ragione Sociale')}: {e}")
        
        self.csv_file.flush()  # Assicura che i dati siano scritti su disco
        logger.info(f"Salvate {count} aziende nel file CSV")
        return count
    
    def close(self):
        """
        Chiude i file aperti
        """
        try:
            if self.csv_file:
                self.csv_file.close()
            logger.info("File chiusi correttamente")
        except Exception as e:
            logger.error(f"Errore nella chiusura dei file: {e}")


def search_companies_api(location=None, sector=None, size=None, count=10):
    """
    Funzione API per la ricerca di aziende
    
    Args:
        location (str): Località (città o provincia)
        sector (str): Settore di attività
        size (str): Dimensione dell'azienda (micro, piccola, media, grande)
        count (int): Numero massimo di risultati
        
    Returns:
        dict: Dizionario con i risultati della ricerca
    """
    try:
        scraper = PMIScraperCustom()
        results = scraper.search_companies(location, sector, size, count)
        saved = scraper.save_results(results)
        scraper.close()
        
        return {
            "success": True,
            "count": saved,
            "results": results
        }
    except Exception as e:
        logger.error(f"Errore nell'API di ricerca: {e}")
        return {
            "success": False,
            "error": str(e),
            "count": 0,
            "results": []
        }


def main():
    """
    Funzione principale per l'esecuzione da riga di comando
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='PMI Scraper Custom - Ricerca personalizzata di contatti PMI italiane')
    parser.add_argument('--location', help='Località (città o provincia)')
    parser.add_argument('--sector', help='Settore di attività')
    parser.add_argument('--size', choices=['micro', 'piccola', 'media', 'grande'], help='Dimensione dell\'azienda')
    parser.add_argument('--count', type=int, default=10, help='Numero massimo di risultati')
    parser.add_argument('--csv-path', default='pmi_data.csv', help='Percorso del file CSV')
    
    args = parser.parse_args()
    
    try:
        # Crea e configura lo scraper
        scraper = PMIScraperCustom(csv_path=args.csv_path)
        
        # Esegui la ricerca
        results = scraper.search_companies(
            location=args.location,
            sector=args.sector,
            size=args.size,
            count=args.count
        )
        
        # Salva i risultati
        saved = scraper.save_results(results)
        
        # Chiudi lo scraper
        scraper.close()
        
        print(f"\nRicerca completata: trovate e salvate {saved} aziende")
        
    except KeyboardInterrupt:
        logger.info("Ricerca interrotta dall'utente")
    except Exception as e:
        logger.error(f"Errore durante l'esecuzione: {e}")


if __name__ == "__main__":
    main()
