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
        this.spawnGracePeriod = 0;  // Grace period after spawning
        
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
            
            // Set world size and camera mode
            if (this.currentLevel.worldWidth && this.currentLevel.worldHeight) {
                this.renderer.setWorldSize(this.currentLevel.worldWidth, this.currentLevel.worldHeight);
            } else {
                this.renderer.setWorldSize(1200, 800);
            }
            
            // Enable follow mode for free roam
            this.renderer.setFollowMode(this.currentLevel.freeRoam || false);
            
            // Grace period for custom/world maps (180 frames = ~3 seconds)
            this.spawnGracePeriod = this.currentLevel.id === 'osm-custom' ? 180 : 0;
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    restart() {
        this.loadLevel();
        this.gameState = 'playing';
        this.input.reset();
        this.renderer.clearTrail();
        // Grace period for custom/world maps on restart too
        this.spawnGracePeriod = this.currentLevel.id === 'osm-custom' ? 180 : 0;
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
        if (this.spawnGracePeriod > 0) {
            this.spawnGracePeriod--;
            return;
        }
        
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
        // Use world size for boundaries (larger than canvas in free roam)
        const worldW = this.currentLevel.worldWidth || this.canvas.width;
        const worldH = this.currentLevel.worldHeight || this.canvas.height;
        
        if (this.collision.checkBoundaryCollision(truckCorners, worldW, worldH)) {
            this.handleCollision();
            return;
        }
        
        if (this.collision.checkBoundaryCollision(trailerCorners, worldW, worldH)) {
            this.handleCollision();
            return;
        }
    }
    
    handleCollision() {
        this.gameState = 'lose';
        this.onGameLose();
    }
    
    checkWinCondition() {
        // Skip win check in free roam mode
        if (this.currentLevel.freeRoam || !this.currentLevel.parkingZone) {
            return;
        }
        
        const parkingTarget = this.currentLevel.parkingTarget || 'trailer';
        let targetCorners;
        
        if (parkingTarget === 'trailer') {
            targetCorners = this.truck.getTrailerCorners();
        } else {
            // For 'truck' target, check both cab and trailer
            targetCorners = this.truck.getTrailerCorners();
        }
        
        if (this.collision.checkParkingSuccess(targetCorners, this.currentLevel.parkingZone)) {
            if (Math.abs(this.truck.speed) < 0.5) {
                this.gameState = 'win';
                this.onGameWin();
            }
        }
    }
    
    isFreeRoam() {
        return this.currentLevel?.freeRoam || false;
    }
    
    getParkingTarget() {
        return this.currentLevel?.parkingTarget || 'trailer';
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        
        // Draw roads (new)
        if (this.currentLevel.roads) {
            this.renderer.drawRoads(this.currentLevel.roads);
        }
        
        this.renderer.drawTrail();
        
        // Only draw parking zone if not in free roam
        if (!this.currentLevel.freeRoam && this.currentLevel.parkingZone) {
            this.renderer.drawParkingBays(this.currentLevel.parkingZone);
            this.renderer.drawParkingZone(this.currentLevel.parkingZone);
        }
        
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
