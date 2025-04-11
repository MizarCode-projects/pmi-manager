/**
 * Job Crawler - Modulo per l'estrazione di offerte di lavoro
 * PMI Contatti Manager
 */

// Configurazione del modulo di crawling delle offerte di lavoro
const JOB_CRAWLER_CONFIG = {
    platforms: {
        linkedin: {
            baseUrl: 'https://www.linkedin.com/jobs',
            selectors: {
                jobTitle: '.job-details-jobs-unified-top-card__job-title',
                company: '.job-details-jobs-unified-top-card__company-name',
                location: '.job-details-jobs-unified-top-card__bullet',
                description: '.jobs-description__content'
            }
        },
        indeed: {
            baseUrl: 'https://it.indeed.com',
            selectors: {}
        },
        infojobs: {
            baseUrl: 'https://www.infojobs.it',
            selectors: {}
        }
    },
    filters: {
        regions: ['Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze', 'Bari', 'Palermo', 'Venezia'],
        jobTypes: ['Full-time', 'Part-time', 'Contratto', 'Freelance', 'Stage'],
        industries: ['Information Technology', 'Marketing', 'Finanza', 'Ingegneria', 'Vendite', 'Risorse Umane']
    }
};

// Esempio di dati di offerte di lavoro (dati di esempio)
const EXAMPLE_JOB_DATA = [
    {
        title: "Sviluppatore Web Full-Stack",
        company: "TechInnovate Srl",
        location: "Milano, Lombardia",
        type: "Full-time",
        salary: "30.000€ - 45.000€ annui",
        description: "Cerchiamo uno sviluppatore Full-Stack con esperienza in React e Node.js per unirsi al nostro team di sviluppo.",
        requirements: ["Almeno 2 anni di esperienza con React", "Conoscenza di Node.js e Express", "Familiarità con database SQL e NoSQL"],
        contactEmail: "jobs@techinnovate.it",
        url: "https://www.linkedin.com/jobs/view/sviluppatore-web-full-stack-at-techinnovate-srl",
        postedDate: "2025-03-28"
    },
    {
        title: "Marketing Manager",
        company: "GreenSolutions Italia",
        location: "Roma, Lazio",
        type: "Full-time",
        salary: "35.000€ - 50.000€ annui",
        description: "Stiamo cercando un Marketing Manager esperto per guidare le nostre strategie di marketing digitale e tradizionale.",
        requirements: ["Esperienza di almeno 3 anni in ruoli di marketing", "Competenze in SEO/SEM", "Capacità di analisi dei dati"],
        contactEmail: "careers@greensolutions.it",
        url: "https://www.linkedin.com/jobs/view/marketing-manager-at-greensolutions-italia",
        postedDate: "2025-04-02"
    },
    {
        title: "Artigiano Digitale Junior",
        company: "Artigiano Digitale",
        location: "Firenze, Toscana",
        type: "Apprendistato",
        salary: "18.000€ - 22.000€ annui",
        description: "Cerchiamo giovani talenti da formare nell'ambito dell'artigianato digitale, combinando tecniche tradizionali e nuove tecnologie.",
        requirements: ["Passione per l'artigianato", "Conoscenza base di strumenti di progettazione 3D", "Creatività e manualità"],
        contactEmail: "lavora@artigianodigitale.it",
        url: "https://www.linkedin.com/jobs/view/artigiano-digitale-junior-at-artigiano-digitale",
        postedDate: "2025-04-05"
    }
];

/**
 * Inizializza il modulo di crawling delle offerte di lavoro
 */
function initJobCrawler() {
    console.log('Inizializzazione modulo Job Crawler...');
}

/**
 * Cerca offerte di lavoro in base ai criteri specificati
 * @param {Object} criteria - Criteri di ricerca
 * @returns {Promise<Array>} - Array di offerte di lavoro trovate
 */
async function searchJobs(criteria) {
    console.log('Ricerca offerte di lavoro con criteri:', criteria);
    
    // Simula una ricerca (in un'implementazione reale, qui ci sarebbe il codice per lo scraping)
    return new Promise((resolve) => {
        setTimeout(() => {
            // Filtra i dati di esempio in base ai criteri
            const results = EXAMPLE_JOB_DATA.filter(job => {
                // Filtra per parola chiave nel titolo o nella descrizione
                if (criteria.keyword) {
                    const keyword = criteria.keyword.toLowerCase();
                    const titleMatch = job.title.toLowerCase().includes(keyword);
                    const descriptionMatch = job.description.toLowerCase().includes(keyword);
                    if (!titleMatch && !descriptionMatch) return false;
                }
                
                // Filtra per località se specificata
                if (criteria.location && !job.location.toLowerCase().includes(criteria.location.toLowerCase())) {
                    return false;
                }
                
                // Filtra per tipo di lavoro se specificato
                if (criteria.jobType && job.type !== criteria.jobType) {
                    return false;
                }
                
                // Filtra per azienda se specificata
                if (criteria.company && !job.company.toLowerCase().includes(criteria.company.toLowerCase())) {
                    return false;
                }
                
                return true;
            });
            
            resolve(results);
        }, 1500); // Simula il tempo di ricerca
    });
}

/**
 * Estrae i dettagli completi di un'offerta di lavoro
 * @param {string} jobUrl - URL dell'offerta di lavoro
 * @returns {Promise<Object>} - Dettagli completi dell'offerta di lavoro
 */
async function extractJobDetails(jobUrl) {
    console.log(`Estrazione dettagli dell'offerta di lavoro: ${jobUrl}`);
    
    // Simula l'estrazione dei dettagli (in un'implementazione reale, qui ci sarebbe il codice per lo scraping)
    return new Promise((resolve) => {
        setTimeout(() => {
            // Trova l'offerta corrispondente nei dati di esempio
            const job = EXAMPLE_JOB_DATA.find(j => j.url === jobUrl) || EXAMPLE_JOB_DATA[0];
            
            // Aggiunge ulteriori dettagli simulati
            const enrichedJob = {
                ...job,
                benefits: [
                    'Smart working',
                    'Assicurazione sanitaria',
                    'Formazione continua'
                ],
                applicationDeadline: new Date(new Date(job.postedDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                companyInfo: {
                    size: job.company === 'TechInnovate Srl' ? '10-50 dipendenti' : 
                           job.company === 'GreenSolutions Italia' ? '20-100 dipendenti' : '5-20 dipendenti',
                    industry: job.company === 'TechInnovate Srl' ? 'Information Technology' : 
                              job.company === 'GreenSolutions Italia' ? 'Energia Rinnovabile' : 'Manifattura',
                    website: job.company === 'TechInnovate Srl' ? 'www.techinnovate.it' : 
                             job.company === 'GreenSolutions Italia' ? 'www.greensolutions.it' : 'www.artigianodigitale.it'
                },
                extractionTime: new Date().toISOString()
            };
            
            resolve(enrichedJob);
        }, 1800); // Simula il tempo di estrazione
    });
}

/**
 * Monitora nuove offerte di lavoro in base ai criteri specificati
 * @param {Object} criteria - Criteri di monitoraggio
 * @param {function} callback - Funzione di callback per nuove offerte
 * @returns {Object} - Oggetto controller per il monitoraggio
 */
function monitorJobs(criteria, callback) {
    console.log('Avvio monitoraggio offerte di lavoro con criteri:', criteria);
    
    // Simula il monitoraggio periodico (in un'implementazione reale, qui ci sarebbe il codice per lo scraping periodico)
    const intervalId = setInterval(() => {
        // Simula il trovamento di nuove offerte
        const randomJob = EXAMPLE_JOB_DATA[Math.floor(Math.random() * EXAMPLE_JOB_DATA.length)];
        const modifiedJob = {
            ...randomJob,
            title: randomJob.title + ' (Nuova)',
            postedDate: new Date().toISOString().split('T')[0],
            url: randomJob.url + '?new=true'
        };
        
        // Chiama il callback con la nuova offerta
        callback([modifiedJob]);
    }, 60000); // Controlla ogni minuto
    
    // Restituisce un controller per gestire il monitoraggio
    return {
        stop: () => {
            clearInterval(intervalId);
            console.log('Monitoraggio offerte di lavoro interrotto');
        }
    };
}

/**
 * Esporta le offerte di lavoro in formato CSV
 * @param {Array} jobs - Offerte di lavoro da esportare
 * @returns {string} - Contenuto CSV
 */
function exportJobsToCSV(jobs) {
    if (!jobs || !jobs.length) return '';
    
    // Prepara i dati per l'esportazione (appiattisce la struttura)
    const flattenedData = jobs.map(job => {
        const { requirements, benefits, companyInfo, ...rest } = job;
        return {
            ...rest,
            requirements: requirements ? requirements.join('; ') : '',
            benefits: benefits ? benefits.join('; ') : '',
            companySize: companyInfo ? companyInfo.size : '',
            companyIndustry: companyInfo ? companyInfo.industry : '',
            companyWebsite: companyInfo ? companyInfo.website : ''
        };
    });
    
    // Ottiene le intestazioni dalle chiavi del primo oggetto
    const headers = Object.keys(flattenedData[0]);
    
    // Crea la riga di intestazione
    let csv = headers.join(',') + '\n';
    
    // Aggiunge le righe di dati
    flattenedData.forEach(item => {
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
 * Esporta le offerte di lavoro in formato JSON
 * @param {Array} jobs - Offerte di lavoro da esportare
 * @returns {string} - Contenuto JSON
 */
function exportJobsToJSON(jobs) {
    return JSON.stringify(jobs, null, 2);
}

// Esporta le funzioni
window.jobCrawler = {
    init: initJobCrawler,
    searchJobs: searchJobs,
    extractJobDetails: extractJobDetails,
    monitorJobs: monitorJobs,
    exportToCSV: exportJobsToCSV,
    exportToJSON: exportJobsToJSON
};
