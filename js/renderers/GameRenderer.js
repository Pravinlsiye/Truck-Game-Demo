// Game Renderer - Composition of all renderers (Open/Closed Principle)
import { TruckRenderer } from './TruckRenderer.js';
import { TrailerRenderer } from './TrailerRenderer.js';
import { EnvironmentRenderer } from './EnvironmentRenderer.js';
import { EffectsRenderer } from './EffectsRenderer.js';

export class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Compose specialized renderers (Dependency Inversion)
        this.truckRenderer = new TruckRenderer(this.ctx);
        this.trailerRenderer = new TrailerRenderer(this.ctx);
        this.environmentRenderer = new EnvironmentRenderer(this.ctx, canvas);
        this.effectsRenderer = new EffectsRenderer(this.ctx, canvas);
        
        // Camera for following truck
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.08
        };
        
        // World size (can be much larger than canvas)
        this.worldWidth = 1200;
        this.worldHeight = 800;
        
        // Is camera following enabled
        this.followMode = false;
        
        this.resize();
    }
    
    resize() {
        this.canvas.width = 1200;
        this.canvas.height = 800;
    }
    
    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }
    
    setFollowMode(enabled) {
        this.followMode = enabled;
    }
    
    updateCamera(targetX, targetY) {
        if (!this.followMode) {
            this.camera.x = 0;
            this.camera.y = 0;
            return;
        }
        
        // Target camera position (center on truck)
        this.camera.targetX = targetX - this.canvas.width / 2;
        this.camera.targetY = targetY - this.canvas.height / 2;
        
        // Clamp to world bounds
        this.camera.targetX = Math.max(0, Math.min(this.camera.targetX, this.worldWidth - this.canvas.width));
        this.camera.targetY = Math.max(0, Math.min(this.camera.targetY, this.worldHeight - this.canvas.height));
        
        // Smooth camera movement
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
    }
    
    applyCamera() {
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }
    
    resetCamera() {
        this.ctx.restore();
    }
    
    // Trail management - delegated to effects renderer
    addTrailPoint(x, y) {
        this.effectsRenderer.addTrailPoint(x, y);
    }
    
    clearTrail() {
        this.effectsRenderer.clearTrail();
    }
    
    // Clear and render background
    clear() {
        // Clear entire canvas
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Render world background with camera offset
    drawBackground() {
        this.applyCamera();
        this.environmentRenderer.setWorldSize(this.worldWidth, this.worldHeight);
        // Pass camera position for culling (optimization)
        this.environmentRenderer.renderBackground(this.camera.x, this.camera.y);
        this.resetCamera();
    }
    
    // Render roads
    drawRoads(roads) {
        if (!roads) return;
        this.applyCamera();
        this.environmentRenderer.renderRoads(roads);
        this.resetCamera();
    }
    
    // Render trail
    drawTrail() {
        this.applyCamera();
        this.effectsRenderer.renderTrail();
        this.resetCamera();
    }
    
    // Render parking zone
    drawParkingZone(zone) {
        this.applyCamera();
        this.environmentRenderer.renderParkingZone(zone);
        this.resetCamera();
    }
    
    // Render parking bays
    drawParkingBays(zone) {
        this.applyCamera();
        this.environmentRenderer.renderParkingBays(zone);
        this.resetCamera();
    }
    
    // Render obstacles
    drawObstacles(obstacles) {
        this.applyCamera();
        for (const obstacle of obstacles) {
            this.environmentRenderer.renderObstacle(obstacle);
        }
        this.resetCamera();
    }
    
    // Render complete truck (cab + trailer + hitch)
    drawTruck(truck) {
        // Update camera to follow truck
        this.updateCamera(truck.x, truck.y);
        
        this.applyCamera();
        
        // Guide lines first (green for truck, red for trailer)
        this.effectsRenderer.renderGuideLines(truck);
        
        // Trailer
        this.trailerRenderer.render(truck.trailer);
        
        // Hitch connection
        const hitchPoint = truck.getHitchPoint();
        const backDir = truck.getDirection(truck.angle + Math.PI);
        const truckRear = {
            x: truck.x + backDir.x * (truck.height / 2),
            y: truck.y + backDir.y * (truck.height / 2)
        };
        const trailerFront = truck.getTrailerFrontPoint();
        this.effectsRenderer.renderHitch(hitchPoint, truckRear, trailerFront);
        
        // Truck cab
        this.truckRenderer.render(truck);
        
        this.resetCamera();
    }
    
    // Render jackknife warning
    drawJacknifeWarning(truck) {
        if (!truck) return;
        const maxAngle = Math.PI / 2.5;
        this.effectsRenderer.renderJacknifeWarning(truck.getJacknifeAngle(), maxAngle);
    }
    
    // Render collision effect
    drawCollisionEffect() {
        this.effectsRenderer.renderCollisionEffect();
    }
    
    // Render success effect
    drawSuccessEffect() {
        this.effectsRenderer.renderSuccessEffect();
    }
}

