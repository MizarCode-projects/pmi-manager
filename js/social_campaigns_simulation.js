// social_campaigns_simulation.js - Sistema di simulazione per le campagne social

/**
 * Simula i KPI per una campagna social
 * @param {Object} campaign - La campagna per cui simulare i KPI
 * @returns {Object} - Oggetto contenente i KPI simulati
 */
function simulateCampaignKPI(campaign) {
    // Ottieni i benchmark per la piattaforma
    const platformBenchmarks = getDefaultKPIByPlatform(campaign.platform);
    
    // Calcola il budget giornaliero
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Se non c'è data di fine, assume un mese
    
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const dailyBudget = campaign.budget / durationDays;
    
    // Applica fattori di correzione in base all'obiettivo della campagna
    const objectiveFactors = getObjectiveFactors(campaign.objective);
    
    // Applica fattori di correzione in base al target
    const targetFactors = getTargetFactors(campaign.target);
    
    // Calcola i KPI simulati
    const cpm = platformBenchmarks.cpm * objectiveFactors.cpmFactor * targetFactors.cpmFactor;
    const impressions = (campaign.budget / cpm) * 1000;
    
    const ctr = platformBenchmarks.ctr * objectiveFactors.ctrFactor * targetFactors.ctrFactor;
    const clicks = impressions * (ctr / 100);
    
    const conversionRate = platformBenchmarks.conversionRate * objectiveFactors.conversionFactor * targetFactors.conversionFactor;
    const conversions = clicks * (conversionRate / 100);
    
    const cpc = campaign.budget / clicks;
    const cpa = conversions > 0 ? campaign.budget / conversions : 0;
    
    // Stima delle entrate in base al settore e all'obiettivo
    const avgOrderValue = getAverageOrderValue(campaign.target);
    const revenue = conversions * avgOrderValue;
    
    const roas = campaign.budget > 0 ? revenue / campaign.budget : 0;
    const roi = campaign.budget > 0 ? ((revenue - campaign.budget) / campaign.budget) * 100 : 0;
    
    // Calcola l'efficacia della campagna simulata
    const effectiveness = calculateSimulatedEffectiveness(roas, conversionRate);
    
    // Simula i dati giornalieri
    const costPerDay = simulateCostPerDay(campaign, durationDays);
    const impressionsPerDay = simulateMetricPerDay(impressions, durationDays, startDate);
    const clicksPerDay = simulateMetricPerDay(clicks, durationDays, startDate);
    const conversionsPerDay = simulateMetricPerDay(conversions, durationDays, startDate);
    
    return {
        impressions: Math.round(impressions),
        clicks: Math.round(clicks),
        ctr,
        cpc,
        cpm,
        conversions: Math.round(conversions),
        conversionRate,
        cpa,
        revenue,
        roas,
        roi,
        effectiveness,
        costPerDay,
        impressionsPerDay,
        clicksPerDay,
        conversionsPerDay
    };
}

/**
 * Calcola l'efficacia simulata di una campagna
 * @param {number} roas - Return on Ad Spend
 * @param {number} conversionRate - Tasso di conversione
 * @returns {number} - Punteggio di efficacia da 1 a 10
 */
function calculateSimulatedEffectiveness(roas, conversionRate) {
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
 * Ottiene i fattori di correzione in base all'obiettivo della campagna
 * @param {string} objective - L'obiettivo della campagna
 * @returns {Object} - Oggetto contenente i fattori di correzione
 */
function getObjectiveFactors(objective) {
    switch (objective) {
        case 'Awareness':
            return {
                cpmFactor: 0.8,  // CPM più basso per campagne di awareness
                ctrFactor: 0.7,  // CTR più basso per campagne di awareness
                conversionFactor: 0.5  // Tasso di conversione più basso
            };
        case 'Consideration':
            return {
                cpmFactor: 1.0,  // CPM nella media
                ctrFactor: 1.2,  // CTR più alto per campagne di consideration
                conversionFactor: 0.8  // Tasso di conversione medio-basso
            };
        case 'Conversion':
            return {
                cpmFactor: 1.3,  // CPM più alto per campagne di conversione
                ctrFactor: 1.0,  // CTR nella media
                conversionFactor: 1.5  // Tasso di conversione più alto
            };
        case 'Retention':
            return {
                cpmFactor: 1.1,  // CPM leggermente più alto
                ctrFactor: 1.3,  // CTR più alto per clienti esistenti
                conversionFactor: 1.8  // Tasso di conversione molto alto
            };
        default:
            return {
                cpmFactor: 1.0,
                ctrFactor: 1.0,
                conversionFactor: 1.0
            };
    }
}

/**
 * Ottiene i fattori di correzione in base al target della campagna
 * @param {string} target - Il target della campagna
 * @returns {Object} - Oggetto contenente i fattori di correzione
 */
function getTargetFactors(target) {
    // Analizza il target per identificare settori o caratteristiche specifiche
    const targetLower = target.toLowerCase();
    
    // Settori B2B vs B2C
    if (targetLower.includes('b2b') || targetLower.includes('aziend') || targetLower.includes('professionisti')) {
        return {
            cpmFactor: 1.4,  // CPM più alto per B2B
            ctrFactor: 0.8,  // CTR più basso per B2B
            conversionFactor: 0.7  // Tasso di conversione più basso
        };
    }
    
    // Target demografici specifici
    if (targetLower.includes('giovani') || targetLower.includes('student')) {
        return {
            cpmFactor: 0.9,  // CPM più basso
            ctrFactor: 1.2,  // CTR più alto
            conversionFactor: 0.9  // Tasso di conversione medio-basso (budget limitato)
        };
    }
    
    if (targetLower.includes('professionisti') || targetLower.includes('manager') || targetLower.includes('dirigent')) {
        return {
            cpmFactor: 1.5,  // CPM più alto
            ctrFactor: 0.9,  // CTR più basso
            conversionFactor: 1.2  // Tasso di conversione più alto
        };
    }
    
    // Target generico
    return {
        cpmFactor: 1.0,
        ctrFactor: 1.0,
        conversionFactor: 1.0
    };
}

/**
 * Ottiene il valore medio dell'ordine in base al settore
 * @param {string} target - Il target della campagna
 * @returns {number} - Valore medio dell'ordine
 */
function getAverageOrderValue(target) {
    const targetLower = target.toLowerCase();
    
    // B2B generalmente ha valori più alti
    if (targetLower.includes('b2b') || targetLower.includes('aziend') || targetLower.includes('impres')) {
        return 500;
    }
    
    // Settori specifici
    if (targetLower.includes('lusso') || targetLower.includes('gioiell') || targetLower.includes('premium')) {
        return 300;
    }
    
    if (targetLower.includes('tecnologia') || targetLower.includes('elettronica')) {
        return 150;
    }
    
    if (targetLower.includes('abbigliamento') || targetLower.includes('moda')) {
        return 80;
    }
    
    if (targetLower.includes('alimentare') || targetLower.includes('cibo') || targetLower.includes('food')) {
        return 50;
    }
    
    // Valore predefinito
    return 100;
}

/**
 * Simula il costo giornaliero di una campagna
 * @param {Object} campaign - La campagna
 * @param {number} durationDays - Durata della campagna in giorni
 * @returns {Array} - Array di oggetti {date, value} con il costo per giorno
 */
function simulateCostPerDay(campaign, durationDays) {
    const startDate = new Date(campaign.startDate);
    const dailyBudget = campaign.budget / durationDays;
    
    const costPerDay = [];
    for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Aggiungi una variazione casuale per rendere i dati più realistici
        const variation = Math.random() * 0.3 - 0.15; // Variazione del ±15%
        const dailyCost = dailyBudget * (1 + variation);
        
        costPerDay.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, dailyCost)
        });
    }
    
    return costPerDay;
}

/**
 * Simula una metrica giornaliera
 * @param {number} totalValue - Valore totale della metrica
 * @param {number} durationDays - Durata della campagna in giorni
 * @param {Date} startDate - Data di inizio della campagna
 * @returns {Array} - Array di oggetti {date, value} con la metrica per giorno
 */
function simulateMetricPerDay(totalValue, durationDays, startDate) {
    const dailyAverage = totalValue / durationDays;
    
    const metricPerDay = [];
    for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Aggiungi una variazione casuale per rendere i dati più realistici
        const variation = Math.random() * 0.6 - 0.3; // Variazione del ±30%
        const dailyValue = dailyAverage * (1 + variation);
        
        metricPerDay.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, Math.round(dailyValue))
        });
    }
    
    return metricPerDay;
}

/**
 * Simula l'andamento futuro di una campagna
 * @param {Object} campaign - La campagna da simulare
 * @param {number} daysToSimulate - Numero di giorni da simulare
 * @returns {Object} - Oggetto contenente i KPI simulati per il periodo futuro
 */
function simulateFutureTrend(campaign, daysToSimulate = 30) {
    // Ottieni i KPI attuali
    const currentKPI = calculateKPI(campaign);
    
    // Crea una copia della campagna per la simulazione
    const simulatedCampaign = { ...campaign };
    
    // Calcola il budget giornaliero attuale
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
    const currentDurationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const dailyBudget = campaign.budget / currentDurationDays;
    
    // Imposta il nuovo budget per il periodo di simulazione
    simulatedCampaign.budget = dailyBudget * daysToSimulate;
    
    // Imposta le nuove date per il periodo di simulazione
    const newStartDate = new Date();
    simulatedCampaign.startDate = newStartDate.toISOString().split('T')[0];
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + daysToSimulate - 1);
    simulatedCampaign.endDate = newEndDate.toISOString().split('T')[0];
    
    // Simula i KPI per il periodo futuro
    const futureKPI = simulateCampaignKPI(simulatedCampaign);
    
    // Applica un fattore di apprendimento (le campagne migliorano nel tempo)
    const learningFactor = 1.05; // 5% di miglioramento
    
    return {
        impressions: Math.round(futureKPI.impressions * learningFactor),
        clicks: Math.round(futureKPI.clicks * learningFactor),
        ctr: futureKPI.ctr * learningFactor,
        conversions: Math.round(futureKPI.conversions * learningFactor),
        conversionRate: futureKPI.conversionRate * learningFactor,
        revenue: futureKPI.revenue * learningFactor,
        roas: futureKPI.roas * learningFactor,
        roi: futureKPI.roi * learningFactor,
        costPerDay: futureKPI.costPerDay,
        impressionsPerDay: futureKPI.impressionsPerDay,
        clicksPerDay: futureKPI.clicksPerDay,
        conversionsPerDay: futureKPI.conversionsPerDay
    };
}

/**
 * Simula l'impatto di un cambiamento nel budget
 * @param {Object} campaign - La campagna da simulare
 * @param {number} budgetChange - Percentuale di cambiamento del budget (es. 20 per +20%)
 * @returns {Object} - Oggetto contenente i KPI simulati con il nuovo budget
 */
function simulateBudgetChange(campaign, budgetChange) {
    // Crea una copia della campagna per la simulazione
    const simulatedCampaign = { ...campaign };
    
    // Calcola il nuovo budget
    const newBudget = campaign.budget * (1 + (budgetChange / 100));
    simulatedCampaign.budget = newBudget;
    
    // Simula i KPI con il nuovo budget
    return simulateCampaignKPI(simulatedCampaign);
}

/**
 * Simula l'impatto di un cambiamento nella piattaforma
 * @param {Object} campaign - La campagna da simulare
 * @param {string} newPlatform - La nuova piattaforma
 * @returns {Object} - Oggetto contenente i KPI simulati con la nuova piattaforma
 */
function simulatePlatformChange(campaign, newPlatform) {
    // Crea una copia della campagna per la simulazione
    const simulatedCampaign = { ...campaign };
    
    // Cambia la piattaforma
    simulatedCampaign.platform = newPlatform;
    
    // Simula i KPI con la nuova piattaforma
    return simulateCampaignKPI(simulatedCampaign);
}

/**
 * Simula l'impatto di un cambiamento nell'obiettivo
 * @param {Object} campaign - La campagna da simulare
 * @param {string} newObjective - Il nuovo obiettivo
 * @returns {Object} - Oggetto contenente i KPI simulati con il nuovo obiettivo
 */
function simulateObjectiveChange(campaign, newObjective) {
    // Crea una copia della campagna per la simulazione
    const simulatedCampaign = { ...campaign };
    
    // Cambia l'obiettivo
    simulatedCampaign.objective = newObjective;
    
    // Simula i KPI con il nuovo obiettivo
    return simulateCampaignKPI(simulatedCampaign);
}

/**
 * Simula l'impatto di un cambiamento nel target
 * @param {Object} campaign - La campagna da simulare
 * @param {string} newTarget - Il nuovo target
 * @returns {Object} - Oggetto contenente i KPI simulati con il nuovo target
 */
function simulateTargetChange(campaign, newTarget) {
    // Crea una copia della campagna per la simulazione
    const simulatedCampaign = { ...campaign };
    
    // Cambia il target
    simulatedCampaign.target = newTarget;
    
    // Simula i KPI con il nuovo target
    return simulateCampaignKPI(simulatedCampaign);
}

// Esporta le funzioni
window.simulateCampaignKPI = simulateCampaignKPI;
window.simulateFutureTrend = simulateFutureTrend;
window.simulateBudgetChange = simulateBudgetChange;
window.simulatePlatformChange = simulatePlatformChange;
window.simulateObjectiveChange = simulateObjectiveChange;
window.simulateTargetChange = simulateTargetChange;
