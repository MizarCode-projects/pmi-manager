// social_campaigns_dashboard_filters.js - Filtri per la dashboard delle campagne social

/**
 * Inizializza i filtri della dashboard
 * @param {string} containerId - ID del container dove inserire i filtri
 * @param {Function} onFilterChange - Callback da eseguire quando i filtri cambiano
 */
function initDashboardFilters(containerId = 'dashboard-filters-container', onFilterChange = null) {
    // Ottieni il container
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Svuota il container
    container.innerHTML = '';
    
    // Crea la struttura per i filtri
    container.innerHTML = `
        <div class="card shadow mb-4">
            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 class="m-0 font-weight-bold text-primary">Filtri Dashboard</h6>
                <div class="dropdown no-arrow">
                    <a class="dropdown-toggle" href="#" role="button" id="filterOptionsDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="filterOptionsDropdown">
                        <div class="dropdown-header">Opzioni Filtri:</div>
                        <a class="dropdown-item" href="#" id="reset-filters-btn">Reimposta Filtri</a>
                        <a class="dropdown-item" href="#" id="save-filters-btn">Salva Filtri</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" id="refresh-dashboard-btn">Aggiorna Dashboard</a>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form id="dashboard-filters-form">
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label for="filter-platform">Piattaforma</label>
                            <select class="form-control" id="filter-platform">
                                <option value="">Tutte le piattaforme</option>
                                <!-- Opzioni aggiunte dinamicamente -->
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="filter-status">Stato</label>
                            <select class="form-control" id="filter-status">
                                <option value="">Tutti gli stati</option>
                                <option value="active">Attiva</option>
                                <option value="paused">In pausa</option>
                                <option value="completed">Completata</option>
                                <option value="scheduled">Programmata</option>
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="filter-objective">Obiettivo</label>
                            <select class="form-control" id="filter-objective">
                                <option value="">Tutti gli obiettivi</option>
                                <option value="Awareness">Awareness</option>
                                <option value="Consideration">Consideration</option>
                                <option value="Conversion">Conversion</option>
                                <option value="Retention">Retention</option>
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="filter-date-range">Periodo</label>
                            <select class="form-control" id="filter-date-range">
                                <option value="all">Tutto il periodo</option>
                                <option value="last7">Ultimi 7 giorni</option>
                                <option value="last30">Ultimi 30 giorni</option>
                                <option value="last90">Ultimi 90 giorni</option>
                                <option value="thisMonth">Questo mese</option>
                                <option value="lastMonth">Mese scorso</option>
                                <option value="thisYear">Quest'anno</option>
                                <option value="custom">Personalizzato</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row" id="custom-date-range" style="display: none;">
                        <div class="col-md-6 mb-3">
                            <label for="filter-date-from">Data inizio</label>
                            <input type="date" class="form-control" id="filter-date-from">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="filter-date-to">Data fine</label>
                            <input type="date" class="form-control" id="filter-date-to">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <button type="submit" class="btn btn-primary float-right">
                                <i class="fas fa-filter fa-sm"></i> Applica Filtri
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Popola le opzioni delle piattaforme
    populatePlatformOptions();
    
    // Gestisci il cambio del range di date
    const dateRangeSelect = document.getElementById('filter-date-range');
    const customDateRange = document.getElementById('custom-date-range');
    
    dateRangeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
            
            // Imposta le date in base al range selezionato
            setDateRangeFromSelection(this.value);
        }
    });
    
    // Gestisci il reset dei filtri
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    resetFiltersBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetFilters();
        
        // Esegui il callback se presente
        if (typeof onFilterChange === 'function') {
            onFilterChange(getFilters());
        }
    });
    
    // Gestisci il salvataggio dei filtri
    const saveFiltersBtn = document.getElementById('save-filters-btn');
    saveFiltersBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveFilters();
    });
    
    // Gestisci l'aggiornamento della dashboard
    const refreshDashboardBtn = document.getElementById('refresh-dashboard-btn');
    refreshDashboardBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Esegui il callback se presente
        if (typeof onFilterChange === 'function') {
            onFilterChange(getFilters());
        }
    });
    
    // Gestisci il submit del form
    const filtersForm = document.getElementById('dashboard-filters-form');
    filtersForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Esegui il callback se presente
        if (typeof onFilterChange === 'function') {
            onFilterChange(getFilters());
        }
    });
    
    // Carica i filtri salvati
    loadSavedFilters();
    
    // Imposta le date predefinite (ultimi 30 giorni)
    setDateRangeFromSelection('last30');
}

/**
 * Popola le opzioni delle piattaforme in base alle campagne esistenti
 */
function populatePlatformOptions() {
    const platformSelect = document.getElementById('filter-platform');
    if (!platformSelect) return;
    
    // Ottieni tutte le piattaforme uniche
    const platforms = [];
    socialCampaigns.forEach(campaign => {
        if (!platforms.includes(campaign.platform)) {
            platforms.push(campaign.platform);
        }
    });
    
    // Ordina le piattaforme alfabeticamente
    platforms.sort();
    
    // Aggiungi le opzioni al select
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform;
        option.textContent = platform;
        platformSelect.appendChild(option);
    });
}

/**
 * Imposta le date in base al range selezionato
 * @param {string} rangeValue - Valore del range selezionato
 */
function setDateRangeFromSelection(rangeValue) {
    const dateFrom = document.getElementById('filter-date-from');
    const dateTo = document.getElementById('filter-date-to');
    
    if (!dateFrom || !dateTo) return;
    
    const today = new Date();
    let fromDate = new Date();
    let toDate = new Date();
    
    switch (rangeValue) {
        case 'last7':
            fromDate.setDate(today.getDate() - 7);
            break;
        case 'last30':
            fromDate.setDate(today.getDate() - 30);
            break;
        case 'last90':
            fromDate.setDate(today.getDate() - 90);
            break;
        case 'thisMonth':
            fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
            toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'lastMonth':
            fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            toDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'thisYear':
            fromDate = new Date(today.getFullYear(), 0, 1);
            toDate = new Date(today.getFullYear(), 11, 31);
            break;
        case 'all':
            // Trova la data di inizio della campagna più vecchia
            let oldestDate = new Date();
            socialCampaigns.forEach(campaign => {
                const campaignStartDate = new Date(campaign.startDate);
                if (campaignStartDate < oldestDate) {
                    oldestDate = campaignStartDate;
                }
            });
            fromDate = oldestDate;
            break;
    }
    
    // Formatta le date per l'input date (YYYY-MM-DD)
    dateFrom.value = fromDate.toISOString().split('T')[0];
    dateTo.value = toDate.toISOString().split('T')[0];
}

/**
 * Ottiene i filtri correnti
 * @returns {Object} - Oggetto con i filtri correnti
 */
function getFilters() {
    const platform = document.getElementById('filter-platform').value;
    const status = document.getElementById('filter-status').value;
    const objective = document.getElementById('filter-objective').value;
    const dateRange = document.getElementById('filter-date-range').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    
    return {
        platform,
        status,
        objective,
        dateRange,
        dateFrom,
        dateTo
    };
}

/**
 * Resetta i filtri ai valori predefiniti
 */
function resetFilters() {
    document.getElementById('filter-platform').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-objective').value = '';
    document.getElementById('filter-date-range').value = 'last30';
    
    // Nascondi il range personalizzato
    document.getElementById('custom-date-range').style.display = 'none';
    
    // Imposta le date predefinite (ultimi 30 giorni)
    setDateRangeFromSelection('last30');
}

/**
 * Salva i filtri correnti nel localStorage
 */
function saveFilters() {
    const filters = getFilters();
    localStorage.setItem('dashboardFilters', JSON.stringify(filters));
    
    // Mostra una notifica
    showNotification('Filtri salvati con successo', 'success');
}

/**
 * Carica i filtri salvati dal localStorage
 */
function loadSavedFilters() {
    const savedFilters = localStorage.getItem('dashboardFilters');
    if (!savedFilters) return;
    
    const filters = JSON.parse(savedFilters);
    
    // Imposta i valori dei filtri
    document.getElementById('filter-platform').value = filters.platform || '';
    document.getElementById('filter-status').value = filters.status || '';
    document.getElementById('filter-objective').value = filters.objective || '';
    document.getElementById('filter-date-range').value = filters.dateRange || 'last30';
    
    // Gestisci il range personalizzato
    if (filters.dateRange === 'custom') {
        document.getElementById('custom-date-range').style.display = 'flex';
        document.getElementById('filter-date-from').value = filters.dateFrom || '';
        document.getElementById('filter-date-to').value = filters.dateTo || '';
    } else {
        document.getElementById('custom-date-range').style.display = 'none';
        setDateRangeFromSelection(filters.dateRange || 'last30');
    }
}

/**
 * Mostra una notifica
 * @param {string} message - Messaggio da mostrare
 * @param {string} type - Tipo di notifica (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Controlla se la funzione esiste già (definita in un altro file)
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Implementazione di fallback
    alert(message);
}

// Esporta le funzioni
window.initDashboardFilters = initDashboardFilters;
window.getFilters = getFilters;
window.resetFilters = resetFilters;
