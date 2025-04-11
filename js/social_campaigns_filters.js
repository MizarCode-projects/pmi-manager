// social_campaigns_filters.js - Gestione dei filtri per le campagne social

/**
 * Inizializza i filtri per le campagne social
 */
function initCampaignFilters() {
    // Popola i select dei filtri con le opzioni disponibili
    populateFilterOptions('filter-platform', platforms);
    populateFilterOptions('filter-status', campaignStatuses);
    populateFilterOptions('filter-objective', objectives);
    
    // Aggiungi event listener per i filtri
    document.getElementById('filter-platform')?.addEventListener('change', applyFilters);
    document.getElementById('filter-status')?.addEventListener('change', applyFilters);
    document.getElementById('filter-objective')?.addEventListener('change', applyFilters);
    document.getElementById('filter-date-from')?.addEventListener('change', applyFilters);
    document.getElementById('filter-date-to')?.addEventListener('change', applyFilters);
    
    // Aggiungi event listener per il pulsante di reset dei filtri
    document.getElementById('reset-filters-btn')?.addEventListener('click', resetFilters);
    
    // Aggiungi event listener per la ricerca testuale
    document.getElementById('campaign-search')?.addEventListener('input', applyFilters);
}

/**
 * Popola un elemento select dei filtri con le opzioni fornite
 */
function populateFilterOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Svuota il select
    select.innerHTML = '<option value="">Tutti</option>';
    
    // Aggiungi le opzioni
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

/**
 * Applica i filtri alle campagne social
 */
function applyFilters() {
    // Raccogli i valori dei filtri
    const platform = document.getElementById('filter-platform')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const objective = document.getElementById('filter-objective')?.value || '';
    const dateFrom = document.getElementById('filter-date-from')?.value || '';
    const dateTo = document.getElementById('filter-date-to')?.value || '';
    const searchText = document.getElementById('campaign-search')?.value.toLowerCase() || '';
    
    // Filtra le campagne
    let filtered = [...socialCampaigns];
    
    // Filtra per piattaforma
    if (platform) {
        filtered = filtered.filter(c => c.platform === platform);
    }
    
    // Filtra per stato
    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }
    
    // Filtra per obiettivo
    if (objective) {
        filtered = filtered.filter(c => c.objective === objective);
    }
    
    // Filtra per data di inizio
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filtered = filtered.filter(c => new Date(c.startDate) >= fromDate);
    }
    
    // Filtra per data di fine
    if (dateTo) {
        const toDate = new Date(dateTo);
        filtered = filtered.filter(c => {
            // Se la campagna non ha data di fine, considera solo la data di inizio
            if (!c.endDate) return new Date(c.startDate) <= toDate;
            return new Date(c.endDate) <= toDate;
        });
    }
    
    // Filtra per testo di ricerca
    if (searchText) {
        filtered = filtered.filter(c => {
            return c.name.toLowerCase().includes(searchText) ||
                   c.platform.toLowerCase().includes(searchText) ||
                   c.target.toLowerCase().includes(searchText) ||
                   c.objective.toLowerCase().includes(searchText) ||
                   (c.notes && c.notes.toLowerCase().includes(searchText));
        });
    }
    
    // Aggiorna la tabella con i risultati filtrati
    renderFilteredCampaigns(filtered);
    
    // Aggiorna il conteggio dei risultati
    updateFilterResultsCount(filtered.length);
}

/**
 * Renderizza le campagne filtrate
 */
function renderFilteredCampaigns(filteredCampaigns) {
    const tableBody = document.querySelector('#social-campaigns-table tbody');
    if (!tableBody) return;
    
    // Svuota la tabella
    tableBody.innerHTML = '';
    
    // Distruggi DataTable se esiste
    if ($.fn.DataTable.isDataTable('#social-campaigns-table')) {
        $('#social-campaigns-table').DataTable().destroy();
    }
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">Nessuna campagna corrisponde ai filtri selezionati</td>
            </tr>
        `;
        initCampaignsTable();
        return;
    }
    
    // Formatta i numeri per la visualizzazione
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(Math.round(num));
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT');
    };
    
    // Popola la tabella con i dati filtrati
    filteredCampaigns.forEach(campaign => {
        const row = document.createElement('tr');
        
        // Calcola i KPI effettivi o usa quelli simulati
        const kpi = calculateActualKPI(campaign);
        
        // Determina la classe per lo stato
        let statusClass = '';
        switch (campaign.status) {
            case 'Attiva':
                statusClass = 'bg-success';
                break;
            case 'Pianificata':
                statusClass = 'bg-info';
                break;
            case 'In pausa':
                statusClass = 'bg-warning';
                break;
            case 'Conclusa':
                statusClass = 'bg-secondary';
                break;
            case 'Cancellata':
                statusClass = 'bg-danger';
                break;
        }
        
        // Aggiungi le celle con i dati
        row.innerHTML = `
            <td>${campaign.name}</td>
            <td>${campaign.platform}</td>
            <td>${campaign.target}</td>
            <td>${formatCurrency(campaign.budget)}</td>
            <td><span class="badge ${statusClass}">${campaign.status}</span></td>
            <td>${formatDate(campaign.startDate)}</td>
            <td>${formatDate(campaign.endDate)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info details-campaign-btn" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Dettagli">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn btn-outline-primary edit-campaign-btn" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-campaign-btn" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Reinizializza DataTable
    initCampaignsTable();
    
    // Inizializza i tooltip
    initTooltips();
}

/**
 * Aggiorna il conteggio dei risultati filtrati
 */
function updateFilterResultsCount(count) {
    const countElement = document.getElementById('filter-results-count');
    if (countElement) {
        countElement.textContent = `${count} risultati trovati`;
    }
}

/**
 * Resetta tutti i filtri
 */
function resetFilters() {
    // Resetta i valori dei filtri
    document.getElementById('filter-platform')?.value = '';
    document.getElementById('filter-status')?.value = '';
    document.getElementById('filter-objective')?.value = '';
    document.getElementById('filter-date-from')?.value = '';
    document.getElementById('filter-date-to')?.value = '';
    document.getElementById('campaign-search')?.value = '';
    
    // Applica i filtri (mostrerà tutte le campagne)
    applyFilters();
    
    // Mostra notifica
    showNotification('Filtri reimpostati', 'info');
}

/**
 * Esporta le campagne filtrate in formato CSV
 */
function exportFilteredCampaigns() {
    // Raccogli i valori dei filtri
    const platform = document.getElementById('filter-platform')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const objective = document.getElementById('filter-objective')?.value || '';
    const dateFrom = document.getElementById('filter-date-from')?.value || '';
    const dateTo = document.getElementById('filter-date-to')?.value || '';
    const searchText = document.getElementById('campaign-search')?.value.toLowerCase() || '';
    
    // Filtra le campagne
    let filtered = [...socialCampaigns];
    
    // Applica gli stessi filtri della funzione applyFilters
    if (platform) filtered = filtered.filter(c => c.platform === platform);
    if (status) filtered = filtered.filter(c => c.status === status);
    if (objective) filtered = filtered.filter(c => c.objective === objective);
    
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filtered = filtered.filter(c => new Date(c.startDate) >= fromDate);
    }
    
    if (dateTo) {
        const toDate = new Date(dateTo);
        filtered = filtered.filter(c => {
            if (!c.endDate) return new Date(c.startDate) <= toDate;
            return new Date(c.endDate) <= toDate;
        });
    }
    
    if (searchText) {
        filtered = filtered.filter(c => {
            return c.name.toLowerCase().includes(searchText) ||
                   c.platform.toLowerCase().includes(searchText) ||
                   c.target.toLowerCase().includes(searchText) ||
                   c.objective.toLowerCase().includes(searchText) ||
                   (c.notes && c.notes.toLowerCase().includes(searchText));
        });
    }
    
    // Se non ci sono campagne, mostra un messaggio
    if (filtered.length === 0) {
        showNotification('Nessuna campagna da esportare', 'warning');
        return;
    }
    
    // Crea il contenuto CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Intestazioni
    const headers = [
        'Nome', 'Piattaforma', 'Obiettivo', 'Target', 'Budget', 'Stato',
        'Data Inizio', 'Data Fine', 'Impression', 'Click', 'CTR', 'CPC',
        'Conversioni', 'CAC', 'Entrate', 'ROAS', 'Note'
    ];
    csvContent += headers.join(',') + '\r\n';
    
    // Dati
    filtered.forEach(campaign => {
        const kpi = calculateActualKPI(campaign);
        
        const row = [
            `"${campaign.name}"`,
            `"${campaign.platform}"`,
            `"${campaign.objective}"`,
            `"${campaign.target}"`,
            campaign.budget,
            `"${campaign.status}"`,
            campaign.startDate,
            campaign.endDate || '',
            kpi.impressions,
            kpi.clicks,
            (kpi.ctr).toFixed(2),
            kpi.cpc.toFixed(2),
            kpi.conversions,
            kpi.cac.toFixed(2),
            kpi.revenue.toFixed(2),
            kpi.roas.toFixed(2),
            `"${campaign.notes || ''}"`
        ];
        
        csvContent += row.join(',') + '\r\n';
    });
    
    // Crea un link per il download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campagne_social_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Simula il click sul link
    link.click();
    
    // Rimuovi il link
    document.body.removeChild(link);
    
    // Mostra notifica
    showNotification(`Esportate ${filtered.length} campagne in formato CSV`, 'success');
}

// Inizializza i filtri quando il documento è pronto
document.addEventListener('DOMContentLoaded', initCampaignFilters);
