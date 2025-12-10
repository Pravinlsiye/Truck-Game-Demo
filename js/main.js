// Main Entry Point
import { Game } from './game.js';

class GameApp {
    constructor() {
        this.game = null;
        this.screens = {};
        this.buttons = {};
        this.controlElements = {};
        
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
            start: document.getElementById('start-btn'),
            levels: document.getElementById('levels-btn'),
            backToTitle: document.getElementById('back-to-title'),
            restart: document.getElementById('restart-btn'),
            menu: document.getElementById('menu-btn'),
            nextLevel: document.getElementById('next-level-btn'),
            replay: document.getElementById('replay-btn'),
            winMenu: document.getElementById('win-menu-btn'),
            retry: document.getElementById('retry-btn'),
            loseMenu: document.getElementById('lose-menu-btn')
        };
        
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
        
        // Update steering wheel rotation (convert steering angle to degrees)
        const steeringDegrees = (truck.steeringAngle / truck.maxSteeringAngle) * 90;
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
        this.buttons.start.addEventListener('click', () => this.startGame(0));
        this.buttons.levels.addEventListener('click', () => this.showScreen('levelSelect'));
        
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
        }
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});

