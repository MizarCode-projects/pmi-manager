// social_campaigns_charts_basic.js - Grafici di base per le performance delle campagne social

/**
 * Inizializza i grafici di base per una campagna
 * @param {string} campaignId - ID della campagna
 * @param {string} containerId - ID del container dove inserire i grafici
 */
function initCampaignBasicCharts(campaignId, containerId = 'campaign-charts-container') {
    const campaign = getCampaign(campaignId);
    if (!campaign) return;
    
    // Ottieni il container
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Svuota il container
    container.innerHTML = '';
    
    // Crea la struttura per i grafici
    container.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">Impression e Click</div>
                    <div class="card-body">
                        <canvas id="impressionsClicksChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">CTR</div>
                    <div class="card-body">
                        <canvas id="ctrChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">Conversioni</div>
                    <div class="card-body">
                        <canvas id="conversionsChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">Spesa e Entrate</div>
                    <div class="card-body">
                        <canvas id="spendRevenueChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Calcola i KPI
    const kpi = calculateKPI(campaign);
    
    // Renderizza i grafici
    renderImpressionsClicksChart(campaign, kpi);
    renderCTRChart(campaign, kpi);
    renderConversionsChart(campaign, kpi);
    renderSpendRevenueChart(campaign, kpi);
}

/**
 * Renderizza il grafico delle impression e dei click
 * @param {Object} campaign - La campagna
 * @param {Object} kpi - I KPI calcolati
 */
function renderImpressionsClicksChart(campaign, kpi) {
    const canvas = document.getElementById('impressionsClicksChart');
    if (!canvas) return;
    
    // Ottieni i dati giornalieri
    const impressionsData = kpi.impressionsPerDay || [];
    const clicksData = kpi.clicksPerDay || [];
    
    // Se non ci sono dati, mostra un messaggio
    if (impressionsData.length === 0 || clicksData.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dati non disponibili', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Prepara i dati per il grafico
    const labels = impressionsData.map(item => item.date);
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Impression',
                    data: impressionsData.map(item => item.value),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#4e73df',
                    pointBorderColor: '#4e73df',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#4e73df',
                    pointHoverBorderColor: '#4e73df',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Click',
                    data: clicksData.map(item => item.value),
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
                            return value.toLocaleString('it-IT');
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
                        callback: function(value) {
                            return value.toLocaleString('it-IT');
                        }
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
                            label += context.parsed.y.toLocaleString('it-IT');
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderizza il grafico del CTR
 * @param {Object} campaign - La campagna
 * @param {Object} kpi - I KPI calcolati
 */
function renderCTRChart(campaign, kpi) {
    const canvas = document.getElementById('ctrChart');
    if (!canvas) return;
    
    // Ottieni i dati giornalieri
    const impressionsData = kpi.impressionsPerDay || [];
    const clicksData = kpi.clicksPerDay || [];
    
    // Se non ci sono dati, mostra un messaggio
    if (impressionsData.length === 0 || clicksData.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dati non disponibili', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calcola il CTR giornaliero
    const ctrData = [];
    for (let i = 0; i < impressionsData.length; i++) {
        const date = impressionsData[i].date;
        const impressions = impressionsData[i].value;
        
        // Trova i click corrispondenti
        const clickItem = clicksData.find(item => item.date === date);
        const clicks = clickItem ? clickItem.value : 0;
        
        // Calcola il CTR
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        
        ctrData.push({
            date: date,
            value: ctr
        });
    }
    
    // Prepara i dati per il grafico
    const labels = ctrData.map(item => item.date);
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'CTR (%)',
                data: ctrData.map(item => item.value),
                borderColor: '#36b9cc',
                backgroundColor: 'rgba(54, 185, 204, 0.05)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#36b9cc',
                pointBorderColor: '#36b9cc',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#36b9cc',
                pointHoverBorderColor: '#36b9cc',
                pointHitRadius: 10,
                pointBorderWidth: 2,
                fill: true
            }]
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        callback: function(value) {
                            return value.toFixed(2) + '%';
                        }
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
                            label += context.parsed.y.toFixed(2) + '%';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderizza il grafico delle conversioni
 * @param {Object} campaign - La campagna
 * @param {Object} kpi - I KPI calcolati
 */
function renderConversionsChart(campaign, kpi) {
    const canvas = document.getElementById('conversionsChart');
    if (!canvas) return;
    
    // Ottieni i dati giornalieri
    const conversionsData = kpi.conversionsPerDay || [];
    
    // Se non ci sono dati, mostra un messaggio
    if (conversionsData.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dati non disponibili', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Prepara i dati per il grafico
    const labels = conversionsData.map(item => item.date);
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Conversioni',
                data: conversionsData.map(item => item.value),
                backgroundColor: 'rgba(246, 194, 62, 0.2)',
                borderColor: '#f6c23e',
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
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        beginAtZero: true,
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

/**
 * Renderizza il grafico della spesa e delle entrate
 * @param {Object} campaign - La campagna
 * @param {Object} kpi - I KPI calcolati
 */
function renderSpendRevenueChart(campaign, kpi) {
    const canvas = document.getElementById('spendRevenueChart');
    if (!canvas) return;
    
    // Ottieni i dati giornalieri
    const costData = kpi.costPerDay || [];
    
    // Se non ci sono dati, mostra un messaggio
    if (costData.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Dati non disponibili', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calcola le entrate giornaliere in base alle conversioni
    const conversionsData = kpi.conversionsPerDay || [];
    const revenueData = [];
    
    // Calcola il valore medio dell'ordine
    const avgOrderValue = kpi.revenue / kpi.conversions;
    
    for (let i = 0; i < costData.length; i++) {
        const date = costData[i].date;
        
        // Trova le conversioni corrispondenti
        const conversionItem = conversionsData.find(item => item.date === date);
        const conversions = conversionItem ? conversionItem.value : 0;
        
        // Calcola le entrate
        const revenue = conversions * avgOrderValue;
        
        revenueData.push({
            date: date,
            value: revenue
        });
    }
    
    // Prepara i dati per il grafico
    const labels = costData.map(item => item.date);
    
    // Crea il grafico
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Spesa',
                    data: costData.map(item => item.value),
                    borderColor: '#e74a3b',
                    backgroundColor: 'rgba(231, 74, 59, 0.05)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#e74a3b',
                    pointBorderColor: '#e74a3b',
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#e74a3b',
                    pointHoverBorderColor: '#e74a3b',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    fill: true
                },
                {
                    label: 'Entrate',
                    data: revenueData.map(item => item.value),
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
                    fill: true
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        callback: function(value) {
                            return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                        }
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
                            label += context.parsed.y.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Esporta le funzioni
window.initCampaignBasicCharts = initCampaignBasicCharts;
