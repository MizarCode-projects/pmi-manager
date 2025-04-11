// social_campaigns_dashboard_charts.js - Grafici di riepilogo per la dashboard delle campagne social

/**
 * Inizializza i grafici di riepilogo della dashboard
 * @param {string} containerId - ID del container dove inserire i grafici
 * @param {Object} filters - Filtri da applicare ai dati
 */
function initDashboardCharts(containerId = 'dashboard-charts-container', filters = {}) {
    // Ottieni il container
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Svuota il container
    container.innerHTML = '';
    
    // Crea la struttura per i grafici
    container.innerHTML = `
        <div class="row">
            <div class="col-xl-4 col-lg-5">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Distribuzione per Piattaforma</h6>
                    </div>
                    <div class="card-body">
                        <div class="chart-pie pt-4 pb-2">
                            <canvas id="platformDistributionChart"></canvas>
                        </div>
                        <div class="mt-4 text-center small" id="platform-distribution-legend">
                            <!-- Legend will be added dynamically -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-8 col-lg-7">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Trend delle Performance</h6>
                    </div>
                    <div class="card-body">
                        <div class="chart-area">
                            <canvas id="performanceTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Distribuzione del Budget</h6>
                    </div>
                    <div class="card-body">
                        <div class="chart-bar">
                            <canvas id="budgetDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-6 col-lg-6">
                <div class="card shadow mb-4">
                    <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                        <h6 class="m-0 font-weight-bold text-primary">Efficacia per Obiettivo</h6>
                    </div>
                    <div class="card-body">
                        <div class="chart-bar">
                            <canvas id="objectiveEffectivenessChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizza i grafici con i dati filtrati
    renderPlatformDistributionChart(filters);
    renderPerformanceTrendChart(filters);
    renderBudgetDistributionChart(filters);
    renderObjectiveEffectivenessChart(filters);
}

/**
 * Renderizza il grafico della distribuzione per piattaforma
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderPlatformDistributionChart(filters = {}) {
    const canvas = document.getElementById('platformDistributionChart');
    if (!canvas) return;
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nessuna campagna disponibile', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Raggruppa le campagne per piattaforma
    const platformGroups = {};
    filteredCampaigns.forEach(campaign => {
        if (!platformGroups[campaign.platform]) {
            platformGroups[campaign.platform] = [];
        }
        platformGroups[campaign.platform].push(campaign);
    });
    
    // Prepara i dati per il grafico
    const labels = Object.keys(platformGroups);
    const data = labels.map(platform => platformGroups[platform].length);
    
    // Colori per le piattaforme
    const platformColors = {
        'Facebook': '#4267B2',
        'Instagram': '#C13584',
        'LinkedIn': '#0077B5',
        'Twitter': '#1DA1F2',
        'Google Ads': '#DB4437',
        'YouTube': '#FF0000',
        'TikTok': '#000000'
    };
    
    // Prepara i colori per il grafico
    const backgroundColors = labels.map(platform => platformColors[platform] || getRandomColor());
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    
    // Distruggi il grafico esistente se presente
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: backgroundColors,
                hoverBorderColor: 'rgba(234, 236, 244, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Aggiorna la legenda
    updatePlatformDistributionLegend(labels, backgroundColors, data);
}

/**
 * Aggiorna la legenda del grafico della distribuzione per piattaforma
 * @param {Array} labels - Etichette delle piattaforme
 * @param {Array} colors - Colori delle piattaforme
 * @param {Array} data - Dati delle piattaforme
 */
function updatePlatformDistributionLegend(labels, colors, data) {
    const legendContainer = document.getElementById('platform-distribution-legend');
    if (!legendContainer) return;
    
    // Svuota il container
    legendContainer.innerHTML = '';
    
    // Calcola il totale
    const total = data.reduce((acc, val) => acc + val, 0);
    
    // Crea la legenda
    labels.forEach((label, index) => {
        const percentage = Math.round((data[index] / total) * 100);
        const legendItem = document.createElement('span');
        legendItem.className = 'mr-2';
        legendItem.innerHTML = `
            <i class="fas fa-circle" style="color: ${colors[index]}"></i> ${label} (${percentage}%)
        `;
        legendContainer.appendChild(legendItem);
    });
}

/**
 * Renderizza il grafico del trend delle performance
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderPerformanceTrendChart(filters = {}) {
    const canvas = document.getElementById('performanceTrendChart');
    if (!canvas) return;
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nessuna campagna disponibile', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Ordina le campagne per data di inizio
    filteredCampaigns.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    // Prepara i dati per il grafico
    const dateRange = getDateRange(filteredCampaigns);
    
    // Inizializza gli array per i dati giornalieri
    const impressionsData = initializeDailyData(dateRange);
    const clicksData = initializeDailyData(dateRange);
    const conversionsData = initializeDailyData(dateRange);
    const revenueData = initializeDailyData(dateRange);
    
    // Popola i dati giornalieri
    filteredCampaigns.forEach(campaign => {
        const kpi = calculateKPI(campaign);
        
        // Aggiungi i dati delle impression
        if (kpi.impressionsPerDay && kpi.impressionsPerDay.length > 0) {
            kpi.impressionsPerDay.forEach(item => {
                if (impressionsData[item.date]) {
                    impressionsData[item.date] += item.value;
                }
            });
        }
        
        // Aggiungi i dati dei click
        if (kpi.clicksPerDay && kpi.clicksPerDay.length > 0) {
            kpi.clicksPerDay.forEach(item => {
                if (clicksData[item.date]) {
                    clicksData[item.date] += item.value;
                }
            });
        }
        
        // Aggiungi i dati delle conversioni
        if (kpi.conversionsPerDay && kpi.conversionsPerDay.length > 0) {
            kpi.conversionsPerDay.forEach(item => {
                if (conversionsData[item.date]) {
                    conversionsData[item.date] += item.value;
                }
            });
        }
        
        // Calcola le entrate giornaliere in base alle conversioni
        if (kpi.conversionsPerDay && kpi.conversionsPerDay.length > 0) {
            const avgOrderValue = kpi.revenue / kpi.conversions;
            kpi.conversionsPerDay.forEach(item => {
                if (revenueData[item.date]) {
                    revenueData[item.date] += item.value * avgOrderValue;
                }
            });
        }
    });
    
    // Converti i dati in array per il grafico
    const labels = Object.keys(impressionsData);
    const impressionsValues = Object.values(impressionsData);
    const clicksValues = Object.values(clicksData);
    const conversionsValues = Object.values(conversionsData);
    const revenueValues = Object.values(revenueData);
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    
    // Distruggi il grafico esistente se presente
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entrate',
                    data: revenueValues,
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.05)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#1cc88a',
                    pointBorderColor: '#1cc88a',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#1cc88a',
                    pointHoverBorderColor: '#1cc88a',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Conversioni',
                    data: conversionsValues,
                    borderColor: '#f6c23e',
                    backgroundColor: 'rgba(246, 194, 62, 0.05)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#f6c23e',
                    pointBorderColor: '#f6c23e',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#f6c23e',
                    pointHoverBorderColor: '#f6c23e',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                },
                y: {
                    position: 'left',
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        callback: function(value) {
                            return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                        }
                    }
                },
                y1: {
                    position: 'right',
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'y') {
                                label += context.parsed.y.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                            } else {
                                label += context.parsed.y.toLocaleString('it-IT');
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
 * Renderizza il grafico della distribuzione del budget
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderBudgetDistributionChart(filters = {}) {
    const canvas = document.getElementById('budgetDistributionChart');
    if (!canvas) return;
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nessuna campagna disponibile', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Raggruppa le campagne per piattaforma
    const platformGroups = {};
    filteredCampaigns.forEach(campaign => {
        if (!platformGroups[campaign.platform]) {
            platformGroups[campaign.platform] = 0;
        }
        platformGroups[campaign.platform] += campaign.budget;
    });
    
    // Prepara i dati per il grafico
    const labels = Object.keys(platformGroups);
    const data = labels.map(platform => platformGroups[platform]);
    
    // Colori per le piattaforme
    const platformColors = {
        'Facebook': '#4267B2',
        'Instagram': '#C13584',
        'LinkedIn': '#0077B5',
        'Twitter': '#1DA1F2',
        'Google Ads': '#DB4437',
        'YouTube': '#FF0000',
        'TikTok': '#000000'
    };
    
    // Prepara i colori per il grafico
    const backgroundColors = labels.map(platform => platformColors[platform] || getRandomColor());
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    
    // Distruggi il grafico esistente se presente
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Budget',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderizza il grafico dell'efficacia per obiettivo
 * @param {Object} filters - Filtri da applicare ai dati
 */
function renderObjectiveEffectivenessChart(filters = {}) {
    const canvas = document.getElementById('objectiveEffectivenessChart');
    if (!canvas) return;
    
    // Filtra le campagne in base ai filtri
    let filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Se non ci sono campagne, mostra un messaggio
    if (filteredCampaigns.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nessuna campagna disponibile', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Raggruppa le campagne per obiettivo
    const objectiveGroups = {};
    const objectiveCounts = {};
    
    filteredCampaigns.forEach(campaign => {
        if (!objectiveGroups[campaign.objective]) {
            objectiveGroups[campaign.objective] = 0;
            objectiveCounts[campaign.objective] = 0;
        }
        
        // Calcola i KPI per la campagna
        const kpi = calculateKPI(campaign);
        
        // Somma l'efficacia
        objectiveGroups[campaign.objective] += kpi.effectiveness;
        objectiveCounts[campaign.objective]++;
    });
    
    // Calcola l'efficacia media per obiettivo
    const objectiveEffectiveness = {};
    Object.keys(objectiveGroups).forEach(objective => {
        objectiveEffectiveness[objective] = objectiveGroups[objective] / objectiveCounts[objective];
    });
    
    // Prepara i dati per il grafico
    const labels = Object.keys(objectiveEffectiveness);
    const data = labels.map(objective => objectiveEffectiveness[objective]);
    
    // Colori per gli obiettivi
    const objectiveColors = {
        'Awareness': '#4e73df',
        'Consideration': '#1cc88a',
        'Conversion': '#36b9cc',
        'Retention': '#f6c23e'
    };
    
    // Prepara i colori per il grafico
    const backgroundColors = labels.map(objective => {
        const color = objectiveColors[objective] || getRandomColor();
        return color + '80'; // Aggiungi trasparenza
    });
    
    const borderColors = labels.map(objective => objectiveColors[objective] || getRandomColor());
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    
    // Distruggi il grafico esistente se presente
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Efficacia',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(1) + '/10';
                            return label;
                        }
                    }
                }
            }
        }
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
 * Ottiene l'intervallo di date dalle campagne
 * @param {Array} campaigns - Array di campagne
 * @returns {Object} - Oggetto con le date di inizio e fine
 */
function getDateRange(campaigns) {
    let minDate = null;
    let maxDate = null;
    
    campaigns.forEach(campaign => {
        const startDate = new Date(campaign.startDate);
        if (!minDate || startDate < minDate) {
            minDate = startDate;
        }
        
        let endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
        if (!maxDate || endDate > maxDate) {
            maxDate = endDate;
        }
    });
    
    return { minDate, maxDate };
}

/**
 * Inizializza un oggetto per i dati giornalieri
 * @param {Object} dateRange - Oggetto con le date di inizio e fine
 * @returns {Object} - Oggetto con le date come chiavi e 0 come valori
 */
function initializeDailyData(dateRange) {
    const dailyData = {};
    
    const currentDate = new Date(dateRange.minDate);
    while (currentDate <= dateRange.maxDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        dailyData[dateString] = 0;
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dailyData;
}

/**
 * Genera un colore casuale
 * @returns {string} - Colore in formato esadecimale
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Esporta le funzioni
window.initDashboardCharts = initDashboardCharts;
window.renderPlatformDistributionChart = renderPlatformDistributionChart;
window.renderPerformanceTrendChart = renderPerformanceTrendChart;
window.renderBudgetDistributionChart = renderBudgetDistributionChart;
window.renderObjectiveEffectivenessChart = renderObjectiveEffectivenessChart;
