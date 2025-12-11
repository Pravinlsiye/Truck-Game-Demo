// Game State Manager - Single Responsibility: Game state and flow control
import { TruckCab } from './entities/TruckCab.js';
import { CollisionDetector } from './collision.js';
import { GameRenderer } from './renderers/GameRenderer.js';
import { LevelLoader } from './levels.js';
import { InputHandler } from './input.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new GameRenderer(canvas);
        this.collision = new CollisionDetector();
        this.levelLoader = new LevelLoader();
        this.input = new InputHandler();
        
        this.truck = null;
        this.currentLevel = null;
        this.gameState = 'menu'; // menu, playing, win, lose
        this.collisionCooldown = 0;
        
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    init() {
        this.renderer.resize();
    }
    
    loadLevel(levelIndex = null) {
        if (levelIndex !== null) {
            this.levelLoader.setCurrentLevel(levelIndex);
        }
        
        this.currentLevel = this.levelLoader.getCurrentLevel();
        
        if (!this.currentLevel) {
            console.error('Failed to load level');
            return false;
        }
        
        // Initialize truck with level config
        this.truck = new TruckCab({
            x: this.currentLevel.truck.x,
            y: this.currentLevel.truck.y,
            angle: this.currentLevel.truck.angle
        });
        
        this.collisionCooldown = 0;
        
        return true;
    }
    
    start(levelIndex = null) {
        if (this.loadLevel(levelIndex)) {
            this.gameState = 'playing';
            this.input.reset();
            this.renderer.clearTrail();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    restart() {
        this.loadLevel();
        this.gameState = 'playing';
        this.input.reset();
        this.renderer.clearTrail();
    }
    
    nextLevel() {
        if (this.levelLoader.nextLevel()) {
            this.start();
            return true;
        }
        return false;
    }
    
    gameLoop(timestamp) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        this.update();
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update() {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
        
        const inputState = this.input.getInput();
        this.truck.update(inputState);
        
        // Notify UI of truck state
        this.onUpdate(this.truck);
        
        this.checkCollisions();
        this.checkWinCondition();
    }
    
    checkCollisions() {
        if (this.collisionCooldown > 0) return;
        
        const truckCorners = this.truck.getTruckCorners();
        const trailerCorners = this.truck.getTrailerCorners();
        
        // Check truck collision with obstacles
        if (this.collision.checkObstacleCollision(truckCorners, this.currentLevel.obstacles)) {
            this.handleCollision();
            return;
        }
        
        // Check trailer collision with obstacles
        if (this.collision.checkObstacleCollision(trailerCorners, this.currentLevel.obstacles)) {
            this.handleCollision();
            return;
        }
        
        // Check boundary collisions
        if (this.collision.checkBoundaryCollision(truckCorners, this.canvas.width, this.canvas.height)) {
            this.handleCollision();
            return;
        }
        
        if (this.collision.checkBoundaryCollision(trailerCorners, this.canvas.width, this.canvas.height)) {
            this.handleCollision();
            return;
        }
    }
    
    handleCollision() {
        this.gameState = 'lose';
        this.onGameLose();
    }
    
    checkWinCondition() {
        const trailerCorners = this.truck.getTrailerCorners();
        
        if (this.collision.checkParkingSuccess(trailerCorners, this.currentLevel.parkingZone)) {
            if (Math.abs(this.truck.speed) < 0.5) {
                this.gameState = 'win';
                this.onGameWin();
            }
        }
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawTrail();
        this.renderer.drawParkingBays(this.currentLevel.parkingZone);
        this.renderer.drawParkingZone(this.currentLevel.parkingZone);
        this.renderer.drawObstacles(this.currentLevel.obstacles);
        this.renderer.drawTruck(this.truck);
        
        // Add trail point
        if (Math.abs(this.truck.speed) > 0.1) {
            this.renderer.addTrailPoint(this.truck.x, this.truck.y);
        }
        
        this.renderer.drawJacknifeWarning(this.truck);
        
        if (this.gameState === 'lose') {
            this.renderer.drawCollisionEffect();
        } else if (this.gameState === 'win') {
            this.renderer.drawSuccessEffect();
        }
    }
    
    // Callbacks for UI
    onGameWin() {}
    onGameLose() {}
    onUpdate(truck) {}
    
    getState() {
        return this.gameState;
    }
    
    setState(state) {
        this.gameState = state;
    }
    
    getCurrentLevelInfo() {
        return this.currentLevel;
    }
    
    getLevelCount() {
        return this.levelLoader.getTotalLevels();
    }
    
    isLastLevel() {
        return this.levelLoader.isLastLevel();
    }
}
