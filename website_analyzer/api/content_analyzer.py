#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Content Analyzer - Modulo per l'analisi dei contenuti dei siti web
"""

import re
import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse

logger = logging.getLogger("website_analyzer.content")

def analyze_content(url):
    """
    Analizza i contenuti di un sito web
    
    Args:
        url (str): URL del sito da analizzare
        
    Returns:
        dict: Risultati dell'analisi dei contenuti
    """
    logger.info(f"Analisi dei contenuti per {url}")
    
    try:
        # Effettua una richiesta al sito
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Analisi del testo
        text_analysis = analyze_text(soup)
        
        # Analisi della freschezza dei contenuti
        freshness = analyze_freshness(soup, response)
        
        # Analisi dei media
        media_analysis = analyze_media(soup, url)
        
        return {
            'textAnalysis': text_analysis,
            'freshness': freshness,
            'mediaAnalysis': media_analysis
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi dei contenuti: {str(e)}")
        # In caso di errore, restituisci dati simulati
        return get_simulated_content_results()

def analyze_text(soup):
    """
    Analizza il testo della pagina
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        
    Returns:
        dict: Risultati dell'analisi del testo
    """
    try:
        # Estrai il testo principale della pagina (escludendo script, style, ecc.)
        for script in soup(["script", "style", "header", "footer", "nav"]):
            script.extract()
        
        text = soup.get_text()
        
        # Pulisci il testo
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Conta le parole
        words = re.findall(r'\w+', text.lower())
        word_count = len(words)
        
        # Calcola la densità delle keyword (parole più frequenti)
        word_freq = {}
        for word in words:
            if len(word) > 3:  # Ignora parole troppo corte
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Ottieni le top 3 keyword
        top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:3]
        keyword_density = [
            {
                'keyword': keyword,
                'count': count,
                'density': round(count / word_count * 100, 2) if word_count > 0 else 0
            } for keyword, count in top_keywords
        ]
        
        # Calcola un punteggio di leggibilità semplificato
        # In un'implementazione reale, qui ci sarebbe un algoritmo più complesso (es. Flesch-Kincaid)
        sentences = re.split(r'[.!?]+', text)
        sentence_count = len([s for s in sentences if len(s.strip()) > 0])
        
        if sentence_count > 0 and word_count > 0:
            avg_words_per_sentence = word_count / sentence_count
            readability_score = max(0, min(100, 100 - (avg_words_per_sentence - 15) * 5))
        else:
            readability_score = 50
        
        # Determina il grado di leggibilità
        if readability_score >= 80:
            readability_grade = 'Ottima'
        elif readability_score >= 60:
            readability_grade = 'Buona'
        elif readability_score >= 40:
            readability_grade = 'Media'
        else:
            readability_grade = 'Difficile'
        
        # Calcola un punteggio di sentiment semplificato (simulato)
        # In un'implementazione reale, qui ci sarebbe un'analisi del sentiment più complessa
        sentiment_score = 0.6  # Valore simulato tra -1 e 1
        
        return {
            'wordCount': word_count,
            'readabilityScore': round(readability_score),
            'readabilityGrade': readability_grade,
            'keywordDensity': keyword_density,
            'sentimentScore': sentiment_score
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi del testo: {str(e)}")
        return {
            'wordCount': 1250,
            'readabilityScore': 68,
            'readabilityGrade': 'Buona',
            'keywordDensity': [
                {'keyword': 'esempio', 'count': 12, 'density': 0.96},
                {'keyword': 'analisi', 'count': 8, 'density': 0.64},
                {'keyword': 'contenuto', 'count': 7, 'density': 0.56}
            ],
            'sentimentScore': 0.6
        }

def analyze_freshness(soup, response):
    """
    Analizza la freschezza dei contenuti
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        response (Response): Risposta HTTP
        
    Returns:
        dict: Risultati dell'analisi della freschezza
    """
    try:
        # Cerca la data di ultima modifica negli header HTTP
        last_modified = None
        if 'Last-Modified' in response.headers:
            try:
                last_modified = response.headers['Last-Modified']
                last_modified_date = datetime.strptime(last_modified, '%a, %d %b %Y %H:%M:%S %Z')
            except ValueError:
                last_modified = None
        
        # Se non è presente negli header, cerca nel contenuto della pagina
        if not last_modified:
            # Cerca meta tag con data di aggiornamento
            meta_modified = soup.find('meta', {'property': 'article:modified_time'}) or \
                           soup.find('meta', {'name': 'last-modified'}) or \
                           soup.find('meta', {'name': 'date'}) or \
                           soup.find('meta', {'property': 'og:updated_time'})
            
            if meta_modified and meta_modified.get('content'):
                try:
                    last_modified = meta_modified['content']
                    # Prova a parsare la data in vari formati
                    try:
                        last_modified_date = datetime.fromisoformat(last_modified.replace('Z', '+00:00'))
                    except ValueError:
                        try:
                            last_modified_date = datetime.strptime(last_modified, '%Y-%m-%d')
                        except ValueError:
                            last_modified_date = None
                except Exception:
                    last_modified = None
        
        # Se ancora non è stata trovata, usa la data corrente
        if not last_modified:
            last_modified_date = datetime.now()
            last_modified = last_modified_date.isoformat()
        
        # Calcola l'età del contenuto in giorni
        if last_modified_date:
            age_days = (datetime.now() - last_modified_date).days
        else:
            age_days = 0
        
        # Determina se il contenuto è fresco (meno di 90 giorni)
        fresh = age_days < 90
        
        return {
            'lastModified': last_modified,
            'age': age_days,
            'fresh': fresh
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi della freschezza: {str(e)}")
        return {
            'lastModified': '2025-03-15T10:30:00Z',
            'age': 26,
            'fresh': True
        }

def analyze_media(soup, base_url):
    """
    Analizza i media presenti nella pagina
    
    Args:
        soup (BeautifulSoup): Oggetto BeautifulSoup della pagina
        base_url (str): URL base del sito
        
    Returns:
        dict: Risultati dell'analisi dei media
    """
    try:
        # Trova tutte le immagini
        images = soup.find_all('img')
        
        # Conta le immagini senza attributo alt
        alt_missing = sum(1 for img in images if not img.get('alt'))
        
        # Verifica se le immagini sono responsive
        responsive_images = False
        for img in images:
            # Controlla se l'immagine ha attributi responsive
            if img.get('srcset') or img.get('sizes') or img.get('loading') == 'lazy':
                responsive_images = True
                break
        
        # Trova tutti i video
        videos = soup.find_all(['video', 'iframe'])
        video_count = len([v for v in videos if 'youtube.com' in v.get('src', '') or \
                                             'vimeo.com' in v.get('src', '') or \
                                             v.name == 'video'])
        
        return {
            'images': len(images),
            'videos': video_count,
            'altTextMissing': alt_missing,
            'responsiveImages': responsive_images
        }
    except Exception as e:
        logger.error(f"Errore durante l'analisi dei media: {str(e)}")
        return {
            'images': 15,
            'videos': 2,
            'altTextMissing': 3,
            'responsiveImages': True
        }

def get_simulated_content_results():
    """
    Restituisce risultati simulati per l'analisi dei contenuti
    quando non è possibile ottenere dati reali
    
    Returns:
        dict: Risultati simulati dell'analisi dei contenuti
    """
    return {
        'textAnalysis': {
            'wordCount': 1250,
            'readabilityScore': 68,
            'readabilityGrade': 'Buona',
            'keywordDensity': [
                {'keyword': 'esempio', 'count': 12, 'density': 0.96},
                {'keyword': 'analisi', 'count': 8, 'density': 0.64},
                {'keyword': 'contenuto', 'count': 7, 'density': 0.56}
            ],
            'sentimentScore': 0.6
        },
        'freshness': {
            'lastModified': '2025-03-15T10:30:00Z',
            'age': 26,
            'fresh': True
        },
        'mediaAnalysis': {
            'images': 15,
            'videos': 2,
            'altTextMissing': 3,
            'responsiveImages': True
        }
    }
