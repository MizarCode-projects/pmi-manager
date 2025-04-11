/**
 * Website Analyzer AI - Moduli di analisi
 * Contiene le funzioni per analizzare performance, contenuti e tecnologie
 */

/**
 * Analizza le performance del sito
 * @param {string} url - URL del sito da analizzare
 * @returns {Promise<Object>} - Risultati dell'analisi delle performance
 */
async function analyzePerformance(url) {
    try {
        // In un'implementazione reale, qui ci sarebbe una chiamata all'API PageSpeed Insights
        // Per ora, simuliamo i risultati
        
        // Simula una richiesta API
        await simulateApiDelay(3000);
        
        return {
            webVitals: {
                lcp: { // Largest Contentful Paint
                    value: 2.8,
                    unit: 's',
                    rating: 'needs-improvement',
                    threshold: {
                        good: 2.5,
                        poor: 4.0
                    }
                },
                fid: { // First Input Delay
                    value: 75,
                    unit: 'ms',
                    rating: 'good',
                    threshold: {
                        good: 100,
                        poor: 300
                    }
                },
                cls: { // Cumulative Layout Shift
                    value: 0.12,
                    unit: '',
                    rating: 'needs-improvement',
                    threshold: {
                        good: 0.1,
                        poor: 0.25
                    }
                }
            },
            mobile: {
                score: 85,
                usable: true,
                viewport: true,
                touchTargets: true,
                fontSizes: true
            },
            suggestions: [
                {
                    type: 'warning',
                    title: 'Ottimizza le immagini',
                    description: 'Le immagini potrebbero essere compresse ulteriormente per risparmiare 250KB.',
                    impact: 'medium'
                },
                {
                    type: 'critical',
                    title: 'Riduci il tempo di blocco del thread principale',
                    description: 'Il codice JavaScript blocca il thread principale per 450ms.',
                    impact: 'high'
                },
                {
                    type: 'info',
                    title: 'Utilizza la cache del browser',
                    description: 'Imposta intestazioni di cache appropriate per le risorse statiche.',
                    impact: 'medium'
                }
            ]
        };
    } catch (error) {
        console.error('Errore durante l\'analisi delle performance:', error);
        throw new Error('Impossibile completare l\'analisi delle performance');
    }
}

/**
 * Analizza i contenuti del sito
 * @param {string} url - URL del sito da analizzare
 * @returns {Promise<Object>} - Risultati dell'analisi dei contenuti
 */
async function analyzeContent(url) {
    try {
        // In un'implementazione reale, qui ci sarebbe uno scraping del contenuto e analisi del testo
        // Per ora, simuliamo i risultati
        
        // Simula una richiesta API
        await simulateApiDelay(2200);
        
        return {
            textAnalysis: {
                wordCount: 1250,
                readabilityScore: 68, // 0-100, più alto è più leggibile
                readabilityGrade: 'Buona',
                keywordDensity: [
                    { keyword: 'esempio', count: 12, density: 0.96 },
                    { keyword: 'analisi', count: 8, density: 0.64 },
                    { keyword: 'contenuto', count: 7, density: 0.56 }
                ],
                sentimentScore: 0.6 // -1 a 1, dove 1 è molto positivo
            },
            freshness: {
                lastModified: '2025-03-15T10:30:00Z',
                age: 26, // giorni
                fresh: true
            },
            mediaAnalysis: {
                images: 15,
                videos: 2,
                altTextMissing: 3,
                responsiveImages: true
            }
        };
    } catch (error) {
        console.error('Errore durante l\'analisi dei contenuti:', error);
        throw new Error('Impossibile completare l\'analisi dei contenuti');
    }
}

/**
 * Analizza le tecnologie utilizzate dal sito
 * @param {string} url - URL del sito da analizzare
 * @returns {Promise<Object>} - Risultati dell'analisi delle tecnologie
 */
async function analyzeTechnologies(url) {
    try {
        // In un'implementazione reale, qui ci sarebbe un'analisi delle tecnologie (simile a Wappalyzer)
        // Per ora, simuliamo i risultati
        
        // Simula una richiesta API
        await simulateApiDelay(1800);
        
        return {
            cms: {
                name: 'WordPress',
                version: '6.1.2',
                latestVersion: '6.3.1',
                needsUpdate: true
            },
            server: {
                name: 'Nginx',
                version: '1.20.1'
            },
            frontend: [
                { name: 'jQuery', version: '3.6.0', latestVersion: '3.6.4', needsUpdate: true },
                { name: 'Bootstrap', version: '5.2.3', latestVersion: '5.3.0', needsUpdate: true },
                { name: 'Font Awesome', version: '6.1.1', latestVersion: '6.4.0', needsUpdate: true }
            ],
            analytics: [
                { name: 'Google Analytics', version: 'GA4' },
                { name: 'Facebook Pixel' }
            ],
            security: [
                { name: 'reCAPTCHA', version: 'v3' }
            ]
        };
    } catch (error) {
        console.error('Errore durante l\'analisi delle tecnologie:', error);
        throw new Error('Impossibile completare l\'analisi delle tecnologie');
    }
}

/**
 * Calcola il punteggio complessivo in base ai risultati delle analisi
 * @param {Object} results - Risultati completi dell'analisi
 * @returns {number} - Punteggio complessivo (0-100)
 */
function calculateOverallScore(results) {
    // In un'implementazione reale, qui ci sarebbe un algoritmo più complesso
    // Per ora, simuliamo un calcolo semplice
    
    let score = 0;
    let count = 0;
    
    // Sicurezza (30% del punteggio)
    if (results.security) {
        let securityScore = 0;
        
        // SSL
        if (results.security.ssl) {
            if (results.security.ssl.secure) {
                securityScore += 15;
                if (results.security.ssl.grade === 'A') securityScore += 5;
                else if (results.security.ssl.grade === 'B') securityScore += 3;
            }
        }
        
        // Header di sicurezza
        if (results.security.headers) {
            if (results.security.headers.score === 'A') securityScore += 10;
            else if (results.security.headers.score === 'B') securityScore += 7;
            else if (results.security.headers.score === 'C') securityScore += 5;
            else securityScore += 2;
        }
        
        // Vulnerabilità
        if (results.security.vulnerabilities && !results.security.vulnerabilities.found) {
            securityScore += 10;
        }
        
        score += securityScore * 0.3;
        count++;
    }
    
    // Performance (25% del punteggio)
    if (results.performance) {
        let performanceScore = 0;
        
        // Core Web Vitals
        if (results.performance.webVitals) {
            const { lcp, fid, cls } = results.performance.webVitals;
            
            if (lcp && lcp.rating === 'good') performanceScore += 10;
            else if (lcp && lcp.rating === 'needs-improvement') performanceScore += 5;
            
            if (fid && fid.rating === 'good') performanceScore += 10;
            else if (fid && fid.rating === 'needs-improvement') performanceScore += 5;
            
            if (cls && cls.rating === 'good') performanceScore += 10;
            else if (cls && cls.rating === 'needs-improvement') performanceScore += 5;
        }
        
        // Mobile
        if (results.performance.mobile && results.performance.mobile.score) {
            performanceScore += results.performance.mobile.score / 10;
        }
        
        score += performanceScore * 0.25;
        count++;
    }
    
    // SEO (20% del punteggio)
    if (results.seo) {
        let seoScore = 0;
        
        // Meta tag
        if (results.seo.metaTags) {
            if (results.seo.metaTags.title && results.seo.metaTags.title.present) seoScore += 5;
            if (results.seo.metaTags.description && results.seo.metaTags.description.present) seoScore += 5;
            if (results.seo.metaTags.title && results.seo.metaTags.title.optimal) seoScore += 3;
            if (results.seo.metaTags.description && results.seo.metaTags.description.optimal) seoScore += 3;
        }
        
        // Struttura della pagina
        if (results.seo.headings && results.seo.headings.structure === 'good') {
            seoScore += 7;
        }
        
        // Sitemap e robots.txt
        if (results.seo.sitemap && results.seo.sitemap.present && results.seo.sitemap.valid) {
            seoScore += 4;
        }
        if (results.seo.robotsTxt && results.seo.robotsTxt.present) {
            seoScore += 3;
        }
        
        score += seoScore * 0.2;
        count++;
    }
    
    // Contenuti (15% del punteggio)
    if (results.content) {
        let contentScore = 0;
        
        // Analisi del testo
        if (results.content.textAnalysis && results.content.textAnalysis.readabilityScore) {
            contentScore += results.content.textAnalysis.readabilityScore / 10;
        }
        
        // Freschezza dei contenuti
        if (results.content.freshness && results.content.freshness.fresh) {
            contentScore += 10;
        }
        
        // Analisi dei media
        if (results.content.mediaAnalysis) {
            if (results.content.mediaAnalysis.responsiveImages) contentScore += 5;
            if (results.content.mediaAnalysis.altTextMissing === 0) contentScore += 5;
            else if (results.content.mediaAnalysis.altTextMissing < 5) contentScore += 3;
        }
        
        score += contentScore * 0.15;
        count++;
    }
    
    // Tecnologie (10% del punteggio)
    if (results.technology) {
        let techScore = 0;
        
        // CMS aggiornato
        if (results.technology.cms && !results.technology.cms.needsUpdate) {
            techScore += 10;
        } else if (results.technology.cms) {
            techScore += 5;
        }
        
        // Frontend aggiornato
        if (results.technology.frontend) {
            const outdatedCount = results.technology.frontend.filter(tech => tech.needsUpdate).length;
            if (outdatedCount === 0) techScore += 10;
            else if (outdatedCount < 3) techScore += 7;
            else techScore += 3;
        }
        
        score += techScore * 0.1;
        count++;
    }
    
    // Calcola il punteggio finale
    return count > 0 ? Math.round(score / count * 100) : 0;
}

/**
 * Simula un ritardo per le chiamate API
 * @param {number} ms - Millisecondi di ritardo
 * @returns {Promise<void>}
 */
function simulateApiDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Esporta i risultati dell'analisi in vari formati
 * @param {string} format - Formato di esportazione (pdf, csv, json)
 */
function exportResults(format) {
    if (!appState.results || Object.keys(appState.results).length === 0) {
        alert('Nessun risultato disponibile per l\'esportazione');
        return;
    }
    
    switch (format) {
        case 'pdf':
            alert('Esportazione in PDF non ancora implementata');
            // In un'implementazione reale, qui ci sarebbe la generazione del PDF
            break;
            
        case 'csv':
            exportToCsv();
            break;
            
        case 'json':
            exportToJson();
            break;
            
        default:
            alert('Formato di esportazione non supportato');
    }
}

/**
 * Esporta i risultati in formato CSV
 */
function exportToCsv() {
    // Crea un array di righe per il CSV
    const rows = [
        ['Categoria', 'Aspetto', 'Valore', 'Valutazione']
    ];
    
    // Sicurezza
    if (appState.results.security) {
        if (appState.results.security.ssl) {
            rows.push(['Sicurezza', 'SSL/TLS', appState.results.security.ssl.grade, appState.results.security.ssl.secure ? 'Sicuro' : 'Non sicuro']);
        }
        if (appState.results.security.headers) {
            rows.push(['Sicurezza', 'Header di sicurezza', appState.results.security.headers.score, '']);
        }
        if (appState.results.security.vulnerabilities) {
            rows.push(['Sicurezza', 'Vulnerabilità', appState.results.security.vulnerabilities.count, appState.results.security.vulnerabilities.found ? 'Rilevate' : 'Nessuna']);
        }
    }
    
    // SEO
    if (appState.results.seo) {
        if (appState.results.seo.metaTags && appState.results.seo.metaTags.title) {
            rows.push(['SEO', 'Meta title', appState.results.seo.metaTags.title.value, appState.results.seo.metaTags.title.optimal ? 'Ottimale' : 'Da migliorare']);
        }
        if (appState.results.seo.metaTags && appState.results.seo.metaTags.description) {
            rows.push(['SEO', 'Meta description', appState.results.seo.metaTags.description.value, appState.results.seo.metaTags.description.optimal ? 'Ottimale' : 'Da migliorare']);
        }
        if (appState.results.seo.headings) {
            rows.push(['SEO', 'Struttura headings', appState.results.seo.headings.structure, '']);
        }
        if (appState.results.seo.sitemap) {
            rows.push(['SEO', 'Sitemap', appState.results.seo.sitemap.url, appState.results.seo.sitemap.valid ? 'Valida' : 'Non valida']);
        }
    }
    
    // Performance
    if (appState.results.performance && appState.results.performance.webVitals) {
        const { lcp, fid, cls } = appState.results.performance.webVitals;
        if (lcp) {
            rows.push(['Performance', 'LCP', `${lcp.value} ${lcp.unit}`, lcp.rating]);
        }
        if (fid) {
            rows.push(['Performance', 'FID', `${fid.value} ${fid.unit}`, fid.rating]);
        }
        if (cls) {
            rows.push(['Performance', 'CLS', cls.value, cls.rating]);
        }
    }
    
    // Punteggio complessivo
    rows.push(['Generale', 'Punteggio complessivo', appState.results.overallScore, '']);
    
    // Converti l'array in stringa CSV
    let csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Crea un blob e scarica il file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `website-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Esporta i risultati in formato JSON
 */
function exportToJson() {
    // Crea un blob e scarica il file
    const blob = new Blob([JSON.stringify(appState.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `website-analysis-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Visualizza i risultati dell'analisi
 */
function displayResults() {
    // Nascondi la sezione di caricamento e mostra i risultati
    elements.loadingSection.classList.add('d-none');
    elements.resultsSection.classList.remove('d-none');
    
    // Aggiorna le informazioni generali
    elements.siteUrl.textContent = appState.url;
    elements.analysisTimestamp.textContent = `Analizzato il ${new Date().toLocaleString('it-IT')}`;
    
    // Aggiorna il punteggio complessivo
    elements.overallScore.textContent = appState.results.overallScore;
    
    // Aggiorna il grafico del punteggio
    const scorePercentage = appState.results.overallScore / 100;
    const circumference = 2 * Math.PI * 45; // 2πr dove r = 45
    const dashoffset = circumference * (1 - scorePercentage);
    elements.scoreCircle.style.strokeDasharray = circumference;
    elements.scoreCircle.style.strokeDashoffset = dashoffset;
    
    // Imposta il colore del punteggio in base al valore
    if (appState.results.overallScore >= 80) {
        elements.scoreCircle.style.stroke = '#28a745'; // verde
    } else if (appState.results.overallScore >= 60) {
        elements.scoreCircle.style.stroke = '#ffc107'; // giallo
    } else {
        elements.scoreCircle.style.stroke = '#dc3545'; // rosso
    }
    
    // Aggiorna i dettagli delle varie sezioni
    updateSecurityDetails();
    updateSeoDetails();
    updatePerformanceDetails();
    updateContentDetails();
    updateTechnologyDetails();
}

/**
 * Aggiorna i dettagli della sezione sicurezza
 */
function updateSecurityDetails() {
    if (!appState.results.security) return;
    
    // SSL/TLS
    const sslStatus = document.getElementById('ssl-status');
    const sslDetails = document.getElementById('ssl-details');
    
    if (appState.results.security.ssl) {
        const ssl = appState.results.security.ssl;
        
        // Aggiorna il badge
        if (ssl.secure) {
            sslStatus.innerHTML = `<span class="badge bg-success"><i class="fas fa-lock me-1"></i> Sicuro (Grado ${ssl.grade})</span>`;
        } else {
            sslStatus.innerHTML = `<span class="badge bg-danger"><i class="fas fa-unlock me-1"></i> Non sicuro</span>`;
        }
        
        // Aggiorna i dettagli
        sslDetails.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Certificato valido fino a</div>
                <div>${new Date(ssl.validUntil).toLocaleDateString('it-IT')}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Emesso da</div>
                <div>${ssl.issuer}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Protocollo</div>
                <div>${ssl.details.protocol}</div>
            </div>
        `;
    }
    
    // Header di sicurezza
    const securityHeadersStatus = document.getElementById('security-headers-status');
    const securityHeadersDetails = document.getElementById('security-headers-details');
    
    if (appState.results.security.headers) {
        const headers = appState.results.security.headers;
        
        // Aggiorna il badge
        if (headers.score === 'A') {
            securityHeadersStatus.innerHTML = `<span class="badge bg-success"><i class="fas fa-check me-1"></i> Ottimi (Grado ${headers.score})</span>`;
        } else if (headers.score === 'B' || headers.score === 'C') {
            securityHeadersStatus.innerHTML = `<span class="badge bg-warning"><i class="fas fa-exclamation-triangle me-1"></i> Da migliorare (Grado ${headers.score})</span>`;
        } else {
            securityHeadersStatus.innerHTML = `<span class="badge bg-danger"><i class="fas fa-times me-1"></i> Insufficienti (Grado ${headers.score})</span>`;
        }
        
        // Aggiorna i dettagli
        let headerDetails = '';
        
        if (headers.missing && headers.missing.length > 0) {
            headerDetails += `
                <div class="detail-item">
                    <div class="detail-label">Header mancanti</div>
                    <div>
                        <ul class="mb-0 ps-3">
                            ${headers.missing.map(header => `<li>${header}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        if (headers.present && headers.present.length > 0) {
            headerDetails += `
                <div class="detail-item">
                    <div class="detail-label">Header presenti</div>
                    <div>
                        <ul class="mb-0 ps-3">
                            ${headers.present.map(header => `<li>${header}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        securityHeadersDetails.innerHTML = headerDetails;
    }
    
    // Vulnerabilità
    const vulnerabilitiesStatus = document.getElementById('vulnerabilities-status');
    const vulnerabilitiesDetails = document.getElementById('vulnerabilities-details');
    
    if (appState.results.security.vulnerabilities) {
        const vulnerabilities = appState.results.security.vulnerabilities;
        
        // Aggiorna il badge
        if (!vulnerabilities.found || vulnerabilities.count === 0) {
            vulnerabilitiesStatus.innerHTML = `<span class="badge bg-success"><i class="fas fa-shield-alt me-1"></i> Nessuna rilevata</span>`;
        } else {
            vulnerabilitiesStatus.innerHTML = `<span class="badge bg-danger"><i class="fas fa-bug me-1"></i> ${vulnerabilities.count} rilevate</span>`;
        }
        
        // Aggiorna i dettagli
        if (vulnerabilities.details && vulnerabilities.details.length > 0) {
            vulnerabilitiesDetails.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">Vulnerabilità rilevate</div>
                    <div>
                        <ul class="mb-0 ps-3">
                            ${vulnerabilities.details.map(vuln => `<li>${vuln.name}: ${vuln.description}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } else {
            vulnerabilitiesDetails.innerHTML = `
                <div class="detail-item">
                    <div>Nessuna vulnerabilità nota rilevata nel sito.</div>
                </div>
            `;
        }
    }
}
