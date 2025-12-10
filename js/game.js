// Game State Manager
import { Truck } from './truck.js';
import { CollisionDetector } from './collision.js';
import { Renderer } from './renderer.js';
import { LevelLoader } from './levels.js';
import { InputHandler } from './input.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
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
        // Set canvas size
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
        
        // Initialize truck at level starting position
        this.truck = new Truck(
            this.currentLevel.truck.x,
            this.currentLevel.truck.y,
            this.currentLevel.truck.angle
        );
        
        this.collisionCooldown = 0;
        
        return true;
    }
    
    start(levelIndex = null) {
        if (this.loadLevel(levelIndex)) {
            this.gameState = 'playing';
            this.input.reset();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    restart() {
        this.loadLevel();
        this.gameState = 'playing';
        this.input.reset();
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
        
        // Update
        this.update();
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop);
    }
    
    update() {
        // Update collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
        
        // Get input and update truck
        const inputState = this.input.getInput();
        this.truck.update(inputState);
        
        // Notify UI of truck state
        this.onUpdate(this.truck);
        
        // Check collisions
        this.checkCollisions();
        
        // Check win condition
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
            // Additional check: truck must be nearly stopped
            if (Math.abs(this.truck.speed) < 0.5) {
                this.gameState = 'win';
                this.onGameWin();
            }
        }
    }
    
    render() {
        // Clear canvas
        this.renderer.clear();
        
        // Draw parking zone
        this.renderer.drawParkingZone(this.currentLevel.parkingZone);
        
        // Draw obstacles
        this.renderer.drawObstacles(this.currentLevel.obstacles);
        
        // Draw truck and trailer
        this.renderer.drawTruck(this.truck);
        
        // Draw jackknife warning if applicable
        this.renderer.drawJacknifeWarning(this.truck);
        
        // Draw effects based on state
        if (this.gameState === 'lose') {
            this.renderer.drawCollisionEffect();
        } else if (this.gameState === 'win') {
            this.renderer.drawSuccessEffect();
        }
    }
    
    // Callbacks for UI - will be set by main.js
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

