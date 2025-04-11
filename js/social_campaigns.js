// Variabili globali per le campagne social
let socialCampaigns = [];
let campaignsTable;

// Funzione per inizializzare la pagina delle campagne social
function initSocialCampaignsPage() {
    // Carica le campagne salvate
    loadCampaigns();
    
    // Inizializza la tabella delle campagne
    initSocialCampaignsTable();
    
    // Inizializza i filtri
    initSocialCampaignsFilters();
    
    // Aggiorna le metriche di performance
    updatePerformanceMetrics();
}

// Funzione per caricare le campagne dal localStorage
function loadCampaigns() {
    const savedCampaigns = localStorage.getItem('socialCampaigns');
    if (savedCampaigns) {
        socialCampaigns = JSON.parse(savedCampaigns);
        renderSocialCampaignsTable();
    } else {
        // Se non ci sono campagne salvate, inizializza con un array vuoto
        socialCampaigns = [];
        saveCampaigns();
    }
}

// Funzione per salvare le campagne nel localStorage
function saveCampaigns() {
    localStorage.setItem('socialCampaigns', JSON.stringify(socialCampaigns));
}

// Funzione per aggiungere una nuova campagna
function addSocialCampaign(campaign) {
    // Aggiungi un ID univoco se non è presente
    if (!campaign.id) {
        campaign.id = Date.now().toString();
    }
    
    // Aggiungi dati di performance simulati
    campaign.performance = generateRandomPerformance(campaign.budget);
    
    // Aggiungi la campagna all'array
    socialCampaigns.push(campaign);
    
    // Salva le campagne aggiornate
    saveCampaigns();
    
    // Aggiorna la tabella e le metriche
    renderSocialCampaignsTable();
    updatePerformanceMetrics();
}

// Funzione per aggiornare una campagna esistente
function updateSocialCampaign(campaignId, updatedData) {
    const index = socialCampaigns.findIndex(c => c.id === campaignId);
    if (index !== -1) {
        // Mantieni l'ID e i dati di performance originali
        const originalId = socialCampaigns[index].id;
        const originalPerformance = socialCampaigns[index].performance;
        
        // Aggiorna i dati della campagna
        socialCampaigns[index] = {
            ...updatedData,
            id: originalId,
            performance: originalPerformance
        };
        
        // Salva le campagne aggiornate
        saveCampaigns();
        
        // Aggiorna la tabella e le metriche
        renderSocialCampaignsTable();
        updatePerformanceMetrics();
        
        return true;
    }
    return false;
}

// Funzione per eliminare una campagna
function deleteSocialCampaign(campaignId) {
    const index = socialCampaigns.findIndex(c => c.id === campaignId);
    if (index !== -1) {
        // Rimuovi la campagna dall'array
        socialCampaigns.splice(index, 1);
        
        // Salva le campagne aggiornate
        saveCampaigns();
        
        // Aggiorna la tabella e le metriche
        renderSocialCampaignsTable();
        updatePerformanceMetrics();
        
        return true;
    }
    return false;
}

// Funzione per ottenere una campagna specifica per ID
function getSocialCampaignById(campaignId) {
    return socialCampaigns.find(c => c.id === campaignId);
}

// Funzione per filtrare le campagne in base ai criteri
function filterSocialCampaigns(filters) {
    return socialCampaigns.filter(campaign => {
        // Filtra per piattaforma
        if (filters.platform && filters.platform !== 'all' && campaign.platform !== filters.platform) {
            return false;
        }
        
        // Filtra per obiettivo
        if (filters.objective && filters.objective !== 'all' && campaign.objective !== filters.objective) {
            return false;
        }
        
        // Filtra per stato
        if (filters.status && filters.status !== 'all' && campaign.status !== filters.status) {
            return false;
        }
        
        // Filtra per data di inizio
        if (filters.startDate && new Date(campaign.startDate) < new Date(filters.startDate)) {
            return false;
        }
        
        // Filtra per data di fine
        if (filters.endDate && new Date(campaign.endDate) > new Date(filters.endDate)) {
            return false;
        }
        
        // Filtra per budget minimo
        if (filters.minBudget && campaign.budget < parseFloat(filters.minBudget)) {
            return false;
        }
        
        // Filtra per budget massimo
        if (filters.maxBudget && campaign.budget > parseFloat(filters.maxBudget)) {
            return false;
        }
        
        // Se passa tutti i filtri, includi la campagna
        return true;
    });
}

// Funzione per inizializzare i filtri delle campagne
function initSocialCampaignsFilters() {
    // Aggiungi event listener per il pulsante di applicazione dei filtri
    document.getElementById('apply-filters-btn').addEventListener('click', function() {
        // Raccogli i valori dei filtri
        const filters = {
            platform: document.getElementById('filter-platform').value,
            objective: document.getElementById('filter-objective').value,
            status: document.getElementById('filter-status').value,
            startDate: document.getElementById('filter-start-date').value,
            endDate: document.getElementById('filter-end-date').value,
            minBudget: document.getElementById('filter-min-budget').value,
            maxBudget: document.getElementById('filter-max-budget').value
        };
        
        // Filtra le campagne e aggiorna la tabella
        const filteredCampaigns = filterSocialCampaigns(filters);
        renderSocialCampaignsTable(filteredCampaigns);
        
        // Mostra una notifica
        showNotification(`Filtri applicati: ${filteredCampaigns.length} campagne trovate`, 'info');
    });
    
    // Aggiungi event listener per il pulsante di reset dei filtri
    document.getElementById('reset-filters-btn').addEventListener('click', function() {
        // Reset dei campi dei filtri
        document.getElementById('filter-platform').value = 'all';
        document.getElementById('filter-objective').value = 'all';
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        document.getElementById('filter-min-budget').value = '';
        document.getElementById('filter-max-budget').value = '';
        
        // Mostra tutte le campagne
        renderSocialCampaignsTable();
        
        // Mostra una notifica
        showNotification('Filtri reimpostati', 'info');
    });
}

// Funzione per generare dati di performance casuali per le campagne
function generateRandomPerformance(budget) {
    const impressions = Math.floor(budget * (Math.random() * 1000 + 500));
    const clicks = Math.floor(impressions * (Math.random() * 0.1 + 0.01));
    const conversions = Math.floor(clicks * (Math.random() * 0.2 + 0.05));
    const revenue = budget * (Math.random() * 3 + 0.5);
    
    return {
        impressions,
        clicks,
        conversions,
        ctr: (clicks / impressions) * 100,
        cpc: budget / clicks,
        cpm: (budget / impressions) * 1000,
        cpa: conversions > 0 ? budget / conversions : 0,
        revenue,
        roas: revenue / budget
    };
}

// Funzione per aggiornare le metriche di performance
function updatePerformanceMetrics() {
    if (socialCampaigns.length === 0) {
        // Se non ci sono campagne, imposta tutti i valori a zero
        document.getElementById('total-impressions').textContent = '0';
        document.getElementById('total-clicks').textContent = '0';
        document.getElementById('avg-ctr').textContent = '0%';
        document.getElementById('avg-cpc').textContent = '€0.00';
        document.getElementById('total-conversions').textContent = '0';
        document.getElementById('avg-cac').textContent = '€0.00';
        document.getElementById('avg-roas').textContent = '0x';
        document.getElementById('avg-cpm').textContent = '€0.00';
        return;
    }
    
    // Calcola le metriche aggregate
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalBudget = 0;
    let totalRevenue = 0;
    
    socialCampaigns.forEach(campaign => {
        if (campaign.performance) {
            totalImpressions += campaign.performance.impressions;
            totalClicks += campaign.performance.clicks;
            totalConversions += campaign.performance.conversions;
            totalRevenue += campaign.performance.revenue;
        }
        totalBudget += campaign.budget;
    });
    
    // Calcola le medie
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalBudget / totalClicks : 0;
    const avgCAC = totalConversions > 0 ? totalBudget / totalConversions : 0;
    const avgROAS = totalBudget > 0 ? totalRevenue / totalBudget : 0;
    const avgCPM = totalImpressions > 0 ? (totalBudget / totalImpressions) * 1000 : 0;
    
    // Aggiorna i valori nella UI
    document.getElementById('total-impressions').textContent = formatNumber(totalImpressions);
    document.getElementById('total-clicks').textContent = formatNumber(totalClicks);
    document.getElementById('avg-ctr').textContent = formatPercentage(avgCTR);
    document.getElementById('avg-cpc').textContent = formatCurrency(avgCPC);
    document.getElementById('total-conversions').textContent = formatNumber(totalConversions);
    document.getElementById('avg-cac').textContent = formatCurrency(avgCAC);
    document.getElementById('avg-roas').textContent = formatNumber(avgROAS, 1) + 'x';
    document.getElementById('avg-cpm').textContent = formatCurrency(avgCPM);
}

// Funzione per inizializzare la tabella delle campagne social
function initSocialCampaignsTable() {
    const tableContainer = document.getElementById('campaigns-table-container');
    if (!tableContainer) {
        console.error('Container della tabella non trovato');
        return;
    }
    
    // Crea la tabella se non esiste
    if (!document.getElementById('campaigns-table')) {
        const tableHTML = `
            <table id="campaigns-table" class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Piattaforma</th>
                        <th>Obiettivo</th>
                        <th>Budget</th>
                        <th>Stato</th>
                        <th>Data Inizio</th>
                        <th>Data Fine</th>
                        <th>Performance</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        tableContainer.innerHTML = tableHTML;
    }
    
    // Inizializza DataTables
    if ($.fn.DataTable.isDataTable('#campaigns-table')) {
        campaignsTable.destroy();
    }
    
    campaignsTable = $('#campaigns-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
        },
        responsive: true,
        order: [[5, 'desc']] // Ordina per data di inizio (discendente)
    });
    
    // Renderizza i dati nella tabella
    renderSocialCampaignsTable();
}

// Funzione per renderizzare i dati nella tabella delle campagne
function renderSocialCampaignsTable(campaigns = socialCampaigns) {
    if (!campaignsTable) {
        console.error('Tabella non inizializzata');
        return;
    }
    
    // Svuota la tabella
    campaignsTable.clear();
    
    // Aggiungi le campagne alla tabella
    campaigns.forEach(campaign => {
        const performance = campaign.performance || {};
        const roas = performance.roas || 0;
        const ctr = performance.ctr || 0;
        
        // Determina la classe di performance in base al ROAS
        let performanceClass = 'text-warning';
        if (roas >= 2) {
            performanceClass = 'text-success';
        } else if (roas < 1) {
            performanceClass = 'text-danger';
        }
        
        // Formatta le date
        const startDate = new Date(campaign.startDate).toLocaleDateString('it-IT');
        const endDate = campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('it-IT') : '-';
        
        // Aggiungi la riga alla tabella
        campaignsTable.row.add([
            campaign.name,
            campaign.platform,
            campaign.objective,
            formatCurrency(campaign.budget),
            `<span class="badge bg-${campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'secondary'}">${campaign.status === 'active' ? 'Attiva' : campaign.status === 'paused' ? 'In pausa' : 'Completata'}</span>`,
            startDate,
            endDate,
            `<div class="${performanceClass}"><strong>ROAS:</strong> ${roas.toFixed(2)}x <br><strong>CTR:</strong> ${ctr.toFixed(2)}%</div>`,
            `<div class="btn-group">
                <button class="btn btn-sm btn-outline-primary edit-campaign" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Modifica"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-success view-campaign" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Visualizza"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-outline-danger delete-campaign" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Elimina"><i class="fas fa-trash"></i></button>
            </div>`
        ]);
    });
    
    // Disegna la tabella
    campaignsTable.draw();
    
    // Inizializza i tooltip
    initTooltips();
    
    // Aggiungi gli event listener per i pulsanti di azione
    addCampaignActionListeners();
}

// Funzione per aggiungere gli event listener ai pulsanti di azione delle campagne
function addCampaignActionListeners() {
    // Event listener per il pulsante di modifica
    document.querySelectorAll('.edit-campaign').forEach(button => {
        button.addEventListener('click', function() {
            const campaignId = this.getAttribute('data-id');
            editCampaign(campaignId);
        });
    });
    
    // Event listener per il pulsante di visualizzazione
    document.querySelectorAll('.view-campaign').forEach(button => {
        button.addEventListener('click', function() {
            const campaignId = this.getAttribute('data-id');
            viewCampaign(campaignId);
        });
    });
    
    // Event listener per il pulsante di eliminazione
    document.querySelectorAll('.delete-campaign').forEach(button => {
        button.addEventListener('click', function() {
            const campaignId = this.getAttribute('data-id');
            if (confirm('Sei sicuro di voler eliminare questa campagna?')) {
                deleteSocialCampaign(campaignId);
            }
        });
    });
}

// Funzione per modificare una campagna
function editCampaign(campaignId) {
    const campaign = getSocialCampaignById(campaignId);
    if (!campaign) {
        showNotification('Campagna non trovata', 'error');
        return;
    }
    
    // Qui andrebbe implementata la logica per aprire il modal di modifica
    // e popolarlo con i dati della campagna
    console.log('Modifica campagna:', campaign);
    showNotification('Funzionalità di modifica in fase di sviluppo', 'info');
}

// Funzione per visualizzare i dettagli di una campagna
function viewCampaign(campaignId) {
    const campaign = getSocialCampaignById(campaignId);
    if (!campaign) {
        showNotification('Campagna non trovata', 'error');
        return;
    }
    
    // Qui andrebbe implementata la logica per aprire il modal di visualizzazione
    // e popolarlo con i dati della campagna
    console.log('Visualizza campagna:', campaign);
    showNotification('Funzionalità di visualizzazione in fase di sviluppo', 'info');
}

// Inizializza la pagina quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza la pagina delle campagne social
    initSocialCampaignsPage();
    
    // Inizializza i tooltip di Bootstrap
    initTooltips();
});

// Funzione per formattare un numero
function formatNumber(num, decimals = 0) {
    return num.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Funzione per formattare una percentuale
function formatPercentage(num) {
    return `${num.toFixed(2)}%`;
}

// Funzione per formattare una valuta
function formatCurrency(num) {
    return `€${num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Funzione per mostrare una notifica
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Funzione per inizializzare i tooltip di Bootstrap
function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}
