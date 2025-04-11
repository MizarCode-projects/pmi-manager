#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PMI Generator - Generazione di dati di esempio di PMI italiane
"""

import csv
import logging
import os
import random
from datetime import datetime

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pmi_scraper.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("PMI_Scraper")

class PMIGenerator:
    """
    Classe per generare dati di esempio di PMI italiane
    """
    
    def __init__(self, output_type="csv", db_path="pmi_data.db", csv_path="pmi_data.csv"):
        """
        Inizializza il generatore
        
        Args:
            output_type (str): Tipo di output (csv o db)
            db_path (str): Percorso del database SQLite
            csv_path (str): Percorso del file CSV
        """
        self.output_type = output_type
        self.db_path = db_path
        self.csv_path = csv_path
        
        # Dati di esempio per la generazione
        self.nomi_aziende = [
            "Ristorante ", "Trattoria ", "Pizzeria ", "Bar ", "Caffè ", "Osteria ", 
            "Pasticceria ", "Gelateria ", "Panificio ", "Macelleria ", "Salumeria ",
            "Hotel ", "Albergo ", "B&B ", "Pensione ", "Agriturismo ", "Locanda ",
            "Negozio ", "Boutique ", "Ferramenta ", "Cartoleria ", "Libreria ", 
            "Farmacia ", "Profumeria ", "Gioielleria ", "Ottica ", "Calzature ",
            "Studio ", "Agenzia ", "Consulenza ", "Assicurazioni ", "Immobiliare ",
            "Autofficina ", "Carrozzeria ", "Elettrauto ", "Gommista ", "Concessionaria ",
            "Impresa ", "Costruzioni ", "Edile ", "Impianti ", "Elettrica ", "Idraulica ",
            "Falegnameria ", "Vetreria ", "Fabbro ", "Ceramiche ", "Marmi ",
            "Centro ", "Palestra ", "Piscina ", "Spa ", "Benessere ", "Estetica "
        ]
        
        self.secondi_nomi = [
            "Da Mario", "Da Luigi", "Da Giuseppe", "Da Francesco", "Da Antonio",
            "Da Giovanni", "Da Pietro", "Da Paolo", "Da Roberto", "Da Riccardo",
            "Da Marco", "Da Bruno", "Da Carlo", "Da Luca", "Da Andrea",
            "Il Gabbiano", "Il Veliero", "La Perla", "La Stella", "Il Faro",
            "La Rosa", "Il Giglio", "La Quercia", "Il Pino", "L'Ulivo",
            "La Fontana", "Il Pozzo", "La Cascata", "Il Mulino", "La Locanda",
            "Il Borgo", "La Piazza", "Il Castello", "La Torre", "Il Palazzo",
            "L'Angolo", "La Bottega", "Il Cantuccio", "La Taverna", "Il Rifugio",
            "Belvedere", "Buongusto", "Elite", "Express", "Deluxe",
            "Royal", "Imperial", "Continental", "International", "Metropolitan"
        ]
        
        self.citta = [
            "Milano", "Roma", "Napoli", "Torino", "Palermo", "Genova", "Bologna",
            "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova",
            "Trieste", "Taranto", "Brescia", "Parma", "Prato", "Modena", "Reggio Calabria",
            "Reggio Emilia", "Perugia", "Livorno", "Ravenna", "Cagliari", "Foggia",
            "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano in Campania",
            "Monza", "Siracusa", "Pescara", "Bergamo", "Forlì", "Vicenza", "Terni",
            "Bolzano", "Novara", "Piacenza", "Ancona", "Andria", "Arezzo", "Udine",
            "Cesena", "Lecce", "Pesaro"
        ]
        
        self.vie = [
            "Via Roma", "Via Milano", "Via Napoli", "Via Torino", "Via Firenze",
            "Via Venezia", "Via Bologna", "Via Genova", "Via Palermo", "Via Verona",
            "Via Garibaldi", "Via Mazzini", "Via Cavour", "Via Dante", "Via Leopardi",
            "Via Carducci", "Via Pascoli", "Via Foscolo", "Via Petrarca", "Via Alfieri",
            "Via Marconi", "Via Fermi", "Via Volta", "Via Galilei", "Via Einstein",
            "Via Leonardo da Vinci", "Via Michelangelo", "Via Raffaello", "Via Tiziano",
            "Via Bernini", "Via Canova", "Via Giotto", "Via Botticelli", "Via Caravaggio",
            "Corso Italia", "Corso Europa", "Corso America", "Corso Francia", "Corso Inghilterra",
            "Piazza Duomo", "Piazza Maggiore", "Piazza San Marco", "Piazza del Popolo", "Piazza della Repubblica",
            "Viale dei Giardini", "Viale delle Rose", "Viale degli Ulivi", "Viale dei Pini", "Viale delle Palme"
        ]
        
        self.domini = [
            "gmail.com", "yahoo.it", "libero.it", "hotmail.com", "outlook.it",
            "virgilio.it", "alice.it", "tin.it", "tiscali.it", "fastwebnet.it"
        ]
        
        self.settori = [
            "Ristorazione", "Alberghiero", "Commercio al dettaglio", "Commercio all'ingrosso",
            "Servizi professionali", "Artigianato", "Edilizia", "Automotive", "Benessere",
            "Salute", "Tecnologia", "Moda", "Alimentare", "Trasporti", "Logistica",
            "Agricoltura", "Manifatturiero", "Immobiliare", "Finanziario", "Assicurativo"
        ]
        
        # Inizializza l'output
        if output_type == "csv":
            self._init_csv()
    
    def _init_csv(self):
        """Inizializza il file CSV"""
        try:
            # Controlla se il file esiste già
            file_exists = os.path.isfile(self.csv_path)
            
            self.csv_file = open(self.csv_path, 'w', newline='', encoding='utf-8')
            self.csv_writer = csv.writer(self.csv_file)
            
            # Scrive l'header
            self.csv_writer.writerow(['Nome', 'Email', 'Telefono', 'Descrizione', 'Sito Web', 'Data Scraping', 'Indirizzo', 'Settore'])
            logger.info(f"File CSV inizializzato: {self.csv_path}")
        except IOError as e:
            logger.error(f"Errore nell'inizializzazione del file CSV: {e}")
            raise
    
    def _save_to_csv(self, data):
        """
        Salva i dati nel file CSV
        
        Args:
            data (dict): Dizionario contenente i dati dell'azienda
        """
        try:
            self.csv_writer.writerow([
                data['nome'], data['email'], data['telefono'], 
                data['descrizione'], data['sito_web'], 
                data['data_scraping'], data['indirizzo'], data['settore']
            ])
            logger.debug(f"Dati salvati nel CSV per: {data['nome']}")
        except IOError as e:
            logger.error(f"Errore nel salvataggio dei dati nel CSV: {e}")
    
    def generate_company_data(self):
        """
        Genera dati casuali per un'azienda
        
        Returns:
            dict: Dizionario contenente i dati dell'azienda
        """
        # Genera un nome casuale
        nome_base = random.choice(self.nomi_aziende)
        secondo_nome = random.choice(self.secondi_nomi)
        nome = nome_base + secondo_nome
        
        # Genera un nome normalizzato per email e sito web
        nome_normalizzato = nome.lower().replace(' ', '').replace("'", "").replace('"', '')
        
        # Genera altri dati casuali
        citta = random.choice(self.citta)
        via = random.choice(self.vie)
        civico = random.randint(1, 200)
        cap = f"{random.randint(10, 99)}0{random.randint(10, 99)}"
        
        email = f"info@{nome_normalizzato}.it"
        if random.random() < 0.3:  # 30% di probabilità di avere un'email personale
            email = f"{nome_normalizzato}@{random.choice(self.domini)}"
        
        telefono = f"+39 {random.randint(300, 399)} {random.randint(1000000, 9999999)}"
        if random.random() < 0.5:  # 50% di probabilità di avere un numero fisso
            telefono = f"+39 0{random.randint(10, 99)} {random.randint(100000, 999999)}"
        
        sito_web = f"https://www.{nome_normalizzato}.it"
        if random.random() < 0.4:  # 40% di probabilità di non avere un sito web
            sito_web = ""
        
        settore = random.choice(self.settori)
        
        # Genera una descrizione casuale
        descrizioni = [
            f"Dal {random.randint(1950, 2020)} offriamo servizi di qualità nel settore {settore.lower()}. La nostra azienda è specializzata in soluzioni innovative per clienti esigenti.",
            f"Azienda leader nel settore {settore.lower()} con sede a {citta}. Offriamo prodotti e servizi di alta qualità dal {random.randint(1950, 2020)}.",
            f"La nostra missione è fornire il miglior servizio possibile nel settore {settore.lower()}. Siamo un'azienda a conduzione familiare con oltre {random.randint(5, 50)} anni di esperienza.",
            f"Specialisti nel settore {settore.lower()} con un team di professionisti qualificati. Serviamo clienti in tutta la provincia di {citta} e oltre.",
            f"Innovazione e tradizione si incontrano nella nostra azienda attiva nel settore {settore.lower()}. Fondata nel {random.randint(1950, 2020)}, siamo cresciuti fino a diventare un punto di riferimento a {citta}."
        ]
        descrizione = random.choice(descrizioni)
        
        indirizzo = f"{via}, {civico} - {cap} {citta}"
        
        return {
            'nome': nome,
            'email': email,
            'telefono': telefono,
            'descrizione': descrizione,
            'sito_web': sito_web,
            'data_scraping': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'indirizzo': indirizzo,
            'settore': settore
        }
    
    def generate_multiple_companies(self, count=1000):
        """
        Genera dati per più aziende
        
        Args:
            count (int): Numero di aziende da generare
        """
        try:
            logger.info(f"Generazione di {count} aziende...")
            
            for i in range(count):
                if i % 100 == 0:
                    logger.info(f"Generati dati per {i} aziende...")
                
                company_data = self.generate_company_data()
                self._save_to_csv(company_data)
                
            logger.info(f"Generazione completata: {count} aziende")
                
        except Exception as e:
            logger.error(f"Errore durante la generazione dei dati: {e}")
        finally:
            self.close()
    
    def close(self):
        """Chiude i file aperti"""
        try:
            if self.output_type == "csv":
                self.csv_file.close()
            logger.info("File chiusi correttamente")
        except Exception as e:
            logger.error(f"Errore nella chiusura dei file: {e}")


def main():
    """Funzione principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description='PMI Generator - Generazione di dati di esempio di PMI italiane')
    parser.add_argument('--output', choices=['csv'], default='csv', help='Formato di output (csv)')
    parser.add_argument('--count', type=int, default=1000, help='Numero di aziende da generare')
    parser.add_argument('--csv-path', default='pmi_data.csv', help='Percorso del file CSV')
    
    args = parser.parse_args()
    
    try:
        # Crea e configura il generatore
        generator = PMIGenerator(
            output_type=args.output,
            csv_path=args.csv_path
        )
        
        # Genera i dati
        generator.generate_multiple_companies(args.count)
        
        logger.info("Generazione dati completata con successo")
        
    except KeyboardInterrupt:
        logger.info("Generazione interrotta dall'utente")
    except Exception as e:
        logger.error(f"Errore durante l'esecuzione: {e}")


if __name__ == "__main__":
    main()
