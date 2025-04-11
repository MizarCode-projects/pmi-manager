/**
 * Website Analyzer AI - Script principale
 * Analizza vari aspetti di un sito web: sicurezza, SEO, performance, contenuti, tecnologie
 */

// Configurazione API
const API_CONFIG = {
    baseUrl: 'http://localhost:5000/api',
    endpoints: {
        analyze: '/analyze',
        status: '/status'
    }
};

// Stato dell'applicazione
const appState = {
    analyzing: false,
    url: '',
    results: {}
};

// Elementi DOM
const elements = {
    urlInput: document.getElementById('website-url'),
    analyzeButton: document.getElementById('analyze-button'),
    urlError: document.getElementById('url-error'),
    loadingSection: document.getElementById('loading-section'),
    resultsSection: document.getElementById('results-section'),
    progressBar: document.getElementById('analysis-progress'),
    siteUrl: document.getElementById('site-url'),
    analysisTimestamp: document.getElementById('analysis-timestamp'),
    overallScore: document.getElementById('overall-score'),
    scoreCircle: document.getElementById('score-circle')
};

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});

/**
 * Inizializza gli event listener
 */
function initEventListeners() {
    // Click sul pulsante Analizza
    elements.analyzeButton.addEventListener('click', () => {
        const url = elements.urlInput.value.trim();
        if (validateUrl(url)) {
            startAnalysis(url);
        } else {
            showUrlError();
        }
    });

    // Pressione Enter nell'input URL
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.analyzeButton.click();
        }
    });

    // Nascondi l'errore quando l'utente inizia a digitare
    elements.urlInput.addEventListener('input', () => {
        elements.urlError.classList.add('d-none');
    });

    // Pulsanti di esportazione
    document.getElementById('export-pdf').addEventListener('click', () => exportResults('pdf'));
    document.getElementById('export-csv').addEventListener('click', () => exportResults('csv'));
    document.getElementById('export-json').addEventListener('click', () => exportResults('json'));
}

/**
 * Valida l'URL inserito
 * @param {string} url - URL da validare
 * @returns {boolean} - true se l'URL è valido
 */
function validateUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

/**
 * Mostra un errore per URL non valido
 */
function showUrlError() {
    elements.urlError.classList.remove('d-none');
    elements.urlInput.classList.add('is-invalid');
    setTimeout(() => {
        elements.urlInput.classList.remove('is-invalid');
    }, 3000);
}

/**
 * Avvia l'analisi del sito web
 * @param {string} url - URL del sito da analizzare
 */
async function startAnalysis(url) {
    try {
        // Mostra l'indicatore di caricamento
        showLoadingIndicator();

        // Verifica lo stato del server API
        const serverStatus = await checkServerStatus();
        if (!serverStatus.online) {
            throw new Error('Il server API non è disponibile. Verifica la connessione.');
        }

        // Effettua la richiesta di analisi al backend
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Errore durante l\'analisi del sito');
        }

        // Elabora i risultati
        const results = await response.json();
        
        // Nascondi l'indicatore di caricamento
        hideLoadingIndicator();
        
        // Mostra i risultati
        displayResults(results);
        
        return results;
    } catch (error) {
        console.error('Errore durante l\'analisi:', error);
        
        // Nascondi l'indicatore di caricamento
        hideLoadingIndicator();
        
        // Mostra l'errore
        showError(error.message);
        
        return null;
    }
}

/**
 * Verifica lo stato del server API
 * @returns {Promise<Object>} - Stato del server API
 */
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.status}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return { online: false };
        }

        return await response.json();
    } catch (error) {
        console.error('Errore durante la verifica dello stato del server:', error);
        return { online: false };
    }
}

/**
 * Mostra l'indicatore di caricamento
 */
function showLoadingIndicator() {
    elements.loadingSection.classList.remove('d-none');
    elements.resultsSection.classList.add('d-none');
}

/**
 * Nasconde l'indicatore di caricamento
 */
function hideLoadingIndicator() {
    elements.loadingSection.classList.add('d-none');
    elements.resultsSection.classList.remove('d-none');
}

/**
 * Mostra un errore
 * @param {string} message - Messaggio di errore
 */
function showError(message) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger mt-4';
    errorAlert.innerHTML = `
        <h4 class="alert-heading">Errore durante l'analisi</h4>
        <p>${message}</p>
        <hr>
        <p class="mb-0">Riprova con un altro URL o contatta l'assistenza se il problema persiste.</p>
    `;
    
    // Inserisci l'alert dopo l'input
    elements.urlInput.parentNode.parentNode.appendChild(errorAlert);
    
    // Rimuovi l'alert dopo 10 secondi
    setTimeout(() => {
        errorAlert.remove();
    }, 10000);
}

/**
 * Mostra i risultati dell'analisi
 * @param {Object} results - Risultati dell'analisi
 */
function displayResults(results) {
    if (!results || !results.success) {
        console.error('Risultati non validi:', results);
        showError('I risultati dell\'analisi non sono validi o contengono errori.');
        return;
    }

    try {
        // Aggiorna lo stato
        appState.analyzing = false;
        appState.url = results.url;
        appState.results = results;

        // Mostra i risultati
        elements.siteUrl.textContent = results.url;
        elements.analysisTimestamp.textContent = new Date(results.timestamp).toLocaleString();
        elements.overallScore.textContent = results.overallScore;
        
        // Aggiorna il grafico del punteggio (circle)
        const circumference = 2 * Math.PI * 54; // 2πr dove r è 54 (raggio del cerchio SVG)
        const offset = circumference - (results.overallScore / 100) * circumference;
        elements.scoreCircle.style.strokeDashoffset = offset;
        
        // Aggiorna i dettagli di sicurezza
        updateSecurityDetails(results.security);
        
        // Aggiorna i dettagli SEO
        updateSeoDetails(results.seo);
        
        // Aggiorna i dettagli di performance
        updatePerformanceDetails(results.performance);
        
        // Aggiorna i dettagli dei contenuti
        updateContentDetails(results.content);
        
        // Aggiorna i dettagli delle tecnologie
        updateTechnologyDetails(results.technology);
    } catch (error) {
        console.error('Errore durante la visualizzazione dei risultati:', error);
        showError('Si è verificato un errore durante la visualizzazione dei risultati: ' + error.message);
    }
}

/**
 * Aggiorna i dettagli di sicurezza
 * @param {Object} security - Dati di sicurezza
 */
function updateSecurityDetails(security) {
    try {
        // SSL Status
        const sslStatus = document.getElementById('ssl-status');
        sslStatus.innerHTML = security.ssl.secure ? 
            '<span class="badge bg-success"><i class="fas fa-lock me-1"></i> Sicuro</span>' : 
            '<span class="badge bg-danger"><i class="fas fa-unlock me-1"></i> Non sicuro</span>';
        
        // SSL Details
        const sslDetails = document.getElementById('ssl-details');
        sslDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Grado SSL</div>
                <div class="detail-value">${security.ssl.grade}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Valido fino a</div>
                <div class="detail-value">${security.ssl.validUntil}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Emittente</div>
                <div class="detail-value">${security.ssl.issuer}</div>
            </div>
        `;
        
        // Security Headers Status
        const headersStatus = document.getElementById('security-headers-status');
        const headerScore = security.headers.score;
        let badgeClass = 'bg-warning';
        let icon = 'exclamation-triangle';
        
        if (headerScore === 'A' || headerScore === 'A+') {
            badgeClass = 'bg-success';
            icon = 'check';
        } else if (headerScore === 'F') {
            badgeClass = 'bg-danger';
            icon = 'times';
        }
        
        headersStatus.innerHTML = `<span class="badge ${badgeClass}"><i class="fas fa-${icon} me-1"></i> ${headerScore}</span>`;
        
        // Security Headers Details
        const headersDetails = document.getElementById('security-headers-details');
        headersDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Header presenti</div>
                <div class="detail-value">${security.headers.present.join(', ') || 'Nessuno'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Header mancanti</div>
                <div class="detail-value">${security.headers.missing.join(', ') || 'Nessuno'}</div>
            </div>
        `;
        
        // Vulnerabilities Status
        const vulnStatus = document.getElementById('vulnerabilities-status');
        vulnStatus.innerHTML = security.vulnerabilities.found ? 
            `<span class="badge bg-danger"><i class="fas fa-bug me-1"></i> ${security.vulnerabilities.count} trovate</span>` : 
            '<span class="badge bg-success"><i class="fas fa-shield-alt me-1"></i> Nessuna rilevata</span>';
        
        // Vulnerabilities Details
        const vulnDetails = document.getElementById('vulnerabilities-details');
        if (security.vulnerabilities.found && security.vulnerabilities.details.length > 0) {
            let vulnHtml = '<ul class="list-group list-group-flush">';
            security.vulnerabilities.details.forEach(vuln => {
                vulnHtml += `<li class="list-group-item p-2">${vuln}</li>`;
            });
            vulnHtml += '</ul>';
            vulnDetails.innerHTML = vulnHtml;
        } else {
            vulnDetails.innerHTML = '<p class="text-success">Nessuna vulnerabilità nota rilevata.</p>';
        }
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei dettagli di sicurezza:', error);
    }
}

/**
 * Aggiorna i dettagli SEO
 * @param {Object} seo - Dati SEO
 */
function updateSeoDetails(seo) {
    try {
        // Meta Tags Status
        const metaStatus = document.getElementById('meta-tags-status');
        const metaOptimal = seo.metaTags.title.optimal && seo.metaTags.description.optimal;
        metaStatus.innerHTML = metaOptimal ? 
            '<span class="badge bg-success"><i class="fas fa-check me-1"></i> Ottimizzati</span>' : 
            '<span class="badge bg-warning"><i class="fas fa-exclamation-triangle me-1"></i> Da migliorare</span>';
        
        // Meta Tags Details
        const metaDetails = document.getElementById('meta-tags-details');
        metaDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Titolo</div>
                <div class="detail-value">${seo.metaTags.title.value} (${seo.metaTags.title.length} caratteri)</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Descrizione</div>
                <div class="detail-value">${seo.metaTags.description.value} (${seo.metaTags.description.length} caratteri)</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Robots</div>
                <div class="detail-value">${seo.metaTags.robots.value}</div>
            </div>
        `;
        
        // Page Structure Status
        const structureStatus = document.getElementById('page-structure-status');
        const goodStructure = seo.headings.structure === 'good';
        structureStatus.innerHTML = goodStructure ? 
            '<span class="badge bg-success"><i class="fas fa-check me-1"></i> Ottimizzata</span>' : 
            '<span class="badge bg-warning"><i class="fas fa-exclamation-triangle me-1"></i> Da migliorare</span>';
        
        // Page Structure Details
        const structureDetails = document.getElementById('page-structure-details');
        structureDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">H1</div>
                <div class="detail-value">${seo.headings.h1.count} ${seo.headings.h1.count === 1 ? '(Ottimale)' : '(Non ottimale)'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">H2</div>
                <div class="detail-value">${seo.headings.h2.count}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Valori H1</div>
                <div class="detail-value">${seo.headings.h1.values.join(', ')}</div>
            </div>
        `;
        
        // Links Status
        const linksStatus = document.getElementById('links-status');
        const brokenLinks = seo.links.broken;
        linksStatus.innerHTML = brokenLinks > 0 ? 
            `<span class="badge bg-warning"><i class="fas fa-exclamation-triangle me-1"></i> ${brokenLinks} link rotti</span>` : 
            '<span class="badge bg-success"><i class="fas fa-check me-1"></i> Ottimizzati</span>';
        
        // Links Details
        const linksDetails = document.getElementById('links-details');
        linksDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Link interni</div>
                <div class="detail-value">${seo.links.internal}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Link esterni</div>
                <div class="detail-value">${seo.links.external}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Link rotti</div>
                <div class="detail-value">${seo.links.broken}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Sitemap</div>
                <div class="detail-value">${seo.sitemap.present ? 'Presente' : 'Mancante'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Robots.txt</div>
                <div class="detail-value">${seo.robotsTxt.present ? 'Presente' : 'Mancante'}</div>
            </div>
        `;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei dettagli SEO:', error);
    }
}

/**
 * Aggiorna i dettagli di performance
 * @param {Object} performance - Dati di performance
 */
function updatePerformanceDetails(performance) {
    try {
        // Web Vitals Status
        const webVitalsStatus = document.getElementById('web-vitals-status');
        const lcpRating = performance.webVitals.lcp.rating;
        const clsRating = performance.webVitals.cls.rating;
        
        let badgeClass = 'bg-warning';
        let icon = 'exclamation-triangle';
        
        if (lcpRating === 'good' && clsRating === 'good') {
            badgeClass = 'bg-success';
            icon = 'check';
        } else if (lcpRating === 'poor' || clsRating === 'poor') {
            badgeClass = 'bg-danger';
            icon = 'times';
        }
        
        webVitalsStatus.innerHTML = `<span class="badge ${badgeClass}"><i class="fas fa-${icon} me-1"></i> ${lcpRating === 'good' ? 'Buono' : 'Da migliorare'}</span>`;
        
        // Web Vitals Details
        const webVitalsDetails = document.getElementById('web-vitals-details');
        webVitalsDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">LCP (Largest Contentful Paint)</div>
                <div class="detail-value">${performance.webVitals.lcp.value}${performance.webVitals.lcp.unit} (${getRatingText(performance.webVitals.lcp.rating)})</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">CLS (Cumulative Layout Shift)</div>
                <div class="detail-value">${performance.webVitals.cls.value} (${getRatingText(performance.webVitals.cls.rating)})</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">FID (First Input Delay)</div>
                <div class="detail-value">${performance.webVitals.fid.value}${performance.webVitals.fid.unit} (${getRatingText(performance.webVitals.fid.rating)})</div>
            </div>
        `;
        
        // Mobile Status
        const mobileStatus = document.getElementById('mobile-status');
        const mobileScore = performance.mobile.score;
        
        badgeClass = 'bg-warning';
        icon = 'exclamation-triangle';
        
        if (mobileScore >= 90) {
            badgeClass = 'bg-success';
            icon = 'check';
        } else if (mobileScore < 50) {
            badgeClass = 'bg-danger';
            icon = 'times';
        }
        
        mobileStatus.innerHTML = `<span class="badge ${badgeClass}"><i class="fas fa-${icon} me-1"></i> ${mobileScore}/100</span>`;
        
        // Mobile Details
        const mobileDetails = document.getElementById('mobile-details');
        mobileDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Utilizzabile su mobile</div>
                <div class="detail-value">${performance.mobile.usable ? 'Sì' : 'No'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Viewport configurato</div>
                <div class="detail-value">${performance.mobile.viewport ? 'Sì' : 'No'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Target touch adeguati</div>
                <div class="detail-value">${performance.mobile.touchTargets ? 'Sì' : 'No'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Dimensione font adeguata</div>
                <div class="detail-value">${performance.mobile.fontSizes ? 'Sì' : 'No'}</div>
            </div>
        `;
        
        // Performance Suggestions
        const suggestionsList = document.getElementById('performance-suggestions');
        if (performance.suggestions && performance.suggestions.length > 0) {
            let suggestionsHtml = '';
            
            performance.suggestions.forEach(suggestion => {
                suggestionsHtml += `
                    <div class="suggestion-item ${suggestion.type}">
                        <div class="suggestion-icon">
                            <i class="fas fa-${getSuggestionIcon(suggestion.type)}"></i>
                        </div>
                        <div>
                            <h5 class="suggestion-title">${suggestion.title}</h5>
                            <p class="suggestion-description">${suggestion.description}</p>
                        </div>
                    </div>
                `;
            });
            
            suggestionsList.innerHTML = suggestionsHtml;
        } else {
            suggestionsList.innerHTML = '<p class="text-center">Nessun suggerimento disponibile.</p>';
        }
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei dettagli di performance:', error);
    }
}

/**
 * Aggiorna i dettagli dei contenuti
 * @param {Object} content - Dati dei contenuti
 */
function updateContentDetails(content) {
    try {
        // Text Analysis Status
        const textStatus = document.getElementById('text-analysis-status');
        const readabilityScore = content.textAnalysis.readabilityScore;
        
        let badgeClass = 'bg-warning';
        let icon = 'exclamation-triangle';
        let text = 'Media leggibilità';
        
        if (readabilityScore >= 70) {
            badgeClass = 'bg-success';
            icon = 'check';
            text = 'Buona leggibilità';
        } else if (readabilityScore < 50) {
            badgeClass = 'bg-danger';
            icon = 'times';
            text = 'Scarsa leggibilità';
        }
        
        textStatus.innerHTML = `<span class="badge ${badgeClass}"><i class="fas fa-${icon} me-1"></i> ${text}</span>`;
        
        // Text Analysis Details
        const textDetails = document.getElementById('text-analysis-details');
        textDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Conteggio parole</div>
                <div class="detail-value">${content.textAnalysis.wordCount}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Punteggio leggibilità</div>
                <div class="detail-value">${content.textAnalysis.readabilityScore}/100 (${content.textAnalysis.readabilityGrade})</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Parole chiave principali</div>
                <div class="detail-value">
                    ${content.textAnalysis.keywordDensity.map(kw => `${kw.keyword} (${kw.count})`).join(', ')}
                </div>
            </div>
        `;
        
        // Content Freshness Status
        const freshnessStatus = document.getElementById('content-freshness-status');
        
        badgeClass = content.freshness.fresh ? 'bg-success' : 'bg-warning';
        icon = content.freshness.fresh ? 'check' : 'exclamation-triangle';
        text = content.freshness.fresh ? 'Contenuto recente' : 'Contenuto datato';
        
        freshnessStatus.innerHTML = `<span class="badge ${badgeClass}"><i class="fas fa-${icon} me-1"></i> ${text}</span>`;
        
        // Content Freshness Details
        const freshnessDetails = document.getElementById('content-freshness-details');
        freshnessDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Ultima modifica</div>
                <div class="detail-value">${new Date(content.freshness.lastModified).toLocaleDateString()}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Età del contenuto</div>
                <div class="detail-value">${content.freshness.age} giorni</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Elementi multimediali</div>
                <div class="detail-value">${content.mediaAnalysis.images} immagini, ${content.mediaAnalysis.videos} video</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Immagini responsive</div>
                <div class="detail-value">${content.mediaAnalysis.responsiveImages ? 'Sì' : 'No'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Immagini senza alt text</div>
                <div class="detail-value">${content.mediaAnalysis.altTextMissing}</div>
            </div>
        `;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei dettagli dei contenuti:', error);
    }
}

/**
 * Aggiorna i dettagli delle tecnologie
 * @param {Object} technology - Dati delle tecnologie
 */
function updateTechnologyDetails(technology) {
    try {
        // Technologies Details
        const techDetails = document.getElementById('technologies-details');
        techDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">CMS</div>
                <div class="detail-value">${technology.cms.name} ${technology.cms.version} (${technology.cms.confidence}% di confidenza)</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Framework Frontend</div>
                <div class="detail-value">${technology.frontendFramework.name} (${technology.frontendFramework.confidence}% di confidenza)</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Librerie JavaScript</div>
                <div class="detail-value">${technology.jsLibraries.map(lib => `${lib.name} ${lib.version}`).join(', ')}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Strumenti di Analytics</div>
                <div class="detail-value">${technology.analyticsTools.join(', ')}</div>
            </div>
        `;
        
        // Versions Status
        const versionsStatus = document.getElementById('versions-status');
        versionsStatus.innerHTML = `<span class="badge bg-warning"><i class="fas fa-exclamation-triangle me-1"></i> Aggiornamenti disponibili</span>`;
        
        // Versions Details
        const versionsDetails = document.getElementById('versions-details');
        versionsDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Server</div>
                <div class="detail-value">${technology.serverTech.server}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Powered By</div>
                <div class="detail-value">${technology.serverTech.poweredBy}</div>
            </div>
        `;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei dettagli delle tecnologie:', error);
    }
}

/**
 * Ottiene il testo del rating
 * @param {string} rating - Rating (good, needs-improvement, poor)
 * @returns {string} - Testo del rating in italiano
 */
function getRatingText(rating) {
    switch (rating) {
        case 'good':
            return 'Buono';
        case 'needs-improvement':
            return 'Da migliorare';
        case 'poor':
            return 'Scarso';
        default:
            return rating;
    }
}

/**
 * Ottiene l'icona per il tipo di suggerimento
 * @param {string} type - Tipo di suggerimento (critical, warning, info)
 * @returns {string} - Nome dell'icona Font Awesome
 */
function getSuggestionIcon(type) {
    switch (type) {
        case 'critical':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        case 'info':
            return 'info-circle';
        default:
            return 'lightbulb';
    }
}

/**
 * Esporta i risultati in vari formati
 * @param {string} format - Formato di esportazione (pdf, csv, json)
 */
function exportResults(format) {
    if (!appState.results || !appState.results.success) {
        alert('Nessun risultato disponibile da esportare.');
        return;
    }
    
    switch (format) {
        case 'pdf':
            alert('Esportazione in PDF non ancora implementata.');
            break;
        case 'csv':
            alert('Esportazione in CSV non ancora implementata.');
            break;
        case 'json':
            // Crea un blob con i dati JSON
            const jsonData = JSON.stringify(appState.results, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Crea un link per il download
            const a = document.createElement('a');
            a.href = url;
            a.download = `website-analysis-${appState.url.replace(/[^a-z0-9]/gi, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Pulisci
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            break;
    }
}
