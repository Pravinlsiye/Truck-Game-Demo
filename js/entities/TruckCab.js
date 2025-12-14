// TruckCab class - Single Responsibility: Truck cab physics and behavior
import { Vehicle } from './Vehicle.js';
import { Trailer } from './Trailer.js';

export class TruckCab extends Vehicle {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
            angle: config.angle,
            width: config.width || 36,  // Narrower cab
            height: config.height || 50  // Shorter cab for realistic proportions
        });
        
        // Physics config - Realistic steering
        this.physics = {
            speed: 0,
            maxSpeed: config.maxSpeed || 3,
            acceleration: config.acceleration || 0.08,
            deceleration: config.deceleration || 0.03,
            brakeForce: config.brakeForce || 0.1,
            steeringAngle: 0,
            maxSteeringAngle: config.maxSteeringAngle || Math.PI / 4,  // 45 degrees max
            steeringSpeed: config.steeringSpeed || 0.02,  // Slower rotation for realism
            steeringReturn: config.steeringReturn || 0.015  // Slower return to center
        };
        
        // Hitch config - Semi truck has hitch at rear of cab frame
        this.hitchDistance = config.hitchDistance || 20;  // Right at cab rear
        
        // Create trailer - longer for realistic 53ft container look
        this.trailer = new Trailer({
            x: config.x,
            y: config.y,
            angle: config.angle,
            width: config.trailerWidth || 44,  // Slightly wider than cab
            height: config.trailerHeight || 160,  // Much longer trailer
            pivotDistance: config.trailerPivotDistance || 8  // Kingpin close to front
        });
        
        // Initialize trailer position
        this.initTrailerPosition();
    }
    
    // Getters for external access
    get speed() { return this.physics.speed; }
    get maxSpeed() { return this.physics.maxSpeed; }
    get steeringAngle() { return this.physics.steeringAngle; }
    get maxSteeringAngle() { return this.physics.maxSteeringAngle; }
    get trailerAngle() { return this.trailer.angle; }
    get trailerWidth() { return this.trailer.width; }
    get trailerHeight() { return this.trailer.height; }
    get trailerCenterX() { return this.trailer.x; }
    get trailerCenterY() { return this.trailer.y; }
    
    initTrailerPosition() {
        const hitch = this.getHitchPoint();
        const backDir = this.getDirection(this.trailer.angle + Math.PI);
        this.trailer.x = hitch.x + backDir.x * this.trailer.pivotDistance;
        this.trailer.y = hitch.y + backDir.y * this.trailer.pivotDistance;
    }
    
    getHitchPoint() {
        const backDir = this.getDirection(this.angle + Math.PI);
        return {
            x: this.x + backDir.x * this.hitchDistance,
            y: this.y + backDir.y * this.hitchDistance
        };
    }
    
    getTrailerFrontPoint() {
        return this.trailer.getFrontPoint();
    }
    
    getTrailerCorners() {
        return this.trailer.getCorners();
    }
    
    getTruckCorners() {
        return this.getCorners();
    }
    
    // Jackknife detection
    getJacknifeAngle() {
        let angleDiff = this.angle - this.trailer.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        return angleDiff;
    }
    
    isJackknifed() {
        return Math.abs(this.getJacknifeAngle()) > Math.PI / 2.5;
    }
    
    update(input) {
        this.updateSteering(input);
        this.updateSpeed(input);
        this.updatePosition();
        this.trailer.followHitch(this.getHitchPoint());
    }
    
    updateSteering(input) {
        const p = this.physics;
        
        if (input.steerLeft) {
            p.steeringAngle = Math.max(p.steeringAngle - p.steeringSpeed, -p.maxSteeringAngle);
        } else if (input.steerRight) {
            p.steeringAngle = Math.min(p.steeringAngle + p.steeringSpeed, p.maxSteeringAngle);
        } else {
            // Return to center
            if (Math.abs(p.steeringAngle) < p.steeringReturn) {
                p.steeringAngle = 0;
            } else if (p.steeringAngle > 0) {
                p.steeringAngle -= p.steeringReturn;
            } else {
                p.steeringAngle += p.steeringReturn;
            }
        }
    }
    
    updateSpeed(input) {
        const p = this.physics;
        const jacknifeAngle = Math.abs(this.getJacknifeAngle());
        const maxJacknifeAngle = Math.PI / 2.5;
        const isNearJacknife = jacknifeAngle > maxJacknifeAngle * 0.8;
        const isJackknifed = jacknifeAngle > maxJacknifeAngle;
        
        if (input.accelerate) {
            p.speed = Math.min(p.speed + p.acceleration, p.maxSpeed);
        } else if (input.brake) {
            // Jackknife prevention
            if (isJackknifed && p.speed <= 0) {
                p.speed = 0;
            } else if (isNearJacknife && p.speed < 0) {
                p.speed = Math.max(p.speed - p.brakeForce * 0.3, -p.maxSpeed * 0.3);
            } else {
                p.speed = Math.max(p.speed - p.brakeForce, -p.maxSpeed * 0.6);
            }
        } else {
            // Natural deceleration
            if (Math.abs(p.speed) < p.deceleration) {
                p.speed = 0;
            } else if (p.speed > 0) {
                p.speed -= p.deceleration;
            } else {
                p.speed += p.deceleration;
            }
        }
    }
    
    updatePosition() {
        if (this.physics.speed === 0) return;
        
        const p = this.physics;
        const turnFactor = p.steeringAngle * (p.speed > 0 ? 1 : -1);
        this.angle += turnFactor * Math.abs(p.speed) * 0.02;
        
        const fwdDir = this.getDirection(this.angle);
        this.x += fwdDir.x * p.speed;
        this.y += fwdDir.y * p.speed;
    }
    
    reset(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.physics.speed = 0;
        this.physics.steeringAngle = 0;
        this.trailer.angle = angle;
        this.initTrailerPosition();
    }
}

