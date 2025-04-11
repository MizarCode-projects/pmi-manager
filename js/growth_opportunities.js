// growth_opportunities.js - Gestione delle opportunità di crescita aziendale

// Dati di esempio per i bandi
let bandi = [];

// Dati di esempio per gli investitori
let investitori = [];

// Dati di esempio per le opportunità di diversificazione
let opportunitaDiversificazione = [];

/**
 * Inizializza la pagina delle opportunità di crescita
 */
function initGrowthOpportunitiesPage() {
    loadData();
    initTables();
    initCalendar();
    initROICalculator();
    initEventListeners();
}

/**
 * Carica i dati da localStorage o inizializza con dati di esempio
 */
function loadData() {
    // Carica bandi
    const savedBandi = localStorage.getItem('bandi');
    if (savedBandi) {
        bandi = JSON.parse(savedBandi);
    } else {
        initSampleBandi();
        saveBandi();
    }
    
    // Carica investitori
    const savedInvestitori = localStorage.getItem('investitori');
    if (savedInvestitori) {
        investitori = JSON.parse(savedInvestitori);
    } else {
        initSampleInvestitori();
        saveInvestitori();
    }
    
    // Carica opportunità di diversificazione
    const savedOpportunita = localStorage.getItem('opportunitaDiversificazione');
    if (savedOpportunita) {
        opportunitaDiversificazione = JSON.parse(savedOpportunita);
    } else {
        initSampleOpportunitaDiversificazione();
        saveOpportunitaDiversificazione();
    }
}

/**
 * Inizializza le tabelle DataTables
 */
function initTables() {
    // Inizializza tabella bandi
    if ($.fn.DataTable.isDataTable('#bandi-table')) {
        $('#bandi-table').DataTable().destroy();
    }
    
    $('#bandi-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
        },
        responsive: true,
        data: bandi,
        columns: [
            { data: 'titolo' },
            { data: 'ente' },
            { data: 'categoria' },
            { data: 'regione' },
            { 
                data: 'importo',
                render: function(data) {
                    return data.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                }
            },
            { data: 'scadenza' },
            { 
                data: null,
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-info view-bando" data-id="${row.id}"><i class="fas fa-eye"></i></button>
                            <button type="button" class="btn btn-success save-bando" data-id="${row.id}"><i class="fas fa-bookmark"></i></button>
                            <button type="button" class="btn btn-primary share-bando" data-id="${row.id}"><i class="fas fa-share-alt"></i></button>
                        </div>
                    `;
                }
            }
        ]
    });
    
    // Inizializza tabella investitori
    if ($.fn.DataTable.isDataTable('#investitori-table')) {
        $('#investitori-table').DataTable().destroy();
    }
    
    $('#investitori-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
        },
        responsive: true,
        data: investitori,
        columns: [
            { data: 'nome' },
            { data: 'tipo' },
            { 
                data: 'settori',
                render: function(data) {
                    return data.join(', ');
                }
            },
            { data: 'fase' },
            { 
                data: 'ticket',
                render: function(data) {
                    return data.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                }
            },
            { 
                data: 'contatti',
                render: function(data) {
                    return `<a href="mailto:${data.email}"><i class="fas fa-envelope me-2"></i>${data.email}</a>`;
                }
            },
            { 
                data: null,
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-info view-investitore" data-id="${row.id}"><i class="fas fa-eye"></i></button>
                            <button type="button" class="btn btn-success save-investitore" data-id="${row.id}"><i class="fas fa-bookmark"></i></button>
                            <button type="button" class="btn btn-primary contact-investitore" data-id="${row.id}"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    `;
                }
            }
        ]
    });

    // Inizializza tabella opportunità di diversificazione
    if ($.fn.DataTable.isDataTable('#diversificazione-table')) {
        $('#diversificazione-table').DataTable().destroy();
    }
    
    $('#diversificazione-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
        },
        responsive: true,
        data: opportunitaDiversificazione,
        columns: [
            { data: 'settore' },
            { 
                data: 'potenziale',
                render: function(data) {
                    let stars = '';
                    for (let i = 0; i < data; i++) {
                        stars += '<i class="fas fa-star text-warning"></i>';
                    }
                    for (let i = data; i < 5; i++) {
                        stars += '<i class="far fa-star text-warning"></i>';
                    }
                    return stars;
                }
            },
            { 
                data: 'investimento',
                render: function(data) {
                    return data.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
                }
            },
            { 
                data: 'complessita',
                render: function(data) {
                    let dots = '';
                    for (let i = 0; i < data; i++) {
                        dots += '<i class="fas fa-circle text-danger me-1"></i>';
                    }
                    for (let i = data; i < 5; i++) {
                        dots += '<i class="far fa-circle text-danger me-1"></i>';
                    }
                    return dots;
                }
            },
            { 
                data: 'roi',
                render: function(data) {
                    return data + '%';
                }
            },
            { 
                data: null,
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-info view-diversificazione" data-id="${row.id}"><i class="fas fa-eye"></i></button>
                            <button type="button" class="btn btn-success analyze-diversificazione" data-id="${row.id}"><i class="fas fa-chart-line"></i></button>
                        </div>
                    `;
                }
            }
        ]
    });
}

/**
 * Inizializza il calendario delle scadenze
 */
function initCalendar() {
    const calendarEl = document.getElementById('scadenze-calendar');
    if (!calendarEl) return;
    
    const events = bandi.map(bando => {
        return {
            title: bando.titolo,
            start: bando.scadenza,
            extendedProps: {
                id: bando.id,
                ente: bando.ente,
                categoria: bando.categoria
            }
        };
    });
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'it',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listMonth'
        },
        events: events,
        eventClick: function(info) {
            const bandoId = info.event.extendedProps.id;
            showBandoDetails(bandoId);
        }
    });
    
    calendar.render();
}

/**
 * Inizializza il calcolatore ROI
 */
function initROICalculator() {
    $('#roi-calculator-form').on('submit', function(e) {
        e.preventDefault();
        
        const investimento = parseFloat($('#roi-investimento').val());
        const ricavi = parseFloat($('#roi-ricavi').val());
        const costi = parseFloat($('#roi-costi').val());
        const anni = parseInt($('#roi-anni').val());
        
        const profittoAnnuale = ricavi - costi;
        const profittoTotale = profittoAnnuale * anni;
        const roi = ((profittoTotale - investimento) / investimento) * 100;
        const payback = investimento / profittoAnnuale;
        
        $('#roi-result').text(roi.toFixed(2) + '%');
        $('#payback-result').text(payback.toFixed(2) + ' anni');
        $('#profitto-result').text(profittoTotale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }));
        
        // Aggiorna il grafico
        updateROIChart(investimento, profittoAnnuale, anni);
    });
}

/**
 * Aggiorna il grafico ROI
 */
function updateROIChart(investimento, profittoAnnuale, anni) {
    const ctx = document.getElementById('roi-chart');
    
    // Distruggi il grafico esistente se presente
    if (window.roiChart) {
        window.roiChart.destroy();
    }
    
    // Crea dati per il grafico
    const labels = [];
    const investimentoData = [];
    const profittoData = [];
    
    for (let i = 0; i <= anni; i++) {
        labels.push('Anno ' + i);
        investimentoData.push(investimento);
        profittoData.push(i * profittoAnnuale);
    }
    
    // Crea nuovo grafico
    window.roiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Investimento',
                    data: investimentoData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Profitto Cumulativo',
                    data: profittoData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inizializza gli event listener
 */
function initEventListeners() {
    // Filtri bandi
    $('#bandi-categoria, #bandi-regione, #bandi-scadenza, #bandi-importo').on('change', function() {
        filterBandi();
    });
    
    // Filtri investitori
    $('#investitori-tipo, #investitori-settore, #investitori-fase, #investitori-ticket').on('change', function() {
        filterInvestitori();
    });
    
    // Pulsante aggiorna bandi
    $('#refresh-bandi').on('click', function() {
        refreshBandi();
    });
    
    // Pulsante aggiorna investitori
    $('#refresh-investitori').on('click', function() {
        refreshInvestitori();
    });
    
    // Visualizza dettagli bando
    $(document).on('click', '.view-bando', function() {
        const bandoId = $(this).data('id');
        showBandoDetails(bandoId);
    });
    
    // Visualizza dettagli investitore
    $(document).on('click', '.view-investitore', function() {
        const investitoreId = $(this).data('id');
        showInvestitoreDetails(investitoreId);
    });
    
    // Contatta investitore
    $(document).on('click', '.contact-investitore', function() {
        const investitoreId = $(this).data('id');
        prepareContactForm(investitoreId);
    });
    
    // Visualizza dettagli strategia
    $(document).on('click', '[data-bs-target="#strategiaModal"]', function() {
        const strategia = $(this).data('strategia');
        showStrategiaDetails(strategia);
    });
    
    // Form contatto investitore
    $('#contatto-investitore-form').on('submit', function(e) {
        e.preventDefault();
        sendInvestitoreContact();
    });
}

/**
 * Filtra i bandi in base ai criteri selezionati
 */
function filterBandi() {
    const categoria = $('#bandi-categoria').val();
    const regione = $('#bandi-regione').val();
    const scadenzaGiorni = $('#bandi-scadenza').val();
    const importoMinimo = $('#bandi-importo').val();
    
    let filteredBandi = bandi;
    
    if (categoria) {
        filteredBandi = filteredBandi.filter(bando => bando.categoria === categoria);
    }
    
    if (regione) {
        filteredBandi = filteredBandi.filter(bando => bando.regione === regione);
    }
    
    if (scadenzaGiorni) {
        const oggi = new Date();
        const dataLimite = new Date();
        dataLimite.setDate(oggi.getDate() + parseInt(scadenzaGiorni));
        
        filteredBandi = filteredBandi.filter(bando => {
            const scadenzaDate = new Date(bando.scadenza);
            return scadenzaDate <= dataLimite && scadenzaDate >= oggi;
        });
    }
    
    if (importoMinimo) {
        filteredBandi = filteredBandi.filter(bando => bando.importo >= parseInt(importoMinimo));
    }
    
    // Aggiorna la tabella
    $('#bandi-table').DataTable().clear().rows.add(filteredBandi).draw();
    
    // Aggiorna i bandi in evidenza
    updateBandiEvidenza(filteredBandi);
}

/**
 * Filtra gli investitori in base ai criteri selezionati
 */
function filterInvestitori() {
    const tipo = $('#investitori-tipo').val();
    const settore = $('#investitori-settore').val();
    const fase = $('#investitori-fase').val();
    const ticketMinimo = $('#investitori-ticket').val();
    
    let filteredInvestitori = investitori;
    
    if (tipo) {
        filteredInvestitori = filteredInvestitori.filter(investitore => investitore.tipo === tipo);
    }
    
    if (settore) {
        filteredInvestitori = filteredInvestitori.filter(investitore => investitore.settori.includes(settore));
    }
    
    if (fase) {
        filteredInvestitori = filteredInvestitori.filter(investitore => investitore.fase === fase);
    }
    
    if (ticketMinimo) {
        filteredInvestitori = filteredInvestitori.filter(investitore => investitore.ticket >= parseInt(ticketMinimo));
    }
    
    // Aggiorna la tabella
    $('#investitori-table').DataTable().clear().rows.add(filteredInvestitori).draw();
    
    // Aggiorna gli investitori consigliati
    updateInvestitoriConsigliati(filteredInvestitori);
}

/**
 * Aggiorna i bandi in evidenza
 */
function updateBandiEvidenza(filteredBandi) {
    const bandiEvidenzaContainer = document.getElementById('bandi-evidenza');
    if (!bandiEvidenzaContainer) return;
    
    // Ordina per scadenza (i più vicini prima)
    const bandiOrdinati = [...filteredBandi].sort((a, b) => {
        return new Date(a.scadenza) - new Date(b.scadenza);
    });
    
    // Prendi i primi 3
    const bandiEvidenza = bandiOrdinati.slice(0, 3);
    
    // Svuota il container
    bandiEvidenzaContainer.innerHTML = '';
    
    // Se non ci sono bandi
    if (bandiEvidenza.length === 0) {
        bandiEvidenzaContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> Nessun bando corrisponde ai criteri selezionati.
                </div>
            </div>
        `;
        return;
    }
    
    // Aggiungi le card dei bandi
    bandiEvidenza.forEach(bando => {
        const scadenzaDate = new Date(bando.scadenza);
        const oggi = new Date();
        const giorniMancanti = Math.ceil((scadenzaDate - oggi) / (1000 * 60 * 60 * 24));
        
        let badgeClass = 'bg-success';
        if (giorniMancanti <= 7) {
            badgeClass = 'bg-danger';
        } else if (giorniMancanti <= 30) {
            badgeClass = 'bg-warning';
        }
        
        bandiEvidenzaContainer.innerHTML += `
            <div class="col">
                <div class="card h-100">
                    <div class="card-header">
                        <span class="badge ${badgeClass}">${giorniMancanti} giorni alla scadenza</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${bando.titolo}</h5>
                        <p class="card-text">${bando.descrizione.substring(0, 100)}...</p>
                        <ul class="list-group list-group-flush mb-3">
                            <li class="list-group-item"><strong>Ente:</strong> ${bando.ente}</li>
                            <li class="list-group-item"><strong>Categoria:</strong> ${bando.categoria}</li>
                            <li class="list-group-item"><strong>Importo:</strong> ${bando.importo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</li>
                        </ul>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm w-100 view-bando" data-id="${bando.id}">
                            <i class="fas fa-info-circle me-1"></i> Dettagli
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

/**
 * Aggiorna gli investitori consigliati
 */
function updateInvestitoriConsigliati(filteredInvestitori) {
    const investitoriContainer = document.getElementById('investitori-consigliati');
    if (!investitoriContainer) return;
    
    // Prendi 3 investitori casuali
    const investitoriConsigliati = filteredInvestitori.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Svuota il container
    investitoriContainer.innerHTML = '';
    
    // Se non ci sono investitori
    if (investitoriConsigliati.length === 0) {
        investitoriContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> Nessun investitore corrisponde ai criteri selezionati.
                </div>
            </div>
        `;
        return;
    }
    
    // Aggiungi le card degli investitori
    investitoriConsigliati.forEach(investitore => {
        investitoriContainer.innerHTML += `
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${investitore.nome}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${investitore.tipo}</h6>
                        <p class="card-text">${investitore.descrizione.substring(0, 100)}...</p>
                        <ul class="list-group list-group-flush mb-3">
                            <li class="list-group-item"><strong>Settori:</strong> ${investitore.settori.join(', ')}</li>
                            <li class="list-group-item"><strong>Fase:</strong> ${investitore.fase}</li>
                            <li class="list-group-item"><strong>Ticket:</strong> ${investitore.ticket.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</li>
                        </ul>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-outline-primary btn-sm view-investitore" data-id="${investitore.id}">
                            <i class="fas fa-info-circle me-1"></i> Dettagli
                        </button>
                        <button class="btn btn-primary btn-sm contact-investitore" data-id="${investitore.id}">
                            <i class="fas fa-paper-plane me-1"></i> Contatta
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Aggiorna il select nel form di contatto
    updateInvestitoriSelect(filteredInvestitori);
}

/**
 * Aggiorna il select degli investitori nel form di contatto
 */
function updateInvestitoriSelect(investitori) {
    const select = document.getElementById('investitore-destinatario');
    if (!select) return;
    
    // Mantieni solo l'opzione predefinita
    select.innerHTML = '<option value="" selected disabled>Seleziona un investitore</option>';
    
    // Aggiungi le opzioni
    investitori.forEach(investitore => {
        select.innerHTML += `<option value="${investitore.id}">${investitore.nome} (${investitore.tipo})</option>`;
    });
}

/**
 * Mostra i dettagli di un bando
 */
function showBandoDetails(bandoId) {
    const bando = bandi.find(b => b.id === bandoId);
    if (!bando) return;
    
    const modalContent = document.getElementById('bando-modal-content');
    if (!modalContent) return;
    
    const scadenzaDate = new Date(bando.scadenza);
    const oggi = new Date();
    const giorniMancanti = Math.ceil((scadenzaDate - oggi) / (1000 * 60 * 60 * 24));
    
    let badgeClass = 'bg-success';
    if (giorniMancanti <= 7) {
        badgeClass = 'bg-danger';
    } else if (giorniMancanti <= 30) {
        badgeClass = 'bg-warning';
    }
    
    modalContent.innerHTML = `
        <div class="mb-3">
            <h4>${bando.titolo}</h4>
            <span class="badge ${badgeClass}">${giorniMancanti} giorni alla scadenza</span>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Ente:</strong> ${bando.ente}</p>
                <p><strong>Categoria:</strong> ${bando.categoria}</p>
                <p><strong>Regione:</strong> ${bando.regione}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Importo:</strong> ${bando.importo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</p>
                <p><strong>Scadenza:</strong> ${new Date(bando.scadenza).toLocaleDateString('it-IT')}</p>
                <p><strong>Pubblicato il:</strong> ${new Date(bando.pubblicazione).toLocaleDateString('it-IT')}</p>
            </div>
        </div>
        
        <div class="mb-3">
            <h5>Descrizione</h5>
            <p>${bando.descrizione}</p>
        </div>
        
        <div class="mb-3">
            <h5>Requisiti</h5>
            <ul>
                ${bando.requisiti.map(req => `<li>${req}</li>`).join('')}
            </ul>
        </div>
        
        <div class="mb-3">
            <h5>Documentazione Richiesta</h5>
            <ul>
                ${bando.documentazione.map(doc => `<li>${doc}</li>`).join('')}
            </ul>
        </div>
        
        <div class="mb-3">
            <a href="${bando.link}" target="_blank" class="btn btn-outline-primary">
                <i class="fas fa-external-link-alt me-1"></i> Visita il sito ufficiale
            </a>
        </div>
    `;
    
    // Mostra il modal
    const bandoModal = new bootstrap.Modal(document.getElementById('bandoModal'));
    bandoModal.show();
    
    // Imposta l'azione del pulsante
    document.getElementById('bando-action-btn').onclick = function() {
        partecipaBando(bandoId);
    };
}

/**
 * Mostra i dettagli di un investitore
 */
function showInvestitoreDetails(investitoreId) {
    const investitore = investitori.find(i => i.id === investitoreId);
    if (!investitore) return;
    
    const modalContent = document.getElementById('investitore-modal-content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="mb-3">
            <h4>${investitore.nome}</h4>
            <span class="badge bg-primary">${investitore.tipo}</span>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Settori:</strong> ${investitore.settori.join(', ')}</p>
                <p><strong>Fase:</strong> ${investitore.fase}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Ticket:</strong> ${investitore.ticket.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</p>
                <p><strong>Email:</strong> <a href="mailto:${investitore.contatti.email}">${investitore.contatti.email}</a></p>
                <p><strong>Sito Web:</strong> <a href="${investitore.contatti.website}" target="_blank">${investitore.contatti.website}</a></p>
            </div>
        </div>
        
        <div class="mb-3">
            <h5>Descrizione</h5>
            <p>${investitore.descrizione}</p>
        </div>
        
        <div class="mb-3">
            <h5>Criteri di Investimento</h5>
            <ul>
                ${investitore.criteri.map(criterio => `<li>${criterio}</li>`).join('')}
            </ul>
        </div>
        
        <div class="mb-3">
            <h5>Portfolio</h5>
            <ul>
                ${investitore.portfolio.map(azienda => `<li>${azienda}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Mostra il modal
    const investitoreModal = new bootstrap.Modal(document.getElementById('investitoreModal'));
    investitoreModal.show();
    
    // Imposta l'azione del pulsante
    document.getElementById('investitore-action-btn').onclick = function() {
        prepareContactForm(investitoreId);
        investitoreModal.hide();
    };
}

/**
 * Prepara il form di contatto per un investitore
 */
function prepareContactForm(investitoreId) {
    const investitore = investitori.find(i => i.id === investitoreId);
    if (!investitore) return;
    
    // Seleziona l'investitore nel form
    const select = document.getElementById('investitore-destinatario');
    if (select) {
        select.value = investitoreId;
    }
    
    // Scrolla alla sezione del form
    document.querySelector('#contatto-investitore-form').scrollIntoView({ behavior: 'smooth' });
    
    // Focus sul campo oggetto
    document.getElementById('investitore-oggetto').focus();
}

/**
 * Invia il form di contatto per un investitore
 */
function sendInvestitoreContact() {
    // Qui si implementerebbe l'invio effettivo del messaggio
    // Per ora mostriamo solo un alert di successo
    
    alert('Messaggio inviato con successo!');
    
    // Reset del form
    document.getElementById('contatto-investitore-form').reset();
}

/**
 * Mostra i dettagli di una strategia di monetizzazione
 */
function showStrategiaDetails(strategia) {
    const modalContent = document.getElementById('strategia-modal-content');
    if (!modalContent) return;
    
    let content = '';
    
    switch(strategia) {
        case 'pubblicita':
            content = `
                <div class="mb-3">
                    <h4>Monetizzazione tramite Pubblicitu00e0</h4>
                </div>
                
                <div class="mb-3">
                    <p>La monetizzazione tramite pubblicitu00e0 consente di generare entrate mostrando annunci sul tuo sito web o app. Ecco come implementarla:</p>
                </div>
                
                <div class="mb-3">
                    <h5>Piattaforme Principali</h5>
                    <ul>
                        <li><strong>Google AdSense:</strong> La piattaforma pubblicitaria piu00f9 diffusa, facile da implementare.</li>
                        <li><strong>Facebook Audience Network:</strong> Ideale se hai un'app mobile.</li>
                        <li><strong>Media.net:</strong> Alternativa a Google AdSense con annunci contestuali.</li>
                    </ul>
                </div>
                
                <div class="mb-3">
                    <h5>Requisiti</h5>
                    <ul>
                        <li>Sito web o app con traffico significativo (idealmente 10.000+ visite mensili)</li>
                        <li>Contenuti originali e di qualitu00e0</li>
                        <li>Conformitu00e0 alle normative sulla privacy (GDPR, Cookie Law)</li>
                    </ul>
                </div>
                
                <div class="mb-3">
                    <h5>Potenziale di Guadagno</h5>
                    <p>Il guadagno dipende da vari fattori:</p>
                    <ul>
                        <li>Volume di traffico</li>
                        <li>Nicchia di mercato (alcuni settori pagano di piu00f9)</li>
                        <li>Posizionamento degli annunci</li>
                        <li>Provenienza geografica dei visitatori</li>
                    </ul>
                    <p>In media, si puu00f2 guadagnare tra 1u20ac e 10u20ac per 1.000 visualizzazioni di pagina.</p>
                </div>
            `;
            break;
            
        case 'affiliazioni':
            content = `
                <div class="mb-3">
                    <h4>Monetizzazione tramite Affiliazioni</h4>
                </div>
                
                <div class="mb-3">
                    <p>Il marketing di affiliazione consiste nel promuovere prodotti o servizi di altre aziende e guadagnare una commissione per ogni vendita generata. Ecco come implementarlo:</p>
                </div>
                
                <div class="mb-3">
                    <h5>Piattaforme Principali</h5>
                    <ul>
                        <li><strong>Amazon Associates:</strong> Il programma di affiliazione piu00f9 grande al mondo.</li>
                        <li><strong>Awin:</strong> Rete di affiliazione con molti brand italiani ed europei.</li>
                        <li><strong>Commission Junction:</strong> Piattaforma con brand premium e commissioni elevate.</li>
                    </ul>
                </div>
                
                <div class="mb-3">
                    <h5>Requisiti</h5>
                    <ul>
                        <li>Pubblico di riferimento in linea con i prodotti promossi</li>
                        <li>Contenuti di qualitu00e0 che generano fiducia</li>
                        <li>Strategia di marketing efficace</li>
                    </ul>
                </div>
                
                <div class="mb-3">
                    <h5>Potenziale di Guadagno</h5>
                    <p>Le commissioni variano notevolmente:</p>
                    <ul>
                        <li>Prodotti fisici: 3-10% del valore dell'ordine</li>
                        <li>Prodotti digitali: 30-70% del valore</li>
                        <li>Servizi: 10-50% o commissioni fisse</li>
                    </ul>
                    <p>Un affiliato esperto puu00f2 guadagnare da centinaia a migliaia di euro al mese.</p>
                </div>
            `;
            break;
            
        case 'abbonamenti':
            content = `
                <div class="mb-3">
                    <h4>Monetizzazione tramite Abbonamenti</h4>
                </div>
                
                <div class="mb-3">
                    <p>Il modello di abbonamento offre un flusso di entrate ricorrenti e prevedibili. Ecco come implementarlo:</p>
                </div>
                
                <div class="mb-3">
                    <h5>Tipologie di Abbonamento</h5>
                    <ul>
                        <li><strong>Freemium:</strong> Versione base gratuita + funzionalitu00e0 premium a pagamento.</li>
                        <li><strong>Tiered:</strong> Diversi livelli di servizio a prezzi crescenti.</li>
                        <li><strong>Accesso esclusivo:</strong> Contenuti o servizi disponibili solo agli abbonati.</li>
                    </ul>
                </div>
                
                <div class="mb-3">
                    <h5>Requisiti</h5>
                    <ul>
                        <li>Valore continuo e percepibile nel tempo</li>
                        <li>Aggiornamenti e miglioramenti regolari</li>
                        <li>Eccellente servizio clienti</li>
                        <li>Sistema di pagamento sicuro e affidabile</li>
                    </ul>
                </div>
                
                <div class="mb-3">
                    <h5>Potenziale di Guadagno</h5>
                    <p>Dipende dal prezzo dell'abbonamento e dal numero di abbonati:</p>
                    <ul>
                        <li>100 abbonati a 10u20ac/mese = 1.000u20ac/mese</li>
                        <li>1.000 abbonati a 10u20ac/mese = 10.000u20ac/mese</li>
                    </ul>
                    <p>Il vantaggio principale u00e8 la prevedibilitu00e0 delle entrate e l'aumento del valore del cliente nel tempo.</p>
                </div>
            `;
            break;
            
        default:
            content = '<p>Dettagli non disponibili per questa strategia.</p>';
    }
    
    modalContent.innerHTML = content;
    
    // Mostra il modal
    const strategiaModal = new bootstrap.Modal(document.getElementById('strategiaModal'));
    strategiaModal.show();
}

/**
 * Partecipa a un bando
 */
function partecipaBando(bandoId) {
    const bando = bandi.find(b => b.id === bandoId);
    if (!bando) return;
    
    // Qui si implementerebbe la logica per partecipare al bando
    // Per ora mostriamo solo un alert
    
    alert(`Hai avviato la procedura di partecipazione al bando "${bando.titolo}". Un consulente ti contatteru00e0 per assisterti nella compilazione della domanda.`);
    
    // Chiudi il modal
    const bandoModal = bootstrap.Modal.getInstance(document.getElementById('bandoModal'));
    if (bandoModal) {
        bandoModal.hide();
    }
}

/**
 * Aggiorna i bandi da fonti esterne
 */
function refreshBandi() {
    // Qui si implementerebbe la logica per aggiornare i bandi da API esterne
    // Per ora simuliamo un aggiornamento
    
    // Mostra spinner
    const button = document.getElementById('refresh-bandi');
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Aggiornamento...';
    button.disabled = true;
    
    // Simula una richiesta API
    setTimeout(() => {
        // Ripristina il pulsante
        button.innerHTML = originalContent;
        button.disabled = false;
        
        // Mostra messaggio di successo
        alert('Bandi aggiornati con successo!');
        
        // Aggiorna la tabella
        $('#bandi-table').DataTable().ajax.reload();
    }, 2000);
}

/**
 * Aggiorna gli investitori da fonti esterne
 */
function refreshInvestitori() {
    // Qui si implementerebbe la logica per aggiornare gli investitori da API esterne
    // Per ora simuliamo un aggiornamento
    
    // Mostra spinner
    const button = document.getElementById('refresh-investitori');
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Aggiornamento...';
    button.disabled = true;
    
    // Simula una richiesta API
    setTimeout(() => {
        // Ripristina il pulsante
        button.innerHTML = originalContent;
        button.disabled = false;
        
        // Mostra messaggio di successo
        alert('Investitori aggiornati con successo!');
        
        // Aggiorna la tabella
        $('#investitori-table').DataTable().ajax.reload();
    }, 2000);
}

/**
 * Inizializza i dati di esempio per i bandi
 */
function initSampleBandi() {
    bandi = [
        {
            id: 'bando1',
            titolo: 'Bando Innovazione Digitale PMI 2025',
            ente: 'Ministero delle Imprese e del Made in Italy',
            categoria: 'digitale',
            regione: 'nazionale',
            importo: 500000,
            scadenza: '2025-06-30',
            pubblicazione: '2025-01-15',
            descrizione: 'Contributi a fondo perduto per progetti di innovazione digitale nelle PMI italiane. Il bando mira a sostenere la transizione digitale delle piccole e medie imprese attraverso l\'adozione di tecnologie avanzate e la digitalizzazione dei processi produttivi.',
            requisiti: [
                'Essere una PMI secondo la definizione UE',
                'Avere sede operativa in Italia',
                'Essere iscritti al Registro delle Imprese',
                'Essere in regola con gli obblighi contributivi'
            ],
            documentazione: [
                'Progetto dettagliato di innovazione digitale',
                'Business plan con analisi costi-benefici',
                'Preventivi di spesa',
                'Dichiarazione De Minimis'
            ],
            link: 'https://www.mise.gov.it/bandi/'
        },
        {
            id: 'bando2',
            titolo: 'Bando Green Economy 2025',
            ente: 'Regione Lombardia',
            categoria: 'green',
            regione: 'lombardia',
            importo: 200000,
            scadenza: '2025-05-15',
            pubblicazione: '2025-02-01',
            descrizione: 'Finanziamenti per progetti di sostenibilità ambientale e economia circolare. Il bando sostiene le imprese che intendono investire in progetti di riduzione dell\'impatto ambientale, efficientamento energetico e sviluppo di prodotti e servizi sostenibili.',
            requisiti: [
                'Sede operativa in Lombardia',
                'Almeno 3 anni di attività',
                'Fatturato minimo di 300.000€ annui',
                'Progetto con impatto ambientale misurabile'
            ],
            documentazione: [
                'Piano di sostenibilità ambientale',
                'Certificazioni ambientali (se presenti)',
                'Analisi dell\'impatto ambientale attuale',
                'Preventivi dettagliati'
            ],
            link: 'https://www.regione.lombardia.it/bandi/'
        },
        {
            id: 'bando3',
            titolo: 'Bando Startup Innovative 2025',
            ente: 'Invitalia',
            categoria: 'startup',
            regione: 'nazionale',
            importo: 150000,
            scadenza: '2025-04-20',
            pubblicazione: '2025-01-20',
            descrizione: 'Finanziamenti per startup innovative ad alto contenuto tecnologico. Il bando offre un mix di contributi a fondo perduto e finanziamenti agevolati per sostenere la nascita e lo sviluppo di startup innovative in settori ad alto potenziale di crescita.',
            requisiti: [
                'Essere iscritti al registro delle startup innovative',
                'Costituzione da non più di 36 mesi',
                'Team con competenze specifiche nel settore',
                'Idea innovativa con potenziale di scalabilità'
            ],
            documentazione: [
                'Business plan dettagliato',
                'Pitch deck',
                'CV dei fondatori',
                'Eventuale prototipo o MVP'
            ],
            link: 'https://www.invitalia.it/bandi/'
        },
        {
            id: 'bando4',
            titolo: 'Bando Internazionalizzazione PMI 2025',
            ente: 'ICE - Agenzia per la promozione all\'estero',
            categoria: 'export',
            regione: 'nazionale',
            importo: 100000,
            scadenza: '2025-07-10',
            pubblicazione: '2025-03-01',
            descrizione: 'Contributi per progetti di espansione sui mercati esteri. Il bando supporta le PMI italiane nei processi di internazionalizzazione attraverso contributi per partecipazione a fiere internazionali, missioni commerciali, e-commerce per l\'export e consulenze specialistiche.',
            requisiti: [
                'Essere una PMI secondo la definizione UE',
                'Avere un fatturato minimo di 500.000€',
                'Avere un prodotto/servizio già commercializzato in Italia',
                'Piano di internazionalizzazione concreto'
            ],
            documentazione: [
                'Piano di internazionalizzazione',
                'Analisi dei mercati target',
                'Preventivi per fiere o consulenze',
                'Documentazione societaria'
            ],
            link: 'https://www.ice.it/bandi/'
        },
        {
            id: 'bando5',
            titolo: 'Bando Ricerca e Sviluppo 2025',
            ente: 'Ministero dell\'Università e della Ricerca',
            categoria: 'ricerca',
            regione: 'nazionale',
            importo: 800000,
            scadenza: '2025-09-30',
            pubblicazione: '2025-02-15',
            descrizione: 'Finanziamenti per progetti di ricerca industriale e sviluppo sperimentale. Il bando sostiene progetti di ricerca applicata e sviluppo sperimentale finalizzati alla realizzazione di nuovi prodotti, processi o servizi o al notevole miglioramento di prodotti, processi o servizi esistenti.',
            requisiti: [
                'Imprese di qualsiasi dimensione',
                'Possibilità di collaborazione con università o enti di ricerca',
                'Progetto di ricerca con TRL iniziale 3-4',
                'Durata massima del progetto: 36 mesi'
            ],
            documentazione: [
                'Progetto di ricerca dettagliato',
                'Piano di sfruttamento dei risultati',
                'CV del team di ricerca',
                'Accordi di collaborazione con enti di ricerca (se presenti)'
            ],
            link: 'https://www.mur.gov.it/bandi/'
        }
    ];
}

/**
 * Inizializza i dati di esempio per gli investitori
 */
function initSampleInvestitori() {
    investitori = [
        {
            id: 'inv1',
            nome: 'TechVentures Capital',
            tipo: 'venture-capital',
            settori: ['tech', 'fintech', 'ai'],
            fase: 'early',
            ticket: 500000,
            descrizione: 'Fondo di venture capital specializzato in startup tecnologiche con forte potenziale di crescita. TechVentures investe principalmente in fase early stage e offre, oltre al capitale, supporto strategico e accesso a una rete di partner industriali.',
            criteri: [
                'Tecnologia proprietaria o vantaggio competitivo chiaro',
                'Mercato potenziale di almeno 1 miliardo di euro',
                'Team con competenze complementari',
                'Traction iniziale dimostrata'
            ],
            portfolio: [
                'AI Solutions (Intelligenza Artificiale)',
                'FinTech Revolution (Fintech)',
                'CloudSecure (Cybersecurity)',
                'DataInsight (Big Data)'
            ],
            contatti: {
                email: 'investments@techventures.it',
                website: 'https://www.techventures.it'
            }
        },
        {
            id: 'inv2',
            nome: 'GreenFuture Investments',
            tipo: 'private-equity',
            settori: ['green', 'food', 'manifattura'],
            fase: 'growth',
            ticket: 2000000,
            descrizione: 'Fondo di private equity focalizzato su aziende sostenibili e progetti green economy. GreenFuture investe in aziende con modelli di business sostenibili che contribuiscono positivamente all\'ambiente e alla società.',
            criteri: [
                'Impatto ambientale positivo misurabile',
                'Fatturato minimo di 2 milioni di euro',
                'Margini operativi positivi',
                'Potenziale di espansione internazionale'
            ],
            portfolio: [
                'EcoPackaging (Imballaggi sostenibili)',
                'BioEnergy (Energie rinnovabili)',
                'OrganicFood (Alimentare biologico)',
                'GreenBuilding (Edilizia sostenibile)'
            ],
            contatti: {
                email: 'info@greenfuture.it',
                website: 'https://www.greenfuture-investments.it'
            }
        },
        {
            id: 'inv3',
            nome: 'Angelo Innovatori',
            tipo: 'business-angel',
            settori: ['tech', 'ecommerce', 'saas'],
            fase: 'seed',
            ticket: 100000,
            descrizione: 'Network di business angel con esperienza imprenditoriale nel settore tech e digitale. Angelo Innovatori offre non solo capitale ma anche mentorship, networking e supporto operativo alle startup in fase iniziale.',
            criteri: [
                'Fondatori con forte determinazione e visione',
                'Prodotto minimo funzionante (MVP)',
                'Modello di business scalabile',
                'Settore in crescita'
            ],
            portfolio: [
                'ShopNow (E-commerce)',
                'TaskManager (SaaS)',
                'MobileApps (App Development)',
                'DigitalMarketing (MarTech)'
            ],
            contatti: {
                email: 'contatto@angeloinnovatori.it',
                website: 'https://www.angeloinnovatori.it'
            }
        },
        {
            id: 'inv4',
            nome: 'MedTech Accelerator',
            tipo: 'incubatori',
            settori: ['biotech', 'tech'],
            fase: 'seed',
            ticket: 150000,
            descrizione: 'Acceleratore specializzato in startup del settore medtech e biotecnologico. MedTech Accelerator offre un programma di accelerazione di 6 mesi, spazi di lavoro, mentorship e accesso a una rete di ospedali e cliniche per testare le soluzioni.',
            criteri: [
                'Soluzione innovativa nel settore sanitario',
                'Team con competenze tecniche e mediche',
                'Potenziale di miglioramento della qualità della vita dei pazienti',
                'Modello di business sostenibile'
            ],
            portfolio: [
                'HealthMonitor (Dispositivi medici)',
                'GenomicResearch (Biotecnologia)',
                'PatientCare (Software medico)',
                'DiagnosticAI (Diagnostica)'
            ],
            contatti: {
                email: 'programs@medtechaccelerator.it',
                website: 'https://www.medtechaccelerator.it'
            }
        },
        {
            id: 'inv5',
            nome: 'Digital Crowdfunding',
            tipo: 'crowdfunding',
            settori: ['tech', 'ecommerce', 'food', 'green'],
            fase: 'early',
            ticket: 50000,
            descrizione: 'Piattaforma di equity crowdfunding per progetti innovativi e startup. Digital Crowdfunding permette a piccoli investitori di partecipare al capitale di startup promettenti, democratizzando l\'accesso agli investimenti in innovazione.',
            criteri: [
                'Pitch convincente e chiaro',
                'Prototipo o prodotto già sul mercato',
                'Valutazione pre-money ragionevole',
                'Storia coinvolgente da raccontare agli investitori'
            ],
            portfolio: [
                'SmartHome (Domotica)',
                'FoodDelivery (Food Tech)',
                'SustainableFashion (Moda sostenibile)',
                'UrbanMobility (Mobilità)'
            ],
            contatti: {
                email: 'progetti@digitalcrowdfunding.it',
                website: 'https://www.digitalcrowdfunding.it'
            }
        }
    ];
}

/**
 * Inizializza i dati di esempio per le opportunità di diversificazione
 */
function initSampleOpportunitaDiversificazione() {
    opportunitaDiversificazione = [
        {
            id: 'div1',
            settore: 'E-commerce B2B',
            potenziale: 4,
            investimento: 50000,
            complessita: 3,
            roi: 120
        },
        {
            id: 'div2',
            settore: 'Servizi Cloud',
            potenziale: 5,
            investimento: 100000,
            complessita: 4,
            roi: 150
        },
        {
            id: 'div3',
            settore: 'Prodotti Sostenibili',
            potenziale: 4,
            investimento: 80000,
            complessita: 3,
            roi: 90
        },
        {
            id: 'div4',
            settore: 'App Mobile',
            potenziale: 3,
            investimento: 60000,
            complessita: 4,
            roi: 100
        },
        {
            id: 'div5',
            settore: 'Formazione Online',
            potenziale: 4,
            investimento: 30000,
            complessita: 2,
            roi: 130
        }
    ];
}

/**
 * Salva i bandi nel localStorage
 */
function saveBandi() {
    localStorage.setItem('bandi', JSON.stringify(bandi));
}

/**
 * Salva gli investitori nel localStorage
 */
function saveInvestitori() {
    localStorage.setItem('investitori', JSON.stringify(investitori));
}

/**
 * Salva le opportunità di diversificazione nel localStorage
 */
function saveOpportunitaDiversificazione() {
    localStorage.setItem('opportunitaDiversificazione', JSON.stringify(opportunitaDiversificazione));
}

// Inizializza la pagina al caricamento del documento
$(document).ready(function() {
    initGrowthOpportunitiesPage();
});
