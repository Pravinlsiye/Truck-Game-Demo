// Effects Renderer - Single Responsibility: Visual effects and overlays
import { BaseRenderer } from './BaseRenderer.js';

export class EffectsRenderer extends BaseRenderer {
    constructor(ctx, canvas) {
        super(ctx);
        this.canvas = canvas;
        this.trailPoints = [];
        this.maxTrailPoints = 500;
        
        // Guide line settings
        this.guideSettings = {
            truck: {
                enabled: true,
                front: true,
                back: true
            },
            trailer: {
                enabled: true,
                front: false,  // Trailer only needs back lines by default
                back: true
            }
        };
    }
    
    // Update guide settings
    setGuideSettings(settings) {
        this.guideSettings = { ...this.guideSettings, ...settings };
    }
    
    getGuideSettings() {
        return this.guideSettings;
    }
    
    addTrailPoint(x, y) {
        this.trailPoints.push({ x, y });
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
    }
    
    clearTrail() {
        this.trailPoints = [];
    }
    
    renderTrail() {
        if (this.trailPoints.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        
        for (let i = 1; i < this.trailPoints.length; i++) {
            this.ctx.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }
    
    renderGuideLines(truck) {
        // Red lines - TRAILER path
        if (this.guideSettings.trailer.enabled) {
            this.renderTrailerGuides(truck);
        }
        
        // Green lines - TRUCK path
        if (this.guideSettings.truck.enabled) {
            this.renderTruckGuides(truck);
        }
    }
    
    renderTrailerGuides(truck) {
        const trailerCorners = truck.getTrailerCorners();
        if (trailerCorners.length < 4) return;
        
        const settings = this.guideSettings.trailer;
        if (!settings.front && !settings.back) return;
        
        // Corners of trailer
        const frontLeft = trailerCorners[0];
        const frontRight = trailerCorners[1];
        const rearRight = trailerCorners[2];
        const rearLeft = trailerCorners[3];
        
        // Direction trailer is pointing (front to back)
        const dx = rearLeft.x - frontLeft.x;
        const dy = rearLeft.y - frontLeft.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / len;
        const dirY = dy / len;
        
        this.ctx.setLineDash([8, 4]);
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        
        const extendLength = 800;
        
        // Left side
        this.ctx.beginPath();
        if (settings.front) {
            this.ctx.moveTo(frontLeft.x - dirX * extendLength, frontLeft.y - dirY * extendLength);
            this.ctx.lineTo(frontLeft.x, frontLeft.y);
        }
        if (settings.back) {
            if (!settings.front) this.ctx.moveTo(rearLeft.x, rearLeft.y);
            else this.ctx.lineTo(rearLeft.x, rearLeft.y);
            this.ctx.lineTo(rearLeft.x + dirX * extendLength, rearLeft.y + dirY * extendLength);
        }
        this.ctx.stroke();
        
        // Right side
        this.ctx.beginPath();
        if (settings.front) {
            this.ctx.moveTo(frontRight.x - dirX * extendLength, frontRight.y - dirY * extendLength);
            this.ctx.lineTo(frontRight.x, frontRight.y);
        }
        if (settings.back) {
            if (!settings.front) this.ctx.moveTo(rearRight.x, rearRight.y);
            else this.ctx.lineTo(rearRight.x, rearRight.y);
            this.ctx.lineTo(rearRight.x + dirX * extendLength, rearRight.y + dirY * extendLength);
        }
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    renderTruckGuides(truck) {
        const truckCorners = truck.getTruckCorners();
        if (truckCorners.length < 4) return;
        
        const settings = this.guideSettings.truck;
        if (!settings.front && !settings.back) return;
        
        // Corners of truck
        const frontLeft = truckCorners[0];
        const frontRight = truckCorners[1];
        const rearRight = truckCorners[2];
        const rearLeft = truckCorners[3];
        
        // Direction truck is pointing (back to front)
        const dx = frontLeft.x - rearLeft.x;
        const dy = frontLeft.y - rearLeft.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / len;
        const dirY = dy / len;
        
        this.ctx.setLineDash([8, 4]);
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
        
        const extendLength = 800;
        
        // Left side
        this.ctx.beginPath();
        if (settings.back) {
            this.ctx.moveTo(rearLeft.x - dirX * extendLength, rearLeft.y - dirY * extendLength);
            this.ctx.lineTo(rearLeft.x, rearLeft.y);
        }
        if (settings.front) {
            if (!settings.back) this.ctx.moveTo(frontLeft.x, frontLeft.y);
            else this.ctx.lineTo(frontLeft.x, frontLeft.y);
            this.ctx.lineTo(frontLeft.x + dirX * extendLength, frontLeft.y + dirY * extendLength);
        }
        this.ctx.stroke();
        
        // Right side
        this.ctx.beginPath();
        if (settings.back) {
            this.ctx.moveTo(rearRight.x - dirX * extendLength, rearRight.y - dirY * extendLength);
            this.ctx.lineTo(rearRight.x, rearRight.y);
        }
        if (settings.front) {
            if (!settings.back) this.ctx.moveTo(frontRight.x, frontRight.y);
            else this.ctx.lineTo(frontRight.x, frontRight.y);
            this.ctx.lineTo(frontRight.x + dirX * extendLength, frontRight.y + dirY * extendLength);
        }
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    renderCollisionEffect() {
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderSuccessEffect() {
        this.ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderJacknifeWarning(jacknifeAngle, maxAngle) {
        const warningThreshold = maxAngle * 0.8;
        
        if (Math.abs(jacknifeAngle) <= warningThreshold) return;
        
        const isLocked = Math.abs(jacknifeAngle) >= maxAngle;
        
        // Overlay
        this.ctx.fillStyle = isLocked 
            ? 'rgba(239, 68, 68, 0.15)' 
            : 'rgba(251, 191, 36, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Warning text background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width / 2 - 180, 25, 360, 30);
        
        // Warning text
        this.ctx.fillStyle = isLocked ? '#ef4444' : '#fbbf24';
        this.ctx.font = 'bold 18px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        const message = isLocked 
            ? '⚠ JACKKNIFE! Drive forward to recover' 
            : '⚠ Warning: Extreme angle';
        this.ctx.fillText(message, this.canvas.width / 2, 32);
    }
    
    renderHitch(hitchPoint, truckRear, trailerFront) {
        // Fifth wheel coupling - thicker connection bar
        this.ctx.beginPath();
        this.ctx.moveTo(truckRear.x, truckRear.y);
        this.ctx.lineTo(trailerFront.x, trailerFront.y);
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        
        // Kingpin (hitch point)
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.arc(hitchPoint.x, hitchPoint.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner kingpin detail
        this.ctx.fillStyle = '#4b5563';
        this.ctx.beginPath();
        this.ctx.arc(hitchPoint.x, hitchPoint.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

