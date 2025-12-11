// Trailer class - Single Responsibility: Trailer behavior only
import { Vehicle } from './Vehicle.js';

export class Trailer extends Vehicle {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
            angle: config.angle,
            width: config.width || 50,
            height: config.height || 120
        });
        
        this.pivotDistance = config.pivotDistance || 60; // Distance from center to front pivot
    }
    
    // Get the front pivot point (where it connects to hitch)
    getFrontPoint() {
        const fwdDir = this.getDirection(this.angle);
        return {
            x: this.x + fwdDir.x * (this.height / 2),
            y: this.y + fwdDir.y * (this.height / 2)
        };
    }
    
    // Update trailer to follow a hitch point
    followHitch(hitchPoint, damping = 0.15) {
        // Calculate direction from trailer center to hitch
        const dx = hitchPoint.x - this.x;
        const dy = hitchPoint.y - this.y;
        const distToHitch = Math.sqrt(dx * dx + dy * dy);
        
        if (distToHitch < 0.1) return;
        
        // Calculate target angle (trailer should point toward hitch)
        const targetAngle = Math.atan2(dx, -dy);
        
        // Smoothly rotate toward target
        let angleDiff = targetAngle - this.angle;
        
        // Normalize to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Apply rotation with damping
        this.angle += angleDiff * damping;
        
        // Normalize angle
        while (this.angle > Math.PI) this.angle -= 2 * Math.PI;
        while (this.angle < -Math.PI) this.angle += 2 * Math.PI;
        
        // Maintain connection distance
        const targetDist = this.pivotDistance + this.height / 2;
        const dirX = dx / distToHitch;
        const dirY = dy / distToHitch;
        const correction = distToHitch - targetDist;
        
        this.x += dirX * correction;
        this.y += dirY * correction;
    }
}

