// social_campaigns_edit.js - Gestione della modifica e cancellazione delle campagne social

/**
 * Inizializza le funzionalità di modifica e cancellazione
 */
function initCampaignEditFeatures() {
    // Aggiungi event listener per il pulsante "Nuova Campagna"
    document.getElementById('new-campaign-btn')?.addEventListener('click', () => openCampaignModal());
    
    // Aggiungi event listener per il pulsante "Cancella Selezionati"
    document.getElementById('delete-selected-btn')?.addEventListener('click', deleteSelectedCampaigns);
    
    // Aggiungi event listener per il checkbox di selezione di tutte le campagne
    document.getElementById('select-all-campaigns')?.addEventListener('change', toggleSelectAllCampaigns);
    
    // Aggiungi event listener per i checkbox di selezione delle singole campagne
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('campaign-checkbox')) {
            updateSelectedCampaignsCount();
        }
    });
}

/**
 * Apre il modal per modificare una campagna esistente
 */
function editCampaign(campaignId) {
    // Resetta il form
    resetCampaignForm();
    
    // Popola il form con i dati della campagna
    populateCampaignForm(campaignId);
    
    // Apri il modal
    const modal = new bootstrap.Modal(document.getElementById('socialCampaignModal'));
    modal.show();
}

/**
 * Conferma ed elimina una campagna
 */
function confirmAndDeleteCampaign(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return;
    
    // Crea un modal di conferma
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'deleteCampaignModal';
    modalElement.tabIndex = '-1';
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Conferma eliminazione</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Sei sicuro di voler eliminare la campagna "${campaign.name}"?</p>
                    <p class="text-danger">Questa azione non può essere annullata.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn">
                        <i class="fas fa-trash me-1"></i> Elimina
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
    
    // Mostra il modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Aggiungi event listener per il pulsante di conferma
    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        // Elimina la campagna
        deleteCampaign(campaignId);
        
        // Chiudi il modal
        modal.hide();
        
        // Rimuovi il modal dal DOM
        modalElement.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalElement);
        });
        
        // Mostra notifica
        showNotification('Campagna eliminata con successo', 'success');
    });
    
    // Rimuovi il modal dal DOM quando viene chiuso
    modalElement.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalElement);
    });
}

/**
 * Seleziona o deseleziona tutte le campagne
 */
function toggleSelectAllCampaigns(event) {
    const isChecked = event.target.checked;
    
    // Seleziona o deseleziona tutti i checkbox
    const checkboxes = document.querySelectorAll('.campaign-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    // Aggiorna il conteggio delle campagne selezionate
    updateSelectedCampaignsCount();
}

/**
 * Aggiorna il conteggio delle campagne selezionate
 */
function updateSelectedCampaignsCount() {
    const selectedCheckboxes = document.querySelectorAll('.campaign-checkbox:checked');
    const countElement = document.getElementById('selected-campaigns-count');
    
    if (countElement) {
        countElement.textContent = selectedCheckboxes.length;
    }
    
    // Abilita o disabilita il pulsante "Cancella Selezionati"
    const deleteButton = document.getElementById('delete-selected-btn');
    if (deleteButton) {
        deleteButton.disabled = selectedCheckboxes.length === 0;
    }
}

/**
 * Elimina le campagne selezionate
 */
function deleteSelectedCampaigns() {
    const selectedCheckboxes = document.querySelectorAll('.campaign-checkbox:checked');
    
    // Se non ci sono campagne selezionate, mostra un messaggio
    if (selectedCheckboxes.length === 0) {
        showNotification('Nessuna campagna selezionata', 'warning');
        return;
    }
    
    // Crea un modal di conferma
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'deleteSelectedCampaignsModal';
    modalElement.tabIndex = '-1';
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Conferma eliminazione</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Sei sicuro di voler eliminare ${selectedCheckboxes.length} campagne selezionate?</p>
                    <p class="text-danger">Questa azione non può essere annullata.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-selected-btn">
                        <i class="fas fa-trash me-1"></i> Elimina ${selectedCheckboxes.length} campagne
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
    
    // Mostra il modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Aggiungi event listener per il pulsante di conferma
    document.getElementById('confirm-delete-selected-btn').addEventListener('click', function() {
        // Raccogli gli ID delle campagne selezionate
        const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);
        
        // Elimina le campagne
        let deletedCount = 0;
        selectedIds.forEach(id => {
            if (deleteCampaign(id)) {
                deletedCount++;
            }
        });
        
        // Chiudi il modal
        modal.hide();
        
        // Rimuovi il modal dal DOM
        modalElement.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalElement);
        });
        
        // Mostra notifica
        showNotification(`Eliminate ${deletedCount} campagne con successo`, 'success');
    });
    
    // Rimuovi il modal dal DOM quando viene chiuso
    modalElement.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalElement);
    });
}

/**
 * Duplica una campagna esistente
 */
function duplicateCampaign(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return;
    
    // Crea una copia della campagna
    const duplicatedCampaign = { ...campaign };
    
    // Modifica alcuni campi
    duplicatedCampaign.name = `Copia di ${campaign.name}`;
    delete duplicatedCampaign.id;
    delete duplicatedCampaign.createdAt;
    delete duplicatedCampaign.updatedAt;
    
    // Imposta lo stato a "Pianificata"
    duplicatedCampaign.status = 'Pianificata';
    
    // Aggiorna le date
    const today = new Date();
    duplicatedCampaign.startDate = today.toISOString().split('T')[0];
    
    // Se c'era una data di fine, aggiorna anche quella
    if (duplicatedCampaign.endDate) {
        const endDate = new Date(duplicatedCampaign.endDate);
        const startDate = new Date(campaign.startDate);
        const duration = endDate - startDate;
        
        const newEndDate = new Date(today.getTime() + duration);
        duplicatedCampaign.endDate = newEndDate.toISOString().split('T')[0];
    }
    
    // Aggiungi la campagna duplicata
    const newCampaign = addCampaign(duplicatedCampaign);
    
    // Mostra notifica
    showNotification('Campagna duplicata con successo', 'success');
    
    return newCampaign;
}

/**
 * Aggiorna lo stato di una campagna
 */
function updateCampaignStatus(campaignId, newStatus) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return false;
    
    // Aggiorna lo stato
    campaign.status = newStatus;
    
    // Aggiorna la campagna
    return updateCampaign(campaignId, campaign);
}

/**
 * Aggiorna i dati effettivi di una campagna
 */
function updateCampaignActualData(campaignId, actualData) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return false;
    
    // Aggiorna i dati effettivi
    campaign.actualSpend = actualData.actualSpend || campaign.actualSpend;
    campaign.impressions = actualData.impressions || campaign.impressions;
    campaign.clicks = actualData.clicks || campaign.clicks;
    campaign.conversions = actualData.conversions || campaign.conversions;
    campaign.revenue = actualData.revenue || campaign.revenue;
    
    // Aggiorna la campagna
    return updateCampaign(campaignId, campaign);
}

/**
 * Mostra il form per l'aggiornamento dei dati effettivi
 */
function showActualDataForm(campaignId) {
    const campaign = getCampaign(campaignId);
    if (!campaign) return;
    
    // Crea un modal per l'aggiornamento dei dati
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'actualDataModal';
    modalElement.tabIndex = '-1';
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Aggiorna dati effettivi - ${campaign.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="actual-data-form">
                        <div class="mb-3">
                            <label for="actual-spend" class="form-label">Spesa effettiva (€)</label>
                            <input type="number" class="form-control" id="actual-spend" step="0.01" min="0" value="${campaign.actualSpend || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="actual-impressions" class="form-label">Impression</label>
                            <input type="number" class="form-control" id="actual-impressions" min="0" value="${campaign.impressions || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="actual-clicks" class="form-label">Click</label>
                            <input type="number" class="form-control" id="actual-clicks" min="0" value="${campaign.clicks || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="actual-conversions" class="form-label">Conversioni</label>
                            <input type="number" class="form-control" id="actual-conversions" min="0" value="${campaign.conversions || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="actual-revenue" class="form-label">Entrate generate (€)</label>
                            <input type="number" class="form-control" id="actual-revenue" step="0.01" min="0" value="${campaign.revenue || ''}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                    <button type="button" class="btn btn-primary" id="save-actual-data-btn">
                        <i class="fas fa-save me-1"></i> Salva dati
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
    
    // Mostra il modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Aggiungi event listener per il pulsante di salvataggio
    document.getElementById('save-actual-data-btn').addEventListener('click', function() {
        // Raccogli i dati dal form
        const actualData = {
            actualSpend: parseFloat(document.getElementById('actual-spend').value) || 0,
            impressions: parseInt(document.getElementById('actual-impressions').value) || 0,
            clicks: parseInt(document.getElementById('actual-clicks').value) || 0,
            conversions: parseInt(document.getElementById('actual-conversions').value) || 0,
            revenue: parseFloat(document.getElementById('actual-revenue').value) || 0
        };
        
        // Aggiorna i dati effettivi
        updateCampaignActualData(campaignId, actualData);
        
        // Chiudi il modal
        modal.hide();
        
        // Rimuovi il modal dal DOM
        modalElement.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalElement);
        });
        
        // Mostra notifica
        showNotification('Dati effettivi aggiornati con successo', 'success');
    });
    
    // Rimuovi il modal dal DOM quando viene chiuso
    modalElement.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modalElement);
    });
}

// Inizializza le funzionalità di modifica quando il documento è pronto
document.addEventListener('DOMContentLoaded', initCampaignEditFeatures);
