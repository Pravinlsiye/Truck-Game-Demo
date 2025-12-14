// GuideSettingsUI - Single Responsibility: Handle guide lines settings UI
export class GuideSettingsUI {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.elements = {};
        
        this.cacheElements();
        this.bindEvents();
        this.syncFromSettings();
    }
    
    cacheElements() {
        this.elements = {
            panel: document.getElementById('guide-settings'),
            settingsBtn: document.getElementById('settings-btn'),
            closeBtn: document.getElementById('close-settings'),
            truckEnabled: document.getElementById('truck-enabled'),
            truckFront: document.getElementById('truck-front'),
            truckBack: document.getElementById('truck-back'),
            trailerEnabled: document.getElementById('trailer-enabled'),
            trailerFront: document.getElementById('trailer-front'),
            trailerBack: document.getElementById('trailer-back')
        };
    }
    
    bindEvents() {
        // Panel toggle
        this.elements.settingsBtn?.addEventListener('click', () => this.toggle());
        this.elements.closeBtn?.addEventListener('click', () => this.close());
        
        // Checkbox changes
        const checkboxes = [
            'truckEnabled', 'truckFront', 'truckBack',
            'trailerEnabled', 'trailerFront', 'trailerBack'
        ];
        
        checkboxes.forEach(id => {
            this.elements[id]?.addEventListener('change', () => this.onSettingChange());
        });
    }
    
    // Sync UI checkboxes from settings
    syncFromSettings() {
        const settings = this.settingsManager.getGuideLineSettings();
        
        if (this.elements.truckEnabled) {
            this.elements.truckEnabled.checked = settings.truck.enabled;
        }
        if (this.elements.truckFront) {
            this.elements.truckFront.checked = settings.truck.front;
        }
        if (this.elements.truckBack) {
            this.elements.truckBack.checked = settings.truck.back;
        }
        if (this.elements.trailerEnabled) {
            this.elements.trailerEnabled.checked = settings.trailer.enabled;
        }
        if (this.elements.trailerFront) {
            this.elements.trailerFront.checked = settings.trailer.front;
        }
        if (this.elements.trailerBack) {
            this.elements.trailerBack.checked = settings.trailer.back;
        }
    }
    
    // Handle checkbox changes
    onSettingChange() {
        const settings = {
            truck: {
                enabled: this.elements.truckEnabled?.checked ?? true,
                front: this.elements.truckFront?.checked ?? true,
                back: this.elements.truckBack?.checked ?? true
            },
            trailer: {
                enabled: this.elements.trailerEnabled?.checked ?? true,
                front: this.elements.trailerFront?.checked ?? false,
                back: this.elements.trailerBack?.checked ?? true
            }
        };
        
        this.settingsManager.setGuideLineSettings(settings);
    }
    
    toggle() {
        this.elements.panel?.classList.toggle('hidden');
    }
    
    close() {
        this.elements.panel?.classList.add('hidden');
    }
    
    open() {
        this.elements.panel?.classList.remove('hidden');
    }
}

