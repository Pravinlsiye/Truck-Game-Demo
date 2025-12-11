// Effects Renderer - Single Responsibility: Visual effects and overlays
import { BaseRenderer } from './BaseRenderer.js';

export class EffectsRenderer extends BaseRenderer {
    constructor(ctx, canvas) {
        super(ctx);
        this.canvas = canvas;
        this.trailPoints = [];
        this.maxTrailPoints = 500;
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
    
    renderGuideLines(trailerCorners) {
        if (trailerCorners.length < 4) return;
        
        const rearLeft = trailerCorners[3];
        const rearRight = trailerCorners[2];
        const frontLeft = trailerCorners[0];
        
        // Calculate direction
        const dx = rearLeft.x - frontLeft.x;
        const dy = rearLeft.y - frontLeft.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / len;
        const dirY = dy / len;
        
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 2;
        
        // Red guide (left)
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(rearLeft.x, rearLeft.y);
        this.ctx.lineTo(rearLeft.x + dirX * 200, rearLeft.y + dirY * 200);
        this.ctx.stroke();
        
        // Green guide (right)
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(rearRight.x, rearRight.y);
        this.ctx.lineTo(rearRight.x + dirX * 200, rearRight.y + dirY * 200);
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
        this.ctx.beginPath();
        this.ctx.moveTo(truckRear.x, truckRear.y);
        this.ctx.lineTo(hitchPoint.x, hitchPoint.y);
        this.ctx.lineTo(trailerFront.x, trailerFront.y);
        this.ctx.strokeStyle = '#4b5563';
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
        
        // Hitch point
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(hitchPoint.x, hitchPoint.y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

