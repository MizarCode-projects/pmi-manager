import csv
import random
import string
import os
from datetime import datetime

# Dati per la generazione di contatti PMI realistici
SETTORI = [
    "Tecnologia", "Manifatturiero", "Edilizia", "Alimentare", "Commercio", "Servizi",
    "Turismo", "Agricoltura", "Trasporti", "Energia", "Tessile", "Arredamento",
    "Meccanica", "Chimica", "Elettronica", "Automotive", "Farmaceutico", "Consulenza",
    "Logistica", "Marketing", "Design", "Formazione", "Ristorazione", "Immobiliare"
]

PROVINCE = [
    "Milano", "Roma", "Torino", "Napoli", "Bologna", "Firenze", "Genova", "Bari",
    "Venezia", "Padova", "Verona", "Brescia", "Modena", "Parma", "Bergamo", "Catania",
    "Palermo", "Cagliari", "Trento", "Bolzano", "Perugia", "Ancona", "Pescara", "Lecce"
]

CITTA = {
    "Milano": ["Milano", "Monza", "Lodi", "Sesto San Giovanni", "Rho", "Legnano"],
    "Roma": ["Roma", "Fiumicino", "Civitavecchia", "Tivoli", "Velletri", "Anzio"],
    "Torino": ["Torino", "Moncalieri", "Rivoli", "Chieri", "Pinerolo", "Ivrea"],
    "Napoli": ["Napoli", "Pozzuoli", "Casoria", "Afragola", "Portici", "Ercolano"],
    "Bologna": ["Bologna", "Imola", "San Lazzaro", "Casalecchio", "Castel Maggiore"],
    "Firenze": ["Firenze", "Prato", "Scandicci", "Sesto Fiorentino", "Empoli"],
    "Genova": ["Genova", "Rapallo", "Chiavari", "Sestri Levante", "Lavagna"],
    "Bari": ["Bari", "Altamura", "Monopoli", "Bitonto", "Molfetta", "Corato"],
    "Venezia": ["Venezia", "Mestre", "Chioggia", "Jesolo", "San Donà di Piave"],
    "Padova": ["Padova", "Abano Terme", "Cittadella", "Este", "Monselice"],
    "Verona": ["Verona", "Villafranca", "San Bonifacio", "Legnago", "Bussolengo"],
    "Brescia": ["Brescia", "Desenzano", "Montichiari", "Lumezzane", "Chiari"],
    "Modena": ["Modena", "Carpi", "Sassuolo", "Formigine", "Castelfranco Emilia"],
    "Parma": ["Parma", "Fidenza", "Salsomaggiore", "Collecchio", "Langhirano"],
    "Bergamo": ["Bergamo", "Treviglio", "Seriate", "Dalmine", "Romano di Lombardia"],
    "Catania": ["Catania", "Acireale", "Misterbianco", "Paternò", "Adrano"],
    "Palermo": ["Palermo", "Bagheria", "Monreale", "Carini", "Termini Imerese"],
    "Cagliari": ["Cagliari", "Quartu Sant'Elena", "Selargius", "Assemini", "Capoterra"],
    "Trento": ["Trento", "Rovereto", "Pergine", "Riva del Garda", "Arco"],
    "Bolzano": ["Bolzano", "Merano", "Bressanone", "Laives", "Brunico"],
    "Perugia": ["Perugia", "Foligno", "Città di Castello", "Spoleto", "Assisi"],
    "Ancona": ["Ancona", "Senigallia", "Jesi", "Fabriano", "Osimo"],
    "Pescara": ["Pescara", "Montesilvano", "Spoltore", "Città Sant'Angelo", "Penne"],
    "Lecce": ["Lecce", "Nardò", "Galatina", "Tricase", "Copertino"]
}

FORME_GIURIDICHE = ["S.r.l.", "S.p.A.", "S.a.s.", "S.n.c.", "Ditta Individuale", "Cooperativa"]

NOMI_AZIENDE_PREFISSI = [
    "Tech", "Ital", "Euro", "Eco", "Smart", "Digital", "Global", "Medi", "Agri", "Bio",
    "Cyber", "Data", "Energy", "Food", "Green", "Hydro", "Info", "Logic", "Mech", "Net",
    "Pro", "Soft", "System", "Tele", "Uni", "Web", "Aero", "Auto", "Electro", "Geo"
]

NOMI_AZIENDE_SUFFISSI = [
    "Systems", "Solutions", "Group", "Italia", "Service", "Tech", "Network", "Consulting",
    "Engineering", "Industries", "Products", "Development", "Manufacturing", "Services",
    "Technologies", "Innovations", "Partners", "Enterprise", "Company", "International"
]

NOMI_AZIENDE_ITALIANI = [
    "Rossi", "Bianchi", "Verdi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci",
    "Marino", "Greco", "Bruno", "Gallo", "Conti", "Mancini", "Costa", "Giordano",
    "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Caruso", "Ferrara", "Mariani"
]

DOMINI_EMAIL = [
    "gmail.com", "yahoo.it", "libero.it", "hotmail.com", "outlook.it", "pec.it",
    "azienda.com", "company.it", "business.it", "enterprise.com", "group.it", "tech.it"
]

DESCRIZIONI = [
    "Azienda leader nel settore {settore} con focus su innovazione e qualità.",
    "PMI specializzata in soluzioni {settore} per il mercato italiano ed europeo.",
    "Offriamo servizi e prodotti di alta qualità nel settore {settore} dal {anno}.",
    "Realtà consolidata nel panorama {settore} con particolare attenzione alla sostenibilità.",
    "Azienda innovativa nel campo {settore} con un team di professionisti qualificati.",
    "Forniamo soluzioni personalizzate per il settore {settore} a piccole e medie imprese.",
    "Dal {anno} operiamo con successo nel settore {settore} con clienti in tutta Italia.",
    "PMI in crescita specializzata in prodotti e servizi {settore} di alta qualità.",
    "La nostra missione è fornire eccellenza nel settore {settore} con un approccio innovativo.",
    "Azienda familiare con lunga tradizione nel settore {settore} e forte radicamento territoriale."
]

def generate_unique_company_name():
    """Genera un nome aziendale unico"""
    tipo = random.choice([1, 2, 3])
    
    if tipo == 1:
        # Nome composto da prefisso + suffisso
        nome = random.choice(NOMI_AZIENDE_PREFISSI) + random.choice(NOMI_AZIENDE_SUFFISSI)
    elif tipo == 2:
        # Nome italiano + settore/attività
        nome = random.choice(NOMI_AZIENDE_ITALIANI) + " " + random.choice(SETTORI)
    else:
        # Nome italiano + forma giuridica
        nome = random.choice(NOMI_AZIENDE_ITALIANI) + " " + random.choice(FORME_GIURIDICHE)
    
    return nome

def generate_email(company_name):
    """Genera un indirizzo email basato sul nome dell'azienda"""
    # Rimuovi spazi e caratteri speciali
    clean_name = ''.join(e for e in company_name if e.isalnum())
    clean_name = clean_name.lower()
    
    tipo = random.choice([1, 2, 3, 4])
    dominio = random.choice(DOMINI_EMAIL)
    
    if tipo == 1:
        return f"info@{clean_name}.it"
    elif tipo == 2:
        return f"contatti@{clean_name}.it"
    elif tipo == 3:
        return f"{clean_name}@{dominio}"
    else:
        return f"info@{clean_name}.com"

def generate_phone():
    """Genera un numero di telefono italiano realistico"""
    prefissi = ["02", "06", "011", "081", "051", "055", "010", "080", "041", "049", "045", "030"]
    prefisso = random.choice(prefissi)
    
    # Genera il resto del numero
    if prefisso == "02" or prefisso == "06":  # Milano o Roma
        resto = ''.join(random.choices(string.digits, k=7))
    else:
        resto = ''.join(random.choices(string.digits, k=6))
    
    return f"{prefisso} {resto}"

def generate_mobile():
    """Genera un numero di cellulare italiano realistico"""
    prefissi = ["320", "330", "340", "350", "360", "370", "380", "390", "391"]
    prefisso = random.choice(prefissi)
    resto = ''.join(random.choices(string.digits, k=7))
    
    return f"{prefisso} {resto}"

def generate_website(company_name):
    """Genera un sito web basato sul nome dell'azienda"""
    # Rimuovi spazi e caratteri speciali
    clean_name = ''.join(e for e in company_name if e.isalnum())
    clean_name = clean_name.lower()
    
    tld = random.choice([".it", ".com", ".net", ".eu", ".org"])
    
    # 20% di probabilità di non avere un sito web
    if random.random() < 0.2:
        return ""
    
    return f"www.{clean_name}{tld}"

def generate_address(provincia, citta):
    """Genera un indirizzo italiano realistico"""
    vie = ["Via Roma", "Via Garibaldi", "Via Dante", "Via Mazzini", "Corso Italia", 
           "Via Verdi", "Via Marconi", "Via Vittorio Emanuele", "Via Leonardo da Vinci", 
           "Via Cavour", "Via Milano", "Via Napoli", "Via Torino", "Via Bologna", 
           "Via Firenze", "Via Venezia", "Via Genova", "Via Bari", "Via Palermo", 
           "Via Catania", "Via Padova", "Via Verona", "Via Brescia", "Via Modena"]
    
    numero = random.randint(1, 150)
    via = random.choice(vie)
    
    return f"{via}, {numero}, {citta}, {provincia}"

def generate_pmi_contact(existing_companies):
    """Genera un contatto PMI completo assicurandosi che non ci siano duplicati"""
    # Genera un nome aziendale unico
    company_name = generate_unique_company_name()
    while company_name in existing_companies:
        company_name = generate_unique_company_name()
    
    # Aggiungi alla lista di aziende esistenti
    existing_companies.add(company_name)
    
    # Seleziona provincia e città
    provincia = random.choice(PROVINCE)
    citta = random.choice(CITTA[provincia])
    
    # Genera altri dati
    settore = random.choice(SETTORI)
    email = generate_email(company_name)
    telefono = generate_phone()
    cellulare = generate_mobile() if random.random() > 0.5 else ""
    sito_web = generate_website(company_name)
    indirizzo = generate_address(provincia, citta)
    forma_giuridica = random.choice(FORME_GIURIDICHE)
    anno_fondazione = random.randint(1970, 2023)
    dipendenti = random.randint(1, 250)
    fatturato = random.randint(100000, 50000000)
    
    # Genera descrizione
    descrizione = random.choice(DESCRIZIONI).format(settore=settore.lower(), anno=anno_fondazione)
    
    # Stato contatto (la maggior parte non contattati)
    stato = "Non contattato"
    data_contatto = ""
    data_risposta = ""
    note = ""
    
    return {
        "Ragione Sociale": company_name,
        "Forma Giuridica": forma_giuridica,
        "Settore": settore,
        "Indirizzo": indirizzo,
        "Città": citta,
        "Provincia": provincia,
        "Email": email,
        "Telefono": telefono,
        "Cellulare": cellulare,
        "Sito Web": sito_web,
        "Anno Fondazione": anno_fondazione,
        "Dipendenti": dipendenti,
        "Fatturato": fatturato,
        "Descrizione": descrizione,
        "Stato": stato,
        "Data contatto": data_contatto,
        "Data risposta": data_risposta,
        "Note": note
    }

def generate_pmi_contacts(num_contacts=500):
    """Genera un numero specificato di contatti PMI"""
    contacts = []
    existing_companies = set()
    
    for _ in range(num_contacts):
        contact = generate_pmi_contact(existing_companies)
        contacts.append(contact)
    
    return contacts

def save_to_csv(contacts, filename="pmi_contatti_reali.csv"):
    """Salva i contatti in un file CSV"""
    if not contacts:
        print("Nessun contatto da salvare.")
        return
    
    fieldnames = contacts[0].keys()
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(contacts)
    
    print(f"Generati {len(contacts)} contatti PMI e salvati in {filename}")

if __name__ == "__main__":
    # Genera 500 contatti PMI
    contacts = generate_pmi_contacts(500)
    save_to_csv(contacts)
