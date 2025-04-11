// charts.js - Modulo per la visualizzazione dei grafici PMI

// Variabili globali per i grafici
let sectorChart = null;
let provinceChart = null;

// Inizializza i grafici
function initCharts(contacts) {
    try {
        console.log('Inizializzazione grafici con', contacts ? contacts.length : 0, 'contatti');
        
        // Aspetta che il DOM sia completamente caricato
        setTimeout(() => {
            try {
                // Verifica se i canvas esistono
                const sectorCanvas = document.getElementById('sector-chart');
                const provinceCanvas = document.getElementById('province-chart');
                
                console.log('Canvas trovati?', 'sector-chart:', !!sectorCanvas, 'province-chart:', !!provinceCanvas);
                
                if (!sectorCanvas || !provinceCanvas) {
                    console.warn('Canvas per i grafici non trovati. Sector:', !!sectorCanvas, 'Province:', !!provinceCanvas);
                    return;
                }
                
                // Verifica che contacts sia un array valido
                if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
                    console.log('Nessun contatto disponibile per i grafici');
                    
                    // Crea grafici vuoti
                    if (sectorChart) {
                        console.log('Distruggo grafico settori esistente');
                        sectorChart.destroy();
                    }
                    
                    if (provinceChart) {
                        console.log('Distruggo grafico province esistente');
                        provinceChart.destroy();
                    }
                    
                    console.log('Creo grafici vuoti');
                    sectorChart = new Chart(sectorCanvas, {
                        type: 'pie',
                        data: {
                            labels: ['Nessun dato'],
                            datasets: [{
                                data: [1],
                                backgroundColor: ['rgba(200, 200, 200, 0.5)'],
                                borderColor: ['rgba(200, 200, 200, 1)']
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { position: 'right' },
                                title: { display: true, text: 'Nessun dato disponibile' }
                            }
                        }
                    });
                    
                    provinceChart = new Chart(provinceCanvas, {
                        type: 'bar',
                        data: {
                            labels: ['Nessun dato'],
                            datasets: [{
                                label: 'Aziende per Provincia',
                                data: [0],
                                backgroundColor: 'rgba(200, 200, 200, 0.5)',
                                borderColor: 'rgba(200, 200, 200, 1)'
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: { y: { beginAtZero: true } },
                            plugins: { title: { display: true, text: 'Nessun dato disponibile' } }
                        }
                    });
                    
                    return;
                }
                
                console.log('Calcolo dati per i grafici');
                // Calcola i dati per il grafico dei settori
                const sectorData = calculateSectorData(contacts);
                
                // Distruggi il grafico esistente se presente
                if (sectorChart) {
                    console.log('Distruggo grafico settori esistente');
                    sectorChart.destroy();
                }
                
                console.log('Creo grafico settori con dati:', sectorData);
                // Grafico dei settori
                sectorChart = new Chart(sectorCanvas, {
                    type: 'pie',
                    data: {
                        labels: sectorData.labels,
                        datasets: [{
                            label: 'Aziende per Settore',
                            data: sectorData.values,
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(153, 102, 255, 0.5)',
                                'rgba(40, 167, 69, 0.5)',
                                'rgba(220, 53, 69, 0.5)',
                                'rgba(255, 159, 64, 0.5)',
                                'rgba(201, 203, 207, 0.5)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(40, 167, 69, 1)',
                                'rgba(220, 53, 69, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(201, 203, 207, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'right',
                            }
                        }
                    }
                });
                
                // Calcola i dati per il grafico delle province
                const provinceData = calculateProvinceData(contacts);
                
                // Distruggi il grafico esistente se presente
                if (provinceChart) {
                    console.log('Distruggo grafico province esistente');
                    provinceChart.destroy();
                }
                
                console.log('Creo grafico province con dati:', provinceData);
                // Grafico delle province (mostra solo le top 10)
                provinceChart = new Chart(provinceCanvas, {
                    type: 'bar',
                    data: {
                        labels: provinceData.labels.slice(0, 10),
                        datasets: [{
                            label: 'Aziende per Provincia',
                            data: provinceData.values.slice(0, 10),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                precision: 0
                            }
                        }
                    }
                });
                
                console.log('Grafici inizializzati con successo');
            } catch (error) {
                console.error('Errore nel rendering dei grafici (interno):', error);
            }
        }, 500); // Attendi 500ms per assicurarti che i canvas siano disponibili
    } catch (error) {
        console.error('Errore nel rendering dei grafici (esterno):', error);
    }
}

// Funzione per calcolare i dati per il grafico dei settori
function calculateSectorData(contacts) {
    const sectorCounts = {};
    
    contacts.forEach(contact => {
        const sector = contact['Settore'] || 'Non specificato';
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    
    // Ordina i settori per conteggio (decrescente)
    const sortedSectors = Object.entries(sectorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Prendi solo i primi 8 settori
    
    // Se non ci sono settori, restituisci un valore predefinito
    if (sortedSectors.length === 0) {
        return {
            labels: ['Nessun dato'],
            values: [1]
        };
    }
    
    return {
        labels: sortedSectors.map(item => item[0]),
        values: sortedSectors.map(item => item[1])
    };
}

// Funzione per calcolare i dati per il grafico delle province
function calculateProvinceData(contacts) {
    const provinceCounts = {};
    
    contacts.forEach(contact => {
        // Estrai la provincia dal campo Provincia se disponibile
        if (contact['Provincia']) {
            const provincia = contact['Provincia'];
            provinceCounts[provincia] = (provinceCounts[provincia] || 0) + 1;
        }
        // Altrimenti prova a estrarla dall'indirizzo
        else if (contact['Indirizzo']) {
            // Estrai la provincia dall'indirizzo
            const addressParts = contact['Indirizzo'].split(',');
            if (addressParts.length > 1) {
                const lastPart = addressParts[addressParts.length - 1].trim();
                // Cerca di estrarre la provincia (assumendo che sia tra parentesi o alla fine)
                const match = lastPart.match(/\(([^)]+)\)/) || lastPart.match(/\b([A-Z]{2})\b/);
                if (match) {
                    const provincia = match[1];
                    provinceCounts[provincia] = (provinceCounts[provincia] || 0) + 1;
                } else {
                    // Se non riesci a estrarre la provincia, usa la città
                    if (contact['Città']) {
                        const città = contact['Città'];
                        provinceCounts[città] = (provinceCounts[città] || 0) + 1;
                    }
                }
            }
        }
        // Se non c'è né provincia né indirizzo, usa la città se disponibile
        else if (contact['Città']) {
            const città = contact['Città'];
            provinceCounts[città] = (provinceCounts[città] || 0) + 1;
        }
    });
    
    // Ordina le province per conteggio (decrescente)
    const sortedProvinces = Object.entries(provinceCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // Se non ci sono province, restituisci un valore predefinito
    if (sortedProvinces.length === 0) {
        return {
            labels: ['Nessun dato'],
            values: [0]
        };
    }
    
    return {
        labels: sortedProvinces.map(item => item[0]),
        values: sortedProvinces.map(item => item[1])
    };
}
