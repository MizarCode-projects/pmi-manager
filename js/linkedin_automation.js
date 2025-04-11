/**
 * LinkedIn Automation - Modulo per l'automazione delle attività su LinkedIn
 * PMI Contatti Manager
 */

// Configurazione del modulo LinkedIn
const LINKEDIN_CONFIG = {
    baseUrl: 'https://www.linkedin.com',
    apiEndpoints: {
        search: '/search/results',
        profile: '/in',
        company: '/company'
    },
    rateLimit: {
        connections: 50,  // massimo numero di connessioni al giorno
        messages: 100,    // massimo numero di messaggi al giorno
        searches: 100     // massimo numero di ricerche al giorno
    },
    delays: {
        betweenActions: 3000,  // 3 secondi tra le azioni
        betweenProfiles: 5000,  // 5 secondi tra i profili
        betweenMessages: 10000  // 10 secondi tra i messaggi
    }
};

// Esempio di dati di contatti PMI italiane (dati di esempio)
const EXAMPLE_PMI_DATA = [
    {
        name: "TechInnovate Srl",
        sector: "Information Technology",
        size: "10-50 dipendenti",
        location: "Milano, Lombardia",
        contactPerson: "Marco Bianchi",
        position: "CEO",
        linkedinUrl: "https://www.linkedin.com/in/marcobianchi",
        email: "m.bianchi@techinnovate.it",
        phone: "+39 02 1234567"
    },
    {
        name: "GreenSolutions Italia",
        sector: "Energia Rinnovabile",
        size: "20-100 dipendenti",
        location: "Roma, Lazio",
        contactPerson: "Laura Verdi",
        position: "Direttore Marketing",
        linkedinUrl: "https://www.linkedin.com/in/lauraverdi",
        email: "l.verdi@greensolutions.it",
        phone: "+39 06 7654321"
    },
    {
        name: "Artigiano Digitale",
        sector: "Manifattura",
        size: "5-20 dipendenti",
        location: "Firenze, Toscana",
        contactPerson: "Giovanni Rossi",
        position: "Fondatore",
        linkedinUrl: "https://www.linkedin.com/in/giovannirossi",
        email: "g.rossi@artigianodigitale.it",
        phone: "+39 055 9876543"
    }
];

/**
 * Inizializza il modulo di automazione LinkedIn
 */
function initLinkedInAutomation() {
    console.log('Inizializzazione modulo automazione LinkedIn...');
    
    // Verifica se siamo in modalità di sviluppo o produzione
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        console.log('Modalità sviluppo: utilizzo dati di esempio');
    } else {
        console.log('Modalità produzione: connessione al backend di automazione');
    }
    
    // Inizializza il sistema di notifiche per l'automazione
    setupAutomationNotifications();
}

/**
 * Configura le notifiche per l'automazione
 */
function setupAutomationNotifications() {
    // Crea il container per le notifiche se non esiste
    if (!document.getElementById('automation-notifications')) {
        const notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'automation-notifications';
        notificationsContainer.style.position = 'fixed';
        notificationsContainer.style.bottom = '20px';
        notificationsContainer.style.right = '20px';
        notificationsContainer.style.zIndex = '9999';
        document.body.appendChild(notificationsContainer);
    }
}

/**
 * Esegue una ricerca di profili LinkedIn in base ai criteri specificati
 * @param {Object} criteria - Criteri di ricerca
 * @returns {Promise<Array>} - Array di profili trovati
 */
async function searchLinkedInProfiles(criteria) {
    console.log('Ricerca profili LinkedIn con criteri:', criteria);
    
    // Verifica se siamo in modalità di sviluppo
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        // Simulazione in modalità sviluppo
        return simulateProfileSearch(criteria);
    } else {
        // Implementazione reale per la produzione
        return realProfileSearch(criteria);
    }
}

/**
 * Simula una ricerca di profili (per sviluppo)
 * @param {Object} criteria - Criteri di ricerca
 * @returns {Promise<Array>} - Array di profili trovati
 */
async function simulateProfileSearch(criteria) {
    showAutomationNotification('Ricerca profili in corso...', 'info');
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Restituisce dati di esempio filtrati in base ai criteri
            const results = EXAMPLE_PMI_DATA.filter(profile => {
                // Filtra per settore se specificato
                if (criteria.sector && !profile.sector.toLowerCase().includes(criteria.sector.toLowerCase())) {
                    return false;
                }
                
                // Filtra per località se specificata
                if (criteria.location && !profile.location.toLowerCase().includes(criteria.location.toLowerCase())) {
                    return false;
                }
                
                // Filtra per dimensione aziendale se specificata
                if (criteria.companySize && !profile.size.toLowerCase().includes(criteria.companySize.toLowerCase())) {
                    return false;
                }
                
                return true;
            });
            
            showAutomationNotification(`Trovati ${results.length} profili`, 'success');
            resolve(results);
        }, 2000); // Simula il tempo di ricerca
    });
}

/**
 * Esegue una ricerca reale di profili (per produzione)
 * @param {Object} criteria - Criteri di ricerca
 * @returns {Promise<Array>} - Array di profili trovati
 */
async function realProfileSearch(criteria) {
    showAutomationNotification('Connessione al backend di automazione...', 'info');
    
    try {
        // Costruisci i parametri di ricerca
        const searchParams = new URLSearchParams();
        if (criteria.sector) searchParams.append('sector', criteria.sector);
        if (criteria.location) searchParams.append('location', criteria.location);
        if (criteria.companySize) searchParams.append('companySize', criteria.companySize);
        if (criteria.keywords) searchParams.append('keywords', criteria.keywords);
        
        // Chiamata al backend di automazione
        const response = await fetch(`/api/linkedin/search?${searchParams.toString()}`);
        
        if (!response.ok) {
            throw new Error(`Errore nella ricerca: ${response.statusText}`);
        }
        
        const data = await response.json();
        showAutomationNotification(`Trovati ${data.results.length} profili`, 'success');
        return data.results;
    } catch (error) {
        console.error('Errore durante la ricerca dei profili:', error);
        showAutomationNotification(`Errore: ${error.message}`, 'danger');
        
        // In caso di errore, restituisci un array vuoto
        return [];
    }
}

/**
 * Invia richieste di connessione a profili LinkedIn
 * @param {Array} profiles - Array di profili a cui inviare richieste
 * @param {string} message - Messaggio personalizzato da includere
 * @returns {Promise<Object>} - Risultati dell'operazione
 */
async function sendConnectionRequests(profiles, message) {
    console.log(`Invio richieste di connessione a ${profiles.length} profili`);
    showAutomationNotification(`Preparazione invio di ${profiles.length} richieste di connessione`, 'info');
    
    // Verifica se siamo in modalità di sviluppo
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        // Simulazione in modalità sviluppo
        return simulateConnectionRequests(profiles, message);
    } else {
        // Implementazione reale per la produzione
        return realConnectionRequests(profiles, message);
    }
}

/**
 * Simula l'invio di richieste di connessione (per sviluppo)
 * @param {Array} profiles - Array di profili
 * @param {string} message - Messaggio personalizzato
 * @returns {Promise<Object>} - Risultati dell'operazione
 */
async function simulateConnectionRequests(profiles, message) {
    return new Promise((resolve) => {
        let processed = 0;
        const total = profiles.length;
        const successfulConnections = [];
        const failedConnections = [];
        
        // Simula l'invio di richieste una alla volta
        const processProfile = (index) => {
            if (index >= total) {
                // Tutte le richieste sono state elaborate
                showAutomationNotification(`Inviate ${successfulConnections.length} richieste di connessione`, 'success');
                resolve({
                    total,
                    successful: successfulConnections,
                    failed: failedConnections
                });
                return;
            }
            
            const profile = profiles[index];
            const personalizedMessage = personalizeMessage(message, profile);
            
            // Simula una probabilità di successo del 90%
            const isSuccessful = Math.random() < 0.9;
            
            if (isSuccessful) {
                successfulConnections.push({
                    profile,
                    message: personalizedMessage,
                    timestamp: new Date().toISOString()
                });
            } else {
                failedConnections.push({
                    profile,
                    message: personalizedMessage,
                    error: 'Simulazione fallita'
                });
            }
            
            processed++;
            showAutomationNotification(`Invio richieste: ${processed}/${total}`, 'info');
            
            // Processa il profilo successivo dopo un ritardo
            setTimeout(() => processProfile(index + 1), LINKEDIN_CONFIG.delays.betweenProfiles);
        };
        
        // Inizia a processare i profili
        processProfile(0);
    });
}

/**
 * Invia richieste di connessione reali (per produzione)
 * @param {Array} profiles - Array di profili
 * @param {string} message - Messaggio personalizzato
 * @returns {Promise<Object>} - Risultati dell'operazione
 */
async function realConnectionRequests(profiles, message) {
    try {
        const response = await fetch('/api/linkedin/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profiles,
                message
            })
        });
        
        if (!response.ok) {
            throw new Error(`Errore nell'invio delle richieste: ${response.statusText}`);
        }
        
        const data = await response.json();
        showAutomationNotification(`Inviate ${data.successful.length} richieste di connessione`, 'success');
        return data;
    } catch (error) {
        console.error('Errore durante l\'invio delle richieste di connessione:', error);
        showAutomationNotification(`Errore: ${error.message}`, 'danger');
        
        // In caso di errore, restituisci un oggetto con informazioni sull'errore
        return {
            total: profiles.length,
            successful: [],
            failed: profiles.map(profile => ({
                profile,
                error: error.message
            }))
        };
    }
}

/**
 * Invia messaggi a contatti LinkedIn esistenti
 * @param {Array} contacts - Array di contatti a cui inviare messaggi
 * @param {string} messageTemplate - Template del messaggio con variabili
 * @returns {Promise<Object>} - Risultati dell'operazione
 */
async function sendMessages(contacts, messageTemplate) {
    console.log(`Invio messaggi a ${contacts.length} contatti`);
    showAutomationNotification(`Preparazione invio di ${contacts.length} messaggi`, 'info');
    
    // Verifica se siamo in modalità di sviluppo
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        // Simulazione in modalità sviluppo
        return simulateSendMessages(contacts, messageTemplate);
    } else {
        // Implementazione reale per la produzione
        return realSendMessages(contacts, messageTemplate);
    }
}

/**
 * Simula l'invio di messaggi (per sviluppo)
 * @param {Array} contacts - Array di contatti
 * @param {string} messageTemplate - Template del messaggio
 * @returns {Promise<Object>} - Risultati dell'operazione
 */
async function simulateSendMessages(contacts, messageTemplate) {
    return new Promise((resolve) => {
        let processed = 0;
        const total = contacts.length;
        const successfulMessages = [];
        const failedMessages = [];
        
        // Simula l'invio di messaggi uno alla volta
        const processContact = (index) => {
            if (index >= total) {
                // Tutti i messaggi sono stati elaborati
                showAutomationNotification(`Inviati ${successfulMessages.length} messaggi`, 'success');
                resolve({
                    total,
                    successful: successfulMessages,
                    failed: failedMessages
                });
                return;
            }
            
            const contact = contacts[index];
            const personalizedMessage = personalizeMessage(messageTemplate, contact);
            
            // Simula una probabilità di successo del 95%
            const isSuccessful = Math.random() < 0.95;
            
            if (isSuccessful) {
                successfulMessages.push({
                    contact,
                    message: personalizedMessage,
                    timestamp: new Date().toISOString()
                });
            } else {
                failedMessages.push({
                    contact,
                    message: personalizedMessage,
                    error: 'Simulazione fallita'
                });
            }
            
            processed++;
            showAutomationNotification(`Invio messaggi: ${processed}/${total}`, 'info');
            
            // Processa il contatto successivo dopo un ritardo
            setTimeout(() => processContact(index + 1), LINKEDIN_CONFIG.delays.betweenMessages);
        };
        
        // Inizia a processare i contatti
        processContact(0);
    });
}

/**
 * Invia messaggi reali (per produzione)
 * @param {Array} contacts - Array di contatti
 * @param {string} messageTemplate - Template del messaggio
 * @returns {Promise<Object>} - Risultati dell'operazione
 */
async function realSendMessages(contacts, messageTemplate) {
    try {
        const response = await fetch('/api/linkedin/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contacts,
                messageTemplate
            })
        });
        
        if (!response.ok) {
            throw new Error(`Errore nell'invio dei messaggi: ${response.statusText}`);
        }
        
        const data = await response.json();
        showAutomationNotification(`Inviati ${data.successful.length} messaggi`, 'success');
        return data;
    } catch (error) {
        console.error('Errore durante l\'invio dei messaggi:', error);
        showAutomationNotification(`Errore: ${error.message}`, 'danger');
        
        // In caso di errore, restituisci un oggetto con informazioni sull'errore
        return {
            total: contacts.length,
            successful: [],
            failed: contacts.map(contact => ({
                contact,
                error: error.message
            }))
        };
    }
}

/**
 * Personalizza un messaggio sostituendo le variabili con i dati del contatto
 * @param {string} template - Template del messaggio
 * @param {Object} contact - Dati del contatto
 * @returns {string} - Messaggio personalizzato
 */
function personalizeMessage(template, contact) {
    if (!template) return '';
    
    let message = template;
    
    // Sostituisce le variabili nel template
    Object.keys(contact).forEach(key => {
        const placeholder = `{{${key}}}`;
        message = message.replace(new RegExp(placeholder, 'g'), contact[key] || '');
    });
    
    return message;
}

/**
 * Estrae dati da un profilo LinkedIn
 * @param {string} profileUrl - URL del profilo LinkedIn
 * @returns {Promise<Object>} - Dati estratti dal profilo
 */
async function extractProfileData(profileUrl) {
    console.log(`Estrazione dati dal profilo: ${profileUrl}`);
    showAutomationNotification('Estrazione dati profilo in corso...', 'info');
    
    // Verifica se siamo in modalità di sviluppo
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        // Simulazione in modalità sviluppo
        return simulateProfileExtraction(profileUrl);
    } else {
        // Implementazione reale per la produzione
        return realProfileExtraction(profileUrl);
    }
}

/**
 * Simula l'estrazione di dati da un profilo (per sviluppo)
 * @param {string} profileUrl - URL del profilo
 * @returns {Promise<Object>} - Dati estratti
 */
async function simulateProfileExtraction(profileUrl) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Trova il profilo corrispondente nei dati di esempio
            const profile = EXAMPLE_PMI_DATA.find(p => p.linkedinUrl === profileUrl) || EXAMPLE_PMI_DATA[0];
            
            // Aggiunge ulteriori dettagli simulati
            const enrichedProfile = {
                ...profile,
                skills: ['Leadership', 'Marketing Digitale', 'Strategia Aziendale'],
                education: [
                    {
                        institution: 'Università di Milano',
                        degree: 'Laurea in Economia',
                        years: '2005-2010'
                    }
                ],
                experience: [
                    {
                        company: profile.name,
                        role: profile.position,
                        years: '2015-presente'
                    },
                    {
                        company: 'Azienda Precedente SpA',
                        role: 'Manager',
                        years: '2010-2015'
                    }
                ],
                extractionTime: new Date().toISOString()
            };
            
            showAutomationNotification('Estrazione dati profilo completata', 'success');
            resolve(enrichedProfile);
        }, 1500); // Simula il tempo di estrazione
    });
}

/**
 * Estrae dati reali da un profilo (per produzione)
 * @param {string} profileUrl - URL del profilo
 * @returns {Promise<Object>} - Dati estratti
 */
async function realProfileExtraction(profileUrl) {
    try {
        // Codifica l'URL per passarlo come parametro
        const encodedUrl = encodeURIComponent(profileUrl);
        
        const response = await fetch(`/api/linkedin/profile?url=${encodedUrl}`);
        
        if (!response.ok) {
            throw new Error(`Errore nell'estrazione del profilo: ${response.statusText}`);
        }
        
        const data = await response.json();
        showAutomationNotification('Estrazione dati profilo completata', 'success');
        return data;
    } catch (error) {
        console.error('Errore durante l\'estrazione dei dati del profilo:', error);
        showAutomationNotification(`Errore: ${error.message}`, 'danger');
        
        // In caso di errore, restituisci un oggetto vuoto
        return {
            error: error.message,
            extractionTime: new Date().toISOString()
        };
    }
}

/**
 * Mostra una notifica per l'automazione
 * @param {string} message - Messaggio da mostrare
 * @param {string} type - Tipo di notifica (info, success, warning, danger)
 */
function showAutomationNotification(message, type = 'info') {
    console.log(`Notifica automazione: ${message} (${type})`);
    
    // Ottieni il container delle notifiche
    const container = document.getElementById('automation-notifications');
    if (!container) return;
    
    // Crea la notifica
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.marginBottom = '10px';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Aggiungi la notifica al container
    container.appendChild(notification);
    
    // Rimuovi la notifica dopo 5 secondi
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

/**
 * Esporta i dati in formato CSV
 * @param {Array} data - Dati da esportare
 * @returns {string} - Contenuto CSV
 */
function exportToCSV(data) {
    if (!data || !data.length) return '';
    
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
    
    return csv;
}

/**
 * Esporta i dati in formato JSON
 * @param {Array} data - Dati da esportare
 * @returns {string} - Contenuto JSON
 */
function exportToJSON(data) {
    return JSON.stringify(data, null, 2);
}

// Esporta le funzioni
window.linkedInAutomation = {
    init: initLinkedInAutomation,
    searchProfiles: searchLinkedInProfiles,
    sendConnectionRequests: sendConnectionRequests,
    sendMessages: sendMessages,
    extractProfileData: extractProfileData,
    exportToCSV: exportToCSV,
    exportToJSON: exportToJSON
};
