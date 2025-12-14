// SettingsManager - Single Responsibility: Manage game settings with persistence
export class SettingsManager {
    constructor(storageKey = 'truckGameSettings') {
        this.storageKey = storageKey;
        this.listeners = [];
        
        // Default settings
        this.defaults = {
            guideLines: {
                truck: { enabled: true, front: true, back: true },
                trailer: { enabled: true, front: false, back: true }
            }
        };
        
        this.settings = this.load();
    }
    
    // Load settings from localStorage
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return this.mergeDefaults(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        return { ...this.defaults };
    }
    
    // Merge saved settings with defaults (handles new settings added later)
    mergeDefaults(saved) {
        return {
            guideLines: {
                truck: { ...this.defaults.guideLines.truck, ...saved.guideLines?.truck },
                trailer: { ...this.defaults.guideLines.trailer, ...saved.guideLines?.trailer }
            }
        };
    }
    
    // Save settings to localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    // Get guide line settings
    getGuideLineSettings() {
        return this.settings.guideLines;
    }
    
    // Update guide line settings
    setGuideLineSettings(guideSettings) {
        this.settings.guideLines = guideSettings;
        this.save();
        this.notifyListeners('guideLines', guideSettings);
    }
    
    // Subscribe to settings changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    // Notify all listeners of changes
    notifyListeners(key, value) {
        this.listeners.forEach(callback => callback(key, value));
    }
    
    // Reset to defaults
    reset() {
        this.settings = { ...this.defaults };
        this.save();
        this.notifyListeners('reset', this.settings);
    }
}

