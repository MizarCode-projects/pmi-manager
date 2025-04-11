// utils.js - Funzioni di utilità generali

/**
 * Mostra una notifica
 * @param {string} message - Messaggio da mostrare
 * @param {string} type - Tipo di notifica (success, error, warning, info)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Mappa i tipi alle classi Bootstrap
    const typeClasses = {
        success: 'alert-success',
        info: 'alert-info',
        warning: 'alert-warning',
        error: 'alert-danger'
    };
    
    // Seleziona la classe in base al tipo
    const alertClass = typeClasses[type] || 'alert-info';
    
    // Crea l'elemento di notifica
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Aggiungi la notifica al container
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
        
        // Rimuovi automaticamente dopo la durata specificata
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, duration);
    } else {
        console.error('Notification container not found');
    }
}

/**
 * Inizializza i tooltip di Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

/**
 * Formatta un numero con separatore delle migliaia e decimali
 * @param {number} num - Il numero da formattare
 * @param {number} decimals - Il numero di decimali (default: 0)
 * @returns {string} - Il numero formattato
 */
function formatNumber(num, decimals = 0) {
    return num.toLocaleString('it-IT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formatta un valore come percentuale
 * @param {number} value - Il valore da formattare (es. 0.15 per 15%)
 * @param {number} decimals - Il numero di decimali (default: 2)
 * @returns {string} - La percentuale formattata (es. "15,00%")
 */
function formatPercentage(value, decimals = 2) {
    return value.toLocaleString('it-IT', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formatta un valore come valuta (Euro)
 * @param {number} value - Il valore da formattare
 * @param {number} decimals - Il numero di decimali (default: 2)
 * @returns {string} - La valuta formattata (es. "€ 1.234,56")
 */
function formatCurrency(value, decimals = 2) {
    return value.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formatta una data nel formato italiano (dd/mm/yyyy)
 * @param {string|Date} date - La data da formattare
 * @returns {string} - La data formattata
 */
function formatDate(date) {
    if (!date) return '-';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return dateObj.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Restituisce la classe CSS in base all'efficacia
 * @param {number} effectiveness - Valore di efficacia (1-10)
 * @returns {string} - La classe CSS corrispondente
 */
function getEffectivenessClass(effectiveness) {
    if (effectiveness >= 8) return 'success';
    if (effectiveness >= 6) return 'info';
    if (effectiveness >= 4) return 'warning';
    return 'danger';
}

/**
 * Inizializza una tabella DataTable con opzioni predefinite
 * @param {string} tableId - L'ID dell'elemento tabella
 * @param {Object} options - Opzioni aggiuntive per DataTable
 * @returns {Object} - L'istanza DataTable
 */
function initDataTable(tableId, options = {}) {
    const defaultOptions = {
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
        },
        responsive: true,
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'Tutti']]
    };
    
    // Unisci le opzioni predefinite con quelle personalizzate
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Inizializza e restituisci l'istanza DataTable
    return $(`#${tableId}`).DataTable(mergedOptions);
}

// Esporta le funzioni
window.showNotification = showNotification;
window.initTooltips = initTooltips;
window.formatNumber = formatNumber;
window.formatPercentage = formatPercentage;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getEffectivenessClass = getEffectivenessClass;
window.initDataTable = initDataTable;
