#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PMI Generator - Script per generare dati realistici di PMI italiane
"""

import csv
import random
import os
from datetime import datetime, timedelta

# Definizioni secondo i criteri UE per le PMI
# Micro impresa: < 10 dipendenti, fatturato <= 2 milioni €
# Piccola impresa: < 50 dipendenti, fatturato <= 10 milioni €
# Media impresa: < 250 dipendenti, fatturato <= 50 milioni €

class PMIGenerator:
    """
    Classe per generare dati realistici di PMI italiane
    """
    
    def __init__(self, output_file="pmi_italiane.csv"):
        """
        Inizializza il generatore
        
        Args:
            output_file (str): Percorso del file CSV di output
        """
        self.output_file = output_file
        
        # Dati di esempio per la generazione
        self.prefissi_aziendali = [
            "Tecno", "Agri", "Mec", "Edi", "Info", "Bio", "Eco", "Auto", "Termo", "Elettro",
            "Idro", "Plast", "Metal", "Legno", "Vetro", "Carta", "Tessile", "Aliment", "Arredo", "Stampa"
        ]
        
        self.suffissi_aziendali = [
            "service", "tech", "system", "group", "italia", "mec", "prom", "trade", "food", "build",
            "consulting", "solutions", "project", "engineering", "design", "energy", "logistic", "export", "quality", "components"
        ]
        
        self.forme_giuridiche = [
            "S.r.l.", "S.n.c.", "S.a.s.", "S.p.A.", "Ditta individuale", "Società cooperativa", "S.r.l.s."
        ]
        
        self.probabilita_forme = {
            "S.r.l.": 0.45,
            "S.n.c.": 0.15,
            "S.a.s.": 0.10,
            "Ditta individuale": 0.20,
            "S.p.A.": 0.03,
            "Società cooperativa": 0.05,
            "S.r.l.s.": 0.02
        }
        
        self.settori = [
            "Manifatturiero", "Edilizia", "Commercio", "Servizi alle imprese", "ICT", "Agricoltura",
            "Alimentare", "Artigianato", "Trasporti", "Turismo", "Servizi alla persona", "Meccanica",
            "Elettronica", "Tessile", "Legno e arredo", "Chimica", "Plastica", "Metalmeccanica"
        ]
        
        self.citta = [
            "Milano", "Roma", "Torino", "Bologna", "Napoli", "Firenze", "Padova", "Bari", "Verona", "Brescia",
            "Modena", "Bergamo", "Parma", "Vicenza", "Treviso", "Udine", "Varese", "Como", "Monza", "Prato",
            "Reggio Emilia", "Ancona", "Pescara", "Catania", "Palermo", "Cagliari", "Venezia", "Perugia", "Trento", "Bolzano"
        ]
        
        self.province = {
            "Milano": "MI", "Roma": "RM", "Torino": "TO", "Bologna": "BO", "Napoli": "NA", "Firenze": "FI", 
            "Padova": "PD", "Bari": "BA", "Verona": "VR", "Brescia": "BS", "Modena": "MO", "Bergamo": "BG", 
            "Parma": "PR", "Vicenza": "VI", "Treviso": "TV", "Udine": "UD", "Varese": "VA", "Como": "CO", 
            "Monza": "MB", "Prato": "PO", "Reggio Emilia": "RE", "Ancona": "AN", "Pescara": "PE", 
            "Catania": "CT", "Palermo": "PA", "Cagliari": "CA", "Venezia": "VE", "Perugia": "PG", 
            "Trento": "TN", "Bolzano": "BZ"
        }
        
        self.vie = [
            "Via Roma", "Via Milano", "Via Torino", "Via Napoli", "Via Firenze", "Via Bologna", "Via Venezia",
            "Via Garibaldi", "Via Mazzini", "Via Dante", "Via Marconi", "Via Galilei", "Via Fermi", "Via Edison",
            "Via dell'Industria", "Via dell'Artigianato", "Via del Lavoro", "Via delle Industrie", "Via Europa",
            "Via XXV Aprile", "Via IV Novembre", "Via I Maggio", "Via II Giugno", "Via XX Settembre",
            "Viale delle Nazioni", "Viale della Repubblica", "Viale della Libertà", "Viale dell'Indipendenza"
        ]
        
        self.domini_email = [
            "gmail.com", "libero.it", "yahoo.it", "virgilio.it", "hotmail.it", "outlook.it", "pec.it", "legalmail.it"
        ]
    
    def _genera_nome_azienda(self):
        """
        Genera un nome casuale per un'azienda
        
        Returns:
            tuple: (nome_azienda, forma_giuridica)
        """
        # Diversi modelli di nomi aziendali
        modello = random.randint(1, 5)
        forma_giuridica = random.choices(
            list(self.probabilita_forme.keys()), 
            weights=list(self.probabilita_forme.values()), 
            k=1
        )[0]
        
        if modello == 1:
            # Prefisso + Suffisso (es. TecnoService)
            nome = random.choice(self.prefissi_aziendali) + random.choice(self.suffissi_aziendali)
        elif modello == 2:
            # Cognome + Settore (es. Bianchi Meccanica)
            cognomi = ["Rossi", "Bianchi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno"]
            settori_brevi = ["Meccanica", "Impianti", "Costruzioni", "Legno", "Servizi", "Trasporti", "Edilizia"]
            nome = f"{random.choice(cognomi)} {random.choice(settori_brevi)}"
        elif modello == 3:
            # Acronimo (es. C.M.B.)
            lettere = [chr(random.randint(65, 90)) for _ in range(random.randint(2, 4))]
            nome = ".".join(lettere) + "."
        elif modello == 4:
            # Cognome e Cognome (es. Bianchi & Rossi)
            cognomi = ["Rossi", "Bianchi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno",
                      "Gallo", "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Lombardi", "Moretti", "Barbieri"]
            separatori = [" & ", " e ", "-", " - "]
            nome = f"{random.choice(cognomi)}{random.choice(separatori)}{random.choice(cognomi)}"
        else:
            # Nome geografico + Settore (es. Brianza Legno)
            luoghi = ["Brianza", "Veneto", "Toscana", "Lombardia", "Piemonte", "Emilia", "Romagna", "Marche", "Umbria", "Lazio"]
            settori_brevi = ["Legno", "Metalli", "Vetro", "Tessile", "Stampa", "Edile", "Impianti", "Meccanica", "Plastica"]
            nome = f"{random.choice(luoghi)} {random.choice(settori_brevi)}"
        
        return nome, forma_giuridica
    
    def _genera_partita_iva(self):
        """
        Genera una partita IVA italiana casuale
        
        Returns:
            str: Partita IVA
        """
        # Le partite IVA italiane sono composte da 11 cifre
        return "".join([str(random.randint(0, 9)) for _ in range(11)])
    
    def _genera_anno_fondazione(self):
        """
        Genera un anno di fondazione realistico
        
        Returns:
            int: Anno di fondazione
        """
        # La maggior parte delle PMI ha meno di 30 anni
        anni_attivita = random.choices(
            [random.randint(1, 5), random.randint(6, 10), random.randint(11, 20), 
             random.randint(21, 30), random.randint(31, 50), random.randint(51, 70)],
            weights=[0.15, 0.25, 0.30, 0.20, 0.08, 0.02],
            k=1
        )[0]
        
        return datetime.now().year - anni_attivita
    
    def _genera_dimensione_pmi(self):
        """
        Genera dimensioni realistiche per una PMI secondo i criteri UE
        
        Returns:
            tuple: (categoria, dipendenti, fatturato)
        """
        # Distribuzione realistica delle dimensioni aziendali in Italia
        categoria = random.choices(
            ["Micro impresa", "Piccola impresa", "Media impresa"],
            weights=[0.82, 0.15, 0.03],  # In Italia circa l'82% sono micro, 15% piccole, 3% medie
            k=1
        )[0]
        
        if categoria == "Micro impresa":
            dipendenti = random.randint(1, 9)
            fatturato = round(random.uniform(0.05, 2.0), 2)  # Da 50k a 2M
        elif categoria == "Piccola impresa":
            dipendenti = random.randint(10, 49)
            fatturato = round(random.uniform(2.0, 10.0), 2)  # Da 2M a 10M
        else:  # Media impresa
            dipendenti = random.randint(50, 249)
            fatturato = round(random.uniform(10.0, 50.0), 2)  # Da 10M a 50M
        
        return categoria, dipendenti, fatturato
    
    def _genera_contatti(self, nome_azienda, citta):
        """
        Genera contatti realistici per un'azienda
        
        Returns:
            tuple: (telefono, email, sito_web)
        """
        # Genera numero di telefono italiano
        prefissi_fissi = ["02", "06", "011", "010", "051", "055", "049", "081", "091", "045"]
        prefissi_mobili = ["320", "328", "330", "338", "340", "345", "347", "350", "360", "370", "380", "388", "389", "391", "392", "393", "327", "329"]
        
        # 70% probabilità di avere un numero fisso, 30% mobile
        if random.random() < 0.7:
            telefono = f"+39 {random.choice(prefissi_fissi)} {random.randint(100000, 9999999)}"
        else:
            telefono = f"+39 {random.choice(prefissi_mobili)} {random.randint(1000000, 9999999)}"
        
        # Normalizza il nome per email e sito web
        nome_norm = nome_azienda.lower().replace(" ", "").replace("&", "e").replace(".", "").replace("-", "").replace("'", "")
        
        # Genera email
        tipi_email = ["info", "contatti", "amministrazione", "vendite", "ufficio"]
        
        # 80% probabilità di avere un dominio aziendale, 20% un provider generico
        if random.random() < 0.8:
            email = f"{random.choice(tipi_email)}@{nome_norm}.it"
        else:
            email = f"{nome_norm}@{random.choice(self.domini_email)}"
        
        # Genera sito web (85% probabilità di averne uno)
        if random.random() < 0.85:
            sito_web = f"https://www.{nome_norm}.it"
        else:
            sito_web = ""
        
        return telefono, email, sito_web
    
    def _genera_indirizzo(self, citta):
        """
        Genera un indirizzo realistico
        
        Returns:
            tuple: (indirizzo_completo, cap, provincia)
        """
        via = random.choice(self.vie)
        civico = random.randint(1, 200)
        
        # CAP realistici per città
        cap_base = {
            "Milano": "201", "Roma": "001", "Torino": "101", "Bologna": "401", "Napoli": "801",
            "Firenze": "501", "Padova": "351", "Bari": "701", "Verona": "371", "Brescia": "251"
        }
        
        if citta in cap_base:
            cap = cap_base[citta] + str(random.randint(0, 9)) + str(random.randint(0, 9))
        else:
            cap = str(random.randint(10, 98)) + "0" + str(random.randint(10, 99))
        
        provincia = self.province.get(citta, "XX")
        
        indirizzo_completo = f"{via}, {civico} - {cap} {citta} ({provincia})"
        
        return indirizzo_completo, cap, provincia
    
    def genera_azienda(self):
        """
        Genera dati completi per una PMI italiana
        
        Returns:
            dict: Dati dell'azienda
        """
        nome_azienda, forma_giuridica = self._genera_nome_azienda()
        nome_completo = f"{nome_azienda} {forma_giuridica}" if forma_giuridica != "Ditta individuale" else nome_azienda
        
        settore = random.choice(self.settori)
        citta = random.choice(self.citta)
        anno_fondazione = self._genera_anno_fondazione()
        partita_iva = self._genera_partita_iva()
        categoria_pmi, dipendenti, fatturato = self._genera_dimensione_pmi()
        telefono, email, sito_web = self._genera_contatti(nome_azienda, citta)
        indirizzo, cap, provincia = self._genera_indirizzo(citta)
        
        # Genera una descrizione contestualizzata
        anni_attivita = datetime.now().year - anno_fondazione
        
        descrizioni = [
            f"Fondata nel {anno_fondazione}, la nostra azienda opera nel settore {settore.lower()} con {dipendenti} dipendenti. Offriamo soluzioni innovative e personalizzate per clienti in tutta Italia.",
            f"Da oltre {anni_attivita} anni siamo specializzati nel settore {settore.lower()}. La nostra azienda, con sede a {citta}, conta {dipendenti} collaboratori e un fatturato di {fatturato} milioni di euro.",
            f"PMI italiana attiva nel settore {settore.lower()} dal {anno_fondazione}. Con {dipendenti} dipendenti, offriamo prodotti e servizi di qualità per il mercato nazionale ed internazionale.",
            f"Azienda a conduzione familiare con {anni_attivita} anni di esperienza nel settore {settore.lower()}. Siamo una {categoria_pmi.lower()} con {dipendenti} dipendenti e un fatturato annuo di {fatturato} milioni di euro.",
            f"Realtà imprenditoriale italiana fondata nel {anno_fondazione}, specializzata nel settore {settore.lower()}. La nostra struttura conta {dipendenti} professionisti qualificati e ha un fatturato di {fatturato} milioni di euro."
        ]
        
        descrizione = random.choice(descrizioni)
        
        return {
            'Ragione Sociale': nome_completo,
            'Forma Giuridica': forma_giuridica,
            'Settore': settore,
            'Anno Fondazione': anno_fondazione,
            'Partita IVA': partita_iva,
            'Categoria': categoria_pmi,
            'Dipendenti': dipendenti,
            'Fatturato (milioni €)': fatturato,
            'Telefono': telefono,
            'Email': email,
            'Sito Web': sito_web,
            'Indirizzo': indirizzo,
            'CAP': cap,
            'Città': citta,
            'Provincia': provincia,
            'Descrizione': descrizione
        }
    
    def genera_dataset(self, num_aziende=1000):
        """
        Genera un dataset di PMI italiane e lo salva in CSV
        
        Args:
            num_aziende (int): Numero di aziende da generare
        """
        aziende = []
        
        print(f"Generazione di {num_aziende} PMI italiane...")
        for i in range(num_aziende):
            if i > 0 and i % 100 == 0:
                print(f"Generate {i} aziende...")
            
            aziende.append(self.genera_azienda())
        
        # Salva in CSV
        with open(self.output_file, 'w', newline='', encoding='utf-8') as f:
            if aziende:
                writer = csv.DictWriter(f, fieldnames=aziende[0].keys())
                writer.writeheader()
                writer.writerows(aziende)
        
        print(f"Dataset generato e salvato in: {self.output_file}")
        return aziende


def main():
    """
    Funzione principale
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Generatore di dati realistici di PMI italiane')
    parser.add_argument('--output', default='pmi_italiane.csv', help='File di output (CSV)')
    parser.add_argument('--num', type=int, default=1000, help='Numero di aziende da generare')
    
    args = parser.parse_args()
    
    generator = PMIGenerator(output_file=args.output)
    generator.genera_dataset(args.num)


if __name__ == "__main__":
    main()
