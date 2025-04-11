// social_campaigns_table.js - Gestione della tabella delle campagne social

// Variabile globale per la tabella DataTable
let socialCampaignsTable;

/**
 * Inizializza la tabella delle campagne social
 */
function initSocialCampaignsTable() {
    const tableElement = document.getElementById('social-campaigns-table');
    
    if (!tableElement) {
        console.error('Elemento tabella non trovato');
        return;
    }
    
    // Inizializza DataTable con opzioni personalizzate
    socialCampaignsTable = $(tableElement).DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
        },
        responsive: true,
        order: [[4, 'desc']], // Ordina per data di inizio (discendente)
        columns: [
            { data: 'name' },
            { data: 'platform' },
            { data: 'objective' },
            { data: 'budget', render: function(data) { return formatCurrency(data); } },
            { data: 'startDate', render: function(data) { return formatDate(data); } },
            { data: 'endDate', render: function(data) { return formatDate(data); } },
            { data: 'status', render: function(data) { return renderStatus(data); } },
            { data: null, orderable: false, render: function(data) { return renderActions(data); } }
        ],
        initComplete: function() {
            // Aggiunge tooltip ai pulsanti di azione
            initTooltips();
        }
    });
    
    // Carica i dati iniziali
    renderSocialCampaignsTable();
}

/**
 * Renderizza la tabella delle campagne social
 */
function renderSocialCampaignsTable(campaigns = null) {
    if (!socialCampaignsTable) {
        console.error('Tabella non inizializzata');
        return;
    }
    
    // Se non vengono fornite campagne specifiche, usa tutte le campagne
    const campaignsToRender = campaigns || socialCampaigns;
    
    // Pulisci la tabella e aggiungi i dati
    socialCampaignsTable.clear();
    socialCampaignsTable.rows.add(campaignsToRender);
    socialCampaignsTable.draw();
    
    // Aggiorna i contatori e le metriche
    updateCampaignCounters();
    updatePerformanceMetrics();
}

/**
 * Aggiorna i contatori delle campagne
 */
function updateCampaignCounters() {
    // Calcola il numero di campagne attive
    const activeCampaigns = socialCampaigns.filter(c => c.status === 'active').length;
    
    // Calcola il budget totale
    const totalBudget = socialCampaigns.reduce((sum, campaign) => sum + parseFloat(campaign.budget), 0);
    
    // Aggiorna i contatori nell'interfaccia utente
    const activeCampaignsElement = document.getElementById('active-campaigns');
    const totalBudgetElement = document.getElementById('total-budget');
    
    if (activeCampaignsElement) {
        activeCampaignsElement.textContent = activeCampaigns;
    }
    
    if (totalBudgetElement) {
        totalBudgetElement.textContent = formatCurrency(totalBudget);
    }
}

/**
 * Formatta lo stato della campagna
 */
function renderStatus(status) {
    const statusMap = {
        'active': { label: 'Attiva', class: 'success' },
        'paused': { label: 'In pausa', class: 'warning' },
        'completed': { label: 'Completata', class: 'info' },
        'scheduled': { label: 'Pianificata', class: 'primary' },
        'cancelled': { label: 'Cancellata', class: 'danger' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'secondary' };
    
    return `<span class="badge bg-${statusInfo.class}">${statusInfo.label}</span>`;
}

/**
 * Renderizza le azioni disponibili per ogni campagna
 */
function renderActions(campaign) {
    return `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-info view-campaign" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Visualizza dettagli">
                <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-primary edit-campaign" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Modifica campagna">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-danger delete-campaign" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Elimina campagna">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

/**
 * Formatta una data
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Mostra i dettagli di una campagna
 */
function showCampaignDetails(campaignId) {
    const campaign = getSocialCampaignById(campaignId);
    
    if (!campaign) {
        showNotification('Campagna non trovata', 'error');
        return;
    }
    
    // Popola il contenitore dei dettagli
    const detailsContainer = document.getElementById('campaign-details-container');
    
    if (!detailsContainer) {
        console.error('Contenitore dettagli non trovato');
        return;
    }
    
    // Formatta le date
    const startDate = formatDate(campaign.startDate);
    const endDate = formatDate(campaign.endDate);
    const createdAt = formatDate(campaign.createdAt);
    
    // Crea il contenuto HTML per i dettagli
    detailsContainer.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h4>${campaign.name}</h4>
                <p><strong>Piattaforma:</strong> ${campaign.platform}</p>
                <p><strong>Obiettivo:</strong> ${campaign.objective}</p>
                <p><strong>Budget:</strong> ${formatCurrency(campaign.budget)}</p>
                <p><strong>Stato:</strong> ${renderStatus(campaign.status)}</p>
                <p><strong>Data Inizio:</strong> ${startDate}</p>
                <p><strong>Data Fine:</strong> ${endDate}</p>
                <p><strong>Target Audience:</strong> ${campaign.targetAudience || '-'}</p>
                <p><strong>Creata il:</strong> ${createdAt}</p>
            </div>
            <div class="col-md-6">
                <h5>Descrizione</h5>
                <p>${campaign.description || 'Nessuna descrizione disponibile.'}</p>
                
                <h5 class="mt-4">Performance</h5>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Impressions:</strong> ${formatNumber(campaign.performance?.impressions || 0)}</p>
                        <p><strong>Clicks:</strong> ${formatNumber(campaign.performance?.clicks || 0)}</p>
                        <p><strong>CTR:</strong> ${formatPercentage(campaign.performance?.ctr || 0)}</p>
                        <p><strong>CPC:</strong> ${formatCurrency(campaign.performance?.cpc || 0)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Conversions:</strong> ${formatNumber(campaign.performance?.conversions || 0)}</p>
                        <p><strong>CAC:</strong> ${formatCurrency(campaign.performance?.cpa || 0)}</p>
                        <p><strong>Revenue:</strong> ${formatCurrency(campaign.performance?.revenue || 0)}</p>
                        <p><strong>ROAS:</strong> ${formatNumber(campaign.performance?.roas || 0, 1)}x</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Mostra il modal
    const modal = new bootstrap.Modal(document.getElementById('campaignDetailsModal'));
    modal.show();
}

// Aggiungi event listeners per le azioni della tabella
document.addEventListener('DOMContentLoaded', function() {
    // Delega degli eventi per i pulsanti di azione
    document.addEventListener('click', function(event) {
        // Gestisci il pulsante di visualizzazione
        if (event.target.closest('.view-campaign')) {
            const button = event.target.closest('.view-campaign');
            const campaignId = button.getAttribute('data-id');
            showCampaignDetails(campaignId);
        }
        
        // Gestisci il pulsante di modifica
        if (event.target.closest('.edit-campaign')) {
            const button = event.target.closest('.edit-campaign');
            const campaignId = button.getAttribute('data-id');
            // Implementare la logica di modifica
            showNotification('Funzionalità di modifica in arrivo!', 'info');
        }
        
        // Gestisci il pulsante di eliminazione
        if (event.target.closest('.delete-campaign')) {
            const button = event.target.closest('.delete-campaign');
            const campaignId = button.getAttribute('data-id');
            
            // Chiedi conferma prima di eliminare
            if (confirm('Sei sicuro di voler eliminare questa campagna?')) {
                deleteSocialCampaign(campaignId);
                showNotification('Campagna eliminata con successo', 'success');
            }
        }
    });
});

/**
 * Carica le campagne social dal localStorage
 */
function loadSocialCampaigns() {
    const savedCampaigns = localStorage.getItem('social_campaigns');
    if (savedCampaigns) {
        socialCampaigns = JSON.parse(savedCampaigns);
    } else {
        // Se non ci sono campagne salvate, inizializza l'array vuoto
        socialCampaigns = [];
    }
}

/**
 * Salva le campagne social nel localStorage
 */
function saveSocialCampaigns() {
    localStorage.setItem('social_campaigns', JSON.stringify(socialCampaigns));
}

/**
 * Aggiunge una nuova campagna social
 * @param {Object} campaign - Oggetto campagna da aggiungere
 */
function addSocialCampaign(campaign) {
    // Assicurati che l'ID sia una stringa
    if (campaign.id && typeof campaign.id !== 'string') {
        campaign.id = campaign.id.toString();
    }
    
    // Se non c'è un ID, generane uno
    if (!campaign.id) {
        campaign.id = Date.now().toString();
    }
    
    // Aggiungi la campagna all'array
    socialCampaigns.push(campaign);
    
    // Salva le campagne
    saveSocialCampaigns();
    
    // Aggiorna la tabella
    renderSocialCampaignsTable();
}

/**
 * Aggiorna una campagna social esistente
 * @param {string} id - ID della campagna da aggiornare
 * @param {Object} updatedData - Dati aggiornati
 */
function updateSocialCampaign(id, updatedData) {
    // Trova l'indice della campagna
    const index = socialCampaigns.findIndex(c => c.id === id);
    
    // Se la campagna esiste, aggiornala
    if (index !== -1) {
        // Mantieni l'ID originale
        updatedData.id = id;
        
        // Aggiorna la campagna
        socialCampaigns[index] = updatedData;
        
        // Salva le campagne
        saveSocialCampaigns();
        
        // Aggiorna la tabella
        renderSocialCampaignsTable();
        
        return true;
    }
    
    return false;
}

/**
 * Elimina una campagna social
 * @param {string} id - ID della campagna da eliminare
 */
function deleteSocialCampaign(id) {
    // Trova l'indice della campagna
    const index = socialCampaigns.findIndex(c => c.id === id);
    
    // Se la campagna esiste, eliminala
    if (index !== -1) {
        socialCampaigns.splice(index, 1);
        
        // Salva le campagne
        saveSocialCampaigns();
        
        // Aggiorna la tabella
        renderSocialCampaignsTable();
        
        return true;
    }
    
    return false;
}

/**
 * Mostra i dettagli di una campagna
 * @param {string} campaignId - ID della campagna
 */
function showCampaignDetails(campaignId) {
    // Trova la campagna
    const campaign = socialCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Calcola i KPI
    const kpi = calculateKPI(campaign);
    
    // Crea il contenuto del modal
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">Dettagli Campagna: ${campaign.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Informazioni Campagna</h6>
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <th>Piattaforma:</th>
                                <td>${campaign.platform}</td>
                            </tr>
                            <tr>
                                <th>Obiettivo:</th>
                                <td>${campaign.objective}</td>
                            </tr>
                            <tr>
                                <th>Budget:</th>
                                <td>${formatCurrency(campaign.budget)}</td>
                            </tr>
                            <tr>
                                <th>Data Inizio:</th>
                                <td>${formatDate(campaign.startDate)}</td>
                            </tr>
                            <tr>
                                <th>Data Fine:</th>
                                <td>${formatDate(campaign.endDate)}</td>
                            </tr>
                            <tr>
                                <th>Stato:</th>
                                <td><span class="badge ${campaign.status === 'active' ? 'status-active' : campaign.status === 'paused' ? 'status-paused' : campaign.status === 'completed' ? 'status-completed' : 'status-scheduled'}">${campaign.status === 'active' ? 'Attiva' : campaign.status === 'paused' ? 'In pausa' : campaign.status === 'completed' ? 'Completata' : 'Programmata'}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>KPI</h6>
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <th>Impressioni:</th>
                                <td>${formatNumber(kpi.impressions)}</td>
                            </tr>
                            <tr>
                                <th>Click:</th>
                                <td>${formatNumber(kpi.clicks)}</td>
                            </tr>
                            <tr>
                                <th>CTR:</th>
                                <td>${formatPercent(kpi.ctr)}</td>
                            </tr>
                            <tr>
                                <th>CPC:</th>
                                <td>${formatCurrency(kpi.cpc)}</td>
                            </tr>
                            <tr>
                                <th>Conversioni:</th>
                                <td>${formatNumber(kpi.conversions)}</td>
                            </tr>
                            <tr>
                                <th>Tasso di Conversione:</th>
                                <td>${formatPercent(kpi.conversionRate)}</td>
                            </tr>
                            <tr>
                                <th>CAC:</th>
                                <td>${formatCurrency(kpi.cac)}</td>
                            </tr>
                            <tr>
                                <th>Entrate:</th>
                                <td>${formatCurrency(kpi.revenue)}</td>
                            </tr>
                            <tr>
                                <th>ROAS:</th>
                                <td>${kpi.roas.toFixed(2)}x</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-12">
                    <h6>Efficacia</h6>
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
                </div>
            </div>
            
            ${campaign.description ? `
            <div class="row mt-3">
                <div class="col-12">
                    <h6>Descrizione</h6>
                    <p>${campaign.description}</p>
                </div>
            </div>
            ` : ''}
            
            ${campaign.targetAudience ? `
            <div class="row mt-3">
                <div class="col-12">
                    <h6>Target Audience</h6>
                    <p>${campaign.targetAudience}</p>
                </div>
            </div>
            ` : ''}
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
            <button type="button" class="btn btn-primary edit-campaign-btn" data-id="${campaign.id}" data-bs-dismiss="modal">
                <i class="fas fa-edit me-1"></i> Modifica
            </button>
        </div>
    `;
    
    // Crea il modal
    const modalElement = document.getElementById('campaignDetailsModal');
    if (!modalElement) {
        // Se il modal non esiste, crealo
        const modal = document.createElement('div');
        modal.id = 'campaignDetailsModal';
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    ${modalContent}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Mostra il modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } else {
        // Se il modal esiste, aggiorna il contenuto
        modalElement.querySelector('.modal-content').innerHTML = modalContent;
        
        // Mostra il modal
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();
    }
}

/**
 * Apre il modal per modificare una campagna
 * @param {string} campaignId - ID della campagna da modificare
 */
function openCampaignModal(campaignId = null) {
    // Implementazione da completare
    alert('Funzionalità di modifica in fase di sviluppo');
}

/**
 * Mostra una finestra di conferma per eliminare una campagna
 * @param {string} campaignId - ID della campagna da eliminare
 */
function confirmDeleteCampaign(campaignId) {
    if (confirm('Sei sicuro di voler eliminare questa campagna?')) {
        deleteSocialCampaign(campaignId);
        showNotification('Campagna eliminata con successo', 'success');
    }
}

/**
 * Calcola i KPI di una campagna
 * @param {Object} campaign - Oggetto campagna
 * @returns {Object} - Oggetto con i KPI calcolati
 */
function calculateKPI(campaign) {
    // Se ci sono dati effettivi, usali
    if (campaign.actualData && (campaign.actualData.impressions > 0 || campaign.actualData.clicks > 0 || campaign.actualData.conversions > 0)) {
        const data = campaign.actualData;
        const spend = data.spend || campaign.budget;
        
        return {
            impressions: data.impressions || 0,
            clicks: data.clicks || 0,
            conversions: data.conversions || 0,
            ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
            cpc: data.clicks > 0 ? spend / data.clicks : 0,
            conversionRate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0,
            cac: data.conversions > 0 ? spend / data.conversions : 0,
            revenue: data.revenue || 0,
            roas: spend > 0 ? (data.revenue || 0) / spend : 0,
            effectiveness: calculateEffectiveness(data.revenue || 0, spend)
        };
    }
    
    // Altrimenti, usa i dati di benchmark per la piattaforma
    const benchmark = platformBenchmarks[campaign.platform] || platformBenchmarks['Facebook'];
    const budget = parseFloat(campaign.budget) || 1000;
    
    // Aggiungi un po' di variabilità casuale (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    
    // Calcola le impression stimate (CPM = costo per 1000 impression)
    const impressions = Math.round((budget / benchmark.cpm) * 1000 * randomFactor);
    
    // Calcola i click stimati (CTR = click-through rate)
    const clicks = Math.round(impressions * (benchmark.ctr / 100) * randomFactor);
    
    // Calcola le conversioni stimate
    const conversions = Math.round(clicks * (benchmark.conversionRate / 100) * randomFactor);
    
    // Calcola il costo per acquisizione
    const cac = conversions > 0 ? budget / conversions : 0;
    
    // Calcola le entrate stimate (basate sul ROAS)
    const revenue = budget * benchmark.roas * randomFactor;
    
    // Calcola l'efficacia stimata (scala 1-10)
    const effectiveness = Math.min(10, Math.round((benchmark.roas * randomFactor) * 2));
    
    return {
        impressions,
        clicks,
        conversions,
        ctr: clicks > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? budget / clicks : 0,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        cac,
        revenue,
        roas: budget > 0 ? revenue / budget : 0,
        effectiveness
    };
}

/**
 * Calcola l'efficacia di una campagna in base al ROAS
 * @param {number} revenue - Entrate generate
 * @param {number} spend - Budget speso
 * @returns {number} - Valore di efficacia (1-10)
 */
function calculateEffectiveness(revenue, spend) {
    if (!spend || spend <= 0) return 5;
    
    // Calcola il ROAS
    const roas = revenue / spend;
    
    // Scala da 1 a 10
    if (roas >= 5) return 10;
    if (roas >= 4) return 9;
    if (roas >= 3) return 8;
    if (roas >= 2.5) return 7;
    if (roas >= 2) return 6;
    if (roas >= 1.5) return 5;
    if (roas >= 1) return 4;
    if (roas >= 0.7) return 3;
    if (roas >= 0.4) return 2;
    return 1;
}

// Esporta le funzioni
window.initSocialCampaignsTable = initSocialCampaignsTable;
window.renderSocialCampaignsTable = renderSocialCampaignsTable;
window.updateSocialCampaignsTable = renderSocialCampaignsTable;
window.loadSocialCampaigns = loadSocialCampaigns;
window.saveSocialCampaigns = saveSocialCampaigns;
window.addSocialCampaign = addSocialCampaign;
window.updateSocialCampaign = updateSocialCampaign;
window.deleteSocialCampaign = deleteSocialCampaign;
window.showCampaignDetails = showCampaignDetails;
window.openCampaignModal = openCampaignModal;
window.confirmDeleteCampaign = confirmDeleteCampaign;
