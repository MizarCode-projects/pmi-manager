#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Visualizzatore di dati PMI - Script per visualizzare i dati delle PMI in modo intuitivo
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import sys
from tabulate import tabulate

def carica_dati(file_path):
    """Carica i dati dal file CSV"""
    try:
        df = pd.read_csv(file_path)
        print(f"Caricati {len(df)} record dal file {file_path}")
        return df
    except Exception as e:
        print(f"Errore nel caricamento del file: {e}")
        sys.exit(1)

def mostra_anteprima(df, num_righe=10):
    """Mostra un'anteprima dei dati in formato tabellare"""
    print("\n=== ANTEPRIMA DEI DATI ===")
    print(tabulate(df.head(num_righe), headers='keys', tablefmt='pretty', showindex=False))

def analisi_settori(df):
    """Analizza la distribuzione dei settori"""
    print("\n=== DISTRIBUZIONE PER SETTORE ===")
    settori = df['Settore'].value_counts()
    print(tabulate(settori.reset_index().rename(columns={'index': 'Settore', 'Settore': 'Numero di aziende'}), 
                  headers='keys', tablefmt='pretty', showindex=False))
    
    # Crea un grafico a torta per i settori
    plt.figure(figsize=(12, 8))
    settori.plot(kind='pie', autopct='%1.1f%%', startangle=90)
    plt.title('Distribuzione delle PMI per Settore')
    plt.ylabel('')
    plt.tight_layout()
    plt.savefig('distribuzione_settori.png')
    print(f"Grafico salvato come 'distribuzione_settori.png'")

def analisi_citta(df):
    """Analizza la distribuzione geografica"""
    print("\n=== DISTRIBUZIONE GEOGRAFICA ===")
    # Estrai la città dall'indirizzo
    df['Citta'] = df['Indirizzo'].str.extract(r'- \d+ (.+)$')
    citta = df['Citta'].value_counts().head(15)
    print(tabulate(citta.reset_index().rename(columns={'index': 'Città', 'Citta': 'Numero di aziende'}), 
                  headers='keys', tablefmt='pretty', showindex=False))
    
    # Crea un grafico a barre per le città
    plt.figure(figsize=(12, 8))
    citta.plot(kind='bar', color='skyblue')
    plt.title('Top 15 Città per Numero di PMI')
    plt.xlabel('Città')
    plt.ylabel('Numero di PMI')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('distribuzione_citta.png')
    print(f"Grafico salvato come 'distribuzione_citta.png'")

def analisi_siti_web(df):
    """Analizza la presenza di siti web"""
    print("\n=== PRESENZA SITO WEB ===")
    ha_sito = df['Sito Web'].notna().sum()
    no_sito = df['Sito Web'].isna().sum()
    print(f"PMI con sito web: {ha_sito} ({ha_sito/len(df)*100:.1f}%)")
    print(f"PMI senza sito web: {no_sito} ({no_sito/len(df)*100:.1f}%)")
    
    # Crea un grafico a barre per la presenza di siti web
    plt.figure(figsize=(8, 6))
    plt.bar(['Con sito web', 'Senza sito web'], [ha_sito, no_sito], color=['green', 'red'])
    plt.title('Presenza di Siti Web tra le PMI')
    plt.ylabel('Numero di PMI')
    plt.tight_layout()
    plt.savefig('presenza_siti_web.png')
    print(f"Grafico salvato come 'presenza_siti_web.png'")

def esporta_excel(df, output_file='pmi_data_formattato.xlsx'):
    """Esporta i dati in formato Excel con formattazione"""
    try:
        writer = pd.ExcelWriter(output_file, engine='xlsxwriter')
        df.to_excel(writer, sheet_name='PMI Italiane', index=False)
        
        # Ottieni il foglio di lavoro
        workbook = writer.book
        worksheet = writer.sheets['PMI Italiane']
        
        # Definisci i formati
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'fg_color': '#D7E4BC',
            'border': 1
        })
        
        # Applica il formato all'intestazione
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
        
        # Imposta la larghezza delle colonne
        for i, col in enumerate(df.columns):
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.set_column(i, i, min(max_len, 30))
        
        writer.close()
        print(f"\nDati esportati in formato Excel: {output_file}")
    except Exception as e:
        print(f"Errore nell'esportazione in Excel: {e}")

def main():
    """Funzione principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Visualizzatore di dati PMI')
    parser.add_argument('--file', default='pmi_data.csv', help='Percorso del file CSV')
    parser.add_argument('--righe', type=int, default=10, help='Numero di righe da visualizzare nell\'anteprima')
    parser.add_argument('--excel', action='store_true', help='Esporta i dati in formato Excel')
    parser.add_argument('--grafici', action='store_true', help='Genera grafici di analisi')
    
    args = parser.parse_args()
    
    # Carica i dati
    df = carica_dati(args.file)
    
    # Mostra anteprima
    mostra_anteprima(df, args.righe)
    
    # Genera analisi e grafici se richiesto
    if args.grafici:
        analisi_settori(df)
        analisi_citta(df)
        analisi_siti_web(df)
    
    # Esporta in Excel se richiesto
    if args.excel:
        esporta_excel(df)

if __name__ == "__main__":
    main()
