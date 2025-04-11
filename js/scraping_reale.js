/**
 * Funzionalità di scraping reale per PMI Contatti Manager
 * Questo script sostituisce la simulazione con uno scraping reale
 */

// Quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aggiungi event listener per il pulsante di avvio ricerca
    const startScrapingBtn = document.getElementById('start-scraping-btn');
    if (startScrapingBtn) {
        startScrapingBtn.addEventListener('click', startRealScraping);
    }
    
    // Aggiungi event listener per il pulsante di importazione
    const importResultsBtn = document.getElementById('import-results-btn');
    if (importResultsBtn) {
        importResultsBtn.addEventListener('click', importRealScrapingResults);
    }
    
    // Verifica se i grafici devono essere inizializzati
    if (typeof initCharts === 'function' && typeof contacts !== 'undefined' && contacts) {
        console.log('Inizializzazione grafici dalla pagina di scraping reale');
        try {
            initCharts(contacts);
        } catch (error) {
            console.warn('Impossibile inizializzare i grafici:', error);
        }
    }
});

/**
 * Avvia lo scraping reale
 */
function startRealScraping() {
    const location = document.getElementById('scraping-location').value;
    const sector = document.getElementById('scraping-sector').value;
    const size = document.getElementById('scraping-size').value;
    const count = parseInt(document.getElementById('scraping-count').value);
    
    // Mostra la barra di progresso
    document.getElementById('scraping-results').style.display = 'block';
    document.getElementById('scraping-progress').style.display = 'block';
    document.getElementById('scraping-results-content').innerHTML = '<p class="text-center">Ricerca in corso...</p>';
    
    // Disabilita il pulsante durante la ricerca
    this.disabled = true;
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Ricerca in corso...';
    
    // Chiama l'API di scraping reale
    fetch('/api/scrape', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            localita: location,
            settore: sector,
            size: size,
            num_pages: count > 10 ? 5 : 3 // Limita il numero di pagine in base ai risultati richiesti
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Inizia a controllare lo stato dello scraping
            checkScrapingStatus();
        } else {
            // Mostra l'errore
            document.getElementById('scraping-results-content').innerHTML = 
                `<div class="alert alert-danger">Errore: ${data.error || 'Si è verificato un errore durante la ricerca.'}</div>`;
            
            // Ripristina il pulsante
            document.getElementById('start-scraping-btn').disabled = false;
            document.getElementById('start-scraping-btn').innerHTML = 'Avvia Ricerca';
            document.getElementById('scraping-progress').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Errore:', error);
        document.getElementById('scraping-results-content').innerHTML = 
            `<div class="alert alert-danger">Errore di connessione: ${error.message}</div>`;
        
        // Ripristina il pulsante
        document.getElementById('start-scraping-btn').disabled = false;
        document.getElementById('start-scraping-btn').innerHTML = 'Avvia Ricerca';
        document.getElementById('scraping-progress').style.display = 'none';
    });
}

/**
 * Controlla lo stato dello scraping
 */
function checkScrapingStatus() {
    fetch('/api/scrape/status')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Aggiorna la barra di progresso
        const progressBar = document.querySelector('#scraping-progress .progress-bar');
        if (progressBar && data.progress) {
            progressBar.style.width = `${data.progress}%`;
            progressBar.setAttribute('aria-valuenow', data.progress);
            progressBar.textContent = `${data.progress}%`;
        }
        
        if (data.completed) {
            // Scraping completato
            displayRealScrapingResults(data.results);
            
            // Ripristina il pulsante
            document.getElementById('start-scraping-btn').disabled = false;
            document.getElementById('start-scraping-btn').innerHTML = 'Avvia Ricerca';
            document.getElementById('scraping-progress').style.display = 'none';
            
            // Mostra il pulsante per importare i risultati
            document.getElementById('import-results-btn').style.display = 'inline-block';
        } else if (data.in_progress) {
            // Scraping ancora in corso, controlla di nuovo tra 2 secondi
            setTimeout(checkScrapingStatus, 2000);
        } else if (data.error) {
            // Si è verificato un errore
            document.getElementById('scraping-results-content').innerHTML = 
                `<div class="alert alert-danger">Errore: ${data.error}</div>`;
            
            // Ripristina il pulsante
            document.getElementById('start-scraping-btn').disabled = false;
            document.getElementById('start-scraping-btn').innerHTML = 'Avvia Ricerca';
            document.getElementById('scraping-progress').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Errore nel controllo dello stato:', error);
        // Riprova tra 3 secondi
        setTimeout(checkScrapingStatus, 3000);
    });
}

/**
 * Visualizza i risultati dello scraping reale
 */
function displayRealScrapingResults(results) {
    const resultsContainer = document.getElementById('scraping-results-content');
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center">Nessun risultato trovato.</p>';
        return;
    }
    
    let html = `<p>Trovate ${results.length} aziende:</p>`;
    html += '<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr>';
    html += '<th><input type="checkbox" id="select-all-results"></th>';
    html += '<th>Ragione Sociale</th><th>Settore</th><th>Email</th><th>Telefono</th><th>Città</th><th>Fonte</th></tr></thead><tbody>';
    
    results.forEach((result, index) => {
        html += `<tr>
            <td><input type="checkbox" class="result-checkbox" data-index="${index}" checked></td>
            <td>${result['Ragione Sociale'] || ''}</td>
            <td>${result['Settore'] || ''}</td>
            <td>${result['Email'] || ''}</td>
            <td>${result['Telefono'] || ''}</td>
            <td>${result['Città'] || ''}</td>
            <td>${result['Note'] ? result['Note'].split('Importato da ')[1]?.split(' il ')[0] || '' : ''}</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    resultsContainer.innerHTML = html;
    
    // Event listener per il checkbox "seleziona tutti"
    const selectAllCheckbox = document.getElementById('select-all-results');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            document.querySelectorAll('.result-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
    }
}

/**
 * Importa i risultati dello scraping reale
 */
function importRealScrapingResults() {
    const resultsContainer = document.getElementById('scraping-results-content');
    const checkboxes = resultsContainer.querySelectorAll('.result-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Seleziona almeno un risultato da importare.');
        return;
    }
    
    // Ottieni lo stato dello scraping per recuperare i risultati
    fetch('/api/scrape/status')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.results && data.results.length > 0) {
            const allResults = data.results;
            const selectedResults = [];
            
            checkboxes.forEach(checkbox => {
                const index = parseInt(checkbox.dataset.index);
                if (allResults[index]) {
                    selectedResults.push(allResults[index]);
                }
            });
            
            // Aggiungi i risultati selezionati all'array dei contatti
            if (typeof contacts !== 'undefined') {
                contacts.push(...selectedResults);
                
                // Salva i contatti
                if (typeof saveContacts === 'function') {
                    saveContacts();
                }
                
                // Aggiorna la tabella
                if (typeof dataTable !== 'undefined' && dataTable) {
                    try {
                        dataTable.destroy();
                    } catch (e) {
                        console.warn('Errore nel distruggere DataTable:', e);
                    }
                }
                
                if (typeof renderContacts === 'function') {
                    renderContacts();
                }
                
                // Aggiorna i grafici
                if (typeof initCharts === 'function') {
                    try {
                        initCharts(contacts);
                    } catch (error) {
                        console.warn('Impossibile aggiornare i grafici:', error);
                    }
                }
                
                // Chiudi il modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('scraping-modal'));
                if (modal) {
                    modal.hide();
                }
                
                // Mostra un messaggio di successo
                alert(`${selectedResults.length} aziende importate con successo!`);
            } else {
                console.error('La variabile contacts non è definita');
                alert('Errore: impossibile importare i risultati.');
            }
        } else {
            alert('Nessun risultato disponibile da importare.');
        }
    })
    .catch(error => {
        console.error('Errore nel recupero dei risultati:', error);
        alert('Si è verificato un errore nel recupero dei risultati.');
    });
}
