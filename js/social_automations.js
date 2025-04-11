/**
 * Social Automations - Gestione delle automazioni per LinkedIn e altri social network
 * PMI Contatti Manager
 */

// Configurazione globale
const AUTOMATION_CONFIG = {
    maxConcurrentTasks: 3,
    defaultDelay: 2000, // 2 secondi tra le azioni per evitare blocchi
    platforms: ['LinkedIn', 'Facebook', 'Instagram', 'Twitter'],
    dataExportFormats: ['CSV', 'JSON', 'Google Sheets']
};

// Stato dell'applicazione
const automationState = {
    workflows: [],
    activeAutomations: [],
    results: {}
};

/**
 * Inizializza il modulo di automazione
 */
function initSocialAutomations() {
    console.log('Inizializzazione modulo automazioni social...');
    
    // Carica le automazioni salvate
    loadSavedAutomations();
    
    // Inizializza gli event listener
    initEventListeners();
    
    // Inizializza i listener del modal di automazione
    // Il modal è già presente nell'HTML, quindi non è necessario caricarlo via AJAX
    initAutomationModalListeners();
    
    // Inizializza la tabella delle automazioni
    updateAutomationTable();
}

/**
 * Carica le automazioni salvate dal localStorage
 */
function loadSavedAutomations() {
    try {
        const savedAutomations = localStorage.getItem('socialAutomations');
        if (savedAutomations) {
            automationState.activeAutomations = JSON.parse(savedAutomations);
            console.log(`Caricate ${automationState.activeAutomations.length} automazioni dal localStorage`);
        }
    } catch (error) {
        console.error('Errore nel caricamento delle automazioni:', error);
        showNotification('Errore nel caricamento delle automazioni', 'error');
    }
}

/**
 * Inizializza il builder per la creazione di workflow
 */
function initAutomationBuilder() {
    const builder = document.getElementById('automation-builder');
    if (!builder) return;

    // Implementa drag and drop per gli elementi del workflow
    const draggableItems = document.querySelectorAll('.automation-step');
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    builder.addEventListener('dragover', handleDragOver);
    builder.addEventListener('drop', handleDrop);
}

/**
 * Gestisce l'inizio del drag di un elemento
 * @param {DragEvent} e - Evento drag
 */
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-step-type'));
    e.target.classList.add('dragging');
}

/**
 * Gestisce la fine del drag di un elemento
 * @param {DragEvent} e - Evento drag
 */
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

/**
 * Gestisce il dragover su un'area
 * @param {DragEvent} e - Evento drag
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

/**
 * Gestisce il drop di un elemento
 * @param {DragEvent} e - Evento drag
 */
function handleDrop(e) {
    e.preventDefault();
    const stepType = e.dataTransfer.getData('text/plain');
    
    // Crea un nuovo step nel workflow
    createWorkflowStep(stepType, e.clientX, e.clientY);
}

/**
 * Crea un nuovo step nel workflow
 * @param {string} type - Tipo di step
 * @param {number} x - Posizione X
 * @param {number} y - Posizione Y
 */
function createWorkflowStep(type, x, y) {
    // Implementazione della creazione di uno step nel workflow
    console.log(`Creato step di tipo ${type} alle coordinate (${x}, ${y})`);
    
    // Qui andrebbe implementata la logica per creare visivamente lo step
    // e aggiungerlo al workflow corrente
    
    // Per ora mostriamo solo una notifica
    showNotification(`Step di tipo ${type} aggiunto al workflow`, 'success');
}

/**
 * Inizializza la tabella delle automazioni attive
 */
function initAutomationTable() {
    const table = document.getElementById('automations-table');
    if (!table) return;
    
    // Inizializza DataTable
    const dataTable = initDataTable('automations-table', {
        responsive: true,
        order: [[4, 'desc']], // Ordina per ultima esecuzione (decrescente)
        columnDefs: [
            { targets: -1, orderable: false } // Disabilita ordinamento sulla colonna azioni
        ]
    });
    
    // Aggiorna la tabella con i dati salvati
    updateAutomationTable();
}

/**
 * Aggiorna la tabella delle automazioni con i dati correnti
 */
function updateAutomationTable() {
    // Implementazione dell'aggiornamento della tabella
    // Qui andrebbe la logica per popolare la tabella con i dati reali
    console.log('Tabella automazioni aggiornata');
}

/**
 * Inizializza gli event listener per i pulsanti e le azioni
 */
function initEventListeners() {
    console.log('Inizializzazione event listener per le automazioni...');
    
    // Listener per il pulsante "Nuova Automazione"
    const newAutomationBtn = document.querySelector('button[data-bs-target="#automationModal"]');
    if (newAutomationBtn) {
        console.log('Trovato pulsante nuova automazione');
        newAutomationBtn.addEventListener('click', () => {
            // Prepara il modal per una nuova automazione
            prepareNewAutomationModal();
        });
    } else {
        console.warn('Pulsante nuova automazione non trovato');
    }
    
    // Delegazione eventi per TUTTI i pulsanti "Configura"
    document.addEventListener('click', (e) => {
        console.log('Click rilevato:', e.target.tagName, e.target.textContent.trim());
        
        // Verifica se l'elemento cliccato è un bottone con testo "Configura"
        if (e.target.tagName === 'BUTTON' && e.target.textContent.trim() === 'Configura') {
            console.log('Bottone Configura cliccato!');
            e.preventDefault();
            
            // Trova la card contenitore
            const card = e.target.closest('.card');
            if (card) {
                // Trova il titolo della card
                const cardTitle = card.querySelector('.card-title');
                if (cardTitle) {
                    const moduleType = cardTitle.textContent.trim();
                    console.log(`Click su pulsante configura per ${moduleType}`);
                    
                    configureModule(moduleType);
                } else {
                    console.error('Titolo della card non trovato');
                }
            } else {
                console.error('Card non trovata per il pulsante');
            }
        }
        
        // Pulsanti nella tabella automazioni
        if (e.target.closest('.btn-outline-info')) {
            // Visualizza risultati
            e.preventDefault();
            const row = e.target.closest('tr');
            if (row && row.cells && row.cells.length > 0) {
                const automationName = row.cells[0].textContent;
                viewAutomationResults(automationName);
            }
        } else if (e.target.closest('.btn-outline-primary')) {
            // Modifica automazione
            e.preventDefault();
            const row = e.target.closest('tr');
            if (row && row.cells && row.cells.length > 0) {
                const automationName = row.cells[0].textContent;
                editAutomation(automationName);
            }
        } else if (e.target.closest('.btn-outline-danger')) {
            // Elimina automazione
            e.preventDefault();
            const row = e.target.closest('tr');
            if (row && row.cells && row.cells.length > 0) {
                const automationName = row.cells[0].textContent;
                deleteAutomation(automationName);
            }
        }
    });
}

/**
 * Prepara il modal per la creazione di una nuova automazione
 */
function prepareNewAutomationModal() {
    // Implementazione della preparazione del modal
    console.log('Preparazione modal per nuova automazione');
    
    // Qui andrebbe la logica per resettare e preparare il modal
    // per la creazione di una nuova automazione
}

/**
 * Configura un modulo specifico
 * @param {string} moduleType - Tipo di modulo da configurare
 */
function configureModule(moduleType) {
    // Il modal è già presente nell'HTML, quindi non è necessario caricarlo via AJAX
    // Mostriamo il modal e configuriamo i campi in base al tipo di modulo
    const modal = document.getElementById('automationModal');
    if (!modal) {
        console.error('Modal non trovato nel DOM');
        showNotification('Errore: Modal non trovato. Ricarica la pagina.', 'danger');
        return;
    }
    
    // Mostra il modal prima di manipolare il form
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Aspetta che il modal sia completamente visibile prima di manipolare il form
    modal.addEventListener('shown.bs.modal', function() {
        // Reset form
        const form = document.getElementById('automation-form');
        if (form) {
            form.reset();
        } else {
            console.warn('Form automation-form non trovato');
        }
        
        // Nascondi tutti i contenitori di configurazione specifici
        document.querySelectorAll('.type-config').forEach(el => {
            el.classList.add('d-none');
        });
        
        // Mostra il primo step
        document.querySelectorAll('.automation-step').forEach(el => {
            el.classList.add('d-none');
        });
        
        const stepGeneral = document.getElementById('step-general');
        if (stepGeneral) {
            stepGeneral.classList.remove('d-none');
        }
        
        // Preseleziona il tipo di automazione se specificato
        if (moduleType) {
            const automationType = document.getElementById('automation-type');
            if (automationType) {
                automationType.value = moduleType;
            }
        }
    }, { once: true }); // L'evento viene gestito una sola volta
}

/**
 * Visualizza i risultati di un'automazione
 * @param {string} automationName - Nome dell'automazione
 */
function viewAutomationResults(automationName) {
    console.log(`Visualizzazione risultati per: ${automationName}`);
    
    // Qui andrebbe la logica per visualizzare i risultati dell'automazione
    // Per ora mostriamo solo una notifica
    showNotification(`Visualizzazione risultati per ${automationName}`, 'info');
}

/**
 * Modifica un'automazione esistente
 * @param {string} automationName - Nome dell'automazione
 */
function editAutomation(automationName) {
    console.log(`Modifica automazione: ${automationName}`);
    
    // Qui andrebbe la logica per modificare l'automazione
    // Per ora mostriamo solo una notifica
    showNotification(`Modifica automazione ${automationName}`, 'info');
}

/**
 * Elimina un'automazione
 * @param {string} automationName - Nome dell'automazione
 */
function deleteAutomation(automationName) {
    console.log(`Eliminazione automazione: ${automationName}`);
    
    // Chiedi conferma prima di eliminare
    if (confirm(`Sei sicuro di voler eliminare l'automazione "${automationName}"?`)) {
        // Qui andrebbe la logica per eliminare l'automazione
        // Per ora mostriamo solo una notifica
        showNotification(`Automazione ${automationName} eliminata`, 'success');
    }
}

/**
 * Inizializza i tooltip per gli elementi dell'interfaccia
 */
function initTooltips() {
    // Inizializza i tooltip di Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    console.log('Tooltip inizializzati');
}

/**
 * Inizializza gli event listener per il modal delle automazioni
 */
function initAutomationModalListeners() {
    // Gestione dei passaggi del form
    $('.next-step').click(function() {
        const currentStep = $(this).closest('.automation-step');
        const nextStep = currentStep.next('.automation-step');
        
        // Se siamo nel primo step, mostra la configurazione specifica per il tipo selezionato
        if (currentStep.attr('id') === 'step-general') {
            const selectedType = $('#automation-type').val();
            $('.type-config').addClass('d-none');
            $(`#config-${selectedType}`).removeClass('d-none');
        }
        
        // Se siamo nel secondo step e il formato di esportazione è Google Sheets, mostra le opzioni specifiche
        if (currentStep.attr('id') === 'step-specific') {
            const exportFormat = $('#export-format').val();
            if (exportFormat === 'google-sheets') {
                $('#google-sheets-options').removeClass('d-none');
            } else {
                $('#google-sheets-options').addClass('d-none');
            }
        }
        
        currentStep.addClass('d-none');
        nextStep.removeClass('d-none');
    });
    
    $('.prev-step').click(function() {
        const currentStep = $(this).closest('.automation-step');
        const prevStep = currentStep.prev('.automation-step');
        
        currentStep.addClass('d-none');
        prevStep.removeClass('d-none');
    });
    
    // Gestione del formato di esportazione
    $('#export-format').change(function() {
        const format = $(this).val();
        if (format === 'google-sheets') {
            $('#google-sheets-options').removeClass('d-none');
        } else {
            $('#google-sheets-options').addClass('d-none');
        }
    });
    
    // Gestione dell'opzione per il foglio Google
    $('#create-new-sheet').change(function() {
        if ($(this).is(':checked')) {
            $('#existing-sheet-container').addClass('d-none');
        } else {
            $('#existing-sheet-container').removeClass('d-none');
        }
    });
    
    // Salvataggio dell'automazione
    $('#save-automation').click(function() {
        saveAutomation();
    });
}

/**
 * Salva una nuova automazione
 */
function saveAutomation() {
    // Raccoglie i dati dal form
    const automationData = {
        name: $('#automation-name').val(),
        type: $('#automation-type').val(),
        platform: $('#automation-platform').val(),
        schedule: $('#automation-schedule').val(),
        description: $('#automation-description').val(),
        config: {},
        export: {
            format: $('#export-format').val(),
            filename: $('#export-filename').val() || 'export_' + new Date().getTime(),
            autoDownload: $('#export-auto-download').is(':checked'),
            notify: $('#export-notify').is(':checked')
        },
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Aggiunge la configurazione specifica in base al tipo
    switch (automationData.type) {
        case 'profile_scraper':
            automationData.config = {
                keywords: $('#profile-keywords').val(),
                location: $('#profile-location').val(),
                industry: $('#profile-industry').val(),
                companySize: $('#profile-company-size').val(),
                limit: parseInt($('#profile-limit').val()),
                dataFields: Array.from($('#profile-data-fields option:selected')).map(opt => opt.value)
            };
            break;
        case 'auto_connect':
            automationData.config = {
                searchCriteria: $('#connect-search-criteria').val(),
                limit: parseInt($('#connect-limit').val()),
                message: $('#connect-message').val(),
                dailyLimit: parseInt($('#connect-daily-limit').val()),
                delay: parseInt($('#connect-delay').val())
            };
            break;
        // Altri casi per gli altri tipi di automazione
    }
    
    // Aggiunge le opzioni di Google Sheets se necessario
    if (automationData.export.format === 'google-sheets') {
        automationData.export.createNewSheet = $('#create-new-sheet').is(':checked');
        if (!automationData.export.createNewSheet) {
            automationData.export.existingSheetId = $('#existing-sheet-id').val();
        }
    }
    
    // Salva l'automazione nel localStorage
    let automations = JSON.parse(localStorage.getItem('socialAutomations') || '[]');
    automations.push(automationData);
    localStorage.setItem('socialAutomations', JSON.stringify(automations));
    
    // Chiude il modal e mostra una notifica
    $('#automationModal').modal('hide');
    showNotification(`Automazione "${automationData.name}" creata con successo`, 'success');
    
    // Aggiorna la tabella delle automazioni
    updateAutomationTable();
}

/**
 * Funzione per mostrare una notifica
 * @param {string} message - Messaggio da mostrare
 * @param {string} type - Tipo di notifica (success, info, warning, danger)
 */
function showNotification(message, type = 'info') {
    console.log(`Notifica: ${message} (${type})`);
    
    // Crea il container delle notifiche se non esiste
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Crea la notifica
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Aggiungi la notifica al container
    notificationContainer.appendChild(notification);
    
    // Rimuovi la notifica dopo 5 secondi
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

// Inizializza il modulo quando il documento è pronto
document.addEventListener('DOMContentLoaded', initSocialAutomations);
