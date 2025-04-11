// social_campaigns_dashboard_kpi.js - Widget KPI per la dashboard delle campagne social

/**
 * Inizializza i widget KPI della dashboard
 * @param {string} containerId - ID del container dove inserire i widget
 * @param {Object} filters - Filtri da applicare ai dati
 */
function initDashboardKPIWidgets(containerId = 'dashboard-kpi-widgets', filters = {}) {
    // Ottieni il container
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Svuota il container
    container.innerHTML = '';
    
    // Crea la struttura per i widget
    container.innerHTML = `
        <div class="row">
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-primary shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Budget Totale</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="total-budget-widget">€0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-euro-sign fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-success shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Entrate Totali</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="total-revenue-widget">€0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-chart-line fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-info shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">ROAS Medio</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="avg-roas-widget">0x</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-balance-scale fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-warning shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Conversioni Totali</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="total-conversions-widget">0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-shopping-cart fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-secondary shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-secondary text-uppercase mb-1">Campagne Attive</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="active-campaigns-widget">0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-bullhorn fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-danger shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-danger text-uppercase mb-1">CPC Medio</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800" id="avg-cpc-widget">€0</div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-mouse-pointer fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-primary shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">CTR Medio</div>
                                <div class="row no-gutters align-items-center">
                                    <div class="col-auto">
                                        <div class="h5 mb-0 mr-3 font-weight-bold text-gray-800" id="avg-ctr-widget">0%</div>
                                    </div>
                                    <div class="col">
                                        <div class="progress progress-sm mr-2">
                                            <div class="progress-bar bg-primary" role="progressbar" id="avg-ctr-progress"
                                                style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-percentage fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-left-success shadow h-100 py-2">
                    <div class="card-body">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Tasso di Conversione</div>
                                <div class="row no-gutters align-items-center">
                                    <div class="col-auto">
                                        <div class="h5 mb-0 mr-3 font-weight-bold text-gray-800" id="avg-conversion-rate-widget">0%</div>
                                    </div>
                                    <div class="col">
                                        <div class="progress progress-sm mr-2">
                                            <div class="progress-bar bg-success" role="progressbar" id="avg-conversion-rate-progress"
                                                style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-auto">
                                <i class="fas fa-percentage fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Aggiorna i widget con i dati filtrati
    updateDashboardKPIWidgets(filters);
}

/**
 * Aggiorna i widget KPI della dashboard con i dati filtrati
 * @param {Object} filters - Filtri da applicare ai dati
 */
function updateDashboardKPIWidgets(filters = {}) {
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = [...socialCampaigns];
    
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
    
    // Calcola i KPI totali
    let totalBudget = 0;
    let totalRevenue = 0;
    let totalConversions = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let activeCampaigns = 0;
    
    filteredCampaigns.forEach(campaign => {
        // Calcola i KPI per la campagna
        const kpi = calculateKPI(campaign);
        
        // Aggiorna i totali
        totalBudget += campaign.budget;
        totalRevenue += kpi.revenue;
        totalConversions += kpi.conversions;
        totalClicks += kpi.clicks;
        totalImpressions += kpi.impressions;
        
        // Conta le campagne attive
        if (campaign.status === 'Attiva') {
            activeCampaigns++;
        }
    });
    
    // Calcola le medie
    const avgRoas = totalBudget > 0 ? totalRevenue / totalBudget : 0;
    const avgCpc = totalClicks > 0 ? totalBudget / totalClicks : 0;
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    // Formatta i numeri per la visualizzazione
    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(Math.round(num));
    const formatCurrency = (num) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
    const formatPercent = (num) => num.toFixed(2) + '%';
    
    // Aggiorna i widget
    document.getElementById('total-budget-widget').textContent = formatCurrency(totalBudget);
    document.getElementById('total-revenue-widget').textContent = formatCurrency(totalRevenue);
    document.getElementById('avg-roas-widget').textContent = avgRoas.toFixed(2) + 'x';
    document.getElementById('total-conversions-widget').textContent = formatNumber(totalConversions);
    document.getElementById('active-campaigns-widget').textContent = activeCampaigns;
    document.getElementById('avg-cpc-widget').textContent = formatCurrency(avgCpc);
    document.getElementById('avg-ctr-widget').textContent = formatPercent(avgCtr);
    document.getElementById('avg-conversion-rate-widget').textContent = formatPercent(avgConversionRate);
    
    // Aggiorna le barre di progresso
    const ctrProgress = document.getElementById('avg-ctr-progress');
    if (ctrProgress) {
        const ctrProgressWidth = Math.min(avgCtr * 5, 100); // Scala il CTR per la visualizzazione (max 20%)
        ctrProgress.style.width = ctrProgressWidth + '%';
        ctrProgress.setAttribute('aria-valuenow', ctrProgressWidth);
    }
    
    const conversionRateProgress = document.getElementById('avg-conversion-rate-progress');
    if (conversionRateProgress) {
        const conversionRateProgressWidth = Math.min(avgConversionRate * 10, 100); // Scala il tasso di conversione (max 10%)
        conversionRateProgress.style.width = conversionRateProgressWidth + '%';
        conversionRateProgress.setAttribute('aria-valuenow', conversionRateProgressWidth);
    }
}

// Esporta le funzioni
window.initDashboardKPIWidgets = initDashboardKPIWidgets;
window.updateDashboardKPIWidgets = updateDashboardKPIWidgets;
