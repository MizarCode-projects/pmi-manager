#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Visualizzatore di contatti PMI - Interfaccia interattiva per esplorare i contatti delle PMI italiane
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import sys
import argparse
from tabulate import tabulate
import webbrowser
import tempfile
import random

# Impostazioni per i grafici
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('viridis')
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 12

class ContattiVisualizer:
    """
    Classe per visualizzare e analizzare i contatti delle PMI italiane
    """
    
    def __init__(self, file_path):
        """
        Inizializza il visualizzatore
        
        Args:
            file_path (str): Percorso del file CSV con i contatti
        """
        self.file_path = file_path
        self.df = None
        self.load_data()
    
    def load_data(self):
        """
        Carica i dati dal file CSV
        """
        try:
            self.df = pd.read_csv(self.file_path, encoding='utf-8')
            print(f"Caricati {len(self.df)} contatti dal file {self.file_path}")
        except Exception as e:
            print(f"Errore nel caricamento del file: {e}")
            sys.exit(1)
    
    def show_preview(self, rows=10):
        """
        Mostra un'anteprima dei contatti
        
        Args:
            rows (int): Numero di righe da visualizzare
        """
        print("\n=== ANTEPRIMA DEI CONTATTI ===")
        print(tabulate(self.df.head(rows), headers='keys', tablefmt='grid', showindex=False))
    
    def analyze_sectors(self):
        """
        Analizza la distribuzione dei settori
        """
        print("\n=== DISTRIBUZIONE PER SETTORE ===")
        sector_counts = self.df['Settore'].value_counts()
        print(tabulate(sector_counts.reset_index().rename(columns={'index': 'Settore', 'Settore': 'Numero'}), 
                       headers='keys', tablefmt='grid', showindex=False))
        
        # Grafico a barre orizzontali per i settori
        plt.figure(figsize=(12, 10))
        ax = sns.barplot(x=sector_counts.values, y=sector_counts.index)
        plt.title('Distribuzione delle PMI per settore', fontsize=16, pad=20)
        plt.xlabel('Numero di aziende', fontsize=14)
        plt.ylabel('Settore', fontsize=14)
        
        # Aggiungi i valori alle barre
        for i, v in enumerate(sector_counts.values):
            ax.text(v + 0.5, i, str(v), va='center')
            
        plt.tight_layout()
        plt.savefig('distribuzione_settori_contatti.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_settori_contatti.png'")
    
    def analyze_geography(self):
        """
        Analizza la distribuzione geografica
        """
        print("\n=== DISTRIBUZIONE GEOGRAFICA ===")
        
        # Top 15 città
        city_counts = self.df['Città'].value_counts().head(15)
        print("Top 15 città per numero di PMI:")
        print(tabulate(city_counts.reset_index().rename(columns={'index': 'Città', 'Città': 'Numero'}), 
                       headers='keys', tablefmt='grid', showindex=False))
        
        # Distribuzione per provincia
        if 'Provincia' in self.df.columns:
            province_counts = self.df['Provincia'].value_counts().head(15)
            print("\nTop 15 province per numero di PMI:")
            print(tabulate(province_counts.reset_index().rename(columns={'index': 'Provincia', 'Provincia': 'Numero'}), 
                           headers='keys', tablefmt='grid', showindex=False))
            
            # Grafico a barre per province
            plt.figure(figsize=(12, 8))
            sns.barplot(x=province_counts.index, y=province_counts.values)
            plt.title('Distribuzione delle PMI per provincia', fontsize=16, pad=20)
            plt.xlabel('Provincia', fontsize=14)
            plt.ylabel('Numero di aziende', fontsize=14)
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig('distribuzione_province_contatti.png', dpi=300, bbox_inches='tight')
            print("Grafico salvato come 'distribuzione_province_contatti.png'")
    
    def analyze_web_presence(self):
        """
        Analizza la presenza web delle PMI
        """
        print("\n=== ANALISI PRESENZA WEB ===")
        
        # Conta le aziende con sito web
        has_website = self.df['Sito Web'].notna() & (self.df['Sito Web'] != '')
        website_count = has_website.sum()
        no_website_count = len(self.df) - website_count
        
        print(f"PMI con sito web: {website_count} ({website_count/len(self.df)*100:.1f}%)")
        print(f"PMI senza sito web: {no_website_count} ({no_website_count/len(self.df)*100:.1f}%)")
        
        # Grafico a torta per presenza web
        plt.figure(figsize=(10, 8))
        plt.pie([website_count, no_website_count], 
                labels=['Con sito web', 'Senza sito web'], 
                autopct='%1.1f%%', 
                startangle=90, 
                colors=['#2ecc71', '#e74c3c'],
                wedgeprops={'edgecolor': 'white', 'linewidth': 1.5})
        plt.title('Presenza di siti web nelle PMI italiane', fontsize=16, pad=20)
        plt.tight_layout()
        plt.savefig('presenza_web_contatti.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'presenza_web_contatti.png'")
    
    def export_to_excel(self, output_file='contatti_pmi_formattato.xlsx'):
        """
        Esporta i dati in formato Excel con formattazione avanzata
        
        Args:
            output_file (str): Nome del file Excel di output
        """
        try:
            # Crea un writer Excel con XlsxWriter
            writer = pd.ExcelWriter(output_file, engine='xlsxwriter')
            
            # Esporta il dataframe principale
            self.df.to_excel(writer, sheet_name='Contatti Completi', index=False)
            
            # Ottieni il workbook e il worksheet
            workbook = writer.book
            worksheet = writer.sheets['Contatti Completi']
            
            # Formattazione per le intestazioni
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })
            
            # Applica la formattazione alle intestazioni
            for col_num, value in enumerate(self.df.columns.values):
                worksheet.write(0, col_num, value, header_format)
            
            # Formattazione per le celle
            text_format = workbook.add_format({'text_wrap': True})
            
            # Applica formattazione alle colonne
            worksheet.set_column('A:Z', 18, text_format)  # Larghezza colonna di base
            
            # Crea fogli aggiuntivi con analisi
            
            # Foglio per settori
            settori_counts = self.df['Settore'].value_counts().reset_index()
            settori_counts.columns = ['Settore', 'Numero di aziende']
            settori_counts.to_excel(writer, sheet_name='Settori', index=False)
            
            # Foglio per città
            citta_counts = self.df['Città'].value_counts().reset_index()
            citta_counts.columns = ['Città', 'Numero di aziende']
            citta_counts.to_excel(writer, sheet_name='Città', index=False)
            
            # Chiudi il writer per salvare il file
            writer.close()
            
            print(f"\nDati esportati in formato Excel: {output_file}")
            
        except Exception as e:
            print(f"Errore nell'esportazione in Excel: {e}")
    
    def generate_html_report(self, output_file='contatti_pmi_report.html'):
        """
        Genera un report HTML interattivo
        
        Args:
            output_file (str): Nome del file HTML di output
        """
        try:
            # Crea un template HTML con Bootstrap per un aspetto professionale
            html_template = f"""
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Report Contatti PMI Italiane</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.datatables.net/1.13.1/css/dataTables.bootstrap5.min.css">
                <style>
                    body {{ padding-top: 20px; }}
                    .card {{ margin-bottom: 20px; }}
                    .table-responsive {{ margin-top: 20px; }}
                    .chart-container {{ height: 400px; width: 100%; margin-bottom: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <h1 class="text-center mb-4">Report Contatti PMI Italiane</h1>
                            <p class="lead text-center">Analisi di {len(self.df)} contatti di PMI italiane</p>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="card-title mb-0">Distribuzione per Settore</h5>
                                </div>
                                <div class="card-body">
                                    <div class="chart-container" id="sector-chart">
                                        <img src="distribuzione_settori_contatti.png" class="img-fluid" alt="Distribuzione per Settore">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-success text-white">
                                    <h5 class="card-title mb-0">Presenza Web</h5>
                                </div>
                                <div class="card-body">
                                    <div class="chart-container" id="web-chart">
                                        <img src="presenza_web_contatti.png" class="img-fluid" alt="Presenza Web">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header bg-info text-white">
                                    <h5 class="card-title mb-0">Elenco Contatti PMI</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table id="contacts-table" class="table table-striped table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Ragione Sociale</th>
                                                    <th>Settore</th>
                                                    <th>Telefono</th>
                                                    <th>Email</th>
                                                    <th>Sito Web</th>
                                                    <th>Città</th>
                                                    <th>Provincia</th>
                                                </tr>
                                            </thead>
                                            <tbody>
            """
            
            # Aggiungi le righe della tabella
            for _, row in self.df.iterrows():
                html_template += f"""
                                                <tr>
                                                    <td>{row.get('Ragione Sociale', '')}</td>
                                                    <td>{row.get('Settore', '')}</td>
                                                    <td>{row.get('Telefono', '')}</td>
                                                    <td><a href="mailto:{row.get('Email', '')}">{row.get('Email', '')}</a></td>
                                                    <td>{'<a href="' + row.get('Sito Web', '#') + '" target="_blank">Visita</a>' if pd.notna(row.get('Sito Web', '')) and row.get('Sito Web', '') != '' else ''}</td>
                                                    <td>{row.get('Città', '')}</td>
                                                    <td>{row.get('Provincia', '')}</td>
                                                </tr>
                """
            
            # Chiudi la tabella e il documento HTML
            html_template += """
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mt-4 mb-5">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-warning">
                                    <h5 class="card-title mb-0">Top 10 Città</h5>
                                </div>
                                <div class="card-body">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Città</th>
                                                <th>Numero di PMI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
            """
            
            # Aggiungi le righe della tabella delle città

            city_counts = self.df['Città'].value_counts().head(10)

            for city, count in city_counts.items():

                html_template += f"""
                                            <tr>
                                                <td>{city}</td>
                                                <td>{count}</td>
                                            </tr>
                """

            
            html_template += """
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-danger text-white">
                                    <h5 class="card-title mb-0">Top 10 Settori</h5>
                                </div>
                                <div class="card-body">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Settore</th>
                                                <th>Numero di PMI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
            """
            
            # Aggiungi le righe della tabella dei settori

            sector_counts = self.df['Settore'].value_counts().head(10)

            for sector, count in sector_counts.items():

                html_template += f"""
                                            <tr>
                                                <td>{sector}</td>
                                                <td>{count}</td>
                                            </tr>
                """

            
            # Chiudi la tabella e aggiungi gli script JavaScript

            html_template += """
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script src="https://code.jquery.com/jquery-3.6.3.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
                <script src="https://cdn.datatables.net/1.13.1/js/jquery.dataTables.min.js"></script>
                <script src="https://cdn.datatables.net/1.13.1/js/dataTables.bootstrap5.min.js"></script>
                <script>
                    $(document).ready(function() {
                        $('#contacts-table').DataTable({
                            "pageLength": 10,
                            "language": {
                                "url": "//cdn.datatables.net/plug-ins/1.13.1/i18n/it-IT.json"
                            }
                        });
                    });
                </script>
            </body>
            </html>
            """

            
            # Salva il file HTML

            with open(output_file, 'w', encoding='utf-8') as f:

                f.write(html_template)

            
            print(f"\nReport HTML generato: {output_file}")

            return output_file

            
        except Exception as e:

            print(f"Errore nella generazione del report HTML: {e}")

            return None

    
    def run_all_analyses(self, preview_rows=10, export_excel=True, generate_html=True):

        """

        Esegue tutte le analisi disponibili

        

        Args:

            preview_rows (int): Numero di righe da visualizzare nell'anteprima

            export_excel (bool): Se esportare i dati in Excel

            generate_html (bool): Se generare il report HTML

        """

        self.show_preview(preview_rows)

        self.analyze_sectors()

        self.analyze_geography()

        self.analyze_web_presence()

        

        if export_excel:

            self.export_to_excel()

        

        if generate_html:

            html_file = self.generate_html_report()

            if html_file and os.path.exists(html_file):

                # Apri il report HTML nel browser

                print(f"\nApertura del report HTML nel browser...")

                webbrowser.open('file://' + os.path.abspath(html_file))



def main():

    """

    Funzione principale

    """

    parser = argparse.ArgumentParser(description='Visualizzatore di contatti PMI italiane')

    parser.add_argument('--file', default='pmi_contatti_reali.csv', help='File CSV con i contatti delle PMI')

    parser.add_argument('--righe', type=int, default=10, help='Numero di righe da visualizzare nell\'anteprima')

    parser.add_argument('--no-excel', action='store_true', help='Non esportare in Excel')

    parser.add_argument('--no-html', action='store_true', help='Non generare il report HTML')

    

    args = parser.parse_args()

    

    visualizer = ContattiVisualizer(args.file)

    visualizer.run_all_analyses(

        preview_rows=args.righe, 

        export_excel=not args.no_excel,

        generate_html=not args.no_html

    )



if __name__ == "__main__":

    main()
