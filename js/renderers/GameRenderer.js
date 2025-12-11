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
        
        this.resize();
    }
    
    resize() {
        this.canvas.width = 900;
        this.canvas.height = 650;
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
        this.environmentRenderer.renderBackground();
    }
    
    // Render trail
    drawTrail() {
        this.effectsRenderer.renderTrail();
    }
    
    // Render parking zone
    drawParkingZone(zone) {
        this.environmentRenderer.renderParkingZone(zone);
    }
    
    // Render parking bays
    drawParkingBays(zone) {
        this.environmentRenderer.renderParkingBays(zone);
    }
    
    // Render obstacles
    drawObstacles(obstacles) {
        for (const obstacle of obstacles) {
            this.environmentRenderer.renderObstacle(obstacle);
        }
    }
    
    // Render complete truck (cab + trailer + hitch)
    drawTruck(truck) {
        // Guide lines first
        this.effectsRenderer.renderGuideLines(truck.getTrailerCorners());
        
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

