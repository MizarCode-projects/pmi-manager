/**
 * Data Exporter - Modulo per l'esportazione dei dati in vari formati
 * PMI Contatti Manager
 */

// Configurazione del modulo di esportazione dati
const DATA_EXPORTER_CONFIG = {
    formats: {
        csv: {
            extension: '.csv',
            mimeType: 'text/csv;charset=utf-8;'
        },
        json: {
            extension: '.json',
            mimeType: 'application/json;charset=utf-8;'
        },
        excel: {
            extension: '.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    },
    googleSheets: {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        apiUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    }
};

/**
 * Inizializza il modulo di esportazione dati
 */
function initDataExporter() {
    console.log('Inizializzazione modulo Data Exporter...');
}

/**
 * Esporta dati in formato CSV e avvia il download
 * @param {Array} data - Dati da esportare
 * @param {string} fileName - Nome del file (senza estensione)
 */
function exportToCSV(data, fileName = 'export') {
    if (!data || !data.length) {
        showNotification('Nessun dato da esportare', 'warning');
        return;
    }
    
    try {
        // Ottiene le intestazioni dalle chiavi del primo oggetto
        const headers = Object.keys(data[0]);
        
        // Crea la riga di intestazione
        let csv = headers.join(',') + '\n';
        
        // Aggiunge le righe di dati
        data.forEach(item => {
            const row = headers.map(header => {
                // Gestisce i valori che potrebbero contenere virgole o newline
                let value = item[header];
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                if (value === null || value === undefined) {
                    value = '';
                }
                value = String(value).replace(/"/g, '""'); // Escape delle virgolette
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                    value = `"${value}"`;
                }
                return value;
            }).join(',');
            csv += row + '\n';
        });
        
        // Crea un oggetto Blob e avvia il download
        const blob = new Blob([csv], { type: DATA_EXPORTER_CONFIG.formats.csv.mimeType });
        downloadFile(blob, `${fileName}${DATA_EXPORTER_CONFIG.formats.csv.extension}`);
        
        showNotification(`Esportazione CSV completata: ${fileName}.csv`, 'success');
    } catch (error) {
        console.error('Errore nell\'esportazione CSV:', error);
        showNotification('Errore nell\'esportazione CSV', 'error');
    }
}

/**
 * Esporta dati in formato JSON e avvia il download
 * @param {Array|Object} data - Dati da esportare
 * @param {string} fileName - Nome del file (senza estensione)
 */
function exportToJSON(data, fileName = 'export') {
    if (!data) {
        showNotification('Nessun dato da esportare', 'warning');
        return;
    }
    
    try {
        // Converte i dati in stringa JSON formattata
        const json = JSON.stringify(data, null, 2);
        
        // Crea un oggetto Blob e avvia il download
        const blob = new Blob([json], { type: DATA_EXPORTER_CONFIG.formats.json.mimeType });
        downloadFile(blob, `${fileName}${DATA_EXPORTER_CONFIG.formats.json.extension}`);
        
        showNotification(`Esportazione JSON completata: ${fileName}.json`, 'success');
    } catch (error) {
        console.error('Errore nell\'esportazione JSON:', error);
        showNotification('Errore nell\'esportazione JSON', 'error');
    }
}

/**
 * Funzione generica per avviare il download di un file
 * @param {Blob} blob - Oggetto Blob contenente i dati
 * @param {string} fileName - Nome completo del file
 */
function downloadFile(blob, fileName) {
    // Crea un URL per il blob
    const url = window.URL.createObjectURL(blob);
    
    // Crea un elemento <a> per il download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Aggiunge l'elemento al DOM, simula il click e lo rimuove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Rilascia l'URL
    window.URL.revokeObjectURL(url);
}

/**
 * Esporta dati su Google Sheets
 * @param {Array} data - Dati da esportare
 * @param {string} sheetTitle - Titolo del foglio
 * @returns {Promise<Object>} - Informazioni sul foglio creato
 */
async function exportToGoogleSheets(data, sheetTitle = 'PMI Contatti Export') {
    console.log(`Esportazione dati su Google Sheets: ${sheetTitle}`);
    
    // Simula l'esportazione su Google Sheets (in un'implementazione reale, qui ci sarebbe il codice per l'API)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // Verifica se l'utente è autenticato con Google
                const isAuthenticated = checkGoogleAuth();
                
                if (!isAuthenticated) {
                    // Se non autenticato, mostra un messaggio e interrompe
                    showNotification('Autenticazione Google richiesta per esportare su Sheets', 'warning');
                    reject(new Error('Autenticazione Google richiesta'));
                    return;
                }
                
                // Simula la creazione di un nuovo foglio Google
                const sheetInfo = {
                    id: 'sheet_' + Math.random().toString(36).substr(2, 9),
                    title: sheetTitle,
                    url: `https://docs.google.com/spreadsheets/d/${Math.random().toString(36).substr(2, 9)}/edit`,
                    rowCount: data.length,
                    columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
                    createdAt: new Date().toISOString()
                };
                
                showNotification(`Esportazione su Google Sheets completata: ${sheetTitle}`, 'success');
                resolve(sheetInfo);
            } catch (error) {
                console.error('Errore nell\'esportazione su Google Sheets:', error);
                showNotification('Errore nell\'esportazione su Google Sheets', 'error');
                reject(error);
            }
        }, 2000); // Simula il tempo di esportazione
    });
}

/**
 * Verifica se l'utente è autenticato con Google
 * @returns {boolean} - true se autenticato, false altrimenti
 */
function checkGoogleAuth() {
    // Simula la verifica dell'autenticazione (in un'implementazione reale, qui ci sarebbe il codice per verificare l'auth)
    const authToken = localStorage.getItem('googleAuthToken');
    return !!authToken;
}

/**
 * Avvia il processo di autenticazione con Google
 * @returns {Promise<boolean>} - true se autenticazione riuscita, false altrimenti
 */
async function authenticateWithGoogle() {
    console.log('Avvio autenticazione con Google...');
    
    // Simula il processo di autenticazione (in un'implementazione reale, qui ci sarebbe il codice per OAuth)
    return new Promise((resolve) => {
        // Simula una finestra di popup per l'autenticazione
        const authWindow = window.open('', 'Google Auth', 'width=600,height=600');
        
        // Chiude la finestra dopo 3 secondi
        setTimeout(() => {
            if (authWindow) authWindow.close();
            
            // Simula un'autenticazione riuscita
            const authToken = 'simulated_auth_token_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('googleAuthToken', authToken);
            
            showNotification('Autenticazione Google completata con successo', 'success');
            resolve(true);
        }, 3000);
    });
}

/**
 * Prepara i dati per l'esportazione in un formato standard
 * @param {Array} data - Dati grezzi
 * @param {Array} columns - Colonne da includere (opzionale)
 * @returns {Array} - Dati formattati per l'esportazione
 */
function prepareDataForExport(data, columns = null) {
    if (!data || !data.length) return [];
    
    // Se non sono specificate colonne, usa tutte le chiavi dal primo oggetto
    if (!columns) {
        columns = Object.keys(data[0]);
    }
    
    // Filtra e riordina i dati in base alle colonne specificate
    return data.map(item => {
        const exportItem = {};
        columns.forEach(column => {
            exportItem[column] = item[column];
        });
        return exportItem;
    });
}

/**
 * Genera un esempio di dati di PMI italiane per l'esportazione
 * @param {number} count - Numero di aziende da generare
 * @returns {Array} - Array di dati di esempio
 */
function generateExamplePMIData(count = 10) {
    const sectors = ['Information Technology', 'Manifattura', 'Servizi', 'Commercio', 'Edilizia', 'Agricoltura', 'Turismo', 'Energia'];
    const regions = ['Lombardia', 'Lazio', 'Veneto', 'Piemonte', 'Emilia-Romagna', 'Toscana', 'Campania', 'Sicilia', 'Puglia'];
    const cities = {
        'Lombardia': ['Milano', 'Brescia', 'Bergamo', 'Monza'],
        'Lazio': ['Roma', 'Latina', 'Frosinone', 'Viterbo'],
        'Veneto': ['Venezia', 'Verona', 'Padova', 'Vicenza'],
        'Piemonte': ['Torino', 'Novara', 'Alessandria', 'Cuneo'],
        'Emilia-Romagna': ['Bologna', 'Modena', 'Parma', 'Reggio Emilia'],
        'Toscana': ['Firenze', 'Pisa', 'Livorno', 'Siena'],
        'Campania': ['Napoli', 'Salerno', 'Caserta', 'Avellino'],
        'Sicilia': ['Palermo', 'Catania', 'Messina', 'Siracusa'],
        'Puglia': ['Bari', 'Lecce', 'Taranto', 'Foggia']
    };
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
        const region = regions[Math.floor(Math.random() * regions.length)];
        const city = cities[region][Math.floor(Math.random() * cities[region].length)];
        const sector = sectors[Math.floor(Math.random() * sectors.length)];
        
        // Genera un nome aziendale casuale
        const prefixes = ['Tech', 'Eco', 'Smart', 'Digi', 'Inno', 'Green', 'Blue', 'Red', 'Fast', 'Pro'];
        const suffixes = ['Solutions', 'Systems', 'Group', 'Italia', 'Tech', 'Service', 'Consulting', 'Partners', 'Factory', 'Hub'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const companyName = `${prefix}${suffix} ${Math.random() > 0.5 ? 'Srl' : 'SpA'}`;
        
        // Genera un sito web basato sul nome aziendale
        const website = `www.${prefix.toLowerCase()}${suffix.toLowerCase()}.it`;
        
        // Genera un indirizzo email aziendale
        const email = `info@${prefix.toLowerCase()}${suffix.toLowerCase()}.it`;
        
        // Genera un numero di telefono italiano casuale
        const phone = `+39 0${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10000000)}`;
        
        // Genera un fatturato casuale (in migliaia di euro)
        const revenue = Math.floor(Math.random() * 10000) + 100;
        
        // Genera un numero di dipendenti casuale
        const employees = Math.floor(Math.random() * 100) + 5;
        
        // Crea l'oggetto azienda
        const company = {
            id: i + 1,
            name: companyName,
            sector: sector,
            employees: employees,
            revenue: revenue,
            website: website,
            email: email,
            phone: phone,
            address: `Via ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}. ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}. ${Math.floor(Math.random() * 100) + 1}`,
            city: city,
            region: region,
            country: 'Italia',
            postalCode: `${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 90) + 10}`,
            contactPerson: generateRandomName(),
            contactRole: generateRandomRole(),
            linkedinUrl: `https://www.linkedin.com/company/${prefix.toLowerCase()}${suffix.toLowerCase()}`,
            foundedYear: 2000 + Math.floor(Math.random() * 22),
            lastUpdated: new Date().toISOString()
        };
        
        data.push(company);
    }
    
    return data;
}

/**
 * Genera un nome casuale italiano
 * @returns {string} - Nome casuale
 */
function generateRandomName() {
    const firstNames = ['Marco', 'Giuseppe', 'Antonio', 'Giovanni', 'Francesco', 'Maria', 'Anna', 'Laura', 'Giulia', 'Paola'];
    const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Ferrari', 'Esposito', 'Romano', 'Russo', 'Colombo', 'Ricci', 'Marino'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
}

/**
 * Genera un ruolo aziendale casuale
 * @returns {string} - Ruolo casuale
 */
function generateRandomRole() {
    const roles = ['CEO', 'Direttore Generale', 'Responsabile Marketing', 'Responsabile Vendite', 'Responsabile IT', 'Responsabile HR', 'Fondatore', 'CFO', 'CTO', 'Amministratore'];
    return roles[Math.floor(Math.random() * roles.length)];
}

// Esporta le funzioni
window.dataExporter = {
    init: initDataExporter,
    exportToCSV: exportToCSV,
    exportToJSON: exportToJSON,
    exportToGoogleSheets: exportToGoogleSheets,
    authenticateWithGoogle: authenticateWithGoogle,
    prepareDataForExport: prepareDataForExport,
    generateExampleData: generateExamplePMIData
};
