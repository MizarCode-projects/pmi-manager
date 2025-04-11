// social_campaigns_kpi.js - Gestione dei KPI per le campagne social

/**
 * Calcola i KPI per una campagna social
 * @param {Object} campaign - La campagna per cui calcolare i KPI
 * @returns {Object} - Oggetto contenente i KPI calcolati
 */
function calculateKPI(campaign) {
    // Se ci sono dati effettivi, usa quelli
    if (campaign.actualSpend > 0 || campaign.impressions > 0 || campaign.clicks > 0 || campaign.conversions > 0) {
        return calculateActualKPI(campaign);
    }
    
    // Altrimenti simula i KPI
    return simulateCampaignKPI(campaign);
}

/**
 * Calcola i KPI effettivi di una campagna in base ai dati reali
 * @param {Object} campaign - La campagna per cui calcolare i KPI
 * @returns {Object} - Oggetto contenente i KPI calcolati
 */
function calculateActualKPI(campaign) {
    // Raccogli i dati effettivi
    const actualSpend = campaign.actualSpend || 0;
    const impressions = campaign.impressions || 0;
    const clicks = campaign.clicks || 0;
    const conversions = campaign.conversions || 0;
    const revenue = campaign.revenue || 0;
    
    // Calcola i KPI
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? actualSpend / clicks : 0;
    const cpm = impressions > 0 ? (actualSpend / impressions) * 1000 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpa = conversions > 0 ? actualSpend / conversions : 0;
    const roas = actualSpend > 0 ? revenue / actualSpend : 0;
    const roi = actualSpend > 0 ? ((revenue - actualSpend) / actualSpend) * 100 : 0;
    
    // Calcola l'efficacia della campagna
    const effectiveness = calculateEffectiveness(campaign);
    
    return {
        impressions,
        clicks,
        ctr,
        cpc,
        cpm,
        conversions,
        conversionRate,
        cpa,
        revenue,
        roas,
        roi,
        effectiveness,
        // Aggiungi dati per i grafici
        costPerDay: calculateCostPerDay(campaign),
        impressionsPerDay: calculateImpressionsPerDay(campaign),
        clicksPerDay: calculateClicksPerDay(campaign),
        conversionsPerDay: calculateConversionsPerDay(campaign)
    };
}

/**
 * Calcola l'efficacia di una campagna in base ai dati effettivi
 * @param {Object} campaign - La campagna per cui calcolare l'efficacia
 * @returns {number} - Punteggio di efficacia da 1 a 10
 */
function calculateEffectiveness(campaign) {
    if (!campaign.actualSpend || campaign.actualSpend <= 0) {
        return 5; // Valore predefinito per campagne senza dati
    }
    
    // Calcola l'efficacia in base al ROAS e al tasso di conversione
    const roas = campaign.revenue / campaign.actualSpend;
    const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
    
    // Pesi per i diversi fattori
    const roasWeight = 0.7;
    const conversionWeight = 0.3;
    
    // Calcola il punteggio per il ROAS (scala 1-10)
    let roasScore = 0;
    if (roas >= 5) roasScore = 10;
    else if (roas >= 4) roasScore = 9;
    else if (roas >= 3) roasScore = 8;
    else if (roas >= 2.5) roasScore = 7;
    else if (roas >= 2) roasScore = 6;
    else if (roas >= 1.5) roasScore = 5;
    else if (roas >= 1) roasScore = 4;
    else if (roas >= 0.7) roasScore = 3;
    else if (roas >= 0.4) roasScore = 2;
    else roasScore = 1;
    
    // Calcola il punteggio per il tasso di conversione (scala 1-10)
    let conversionScore = 0;
    if (conversionRate >= 10) conversionScore = 10;
    else if (conversionRate >= 8) conversionScore = 9;
    else if (conversionRate >= 6) conversionScore = 8;
    else if (conversionRate >= 5) conversionScore = 7;
    else if (conversionRate >= 4) conversionScore = 6;
    else if (conversionRate >= 3) conversionScore = 5;
    else if (conversionRate >= 2) conversionScore = 4;
    else if (conversionRate >= 1) conversionScore = 3;
    else if (conversionRate >= 0.5) conversionScore = 2;
    else conversionScore = 1;
    
    // Calcola il punteggio finale pesato
    const finalScore = (roasScore * roasWeight) + (conversionScore * conversionWeight);
    
    // Arrotonda al numero intero più vicino
    return Math.round(finalScore);
}

/**
 * Calcola il costo giornaliero della campagna
 * @param {Object} campaign - La campagna per cui calcolare il costo giornaliero
 * @returns {Array} - Array di oggetti {date, value} con il costo per giorno
 */
function calculateCostPerDay(campaign) {
    // Se non ci sono dati effettivi, restituisci un array vuoto
    if (!campaign.actualSpend || campaign.actualSpend <= 0) {
        return [];
    }
    
    // Calcola la durata della campagna in giorni
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Calcola il costo giornaliero medio
    const dailySpend = campaign.actualSpend / durationDays;
    
    // Crea un array di date e costi
    const costPerDay = [];
    for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Aggiungi una variazione casuale per rendere i dati più realistici
        const variation = Math.random() * 0.4 - 0.2; // Variazione del ±20%
        const dailyCost = dailySpend * (1 + variation);
        
        costPerDay.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, dailyCost)
        });
    }
    
    return costPerDay;
}

/**
 * Calcola le impression giornaliere della campagna
 * @param {Object} campaign - La campagna per cui calcolare le impression giornaliere
 * @returns {Array} - Array di oggetti {date, value} con le impression per giorno
 */
function calculateImpressionsPerDay(campaign) {
    // Se non ci sono dati effettivi, restituisci un array vuoto
    if (!campaign.impressions || campaign.impressions <= 0) {
        return [];
    }
    
    // Calcola la durata della campagna in giorni
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Calcola le impression giornaliere medie
    const dailyImpressions = campaign.impressions / durationDays;
    
    // Crea un array di date e impression
    const impressionsPerDay = [];
    for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Aggiungi una variazione casuale per rendere i dati più realistici
        const variation = Math.random() * 0.6 - 0.3; // Variazione del ±30%
        const dailyImpression = dailyImpressions * (1 + variation);
        
        impressionsPerDay.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, Math.round(dailyImpression))
        });
    }
    
    return impressionsPerDay;
}

/**
 * Calcola i click giornalieri della campagna
 * @param {Object} campaign - La campagna per cui calcolare i click giornalieri
 * @returns {Array} - Array di oggetti {date, value} con i click per giorno
 */
function calculateClicksPerDay(campaign) {
    // Se non ci sono dati effettivi, restituisci un array vuoto
    if (!campaign.clicks || campaign.clicks <= 0) {
        return [];
    }
    
    // Calcola la durata della campagna in giorni
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Calcola i click giornalieri medi
    const dailyClicks = campaign.clicks / durationDays;
    
    // Crea un array di date e click
    const clicksPerDay = [];
    for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Aggiungi una variazione casuale per rendere i dati più realistici
        const variation = Math.random() * 0.7 - 0.35; // Variazione del ±35%
        const dailyClick = dailyClicks * (1 + variation);
        
        clicksPerDay.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, Math.round(dailyClick))
        });
    }
    
    return clicksPerDay;
}

/**
 * Calcola le conversioni giornaliere della campagna
 * @param {Object} campaign - La campagna per cui calcolare le conversioni giornaliere
 * @returns {Array} - Array di oggetti {date, value} con le conversioni per giorno
 */
function calculateConversionsPerDay(campaign) {
    // Se non ci sono dati effettivi, restituisci un array vuoto
    if (!campaign.conversions || campaign.conversions <= 0) {
        return [];
    }
    
    // Calcola la durata della campagna in giorni
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Calcola le conversioni giornaliere medie
    const dailyConversions = campaign.conversions / durationDays;
    
    // Crea un array di date e conversioni
    const conversionsPerDay = [];
    for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Aggiungi una variazione casuale per rendere i dati più realistici
        const variation = Math.random() * 0.8 - 0.4; // Variazione del ±40%
        const dailyConversion = dailyConversions * (1 + variation);
        
        conversionsPerDay.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, Math.round(dailyConversion))
        });
    }
    
    return conversionsPerDay;
}

/**
 * Ottiene una classe CSS in base al punteggio di efficacia
 * @param {number} effectiveness - Punteggio di efficacia da 1 a 10
 * @returns {string} - Classe CSS per la barra di progresso
 */
function getEffectivenessClass(effectiveness) {
    if (effectiveness >= 8) return 'bg-success';
    if (effectiveness >= 6) return 'bg-info';
    if (effectiveness >= 4) return 'bg-warning';
    return 'bg-danger';
}

/**
 * Calcola i KPI medi per una piattaforma specifica
 * @param {string} platform - La piattaforma per cui calcolare i KPI medi
 * @returns {Object} - Oggetto contenente i KPI medi calcolati
 */
function calculateAverageKPIByPlatform(platform) {
    // Filtra le campagne per piattaforma
    const platformCampaigns = socialCampaigns.filter(c => c.platform === platform && c.actualSpend > 0);
    
    // Se non ci sono campagne con dati effettivi, restituisci valori predefiniti
    if (platformCampaigns.length === 0) {
        return getDefaultKPIByPlatform(platform);
    }
    
    // Calcola la somma dei KPI
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    
    platformCampaigns.forEach(campaign => {
        totalSpend += campaign.actualSpend || 0;
        totalImpressions += campaign.impressions || 0;
        totalClicks += campaign.clicks || 0;
        totalConversions += campaign.conversions || 0;
        totalRevenue += campaign.revenue || 0;
    });
    
    // Calcola i KPI medi
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    
    return {
        ctr: avgCTR,
        cpc: avgCPC,
        cpm: avgCPM,
        conversionRate: avgConversionRate,
        cpa: avgCPA,
        roas: avgROAS
    };
}

/**
 * Restituisce i KPI predefiniti per una piattaforma specifica
 * @param {string} platform - La piattaforma per cui ottenere i KPI predefiniti
 * @returns {Object} - Oggetto contenente i KPI predefiniti
 */
function getDefaultKPIByPlatform(platform) {
    // Valori predefiniti basati su benchmark di settore
    switch (platform) {
        case 'Facebook':
            return {
                ctr: 0.9,
                cpc: 0.5,
                cpm: 7.19,
                conversionRate: 9.21,
                cpa: 18.68,
                roas: 2.0
            };
        case 'Instagram':
            return {
                ctr: 0.58,
                cpc: 0.75,
                cpm: 7.91,
                conversionRate: 3.1,
                cpa: 23.86,
                roas: 1.8
            };
        case 'LinkedIn':
            return {
                ctr: 0.39,
                cpc: 5.26,
                cpm: 6.59,
                conversionRate: 2.74,
                cpa: 54.72,
                roas: 2.2
            };
        case 'Twitter':
            return {
                ctr: 0.46,
                cpc: 0.38,
                cpm: 6.46,
                conversionRate: 0.77,
                cpa: 53.33,
                roas: 1.5
            };
        case 'Google Ads':
            return {
                ctr: 3.17,
                cpc: 2.69,
                cpm: 38.40,
                conversionRate: 4.40,
                cpa: 56.11,
                roas: 2.87
            };
        case 'YouTube':
            return {
                ctr: 0.51,
                cpc: 0.14,
                cpm: 9.68,
                conversionRate: 0.51,
                cpa: 42.80,
                roas: 1.2
            };
        case 'TikTok':
            return {
                ctr: 1.02,
                cpc: 0.19,
                cpm: 10.0,
                conversionRate: 1.37,
                cpa: 14.82,
                roas: 1.85
            };
        default:
            return {
                ctr: 1.0,
                cpc: 1.0,
                cpm: 10.0,
                conversionRate: 2.0,
                cpa: 30.0,
                roas: 1.5
            };
    }
}

// Esporta le funzioni
window.calculateKPI = calculateKPI;
window.calculateActualKPI = calculateActualKPI;
window.calculateEffectiveness = calculateEffectiveness;
window.getEffectivenessClass = getEffectivenessClass;
window.calculateAverageKPIByPlatform = calculateAverageKPIByPlatform;
