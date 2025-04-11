// social_campaigns_comparison.js - Funzionalità di confronto tra campagne social

/**
 * Inizializza la funzionalità di confronto tra campagne
 */
function initCampaignComparison() {
    // Aggiungi event listener per il pulsante di confronto
    document.getElementById('compare-campaigns-btn')?.addEventListener('click', openComparisonModal);
    
    // Aggiungi event listener per il pulsante di confronto nella tabella
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-comparison-btn') || e.target.closest('.add-to-comparison-btn')) {
            const btn = e.target.classList.contains('add-to-comparison-btn') ? e.target : e.target.closest('.add-to-comparison-btn');
            const campaignId = btn.dataset.id;
            addToComparison(campaignId);
        }
    });
}

// Array per tenere traccia delle campagne selezionate per il confronto
let campaignsToCompare = [];

/**
 * Aggiunge una campagna al confronto
 * @param {string} campaignId - ID della campagna da aggiungere al confronto
 */
function addToComparison(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return;
    
    // Controlla se la campagna è già nel confronto
    if (campaignsToCompare.some(c => c.id === campaignId)) {
        showNotification('Questa campagna è già nel confronto', 'warning');
        return;
    }
    
    // Limita il numero di campagne nel confronto
    if (campaignsToCompare.length >= 4) {
        showNotification('Puoi confrontare al massimo 4 campagne alla volta', 'warning');
        return;
    }
    
    // Aggiungi la campagna al confronto
    campaignsToCompare.push(campaign);
    
    // Aggiorna il badge del pulsante di confronto
    updateComparisonBadge();
    
    // Mostra notifica
    showNotification(`"${campaign.name}" aggiunta al confronto`, 'success');
}

/**
 * Rimuove una campagna dal confronto
 * @param {string} campaignId - ID della campagna da rimuovere dal confronto
 */
function removeFromComparison(campaignId) {
    // Rimuovi la campagna dall'array
    campaignsToCompare = campaignsToCompare.filter(c => c.id !== campaignId);
    
    // Aggiorna il badge del pulsante di confronto
    updateComparisonBadge();
    
    // Aggiorna la tabella di confronto se il modal è aperto
    if (document.getElementById('campaignComparisonModal')?.classList.contains('show')) {
        renderComparisonTable();
    }
}

/**
 * Aggiorna il badge del pulsante di confronto
 */
function updateComparisonBadge() {
    const badge = document.getElementById('comparison-badge');
    if (badge) {
        badge.textContent = campaignsToCompare.length;
        badge.style.display = campaignsToCompare.length > 0 ? 'inline-block' : 'none';
    }
    
    // Abilita o disabilita il pulsante di confronto
    const compareBtn = document.getElementById('compare-campaigns-btn');
    if (compareBtn) {
        compareBtn.disabled = campaignsToCompare.length === 0;
    }
}

/**
 * Apre il modal di confronto
 */
function openComparisonModal() {
    // Se non ci sono campagne da confrontare, mostra un messaggio
    if (campaignsToCompare.length === 0) {
        showNotification('Seleziona almeno una campagna da confrontare', 'warning');
        return;
    }
    
    // Crea il modal se non esiste
    let modalElement = document.getElementById('campaignComparisonModal');
    
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = 'campaignComparisonModal';
        modalElement.tabIndex = '-1';
        modalElement.setAttribute('aria-hidden', 'true');
        
        modalElement.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confronto Campagne</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="comparison-container">
                            <div class="row mb-3">
                                <div class="col-12">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Seleziona le campagne da confrontare utilizzando il pulsante <i class="fas fa-balance-scale"></i> nella tabella delle campagne.
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="table-responsive">
                                        <table class="table table-bordered comparison-table">
                                            <thead>
                                                <tr>
                                                    <th>Metrica</th>
                                                    <!-- Le colonne delle campagne verranno aggiunte dinamicamente -->
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- Le righe verranno aggiunte dinamicamente -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-4">
                                <div class="col-12">
                                    <h6>Grafici di confronto</h6>
                                    <div class="comparison-charts">
                                        <div class="row">
                                            <div class="col-md-6 mb-4">
                                                <div class="card">
                                                    <div class="card-header">CTR</div>
                                                    <div class="card-body">
                                                        <canvas id="ctrComparisonChart"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6 mb-4">
                                                <div class="card">
                                                    <div class="card-header">Tasso di conversione</div>
                                                    <div class="card-body">
                                                        <canvas id="conversionRateComparisonChart"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-4">
                                                <div class="card">
                                                    <div class="card-header">CPC</div>
                                                    <div class="card-body">
                                                        <canvas id="cpcComparisonChart"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6 mb-4">
                                                <div class="card">
                                                    <div class="card-header">ROAS</div>
                                                    <div class="card-body">
                                                        <canvas id="roasComparisonChart"></canvas>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="clear-comparison-btn">
                            <i class="fas fa-trash me-1"></i> Svuota confronto
                        </button>
                        <button type="button" class="btn btn-primary" id="export-comparison-btn">
                            <i class="fas fa-file-export me-1"></i> Esporta confronto
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
        
        // Aggiungi event listener per i pulsanti
        document.getElementById('clear-comparison-btn').addEventListener('click', clearComparison);
        document.getElementById('export-comparison-btn').addEventListener('click', exportComparison);
    }
    
    // Mostra il modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Renderizza la tabella di confronto
    renderComparisonTable();
    
    // Renderizza i grafici di confronto
    renderComparisonCharts();
}

/**
 * Renderizza la tabella di confronto
 */
function renderComparisonTable() {
    const tableHead = document.querySelector('.comparison-table thead tr');
    const tableBody = document.querySelector('.comparison-table tbody');
    
    if (!tableHead || !tableBody) return;
    
    // Svuota la tabella
    tableHead.innerHTML = '<th>Metrica</th>';
    tableBody.innerHTML = '';
    
    // Se non ci sono campagne da confrontare, mostra un messaggio
    if (campaignsToCompare.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center">Nessuna campagna selezionata per il confronto</td>
            </tr>
        `;
        return;
    }
    
    // Formatta i numeri per la visualizzazione
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(Math.round(num));
    const formatPercent = (num) => new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num / 100);
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    
    // Aggiungi le colonne delle campagne
    campaignsToCompare.forEach(campaign => {
        const th = document.createElement('th');
        th.innerHTML = `
            ${campaign.name}
            <button class="btn btn-sm btn-link text-danger remove-from-comparison-btn" data-id="${campaign.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        tableHead.appendChild(th);
    });
    
    // Calcola i KPI per ogni campagna
    const campaignKPIs = campaignsToCompare.map(campaign => calculateKPI(campaign));
    
    // Definisci le metriche da visualizzare
    const metrics = [
        { name: 'Piattaforma', getValue: (campaign, kpi, index) => campaign.platform },
        { name: 'Obiettivo', getValue: (campaign, kpi, index) => campaign.objective },
        { name: 'Target', getValue: (campaign, kpi, index) => campaign.target },
        { name: 'Budget', getValue: (campaign, kpi, index) => formatCurrency(campaign.budget) },
        { name: 'Stato', getValue: (campaign, kpi, index) => campaign.status },
        { name: 'Data inizio', getValue: (campaign, kpi, index) => new Date(campaign.startDate).toLocaleDateString('it-IT') },
        { name: 'Data fine', getValue: (campaign, kpi, index) => campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('it-IT') : 'Non specificata' },
        { name: 'Impression', getValue: (campaign, kpi, index) => formatNumber(kpi.impressions) },
        { name: 'Click', getValue: (campaign, kpi, index) => formatNumber(kpi.clicks) },
        { name: 'CTR', getValue: (campaign, kpi, index) => formatPercent(kpi.ctr) },
        { name: 'CPC', getValue: (campaign, kpi, index) => formatCurrency(kpi.cpc) },
        { name: 'CPM', getValue: (campaign, kpi, index) => formatCurrency(kpi.cpm) },
        { name: 'Conversioni', getValue: (campaign, kpi, index) => formatNumber(kpi.conversions) },
        { name: 'Tasso di conversione', getValue: (campaign, kpi, index) => formatPercent(kpi.conversionRate) },
        { name: 'CPA', getValue: (campaign, kpi, index) => formatCurrency(kpi.cpa) },
        { name: 'Entrate', getValue: (campaign, kpi, index) => formatCurrency(kpi.revenue) },
        { name: 'ROAS', getValue: (campaign, kpi, index) => `${kpi.roas.toFixed(2)}x` },
        { name: 'ROI', getValue: (campaign, kpi, index) => formatPercent(kpi.roi) },
        { name: 'Efficacia', getValue: (campaign, kpi, index) => `
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
        ` }
    ];
    
    // Aggiungi le righe delle metriche
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        
        // Aggiungi la cella del nome della metrica
        const metricCell = document.createElement('td');
        metricCell.textContent = metric.name;
        row.appendChild(metricCell);
        
        // Aggiungi le celle dei valori per ogni campagna
        campaignsToCompare.forEach((campaign, index) => {
            const valueCell = document.createElement('td');
            valueCell.innerHTML = metric.getValue(campaign, campaignKPIs[index], index);
            row.appendChild(valueCell);
        });
        
        tableBody.appendChild(row);
    });
    
    // Aggiungi event listener per i pulsanti di rimozione
    document.querySelectorAll('.remove-from-comparison-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const campaignId = this.dataset.id;
            removeFromComparison(campaignId);
        });
    });
}

/**
 * Renderizza i grafici di confronto
 */
function renderComparisonCharts() {
    // Se non ci sono campagne da confrontare, non fare nulla
    if (campaignsToCompare.length === 0) return;
    
    // Calcola i KPI per ogni campagna
    const campaignKPIs = campaignsToCompare.map(campaign => calculateKPI(campaign));
    
    // Prepara i dati per i grafici
    const labels = campaignsToCompare.map(campaign => campaign.name);
    const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'];
    
    // Renderizza il grafico CTR
    renderComparisonChart('ctrComparisonChart', 'CTR', labels, campaignKPIs.map(kpi => kpi.ctr), colors, '%');
    
    // Renderizza il grafico del tasso di conversione
    renderComparisonChart('conversionRateComparisonChart', 'Tasso di conversione', labels, campaignKPIs.map(kpi => kpi.conversionRate), colors, '%');
    
    // Renderizza il grafico CPC
    renderComparisonChart('cpcComparisonChart', 'CPC', labels, campaignKPIs.map(kpi => kpi.cpc), colors, '€');
    
    // Renderizza il grafico ROAS
    renderComparisonChart('roasComparisonChart', 'ROAS', labels, campaignKPIs.map(kpi => kpi.roas), colors, 'x');
}

/**
 * Renderizza un grafico di confronto
 * @param {string} canvasId - ID del canvas
 * @param {string} label - Etichetta del grafico
 * @param {Array} labels - Array di etichette per l'asse X
 * @param {Array} data - Array di dati
 * @param {Array} colors - Array di colori
 * @param {string} suffix - Suffisso per i valori
 */
function renderComparisonChart(canvasId, label, labels, data, colors, suffix = '') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Distruggi il grafico esistente se presente
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Crea il nuovo grafico
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (suffix === '%') {
                                return value.toFixed(2) + suffix;
                            } else if (suffix === '€') {
                                return suffix + value.toFixed(2);
                            } else {
                                return value.toFixed(2) + suffix;
                            }
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (suffix === '%') {
                                label += context.parsed.y.toFixed(2) + suffix;
                            } else if (suffix === '€') {
                                label += suffix + context.parsed.y.toFixed(2);
                            } else {
                                label += context.parsed.y.toFixed(2) + suffix;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Svuota il confronto
 */
function clearComparison() {
    // Svuota l'array delle campagne da confrontare
    campaignsToCompare = [];
    
    // Aggiorna il badge del pulsante di confronto
    updateComparisonBadge();
    
    // Renderizza la tabella di confronto
    renderComparisonTable();
    
    // Mostra notifica
    showNotification('Confronto svuotato', 'info');
}

/**
 * Esporta il confronto in formato CSV
 */
function exportComparison() {
    // Se non ci sono campagne da confrontare, mostra un messaggio
    if (campaignsToCompare.length === 0) {
        showNotification('Nessuna campagna da esportare', 'warning');
        return;
    }
    
    // Calcola i KPI per ogni campagna
    const campaignKPIs = campaignsToCompare.map(campaign => calculateKPI(campaign));
    
    // Crea il contenuto CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Intestazioni
    let headers = ['Metrica'];
    campaignsToCompare.forEach(campaign => {
        headers.push(campaign.name);
    });
    csvContent += headers.join(',') + '\r\n';
    
    // Definisci le metriche da esportare
    const metrics = [
        { name: 'Piattaforma', getValue: (campaign, kpi) => campaign.platform },
        { name: 'Obiettivo', getValue: (campaign, kpi) => campaign.objective },
        { name: 'Target', getValue: (campaign, kpi) => campaign.target },
        { name: 'Budget', getValue: (campaign, kpi) => campaign.budget },
        { name: 'Stato', getValue: (campaign, kpi) => campaign.status },
        { name: 'Data inizio', getValue: (campaign, kpi) => campaign.startDate },
        { name: 'Data fine', getValue: (campaign, kpi) => campaign.endDate || '' },
        { name: 'Impression', getValue: (campaign, kpi) => kpi.impressions },
        { name: 'Click', getValue: (campaign, kpi) => kpi.clicks },
        { name: 'CTR', getValue: (campaign, kpi) => kpi.ctr },
        { name: 'CPC', getValue: (campaign, kpi) => kpi.cpc },
        { name: 'CPM', getValue: (campaign, kpi) => kpi.cpm },
        { name: 'Conversioni', getValue: (campaign, kpi) => kpi.conversions },
        { name: 'Tasso di conversione', getValue: (campaign, kpi) => kpi.conversionRate },
        { name: 'CPA', getValue: (campaign, kpi) => kpi.cpa },
        { name: 'Entrate', getValue: (campaign, kpi) => kpi.revenue },
        { name: 'ROAS', getValue: (campaign, kpi) => kpi.roas },
        { name: 'ROI', getValue: (campaign, kpi) => kpi.roi },
        { name: 'Efficacia', getValue: (campaign, kpi) => kpi.effectiveness }
    ];
    
    // Aggiungi le righe delle metriche
    metrics.forEach(metric => {
        let row = [metric.name];
        
        campaignsToCompare.forEach((campaign, index) => {
            const value = metric.getValue(campaign, campaignKPIs[index]);
            row.push(typeof value === 'string' ? `"${value}"` : value);
        });
        
        csvContent += row.join(',') + '\r\n';
    });
    
    // Crea un link per il download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `confronto_campagne_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Simula il click sul link
    link.click();
    
    // Rimuovi il link
    document.body.removeChild(link);
    
    // Mostra notifica
    showNotification(`Confronto esportato in formato CSV`, 'success');
}

/**
 * Aggiunge il pulsante di confronto alle azioni della tabella
 */
function addComparisonButtonToTable() {
    // Aggiungi il pulsante di confronto alle azioni della tabella
    document.querySelectorAll('.campaign-actions').forEach(actionsCell => {
        const campaignId = actionsCell.dataset.id;
        
        // Aggiungi il pulsante solo se non esiste già
        if (!actionsCell.querySelector('.add-to-comparison-btn')) {
            const compareBtn = document.createElement('button');
            compareBtn.className = 'btn btn-outline-secondary add-to-comparison-btn';
            compareBtn.dataset.id = campaignId;
            compareBtn.dataset.bsToggle = 'tooltip';
            compareBtn.title = 'Aggiungi al confronto';
            compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
            
            actionsCell.appendChild(compareBtn);
        }
    });
    
    // Inizializza i tooltip
    initTooltips();
}

// Inizializza la funzionalità di confronto quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
    initCampaignComparison();
    
    // Aggiungi il badge al pulsante di confronto
    const compareBtn = document.getElementById('compare-campaigns-btn');
    if (compareBtn && !compareBtn.querySelector('.badge')) {
        compareBtn.innerHTML += ' <span id="comparison-badge" class="badge bg-danger rounded-pill" style="display: none;">0</span>';
    }
    
    // Aggiorna il badge
    updateComparisonBadge();
});
