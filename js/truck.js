// Truck + Trailer Physics
export class Truck {
    constructor(x, y, angle) {
        // Truck (cab) properties
        this.x = x;
        this.y = y;
        this.angle = angle; // in radians
        this.width = 40;
        this.height = 60;
        
        // Physics properties
        this.speed = 0;
        this.maxSpeed = 3;
        this.acceleration = 0.08;
        this.deceleration = 0.03;
        this.brakeForce = 0.1;
        this.steeringAngle = 0;
        this.maxSteeringAngle = Math.PI / 6; // 30 degrees
        this.steeringSpeed = 0.05;
        this.steeringReturn = 0.08;
        
        // Trailer properties  
        this.trailerAngle = angle;
        this.trailerWidth = 50;
        this.trailerHeight = 120;
        
        // Connection geometry
        this.cabToHitch = 45; // Distance from truck center to hitch point
        this.hitchToTrailerCenter = 70; // Distance from hitch to trailer center
        
        // Trailer center position
        this.trailerCenterX = 0;
        this.trailerCenterY = 0;
        
        // Initialize trailer position
        this.initTrailerPosition();
    }
    
    // Get direction vector for an angle (pointing "forward")
    getDirection(angle) {
        return {
            x: Math.sin(angle),
            y: -Math.cos(angle)
        };
    }
    
    // Initialize trailer position behind the truck
    initTrailerPosition() {
        // Get the hitch point (behind the truck)
        const hitch = this.getHitchPoint();
        
        // Get backward direction for trailer (trailer extends back from hitch)
        const backDir = this.getDirection(this.trailerAngle + Math.PI);
        
        // Trailer center is behind the hitch
        this.trailerCenterX = hitch.x + backDir.x * this.hitchToTrailerCenter;
        this.trailerCenterY = hitch.y + backDir.y * this.hitchToTrailerCenter;
    }
    
    // Get the hitch point (rear of truck where trailer connects)
    getHitchPoint() {
        // Get backward direction from truck
        const backDir = this.getDirection(this.angle + Math.PI);
        
        return {
            x: this.x + backDir.x * this.cabToHitch,
            y: this.y + backDir.y * this.cabToHitch
        };
    }
    
    // Get trailer's front point (where it connects to hitch)
    getTrailerFrontPoint() {
        // Get forward direction from trailer
        const fwdDir = this.getDirection(this.trailerAngle);
        
        return {
            x: this.trailerCenterX + fwdDir.x * (this.trailerHeight / 2),
            y: this.trailerCenterY + fwdDir.y * (this.trailerHeight / 2)
        };
    }
    
    // Calculate angle difference between truck and trailer (for jackknife detection)
    getJacknifeAngle() {
        let angleDiff = this.angle - this.trailerAngle;
        
        // Normalize to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        return angleDiff;
    }
    
    // Check if jackknifed (angle too extreme)
    isJackknifed() {
        const maxJacknifeAngle = Math.PI / 2.5; // About 72 degrees
        return Math.abs(this.getJacknifeAngle()) > maxJacknifeAngle;
    }
    
    update(input) {
        // Calculate current jackknife angle
        const jacknifeAngle = this.getJacknifeAngle();
        const maxJacknifeAngle = Math.PI / 2.5; // About 72 degrees
        const isNearJacknife = Math.abs(jacknifeAngle) > maxJacknifeAngle * 0.8;
        const isJackknifed = Math.abs(jacknifeAngle) > maxJacknifeAngle;
        
        // Handle steering
        if (input.steerLeft) {
            this.steeringAngle = Math.max(this.steeringAngle - this.steeringSpeed, -this.maxSteeringAngle);
        } else if (input.steerRight) {
            this.steeringAngle = Math.min(this.steeringAngle + this.steeringSpeed, this.maxSteeringAngle);
        } else {
            // Return steering to center
            if (Math.abs(this.steeringAngle) < this.steeringReturn) {
                this.steeringAngle = 0;
            } else if (this.steeringAngle > 0) {
                this.steeringAngle -= this.steeringReturn;
            } else {
                this.steeringAngle += this.steeringReturn;
            }
        }
        
        // Handle acceleration/braking with jackknife prevention
        if (input.accelerate) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (input.brake) {
            // Block reverse if jackknifed - only allow forward to recover
            if (isJackknifed && this.speed <= 0) {
                // Can't reverse further when jackknifed - stop!
                this.speed = 0;
            } else if (isNearJacknife && this.speed < 0) {
                // Slow down reverse when approaching jackknife
                this.speed = Math.max(this.speed - this.brakeForce * 0.3, -this.maxSpeed * 0.3);
            } else {
                this.speed = Math.max(this.speed - this.brakeForce, -this.maxSpeed * 0.6);
            }
        } else {
            // Natural deceleration
            if (Math.abs(this.speed) < this.deceleration) {
                this.speed = 0;
            } else if (this.speed > 0) {
                this.speed -= this.deceleration;
            } else {
                this.speed += this.deceleration;
            }
        }
        
        // Update truck position and angle
        if (this.speed !== 0) {
            // Turning based on steering
            const turnFactor = this.steeringAngle * (this.speed > 0 ? 1 : -1);
            this.angle += turnFactor * Math.abs(this.speed) * 0.02;
            
            // Move truck in its forward direction
            const fwdDir = this.getDirection(this.angle);
            this.x += fwdDir.x * this.speed;
            this.y += fwdDir.y * this.speed;
        }
        
        // Update trailer to follow hitch
        this.updateTrailerPhysics();
    }
    
    updateTrailerPhysics() {
        const hitch = this.getHitchPoint();
        
        // Calculate angle from trailer center to hitch
        const dx = hitch.x - this.trailerCenterX;
        const dy = hitch.y - this.trailerCenterY;
        const distToHitch = Math.sqrt(dx * dx + dy * dy);
        
        if (distToHitch > 0.1) {
            // Calculate target angle (trailer should point toward hitch)
            const targetAngle = Math.atan2(dx, -dy);
            
            // Smoothly rotate trailer toward target
            let angleDiff = targetAngle - this.trailerAngle;
            
            // Normalize to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Apply rotation with damping
            this.trailerAngle += angleDiff * 0.15;
            
            // Move trailer center to maintain connection distance
            const targetDist = this.hitchToTrailerCenter;
            const currentDist = distToHitch;
            
            if (Math.abs(currentDist - targetDist) > 0.1) {
                // Calculate direction from trailer to hitch
                const dirX = dx / distToHitch;
                const dirY = dy / distToHitch;
                
                // Move trailer to maintain proper distance
                const correction = currentDist - targetDist;
                this.trailerCenterX += dirX * correction;
                this.trailerCenterY += dirY * correction;
            }
        }
        
        // Normalize trailer angle
        while (this.trailerAngle > Math.PI) this.trailerAngle -= 2 * Math.PI;
        while (this.trailerAngle < -Math.PI) this.trailerAngle += 2 * Math.PI;
    }
    
    // Get truck corners for collision detection
    getTruckCorners() {
        return this.getRotatedRectCorners(
            this.x, this.y, this.width, this.height, this.angle
        );
    }
    
    // Get trailer corners for collision detection
    getTrailerCorners() {
        return this.getRotatedRectCorners(
            this.trailerCenterX, this.trailerCenterY, 
            this.trailerWidth, this.trailerHeight, 
            this.trailerAngle
        );
    }
    
    // Get corners of a rotated rectangle
    getRotatedRectCorners(cx, cy, width, height, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const hw = width / 2;
        const hh = height / 2;
        
        return [
            { x: cx + (-hw * cos - -hh * sin), y: cy + (-hw * sin + -hh * cos) },
            { x: cx + (hw * cos - -hh * sin), y: cy + (hw * sin + -hh * cos) },
            { x: cx + (hw * cos - hh * sin), y: cy + (hw * sin + hh * cos) },
            { x: cx + (-hw * cos - hh * sin), y: cy + (-hw * sin + hh * cos) }
        ];
    }
    
    // Reset truck to initial position
    reset(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 0;
        this.steeringAngle = 0;
        this.trailerAngle = angle;
        this.initTrailerPosition();
    }
}
