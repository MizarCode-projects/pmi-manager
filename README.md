# Generatore e Analizzatore di Dati PMI Italiane

Questo progetto fornisce strumenti per generare e analizzare dati realistici di PMI (Piccole e Medie Imprese) italiane. Il sistema u00e8 composto da due componenti principali: un generatore di dati e un visualizzatore avanzato.

## Caratteristiche

### Generatore di dati PMI

Il generatore crea dati realistici di PMI italiane, includendo:

- Dati anagrafici: ragione sociale, forma giuridica, anno di fondazione, partita IVA
- Dati dimensionali: categoria (micro, piccola, media impresa), numero di dipendenti, fatturato annuo
- Dati di contatto: telefono, email, sito web, indirizzo completo
- Dati settoriali: settore di attivitu00e0, descrizione dell'azienda

I dati generati rispettano i criteri dell'Unione Europea per la classificazione delle PMI:
- **Micro impresa**: < 10 dipendenti, fatturato u2264 2 milioni u20ac
- **Piccola impresa**: < 50 dipendenti, fatturato u2264 10 milioni u20ac
- **Media impresa**: < 250 dipendenti, fatturato u2264 50 milioni u20ac

### Visualizzatore avanzato

Il visualizzatore fornisce analisi dettagliate e grafici intuitivi dei dati delle PMI, tra cui:

- Distribuzione per categoria di PMI (micro, piccola, media)
- Analisi settoriale
- Distribuzione geografica (per cittu00e0 e provincia)
- Analisi di dipendenti e fatturato
- Analisi dell'etu00e0 delle aziende
- Distribuzione delle forme giuridiche
- Analisi della presenza web

Tutti i grafici vengono salvati automaticamente in formato PNG ad alta risoluzione e i dati completi vengono esportati in un file Excel formattato.

## Requisiti

```
pandas
matplotlib
seaborn
tabulate
xlsxwriter
```

Puoi installare tutte le dipendenze con:

```bash
pip install pandas matplotlib seaborn tabulate xlsxwriter
```

## Utilizzo

### Generazione dei dati

```bash
python pmi_generator.py --output pmi_italiane.csv --num 1000
```

Parametri:
- `--output`: File di output (default: pmi_italiane.csv)
- `--num`: Numero di aziende da generare (default: 1000)

### Visualizzazione base

```bash
python visualizza_pmi.py --file pmi_italiane.csv --righe 10 --excel --grafici
```

Parametri:
- `--file`: File CSV con i dati delle PMI
- `--righe`: Numero di righe da visualizzare nell'anteprima
- `--excel`: Esporta i dati in Excel
- `--grafici`: Genera grafici

### Visualizzazione avanzata

```bash
python visualizza_pmi_avanzato.py --file pmi_italiane.csv
```

Parametri:
- `--file`: File CSV con i dati delle PMI (default: pmi_italiane.csv)
- `--righe`: Numero di righe da visualizzare nell'anteprima (default: 10)
- `--no-excel`: Non esportare in Excel

## Output

### File generati

- `pmi_italiane.csv`: Dataset principale in formato CSV
- `pmi_analisi_completa.xlsx`: Analisi completa in formato Excel
- Vari file PNG con grafici dettagliati:
  - distribuzione_categorie.png
  - distribuzione_settori_avanzato.png
  - settori_per_categoria.png
  - distribuzione_province.png
  - distribuzione_dipendenti.png
  - distribuzione_fatturato.png
  - relazione_dipendenti_fatturato.png
  - distribuzione_eta.png
  - eta_per_categoria.png
  - distribuzione_forme_giuridiche.png
  - forme_giuridiche_per_categoria.png
  - presenza_web.png
  - presenza_web_per_categoria.png

## Esempio di utilizzo completo

```bash
# Genera 1000 PMI italiane
python pmi_generator.py --output pmi_italiane.csv --num 1000

# Esegui l'analisi avanzata
python visualizza_pmi_avanzato.py --file pmi_italiane.csv
```

## Note

I dati generati sono realistici ma fittizi, creati per scopi dimostrativi e di analisi. Le distribuzioni statistiche sono basate su dati reali del panorama delle PMI italiane, ma le singole aziende generate sono completamente inventate.
