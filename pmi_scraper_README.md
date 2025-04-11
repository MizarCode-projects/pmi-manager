# PMI Scraper

Uno script Python per il web scraping di informazioni su PMI italiane da directory aziendali.

## Descrizione

Questo script permette di raccogliere automaticamente informazioni sulle PMI italiane da siti web di directory aziendali come Pagine Gialle o simili. Lo script estrae i seguenti dati:

- Nome dell'azienda
- Email aziendale (se disponibile)
- Numero di telefono
- Descrizione dell'azienda
- Sito web aziendale (se disponibile)

I dati raccolti vengono salvati in formato CSV o in un database SQLite per un utilizzo successivo.

## Requisiti

Per utilizzare lo script è necessario installare le seguenti librerie Python:

```bash
pip install requests beautifulsoup4
```

## Utilizzo

Lo script può essere eseguito da riga di comando con vari parametri:

```bash
python pmi_scraper.py --url "https://www.example.com/directory" --output csv --start-page 1 --end-page 5
```

### Parametri disponibili

- `--url`: URL base della directory aziendale (obbligatorio)
- `--output`: Formato di output (`csv` o `db`, default: `csv`)
- `--start-page`: Numero della pagina iniziale (default: 1)
- `--end-page`: Numero della pagina finale (default: 5)
- `--db-path`: Percorso del database SQLite (default: `pmi_data.db`)
- `--csv-path`: Percorso del file CSV (default: `pmi_data.csv`)

## Personalizzazione

Lo script potrebbe richiedere personalizzazioni in base alla struttura specifica del sito web da cui si vogliono estrarre i dati. In particolare, potrebbe essere necessario modificare i selettori CSS o le espressioni regolari utilizzate per identificare gli elementi della pagina.

Le principali aree che potrebbero richiedere personalizzazione sono:

1. Il metodo `scrape_directory_page` per adattarlo alla struttura della directory
2. I selettori utilizzati nel metodo `extract_company_data` per estrarre le informazioni specifiche

## Note etiche e legali

Questo script è stato progettato per scopi educativi e di ricerca. Si prega di:

- Rispettare i termini di servizio dei siti web da cui si estraggono i dati
- Non sovraccaricare i server con richieste eccessive (lo script include già ritardi casuali)
- Non raccogliere dati personali o sensibili senza consenso
- Verificare la conformità con il GDPR e altre normative sulla privacy applicabili

## Automazione

Per eseguire lo script periodicamente su sistemi Unix/Linux, è possibile configurare un cron job:

```bash
# Esempio di cron job per eseguire lo script ogni giorno alle 2:00
0 2 * * * cd /percorso/al/progetto && python pmi_scraper.py --url "https://www.example.com/directory" --output csv
```

Su Windows, è possibile utilizzare l'Utilità di pianificazione di Windows per configurare un'attività pianificata simile.
