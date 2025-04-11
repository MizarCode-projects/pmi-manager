// social_campaigns_dashboard.js - File principale per la dashboard delle campagne social

// Variabile globale per le campagne social
let socialCampaigns = [];

/**
 * Carica le campagne social dal localStorage
 */
function loadSocialCampaigns() {
    try {
        const savedCampaigns = localStorage.getItem('socialCampaigns');
        if (savedCampaigns) {
            socialCampaigns = JSON.parse(savedCampaigns);
            console.log(`Caricate ${socialCampaigns.length} campagne dal localStorage`);
        } else {
            // Se non ci sono campagne salvate, inizializza con un array vuoto
            socialCampaigns = [];
            localStorage.setItem('socialCampaigns', JSON.stringify(socialCampaigns));
        }
    } catch (error) {
        console.error('Errore nel caricamento delle campagne:', error);
        socialCampaigns = [];
    }
}

/**
 * Inizializza la dashboard delle campagne social
 */
function initSocialCampaignsDashboard() {
    // Carica le campagne social se non sono già state caricate
    if (!socialCampaigns || socialCampaigns.length === 0) {
        loadSocialCampaigns();
    }
    
    // Inizializza i filtri della dashboard
    initDashboardFilters('dashboard-filters-container', updateDashboard);
    
    // Inizializza i widget KPI della dashboard
    initDashboardKPI('dashboard-kpi-container');
    
    // Inizializza i grafici della dashboard
    initDashboardCharts('dashboard-charts-container');
    
    // Inizializza le tabelle della dashboard
    initDashboardTables('dashboard-tables-container');
    
    // Aggiorna la dashboard con i filtri correnti
    updateDashboard(getFilters());
    
    // Aggiungi il gestore per il pulsante di esportazione del report
    const exportReportBtn = document.getElementById('export-report-btn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportDashboardReport);
    }
}

/**
 * Aggiorna la dashboard con i filtri specificati
 * @param {Object} filters - Filtri da applicare
 */
function updateDashboard(filters = {}) {
    // Aggiorna i widget KPI
    updateDashboardKPI(filters);
    
    // Aggiorna i grafici
    renderPlatformDistributionChart(filters);
    renderPerformanceTrendChart(filters);
    renderBudgetDistributionChart(filters);
    renderObjectiveEffectivenessChart(filters);
    
    // Aggiorna le tabelle
    renderTopCampaignsTable(filters);
    renderPlatformMetricsTable(filters);
    renderObjectiveMetricsTable(filters);
}

/**
 * Esporta un report della dashboard
 */
function exportDashboardReport() {
    // Ottieni i filtri correnti
    const filters = getFilters();
    
    // Ottieni i dati filtrati
    const filteredCampaigns = filterCampaigns(socialCampaigns, filters);
    
    // Prepara i dati per il report
    const reportData = prepareReportData(filteredCampaigns, filters);
    
    // Genera il report PDF
    generatePDFReport(reportData);
}

/**
 * Prepara i dati per il report
 * @param {Array} campaigns - Campagne filtrate
 * @param {Object} filters - Filtri applicati
 * @returns {Object} - Dati per il report
 */
function prepareReportData(campaigns, filters) {
    // Calcola i KPI totali
    const totalKPI = calculateTotalKPI(campaigns);
    
    // Raggruppa le campagne per piattaforma
    const platformGroups = {};
    campaigns.forEach(campaign => {
        if (!platformGroups[campaign.platform]) {
            platformGroups[campaign.platform] = [];
        }
        platformGroups[campaign.platform].push(campaign);
    });
    
    // Calcola i KPI per piattaforma
    const platformKPI = {};
    Object.keys(platformGroups).forEach(platform => {
        platformKPI[platform] = calculateTotalKPI(platformGroups[platform]);
    });
    
    // Raggruppa le campagne per obiettivo
    const objectiveGroups = {};
    campaigns.forEach(campaign => {
        if (!objectiveGroups[campaign.objective]) {
            objectiveGroups[campaign.objective] = [];
        }
        objectiveGroups[campaign.objective].push(campaign);
    });
    
    // Calcola i KPI per obiettivo
    const objectiveKPI = {};
    Object.keys(objectiveGroups).forEach(objective => {
        objectiveKPI[objective] = calculateTotalKPI(objectiveGroups[objective]);
    });
    
    // Prepara i dati per il report
    return {
        title: 'Report Dashboard Campagne Social',
        date: new Date().toLocaleDateString('it-IT'),
        filters: {
            platform: filters.platform || 'Tutte',
            status: filters.status || 'Tutti',
            objective: filters.objective || 'Tutti',
            dateRange: getDateRangeDescription(filters)
        },
        totalCampaigns: campaigns.length,
        totalKPI,
        platformKPI,
        objectiveKPI,
        topCampaigns: getTopCampaigns(campaigns, 10)
    };
}

/**
 * Ottiene le migliori campagne in base al ROAS
 * @param {Array} campaigns - Campagne da analizzare
 * @param {number} limit - Numero massimo di campagne da restituire
 * @returns {Array} - Migliori campagne
 */
function getTopCampaigns(campaigns, limit = 5) {
    // Calcola i KPI per ogni campagna
    const campaignsWithKPI = campaigns.map(campaign => {
        const kpi = calculateKPI(campaign);
        return { ...campaign, kpi };
    });
    
    // Ordina le campagne per ROAS (decrescente)
    campaignsWithKPI.sort((a, b) => b.kpi.roas - a.kpi.roas);
    
    // Restituisci le prime N campagne
    return campaignsWithKPI.slice(0, limit);
}

/**
 * Ottiene una descrizione del range di date
 * @param {Object} filters - Filtri applicati
 * @returns {string} - Descrizione del range di date
 */
function getDateRangeDescription(filters) {
    if (!filters.dateRange || filters.dateRange === 'all') {
        return 'Tutto il periodo';
    }
    
    if (filters.dateRange === 'custom') {
        return `Dal ${formatDate(filters.dateFrom)} al ${formatDate(filters.dateTo)}`;
    }
    
    const dateRangeLabels = {
        'last7': 'Ultimi 7 giorni',
        'last30': 'Ultimi 30 giorni',
        'last90': 'Ultimi 90 giorni',
        'thisMonth': 'Questo mese',
        'lastMonth': 'Mese scorso',
        'thisYear': 'Quest\'anno'
    };
    
    return dateRangeLabels[filters.dateRange] || 'Periodo personalizzato';
}

/**
 * Formatta una data in formato italiano
 * @param {string} dateString - Data in formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formattata (DD/MM/YYYY)
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Genera un report PDF
 * @param {Object} reportData - Dati per il report
 */
function generatePDFReport(reportData) {
    // Questa è una versione semplificata che utilizza jsPDF
    // In un'implementazione reale, si potrebbe utilizzare una libreria più avanzata
    
    // Controlla se jsPDF è disponibile
    if (typeof jsPDF === 'undefined') {
        // Se jsPDF non è disponibile, mostra un messaggio e scarica i dati come JSON
        alert('La libreria jsPDF non è disponibile. I dati del report verranno scaricati come file JSON.');
        downloadJSONReport(reportData);
        return;
    }
    
    // Crea un nuovo documento PDF
    const doc = new jsPDF();
    
    // Aggiungi il titolo
    doc.setFontSize(18);
    doc.text(reportData.title, 105, 20, { align: 'center' });
    
    // Aggiungi la data
    doc.setFontSize(12);
    doc.text(`Data: ${reportData.date}`, 105, 30, { align: 'center' });
    
    // Aggiungi i filtri
    doc.setFontSize(14);
    doc.text('Filtri applicati:', 20, 45);
    doc.setFontSize(10);
    doc.text(`Piattaforma: ${reportData.filters.platform}`, 25, 55);
    doc.text(`Stato: ${reportData.filters.status}`, 25, 62);
    doc.text(`Obiettivo: ${reportData.filters.objective}`, 25, 69);
    doc.text(`Periodo: ${reportData.filters.dateRange}`, 25, 76);
    
    // Aggiungi i KPI totali
    doc.setFontSize(14);
    doc.text('KPI Totali:', 20, 90);
    doc.setFontSize(10);
    doc.text(`Campagne: ${reportData.totalCampaigns}`, 25, 100);
    doc.text(`Budget totale: ${formatCurrency(reportData.totalKPI.totalBudget)}`, 25, 107);
    doc.text(`Impressioni: ${formatNumber(reportData.totalKPI.totalImpressions)}`, 25, 114);
    doc.text(`Click: ${formatNumber(reportData.totalKPI.totalClicks)}`, 25, 121);
    doc.text(`CTR: ${formatPercent(reportData.totalKPI.ctr)}`, 25, 128);
    doc.text(`CPC: ${formatCurrency(reportData.totalKPI.cpc)}`, 25, 135);
    doc.text(`Conversioni: ${formatNumber(reportData.totalKPI.totalConversions)}`, 25, 142);
    doc.text(`Tasso di conversione: ${formatPercent(reportData.totalKPI.conversionRate)}`, 25, 149);
    doc.text(`Entrate: ${formatCurrency(reportData.totalKPI.totalRevenue)}`, 25, 156);
    doc.text(`ROAS: ${reportData.totalKPI.roas.toFixed(2)}x`, 25, 163);
    
    // Aggiungi le migliori campagne
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Migliori Campagne:', 20, 20);
    
    // Intestazione della tabella
    doc.setFontSize(10);
    doc.text('Nome', 20, 30);
    doc.text('Piattaforma', 70, 30);
    doc.text('Budget', 110, 30);
    doc.text('ROAS', 140, 30);
    doc.text('Efficacia', 170, 30);
    
    // Dati della tabella
    let y = 40;
    reportData.topCampaigns.forEach((campaign, index) => {
        doc.text(campaign.name, 20, y);
        doc.text(campaign.platform, 70, y);
        doc.text(formatCurrency(campaign.budget), 110, y);
        doc.text(`${campaign.kpi.roas.toFixed(2)}x`, 140, y);
        doc.text(`${campaign.kpi.effectiveness.toFixed(1)}/10`, 170, y);
        y += 10;
        
        // Aggiungi una nuova pagina se necessario
        if (y > 270 && index < reportData.topCampaigns.length - 1) {
            doc.addPage();
            y = 20;
            
            // Ripeti l'intestazione
            doc.setFontSize(10);
            doc.text('Nome', 20, y);
            doc.text('Piattaforma', 70, y);
            doc.text('Budget', 110, y);
            doc.text('ROAS', 140, y);
            doc.text('Efficacia', 170, y);
            y += 10;
        }
    });
    
    // Salva il PDF
    doc.save('report_campagne_social.pdf');
}

/**
 * Scarica i dati del report come file JSON
 * @param {Object} reportData - Dati per il report
 */
function downloadJSONReport(reportData) {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'report_campagne_social.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

/**
 * Formatta un numero in formato italiano
 * @param {number} num - Numero da formattare
 * @returns {string} - Numero formattato
 */
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(Math.round(num));
}

/**
 * Formatta un importo in formato valuta italiana
 * @param {number} num - Importo da formattare
 * @returns {string} - Importo formattato
 */
function formatCurrency(num) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
}

/**
 * Formatta una percentuale
 * @param {number} num - Percentuale da formattare
 * @returns {string} - Percentuale formattata
 */
function formatPercent(num) {
    return num.toFixed(2) + '%';
}

/**
 * Calcola i KPI totali per un insieme di campagne
 * @param {Array} campaigns - Campagne da analizzare
 * @returns {Object} - KPI totali
 */
function calculateTotalKPI(campaigns) {
    let totalBudget = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    
    campaigns.forEach(campaign => {
        const kpi = calculateKPI(campaign);
        
        totalBudget += campaign.budget;
        totalImpressions += kpi.impressions;
        totalClicks += kpi.clicks;
        totalConversions += kpi.conversions;
        totalRevenue += kpi.revenue;
    });
    
    // Calcola i KPI derivati
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalBudget / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalBudget > 0 ? totalRevenue / totalBudget : 0;
    
    return {
        totalBudget,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalRevenue,
        ctr,
        cpc,
        conversionRate,
        roas
    };
}

// Esporta le funzioni
window.initSocialCampaignsDashboard = initSocialCampaignsDashboard;
window.updateDashboard = updateDashboard;
window.exportDashboardReport = exportDashboardReport;
