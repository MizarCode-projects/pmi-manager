#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Visualizzazione avanzata dei dati delle PMI italiane
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import argparse
from tabulate import tabulate
import os
import sys

# Impostazioni per i grafici
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('viridis')
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 12


class PMIVisualizer:
    """
    Classe per la visualizzazione avanzata dei dati delle PMI italiane
    """
    
    def __init__(self, file_path):
        """
        Inizializza il visualizzatore
        
        Args:
            file_path (str): Percorso del file CSV con i dati delle PMI
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
            print(f"Caricati {len(self.df)} record dal file {self.file_path}")
        except Exception as e:
            print(f"Errore nel caricamento del file: {e}")
            sys.exit(1)
    
    def show_preview(self, rows=10):
        """
        Mostra un'anteprima dei dati
        
        Args:
            rows (int): Numero di righe da visualizzare
        """
        print("\n=== ANTEPRIMA DEI DATI ===")
        print(tabulate(self.df.head(rows), headers='keys', tablefmt='grid', showindex=False))
    
    def analyze_categories(self):
        """
        Analizza la distribuzione delle categorie di PMI
        """
        print("\n=== DISTRIBUZIONE PER CATEGORIA DI PMI ===")
        categoria_counts = self.df['Categoria'].value_counts()
        print(tabulate(categoria_counts.reset_index().rename(columns={'index': 'Categoria PMI', 'Categoria': 'Numero'}), 
                       headers='keys', tablefmt='grid', showindex=False))
        
        # Grafico a torta per le categorie
        plt.figure(figsize=(10, 8))
        plt.pie(categoria_counts, labels=categoria_counts.index, autopct='%1.1f%%', startangle=90, 
                wedgeprops={'edgecolor': 'white', 'linewidth': 1.5})
        plt.title('Distribuzione delle PMI per categoria', fontsize=16, pad=20)
        plt.tight_layout()
        plt.savefig('distribuzione_categorie.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_categorie.png'")
        
        # Calcola statistiche per dipendenti e fatturato per categoria
        stats_by_category = self.df.groupby('Categoria').agg({
            'Dipendenti': ['mean', 'median', 'min', 'max'],
            'Fatturato (milioni €)': ['mean', 'median', 'min', 'max']
        }).round(2)
        
        print("\n=== STATISTICHE PER CATEGORIA ===")
        print(tabulate(stats_by_category, headers='keys', tablefmt='grid'))
    
    def analyze_sectors(self):
        """
        Analizza la distribuzione dei settori
        """
        print("\n=== DISTRIBUZIONE PER SETTORE ===")
        sector_counts = self.df['Settore'].value_counts()
        print(tabulate(sector_counts.head(15).reset_index().rename(columns={'index': 'Settore', 'Settore': 'Numero'}), 
                       headers='keys', tablefmt='grid', showindex=False))
        
        # Grafico a barre orizzontali per i settori
        plt.figure(figsize=(12, 10))
        ax = sns.barplot(x=sector_counts.values, y=sector_counts.index, palette='viridis')
        plt.title('Distribuzione delle PMI per settore', fontsize=16, pad=20)
        plt.xlabel('Numero di aziende', fontsize=14)
        plt.ylabel('Settore', fontsize=14)
        
        # Aggiungi i valori alle barre
        for i, v in enumerate(sector_counts.values):
            ax.text(v + 0.5, i, str(v), va='center')
            
        plt.tight_layout()
        plt.savefig('distribuzione_settori_avanzato.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_settori_avanzato.png'")
        
        # Analisi incrociata settore-categoria
        print("\n=== DISTRIBUZIONE SETTORI PER CATEGORIA ===")
        sector_by_category = pd.crosstab(self.df['Settore'], self.df['Categoria'])
        print(tabulate(sector_by_category.head(10), headers='keys', tablefmt='grid'))
        
        # Grafico a mosaico per settore e categoria
        plt.figure(figsize=(14, 10))
        sector_category_data = pd.crosstab(self.df['Settore'], self.df['Categoria'])
        sector_category_data.plot(kind='bar', stacked=True, colormap='viridis')
        plt.title('Distribuzione delle categorie di PMI per settore', fontsize=16, pad=20)
        plt.xlabel('Settore', fontsize=14)
        plt.ylabel('Numero di aziende', fontsize=14)
        plt.xticks(rotation=45, ha='right')
        plt.legend(title='Categoria')
        plt.tight_layout()
        plt.savefig('settori_per_categoria.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'settori_per_categoria.png'")
    
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
        province_counts = self.df['Provincia'].value_counts().head(15)
        print("\nTop 15 province per numero di PMI:")
        print(tabulate(province_counts.reset_index().rename(columns={'index': 'Provincia', 'Provincia': 'Numero'}), 
                       headers='keys', tablefmt='grid', showindex=False))
        
        # Grafico a barre per province
        plt.figure(figsize=(12, 8))
        sns.barplot(x=province_counts.index, y=province_counts.values, palette='viridis')
        plt.title('Distribuzione delle PMI per provincia', fontsize=16, pad=20)
        plt.xlabel('Provincia', fontsize=14)
        plt.ylabel('Numero di aziende', fontsize=14)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig('distribuzione_province.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_province.png'")
    
    def analyze_employees_revenue(self):
        """
        Analizza la distribuzione di dipendenti e fatturato
        """
        print("\n=== ANALISI DIPENDENTI E FATTURATO ===")
        
        # Statistiche descrittive
        stats = self.df[['Dipendenti', 'Fatturato (milioni €)']].describe().round(2)
        print(tabulate(stats, headers='keys', tablefmt='grid'))
        
        # Grafico di distribuzione dei dipendenti
        plt.figure(figsize=(12, 8))
        sns.histplot(self.df['Dipendenti'], bins=30, kde=True)
        plt.title('Distribuzione del numero di dipendenti', fontsize=16, pad=20)
        plt.xlabel('Numero di dipendenti', fontsize=14)
        plt.ylabel('Frequenza', fontsize=14)
        plt.tight_layout()
        plt.savefig('distribuzione_dipendenti.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_dipendenti.png'")
        
        # Grafico di distribuzione del fatturato
        plt.figure(figsize=(12, 8))
        sns.histplot(self.df['Fatturato (milioni €)'], bins=30, kde=True)
        plt.title('Distribuzione del fatturato annuo', fontsize=16, pad=20)
        plt.xlabel('Fatturato (milioni €)', fontsize=14)
        plt.ylabel('Frequenza', fontsize=14)
        plt.tight_layout()
        plt.savefig('distribuzione_fatturato.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_fatturato.png'")
        
        # Relazione tra dipendenti e fatturato
        plt.figure(figsize=(12, 8))
        sns.scatterplot(x='Dipendenti', y='Fatturato (milioni €)', hue='Categoria', 
                        size='Dipendenti', sizes=(20, 200), alpha=0.7, data=self.df)
        plt.title('Relazione tra numero di dipendenti e fatturato', fontsize=16, pad=20)
        plt.xlabel('Numero di dipendenti', fontsize=14)
        plt.ylabel('Fatturato (milioni €)', fontsize=14)
        plt.tight_layout()
        plt.savefig('relazione_dipendenti_fatturato.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'relazione_dipendenti_fatturato.png'")
    
    def analyze_age(self):
        """
        Analizza l'età delle aziende
        """
        print("\n=== ANALISI ETÀ DELLE AZIENDE ===")
        
        # Calcola l'età delle aziende
        current_year = 2025  # Anno corrente
        self.df['Età'] = current_year - self.df['Anno Fondazione']
        
        # Statistiche sull'età
        age_stats = self.df['Età'].describe().round(2)
        print(f"Età media delle aziende: {age_stats['mean']:.1f} anni")
        print(f"Età mediana: {age_stats['50%']:.1f} anni")
        print(f"Azienda più giovane: {age_stats['min']:.0f} anni")
        print(f"Azienda più vecchia: {age_stats['max']:.0f} anni")
        
        # Grafico di distribuzione dell'età
        plt.figure(figsize=(12, 8))
        sns.histplot(self.df['Età'], bins=20, kde=True)
        plt.title('Distribuzione dell\'età delle aziende', fontsize=16, pad=20)
        plt.xlabel('Età (anni)', fontsize=14)
        plt.ylabel('Frequenza', fontsize=14)
        plt.tight_layout()
        plt.savefig('distribuzione_eta.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_eta.png'")
        
        # Relazione tra età e dimensione
        plt.figure(figsize=(12, 8))
        sns.boxplot(x='Categoria', y='Età', data=self.df)
        plt.title('Relazione tra età e categoria di PMI', fontsize=16, pad=20)
        plt.xlabel('Categoria', fontsize=14)
        plt.ylabel('Età (anni)', fontsize=14)
        plt.tight_layout()
        plt.savefig('eta_per_categoria.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'eta_per_categoria.png'")
    
    def analyze_legal_forms(self):
        """
        Analizza le forme giuridiche
        """
        print("\n=== ANALISI FORME GIURIDICHE ===")
        
        # Distribuzione delle forme giuridiche
        legal_counts = self.df['Forma Giuridica'].value_counts()
        print(tabulate(legal_counts.reset_index().rename(columns={'index': 'Forma Giuridica', 'Forma Giuridica': 'Numero'}), 
                       headers='keys', tablefmt='grid', showindex=False))
        
        # Grafico a torta per le forme giuridiche
        plt.figure(figsize=(12, 8))
        plt.pie(legal_counts, labels=legal_counts.index, autopct='%1.1f%%', startangle=90, 
                wedgeprops={'edgecolor': 'white', 'linewidth': 1.5})
        plt.title('Distribuzione delle forme giuridiche', fontsize=16, pad=20)
        plt.tight_layout()
        plt.savefig('distribuzione_forme_giuridiche.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'distribuzione_forme_giuridiche.png'")
        
        # Relazione tra forma giuridica e categoria
        legal_by_category = pd.crosstab(self.df['Forma Giuridica'], self.df['Categoria'])
        print("\nDistribuzione delle forme giuridiche per categoria:")
        print(tabulate(legal_by_category, headers='keys', tablefmt='grid'))
        
        # Grafico a barre impilate
        plt.figure(figsize=(12, 8))
        legal_by_category.plot(kind='bar', stacked=True, colormap='viridis')
        plt.title('Distribuzione delle forme giuridiche per categoria', fontsize=16, pad=20)
        plt.xlabel('Forma Giuridica', fontsize=14)
        plt.ylabel('Numero di aziende', fontsize=14)
        plt.xticks(rotation=45, ha='right')
        plt.legend(title='Categoria')
        plt.tight_layout()
        plt.savefig('forme_giuridiche_per_categoria.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'forme_giuridiche_per_categoria.png'")
    
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
        plt.savefig('presenza_web.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'presenza_web.png'")
        
        # Presenza web per categoria
        web_by_category = pd.crosstab(self.df['Categoria'], has_website)
        web_by_category.columns = ['Senza sito web', 'Con sito web']
        
        print("\nPresenza web per categoria:")
        print(tabulate(web_by_category, headers='keys', tablefmt='grid'))
        
        # Grafico a barre per presenza web per categoria
        plt.figure(figsize=(10, 8))
        web_by_category.plot(kind='bar', stacked=True, colormap='RdYlGn')
        plt.title('Presenza web per categoria di PMI', fontsize=16, pad=20)
        plt.xlabel('Categoria', fontsize=14)
        plt.ylabel('Numero di aziende', fontsize=14)
        plt.xticks(rotation=0)
        plt.legend(title='Presenza web')
        plt.tight_layout()
        plt.savefig('presenza_web_per_categoria.png', dpi=300, bbox_inches='tight')
        print("Grafico salvato come 'presenza_web_per_categoria.png'")
        
        # Presenza web per settore
        web_by_sector = pd.crosstab(self.df['Settore'], has_website)
        web_by_sector.columns = ['Senza sito web', 'Con sito web']
        web_by_sector['Percentuale con sito'] = (web_by_sector['Con sito web'] / 
                                               (web_by_sector['Con sito web'] + web_by_sector['Senza sito web']) * 100).round(1)
        
        # Ordina per percentuale di presenza web
        web_by_sector_sorted = web_by_sector.sort_values('Percentuale con sito', ascending=False)
        
        print("\nSettori con maggiore presenza web:")
        print(tabulate(web_by_sector_sorted.head(10)[['Con sito web', 'Senza sito web', 'Percentuale con sito']], 
                       headers='keys', tablefmt='grid'))
    
    def export_to_excel(self, output_file='pmi_analisi_completa.xlsx'):
        """
        Esporta i dati in formato Excel con formattazione avanzata
        
        Args:
            output_file (str): Nome del file Excel di output
        """
        try:
            # Crea un writer Excel con XlsxWriter
            writer = pd.ExcelWriter(output_file, engine='xlsxwriter')
            
            # Esporta il dataframe principale
            self.df.to_excel(writer, sheet_name='Dati Completi', index=False)
            
            # Ottieni il workbook e il worksheet
            workbook = writer.book
            worksheet = writer.sheets['Dati Completi']
            
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
            
            # Formattazione per le celle numeriche
            num_format = workbook.add_format({'num_format': '#,##0'})
            euro_format = workbook.add_format({'num_format': '#,##0.00 €'})
            
            # Applica formattazione alle colonne
            worksheet.set_column('A:Z', 18)  # Larghezza colonna di base
            worksheet.set_column('G:G', 12, num_format)  # Dipendenti
            worksheet.set_column('H:H', 15, euro_format)  # Fatturato
            
            # Crea fogli aggiuntivi con analisi
            
            # Foglio per categorie
            categoria_counts = self.df['Categoria'].value_counts().reset_index()
            categoria_counts.columns = ['Categoria', 'Numero di aziende']
            categoria_counts.to_excel(writer, sheet_name='Categorie', index=False)
            
            # Foglio per settori
            settori_counts = self.df['Settore'].value_counts().reset_index()
            settori_counts.columns = ['Settore', 'Numero di aziende']
            settori_counts.to_excel(writer, sheet_name='Settori', index=False)
            
            # Foglio per forme giuridiche
            forme_counts = self.df['Forma Giuridica'].value_counts().reset_index()
            forme_counts.columns = ['Forma Giuridica', 'Numero di aziende']
            forme_counts.to_excel(writer, sheet_name='Forme Giuridiche', index=False)
            
            # Foglio per statistiche
            stats_sheet = pd.DataFrame()
            
            # Statistiche per categoria
            stats_by_category = self.df.groupby('Categoria').agg({
                'Dipendenti': ['count', 'mean', 'median', 'min', 'max'],
                'Fatturato (milioni €)': ['mean', 'median', 'min', 'max']
            }).round(2)
            
            stats_sheet = stats_by_category
            stats_sheet.to_excel(writer, sheet_name='Statistiche')
            
            # Chiudi il writer per salvare il file
            writer.close()
            
            print(f"\nDati esportati in formato Excel: {output_file}")
            
        except Exception as e:
            print(f"Errore nell'esportazione in Excel: {e}")
    
    def run_all_analyses(self, preview_rows=10, export_excel=True):
        """
        Esegue tutte le analisi disponibili
        
        Args:
            preview_rows (int): Numero di righe da visualizzare nell'anteprima
            export_excel (bool): Se esportare i dati in Excel
        """
        self.show_preview(preview_rows)
        self.analyze_categories()
        self.analyze_sectors()
        self.analyze_geography()
        self.analyze_employees_revenue()
        self.analyze_age()
        self.analyze_legal_forms()
        self.analyze_web_presence()
        
        if export_excel:
            self.export_to_excel()


def main():
    """
    Funzione principale
    """
    parser = argparse.ArgumentParser(description='Visualizzazione avanzata dei dati delle PMI italiane')
    parser.add_argument('--file', default='pmi_italiane.csv', help='File CSV con i dati delle PMI')
    parser.add_argument('--righe', type=int, default=10, help='Numero di righe da visualizzare nell\'anteprima')
    parser.add_argument('--no-excel', action='store_true', help='Non esportare in Excel')
    
    args = parser.parse_args()
    
    visualizer = PMIVisualizer(args.file)
    visualizer.run_all_analyses(preview_rows=args.righe, export_excel=not args.no_excel)


if __name__ == "__main__":
    main()
