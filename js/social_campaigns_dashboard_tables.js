// social_campaigns_dashboard_tables.js - Tabelle di riepilogo per la dashboard delle campagne social

/**
 * Inizializza le tabelle di riepilogo della dashboard
 * @param {string} containerId - ID del container dove inserire le tabelle
 * @param {Object} filters - Filtri da applicare ai dati
 */
function initDashboardTables(containerId = 'dashboard-tables-container', filters = {}) {
    // Ottieni il container
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Svuota il container
    container.innerHTML = '';
    
    // Crea la struttura per le tabelle
    container.innerHTML = `
        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Campagne più performanti</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="topCampaignsTable" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Piattaforma</th>
                                        <th>ROAS</th>
                                        <th>Efficacia</th>
                                        <th>Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- I dati verranno aggiunti dinamicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Metriche per piattaforma</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="platformMetricsTable" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Piattaforma</th>
                                        <th>CTR</th>
                                        <th>CPC</th>
                                        <th>Conv. Rate</th>
                                        <th>ROAS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- I dati verranno aggiunti dinamicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-12 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">Metriche per obiettivo</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="objectiveMetricsTable" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Obiettivo</th>
                                        <th>Campagne</th>
                                        <th>Budget Totale</th>
                                        <th>Entrate Totali</th>
                                        <th>Conversioni</th>
                                        <th>ROAS</th>
                                        <th>Efficacia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- I dati verranno aggiunti dinamicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizza le tabelle con i dati filtrati
    renderTopCampaignsTable(filters);
    renderPlatformMetricsTable(filters);
    renderObjectiveMetricsTable(filters);
}

/**
 * Renderizza la tabella delle campagne più performanti
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderTopCampaignsTable(filters = {}) {
    const tableBody = document.querySelector('#topCampaignsTable tbody');
    if (!tableBody) return;
    
    // Svuota la tabella
    tableBody.innerHTML = '';
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nessuna campagna disponibile</td>
            </tr>
        `;
        return;
    }
    
    // Calcola i KPI per ogni campagna
    const campaignsWithKPI = filteredCampaigns.map(campaign => {
        const kpi = calculateKPI(campaign);
        return { ...campaign, kpi };
    });
    
    // Ordina le campagne per ROAS (decrescente)
    campaignsWithKPI.sort((a, b) => b.kpi.roas - a.kpi.roas);
    
    // Prendi le prime 5 campagne
    const topCampaigns = campaignsWithKPI.slice(0, 5);
    
    // Formatta i numeri per la visualizzazione
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    
    // Popola la tabella
    topCampaigns.forEach(campaign => {
        const row = document.createElement('tr');
        
        // Determina la classe per l'efficacia
        const effectivenessClass = getEffectivenessClass(campaign.kpi.effectiveness);
        
        row.innerHTML = `
            <td>${campaign.name}</td>
            <td>${campaign.platform}</td>
            <td>${campaign.kpi.roas.toFixed(2)}x</td>
            <td>
                <div class="progress">
                    <div class="progress-bar ${effectivenessClass}" 
                         role="progressbar" 
                         style="width: ${campaign.kpi.effectiveness * 10}%" 
                         aria-valuenow="${campaign.kpi.effectiveness}" 
                         aria-valuemin="0" 
                         aria-valuemax="10">
                        ${campaign.kpi.effectiveness}/10
                    </div>
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info details-campaign-btn" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Dettagli">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn btn-outline-primary edit-campaign-btn" data-id="${campaign.id}" data-bs-toggle="tooltip" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Inizializza i tooltip
    initTooltips();
}

/**
 * Renderizza la tabella delle metriche per piattaforma
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderPlatformMetricsTable(filters = {}) {
    const tableBody = document.querySelector('#platformMetricsTable tbody');
    if (!tableBody) return;
    
    // Svuota la tabella
    tableBody.innerHTML = '';
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nessuna campagna disponibile</td>
            </tr>
        `;
        return;
    }
    
    // Raggruppa le campagne per piattaforma
    const platformGroups = {};
    
    filteredCampaigns.forEach(campaign => {
        if (!platformGroups[campaign.platform]) {
            platformGroups[campaign.platform] = {
                campaigns: [],
                totalBudget: 0,
                totalImpressions: 0,
                totalClicks: 0,
                totalConversions: 0,
                totalRevenue: 0
            };
        }
        
        // Calcola i KPI per la campagna
        const kpi = calculateKPI(campaign);
        
        // Aggiungi la campagna al gruppo
        platformGroups[campaign.platform].campaigns.push({ ...campaign, kpi });
        
        // Aggiorna i totali
        platformGroups[campaign.platform].totalBudget += campaign.budget;
        platformGroups[campaign.platform].totalImpressions += kpi.impressions;
        platformGroups[campaign.platform].totalClicks += kpi.clicks;
        platformGroups[campaign.platform].totalConversions += kpi.conversions;
        platformGroups[campaign.platform].totalRevenue += kpi.revenue;
    });
    
    // Calcola le metriche per ogni piattaforma
    const platformMetrics = [];
    
    Object.keys(platformGroups).forEach(platform => {
        const group = platformGroups[platform];
        
        // Calcola le metriche
        const ctr = group.totalImpressions > 0 ? (group.totalClicks / group.totalImpressions) * 100 : 0;
        const cpc = group.totalClicks > 0 ? group.totalBudget / group.totalClicks : 0;
        const conversionRate = group.totalClicks > 0 ? (group.totalConversions / group.totalClicks) * 100 : 0;
        const roas = group.totalBudget > 0 ? group.totalRevenue / group.totalBudget : 0;
        
        platformMetrics.push({
            platform,
            ctr,
            cpc,
            conversionRate,
            roas
        });
    });
    
    // Ordina le piattaforme per ROAS (decrescente)
    platformMetrics.sort((a, b) => b.roas - a.roas);
    
    // Formatta i numeri per la visualizzazione
    const formatPercent = (num) => num.toFixed(2) + '%';
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    
    // Popola la tabella
    platformMetrics.forEach(metric => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${metric.platform}</td>
            <td>${formatPercent(metric.ctr)}</td>
            <td>${formatCurrency(metric.cpc)}</td>
            <td>${formatPercent(metric.conversionRate)}</td>
            <td>${metric.roas.toFixed(2)}x</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Renderizza la tabella delle metriche per obiettivo
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderObjectiveMetricsTable(filters = {}) {
    const tableBody = document.querySelector('#objectiveMetricsTable tbody');
    if (!tableBody) return;
    
    // Svuota la tabella
    tableBody.innerHTML = '';
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Nessuna campagna disponibile</td>
            </tr>
        `;
        return;
    }
    
    // Raggruppa le campagne per obiettivo
    const objectiveGroups = {};
    
    filteredCampaigns.forEach(campaign => {
        if (!objectiveGroups[campaign.objective]) {
            objectiveGroups[campaign.objective] = {
                campaigns: [],
                totalBudget: 0,
                totalConversions: 0,
                totalRevenue: 0,
                totalEffectiveness: 0
            };
        }
        
        // Calcola i KPI per la campagna
        const kpi = calculateKPI(campaign);
        
        // Aggiungi la campagna al gruppo
        objectiveGroups[campaign.objective].campaigns.push({ ...campaign, kpi });
        
        // Aggiorna i totali
        objectiveGroups[campaign.objective].totalBudget += campaign.budget;
        objectiveGroups[campaign.objective].totalConversions += kpi.conversions;
        objectiveGroups[campaign.objective].totalRevenue += kpi.revenue;
        objectiveGroups[campaign.objective].totalEffectiveness += kpi.effectiveness;
    });
    
    // Calcola le metriche per ogni obiettivo
    const objectiveMetrics = [];
    
    Object.keys(objectiveGroups).forEach(objective => {
        const group = objectiveGroups[objective];
        
        // Calcola le metriche
        const campaignCount = group.campaigns.length;
        const roas = group.totalBudget > 0 ? group.totalRevenue / group.totalBudget : 0;
        const avgEffectiveness = campaignCount > 0 ? group.totalEffectiveness / campaignCount : 0;
        
        objectiveMetrics.push({
            objective,
            campaignCount,
            totalBudget: group.totalBudget,
            totalRevenue: group.totalRevenue,
            totalConversions: group.totalConversions,
            roas,
            avgEffectiveness
        });
    });
    
    // Ordina gli obiettivi per ROAS (decrescente)
    objectiveMetrics.sort((a, b) => b.roas - a.roas);
    
    // Formatta i numeri per la visualizzazione
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(Math.round(num));
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    
    // Popola la tabella
    objectiveMetrics.forEach(metric => {
        const row = document.createElement('tr');
        
        // Determina la classe per l'efficacia
        const effectivenessClass = getEffectivenessClass(metric.avgEffectiveness);
        
        row.innerHTML = `
            <td>${metric.objective}</td>
            <td>${metric.campaignCount}</td>
            <td>${formatCurrency(metric.totalBudget)}</td>
            <td>${formatCurrency(metric.totalRevenue)}</td>
            <td>${formatNumber(metric.totalConversions)}</td>
            <td>${metric.roas.toFixed(2)}x</td>
            <td>
                <div class="progress">
                    <div class="progress-bar ${effectivenessClass}" 
                         role="progressbar" 
                         style="width: ${metric.avgEffectiveness * 10}%" 
                         aria-valuenow="${metric.avgEffectiveness}" 
                         aria-valuemin="0" 
                         aria-valuemax="10">
                        ${metric.avgEffectiveness.toFixed(1)}/10
                    </div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Filtra le campagne in base ai filtri
 * @param {Array} campaigns - Array di campagne
 * @param {Object} filters - Filtri da applicare
 * @returns {Array} - Array di campagne filtrate
 */
function filterCampaigns(campaigns, filters = {}) {
    let filteredCampaigns = [...campaigns];
    
    // Applica i filtri
    if (filters.platform) {
        filteredCampaigns = filteredCampaigns.filter(c => c.platform === filters.platform);
    }
    
    if (filters.status) {
        filteredCampaigns = filteredCampaigns.filter(c => c.status === filters.status);
    }
    
    if (filters.objective) {
        filteredCampaigns = filteredCampaigns.filter(c => c.objective === filters.objective);
    }
    
    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredCampaigns = filteredCampaigns.filter(c => new Date(c.startDate) >= fromDate);
    }
    
    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredCampaigns = filteredCampaigns.filter(c => {
            if (!c.endDate) return new Date(c.startDate) <= toDate;
            return new Date(c.endDate) <= toDate;
        });
    }
    
    return filteredCampaigns;
}

/**
 * Inizializza i tooltip di Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Esporta le funzioni
window.initDashboardTables = initDashboardTables;
window.renderTopCampaignsTable = renderTopCampaignsTable;
window.renderPlatformMetricsTable = renderPlatformMetricsTable;
window.renderObjectiveMetricsTable = renderObjectiveMetricsTable;
