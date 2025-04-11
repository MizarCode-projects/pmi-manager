// social_campaigns_form.js - Gestione del form per le campagne social

/**
 * Inizializza il form per le campagne social
 */
function initCampaignForm() {
    // Popola i select con le opzioni disponibili
    populateSelectOptions('campaign-platform', platforms);
    populateSelectOptions('campaign-objective', objectives);
    populateSelectOptions('campaign-status', campaignStatuses);
    
    // Aggiungi event listener per il form
    const form = document.getElementById('campaign-form');
    if (form) {
        form.addEventListener('submit', handleCampaignFormSubmit);
    }
    
    // Aggiungi event listener per il pulsante di simulazione
    const simulateBtn = document.getElementById('simulate-campaign-btn');
    if (simulateBtn) {
        simulateBtn.addEventListener('click', simulateCampaignFromForm);
    }
    
    // Event listener per il cambio di piattaforma (per aggiornare i benchmark)
    const platformSelect = document.getElementById('campaign-platform');
    if (platformSelect) {
        platformSelect.addEventListener('change', updateBenchmarkInfo);
    }
}

/**
 * Popola un elemento select con le opzioni fornite
 */
function populateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Svuota il select
    select.innerHTML = '<option value="">Seleziona...</option>';
    
    // Aggiungi le opzioni
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

/**
 * Gestisce l'invio del form delle campagne
 */
function handleCampaignFormSubmit(event) {
    event.preventDefault();
    
    // Validazione del form
    if (!validateCampaignForm()) {
        return;
    }
    
    // Raccogli i dati dal form
    const campaignData = collectFormData();
    
    // Controlla se è un aggiornamento o una nuova campagna
    const campaignId = document.getElementById('campaign-id').value;
    
    if (campaignId) {
        // Aggiorna la campagna esistente
        updateCampaign(campaignId, campaignData);
        showNotification('Campagna aggiornata con successo', 'success');
    } else {
        // Aggiungi una nuova campagna
        addCampaign(campaignData);
        showNotification('Nuova campagna aggiunta', 'success');
    }
    
    // Chiudi il modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('socialCampaignModal'));
    if (modal) {
        modal.hide();
    }
    
    // Resetta il form
    resetCampaignForm();
}

/**
 * Valida il form delle campagne
 */
function validateCampaignForm() {
    // Campi obbligatori
    const requiredFields = [
        'campaign-name',
        'campaign-platform',
        'campaign-objective',
        'campaign-target',
        'campaign-budget',
        'campaign-start-date',
        'campaign-status'
    ];
    
    let isValid = true;
    
    // Controlla i campi obbligatori
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validazione aggiuntiva per il budget (deve essere un numero positivo)
    const budgetField = document.getElementById('campaign-budget');
    if (budgetField && budgetField.value) {
        const budget = parseFloat(budgetField.value);
        if (isNaN(budget) || budget <= 0) {
            isValid = false;
            budgetField.classList.add('is-invalid');
        }
    }
    
    // Validazione delle date (la data di fine deve essere successiva alla data di inizio)
    const startDateField = document.getElementById('campaign-start-date');
    const endDateField = document.getElementById('campaign-end-date');
    
    if (startDateField && endDateField && startDateField.value && endDateField.value) {
        const startDate = new Date(startDateField.value);
        const endDate = new Date(endDateField.value);
        
        if (endDate < startDate) {
            isValid = false;
            endDateField.classList.add('is-invalid');
        } else {
            endDateField.classList.remove('is-invalid');
        }
    }
    
    // Mostra un messaggio di errore se il form non è valido
    if (!isValid) {
        showNotification('Compila tutti i campi obbligatori correttamente', 'danger');
    }
    
    return isValid;
}

/**
 * Raccoglie i dati dal form
 */
function collectFormData() {
    return {
        name: document.getElementById('campaign-name').value,
        platform: document.getElementById('campaign-platform').value,
        objective: document.getElementById('campaign-objective').value,
        target: document.getElementById('campaign-target').value,
        budget: parseFloat(document.getElementById('campaign-budget').value),
        startDate: document.getElementById('campaign-start-date').value,
        endDate: document.getElementById('campaign-end-date').value,
        status: document.getElementById('campaign-status').value,
        notes: document.getElementById('campaign-notes').value,
        
        // Campi per i dati effettivi (se disponibili)
        actualSpend: parseFloat(document.getElementById('campaign-actual-spend')?.value) || 0,
        impressions: parseInt(document.getElementById('campaign-impressions')?.value) || 0,
        clicks: parseInt(document.getElementById('campaign-clicks')?.value) || 0,
        conversions: parseInt(document.getElementById('campaign-conversions')?.value) || 0,
        revenue: parseFloat(document.getElementById('campaign-revenue')?.value) || 0
    };
}

/**
 * Resetta il form delle campagne
 */
function resetCampaignForm() {
    const form = document.getElementById('campaign-form');
    if (form) {
        form.reset();
        document.getElementById('campaign-id').value = '';
        
        // Nascondi i campi per i dati effettivi
        const actualDataSection = document.getElementById('actual-data-section');
        if (actualDataSection) {
            actualDataSection.style.display = 'none';
        }
        
        // Resetta i risultati della simulazione
        const simulationResults = document.getElementById('simulation-results');
        if (simulationResults) {
            simulationResults.innerHTML = '';
            simulationResults.style.display = 'none';
        }
        
        // Aggiorna il titolo del modal
        const modalTitle = document.querySelector('#socialCampaignModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Nuova Campagna Social';
        }
        
        // Aggiorna il testo del pulsante di invio
        const submitButton = document.querySelector('#campaign-form button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Salva Campagna';
        }
    }
}

/**
 * Popola il form con i dati di una campagna esistente
 */
function populateCampaignForm(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return;
    
    // Imposta l'ID della campagna
    document.getElementById('campaign-id').value = campaign.id;
    
    // Popola i campi del form
    document.getElementById('campaign-name').value = campaign.name;
    document.getElementById('campaign-platform').value = campaign.platform;
    document.getElementById('campaign-objective').value = campaign.objective;
    document.getElementById('campaign-target').value = campaign.target;
    document.getElementById('campaign-budget').value = campaign.budget;
    document.getElementById('campaign-start-date').value = campaign.startDate;
    document.getElementById('campaign-end-date').value = campaign.endDate || '';
    document.getElementById('campaign-status').value = campaign.status;
    document.getElementById('campaign-notes').value = campaign.notes || '';
    
    // Popola i campi per i dati effettivi
    if (campaign.actualSpend || campaign.impressions || campaign.clicks || campaign.conversions || campaign.revenue) {
        document.getElementById('campaign-actual-spend').value = campaign.actualSpend || '';
        document.getElementById('campaign-impressions').value = campaign.impressions || '';
        document.getElementById('campaign-clicks').value = campaign.clicks || '';
        document.getElementById('campaign-conversions').value = campaign.conversions || '';
        document.getElementById('campaign-revenue').value = campaign.revenue || '';
        
        // Mostra la sezione dei dati effettivi
        const actualDataSection = document.getElementById('actual-data-section');
        if (actualDataSection) {
            actualDataSection.style.display = 'block';
        }
    }
    
    // Aggiorna il titolo del modal
    const modalTitle = document.querySelector('#socialCampaignModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Modifica Campagna Social';
    }
    
    // Aggiorna il testo del pulsante di invio
    const submitButton = document.querySelector('#campaign-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Aggiorna Campagna';
    }
}

/**
 * Simula una campagna dai dati del form
 */
function simulateCampaignFromForm() {
    // Raccogli i dati dal form
    const campaignData = {
        platform: document.getElementById('campaign-platform').value,
        budget: parseFloat(document.getElementById('campaign-budget').value)
    };
    
    // Verifica che i campi necessari siano compilati
    if (!campaignData.platform || isNaN(campaignData.budget) || campaignData.budget <= 0) {
        showNotification('Seleziona una piattaforma e inserisci un budget valido', 'warning');
        return;
    }
    
    // Simula i KPI
    const kpi = simulateCampaignKPI(campaignData);
    
    // Mostra i risultati della simulazione
    displaySimulationResults(kpi);
}

/**
 * Mostra i risultati della simulazione
 */
function displaySimulationResults(kpi) {
    const resultsContainer = document.getElementById('simulation-results');
    if (!resultsContainer) return;
    
    // Formatta i numeri per la visualizzazione
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(Math.round(num));
    const formatPercent = (num) => new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num / 100);
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    
    // Crea la tabella dei risultati
    resultsContainer.innerHTML = `
        <h5 class="mt-4">Risultati Simulazione</h5>
        <div class="table-responsive">
            <table class="table table-sm">
                <tbody>
                    <tr>
                        <th>Impression stimate:</th>
                        <td>${formatNumber(kpi.impressions)}</td>
                        <th>Click stimati:</th>
                        <td>${formatNumber(kpi.clicks)}</td>
                    </tr>
                    <tr>
                        <th>CTR stimato:</th>
                        <td>${formatPercent(kpi.ctr)}</td>
                        <th>CPC stimato:</th>
                        <td>${formatCurrency(kpi.cpc)}</td>
                    </tr>
                    <tr>
                        <th>Conversioni stimate:</th>
                        <td>${formatNumber(kpi.conversions)}</td>
                        <th>CAC stimato:</th>
                        <td>${formatCurrency(kpi.cac)}</td>
                    </tr>
                    <tr>
                        <th>Entrate stimate:</th>
                        <td>${formatCurrency(kpi.revenue)}</td>
                        <th>ROAS stimato:</th>
                        <td>${kpi.roas.toFixed(2)}x</td>
                    </tr>
                    <tr>
                        <th>Efficacia stimata:</th>
                        <td colspan="3">
                            <div class="progress">
                                <div class="progress-bar ${getEffectivenessClass(kpi.effectiveness)}" 
                                     role="progressbar" 
                                     style="width: ${kpi.effectiveness * 10}%" 
                                     aria-valuenow="${kpi.effectiveness}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="10">
                                    ${kpi.effectiveness}/10
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-muted small">Nota: Questi risultati sono stime basate su benchmark di settore e possono variare.</p>
    `;
    
    // Mostra il contenitore dei risultati
    resultsContainer.style.display = 'block';
}

/**
 * Restituisce la classe CSS per la barra di efficacia
 */
function getEffectivenessClass(effectiveness) {
    if (effectiveness >= 8) return 'bg-success';
    if (effectiveness >= 6) return 'bg-info';
    if (effectiveness >= 4) return 'bg-warning';
    return 'bg-danger';
}

/**
 * Aggiorna le informazioni di benchmark quando cambia la piattaforma
 */
function updateBenchmarkInfo() {
    const platform = document.getElementById('campaign-platform').value;
    const benchmarkInfo = document.getElementById('benchmark-info');
    
    if (!benchmarkInfo || !platform || !platformBenchmarks[platform]) return;
    
    const benchmark = platformBenchmarks[platform];
    
    benchmarkInfo.innerHTML = `
        <div class="alert alert-info mt-3">
            <h6>Benchmark per ${platform}</h6>
            <div class="row">
                <div class="col-6 col-md-3">
                    <small>CTR medio: ${benchmark.ctr.toFixed(2)}%</small>
                </div>
                <div class="col-6 col-md-3">
                    <small>CPC medio: €${benchmark.cpc.toFixed(2)}</small>
                </div>
                <div class="col-6 col-md-3">
                    <small>CAC medio: €${benchmark.cac.toFixed(2)}</small>
                </div>
                <div class="col-6 col-md-3">
                    <small>ROAS medio: ${benchmark.roas.toFixed(1)}x</small>
                </div>
            </div>
        </div>
    `;
}

/**
 * Mostra una notifica all'utente
 */
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    notificationArea.appendChild(notification);
    
    // Rimuovi la notifica dopo 5 secondi
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Inizializza il form quando il documento è pronto
document.addEventListener('DOMContentLoaded', initCampaignForm);
