// Main Entry Point
import { Game } from './game.js';
import { SettingsManager } from './managers/SettingsManager.js';
import { GuideSettingsUI } from './ui/GuideSettingsUI.js';
import { DXFMapLoader } from './loaders/DXFMapLoader.js';
import { MapPicker } from './ui/MapPicker.js';

class GameApp {
    constructor() {
        this.game = null;
        this.screens = {};
        this.buttons = {};
        this.controlElements = {};
        this.settingsManager = null;
        this.guideSettingsUI = null;
        this.mapLoader = new DXFMapLoader();
        this.mapPicker = null;
        
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize game
        const canvas = document.getElementById('game-canvas');
        this.game = new Game(canvas);
        this.game.init();
        
        // Set game callbacks
        this.game.onGameWin = () => this.showScreen('win');
        this.game.onGameLose = () => this.showScreen('lose');
        this.game.onUpdate = (truck) => this.updateControlPanel(truck);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize settings (SOLID: Dependency Inversion)
        this.settingsManager = new SettingsManager();
        this.guideSettingsUI = new GuideSettingsUI(this.settingsManager);
        
        // Subscribe to settings changes
        this.settingsManager.subscribe((key, value) => {
            if (key === 'guideLines') {
                this.game.renderer.effectsRenderer.setGuideSettings(value);
            }
        });
        
        // Apply initial settings
        this.game.renderer.effectsRenderer.setGuideSettings(
            this.settingsManager.getGuideLineSettings()
        );
        
        // Populate level select
        this.populateLevelSelect();
        
        // Show title screen
        this.showScreen('title');
    }
    
    cacheElements() {
        // Screens
        this.screens = {
            title: document.getElementById('title-screen'),
            levelSelect: document.getElementById('level-select-screen'),
            game: document.getElementById('game-screen'),
            win: document.getElementById('win-screen'),
            lose: document.getElementById('lose-screen')
        };
        
        // Buttons
        this.buttons = {
            levels: document.getElementById('levels-btn'),
            loadMap: document.getElementById('load-map-btn'),
            worldMap: document.getElementById('world-map-btn'),
            backToTitle: document.getElementById('back-to-title'),
            restart: document.getElementById('restart-btn'),
            menu: document.getElementById('menu-btn'),
            nextLevel: document.getElementById('next-level-btn'),
            replay: document.getElementById('replay-btn'),
            winMenu: document.getElementById('win-menu-btn'),
            retry: document.getElementById('retry-btn'),
            loseMenu: document.getElementById('lose-menu-btn')
        };
        
        // File input for map loading
        this.mapFileInput = document.getElementById('map-file-input');
        
        // Other elements
        this.levelGrid = document.getElementById('level-grid');
        this.currentLevelName = document.getElementById('current-level-name');
        
        // Control panel elements
        this.controlElements = {
            steeringWheel: document.getElementById('steering-wheel'),
            speedBar: document.getElementById('speed-bar'),
            gearOptions: document.querySelectorAll('.gear-option')
        };
    }
    
    updateControlPanel(truck) {
        if (!truck) return;
        
        // Update steering wheel rotation
        // Real steering wheel rotates ~180 degrees each direction for full lock
        const steeringDegrees = (truck.steeringAngle / truck.maxSteeringAngle) * 180;
        if (this.controlElements.steeringWheel) {
            this.controlElements.steeringWheel.style.transform = `rotate(${steeringDegrees}deg)`;
        }
        
        // Update speed bar
        const speedPercent = Math.abs(truck.speed / truck.maxSpeed) * 100;
        if (this.controlElements.speedBar) {
            this.controlElements.speedBar.style.width = `${speedPercent}%`;
            if (truck.speed < 0) {
                this.controlElements.speedBar.classList.add('reverse');
            } else {
                this.controlElements.speedBar.classList.remove('reverse');
            }
        }
        
        // Update speed value display
        const speedValue = document.getElementById('speed-value');
        if (speedValue) {
            const displaySpeed = Math.abs(Math.round(truck.speed * 10));
            speedValue.textContent = displaySpeed;
        }
        
        // Update gear indicator
        let currentGear = 'N';
        if (truck.speed > 0.1) {
            currentGear = 'D';
        } else if (truck.speed < -0.1) {
            currentGear = 'R';
        }
        
        this.controlElements.gearOptions.forEach(option => {
            if (option.dataset.gear === currentGear) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    setupEventListeners() {
        // Title screen
        this.buttons.levels.addEventListener('click', () => this.showScreen('levelSelect'));
        this.buttons.loadMap.addEventListener('click', () => this.mapFileInput.click());
        this.mapFileInput.addEventListener('change', (e) => this.handleMapFile(e));
        this.buttons.worldMap.addEventListener('click', () => this.openWorldMap());
        
        // Level select
        this.buttons.backToTitle.addEventListener('click', () => this.showScreen('title'));
        
        // Game screen
        this.buttons.restart.addEventListener('click', () => this.restartLevel());
        this.buttons.menu.addEventListener('click', () => this.returnToMenu());
        
        // Win screen
        this.buttons.nextLevel.addEventListener('click', () => this.goToNextLevel());
        this.buttons.replay.addEventListener('click', () => this.restartLevel());
        this.buttons.winMenu.addEventListener('click', () => this.returnToMenu());
        
        // Lose screen
        this.buttons.retry.addEventListener('click', () => this.restartLevel());
        this.buttons.loseMenu.addEventListener('click', () => this.returnToMenu());
    }
    
    populateLevelSelect() {
        this.levelGrid.innerHTML = '';
        
        const totalLevels = this.game.getLevelCount();
        
        for (let i = 0; i < totalLevels; i++) {
            const level = this.game.levelLoader.getLevel(i);
            const card = document.createElement('div');
            card.className = 'level-card';
            card.innerHTML = `
                <div class="level-number">${level.id}</div>
                <div class="level-name">${level.name}</div>
            `;
            card.addEventListener('click', () => this.startGame(i));
            this.levelGrid.appendChild(card);
        }
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        switch (screenName) {
            case 'title':
                this.screens.title.classList.add('active');
                break;
            case 'levelSelect':
                this.screens.levelSelect.classList.add('active');
                break;
            case 'game':
                this.screens.game.classList.add('active');
                break;
            case 'win':
                this.screens.win.classList.add('active');
                this.screens.game.classList.add('active');
                // Update next level button visibility
                if (this.game.isLastLevel()) {
                    this.buttons.nextLevel.textContent = 'ALL COMPLETE!';
                    this.buttons.nextLevel.disabled = true;
                } else {
                    this.buttons.nextLevel.textContent = 'NEXT LEVEL';
                    this.buttons.nextLevel.disabled = false;
                }
                break;
            case 'lose':
                this.screens.lose.classList.add('active');
                this.screens.game.classList.add('active');
                break;
        }
    }
    
    startGame(levelIndex) {
        this.game.start(levelIndex);
        this.updateLevelInfo();
        this.showScreen('game');
    }
    
    restartLevel() {
        this.game.restart();
        this.showScreen('game');
        // Re-trigger game loop
        this.game.gameLoop();
    }
    
    goToNextLevel() {
        if (this.game.nextLevel()) {
            this.updateLevelInfo();
            this.showScreen('game');
        }
    }
    
    returnToMenu() {
        this.game.setState('menu');
        this.showScreen('title');
    }
    
    updateLevelInfo() {
        const levelInfo = this.game.getCurrentLevelInfo();
        if (levelInfo) {
            this.currentLevelName.textContent = `Level ${levelInfo.id}: ${levelInfo.name}`;
            
            // Update parking target indicator
            const parkingTargetEl = document.getElementById('parking-target');
            if (parkingTargetEl) {
                const target = levelInfo.parkingTarget || 'trailer';
                parkingTargetEl.textContent = `PARK: ${target.toUpperCase()}`;
            }
        }
    }
    
    async handleMapFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Show loading message
            this.currentLevelName.textContent = 'Loading map...';
            
            // Load and parse the DXF file
            const levelData = await this.mapLoader.load(file);
            
            // Add the custom level to the game
            this.game.levelLoader.levels.push(levelData);
            const customIndex = this.game.levelLoader.levels.length - 1;
            
            // Start the custom level
            this.game.start(customIndex);
            this.currentLevelName.textContent = `Custom: ${file.name}`;
            this.showScreen('game');
            
            // Update parking target
            const parkingTargetEl = document.getElementById('parking-target');
            if (parkingTargetEl) {
                parkingTargetEl.textContent = 'PARK: TRAILER';
            }
            
        } catch (error) {
            console.error('Failed to load map:', error);
            alert('Failed to load map file: ' + error.message);
        }
        
        // Reset file input
        event.target.value = '';
    }
    
    openWorldMap() {
        // Lazy initialize map picker
        if (!this.mapPicker) {
            this.mapPicker = new MapPicker((levelData) => this.loadWorldMapLevel(levelData));
        }
        this.mapPicker.show();
    }
    
    loadWorldMapLevel(levelData) {
        // Add the custom level
        this.game.levelLoader.levels.push(levelData);
        const customIndex = this.game.levelLoader.levels.length - 1;
        
        // Start the custom level
        this.game.start(customIndex);
        this.currentLevelName.textContent = `World: ${levelData.name}`;
        this.showScreen('game');
        
        // Update parking target or show free roam
        const parkingTargetEl = document.getElementById('parking-target');
        if (parkingTargetEl) {
            if (levelData.freeRoam) {
                parkingTargetEl.textContent = '🚛 FREE ROAM';
                parkingTargetEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            } else {
                parkingTargetEl.textContent = 'PARK: TRAILER';
                parkingTargetEl.style.background = '';
            }
        }
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});

