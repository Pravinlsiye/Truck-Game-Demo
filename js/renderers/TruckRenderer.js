// Truck Renderer - Single Responsibility: Render truck cab only
import { BaseRenderer } from './BaseRenderer.js';

export class TruckRenderer extends BaseRenderer {
    constructor(ctx) {
        super(ctx);
    }
    
    render(truck) {
        this.ctx.save();
        this.ctx.translate(truck.x, truck.y);
        this.ctx.rotate(truck.angle);
        
        const w = truck.width;
        const h = truck.height;
        
        this.drawShadow(w, h);
        this.drawBody(w, h);
        this.drawGrille(w, h);
        this.drawWindshield(w, h);
        this.drawDetails(w, h);
        this.drawExhausts(w, h);
        this.drawMirrors(w, h);
        this.drawWheels(w, h, truck.steeringAngle);
        
        this.ctx.restore();
    }
    
    drawShadow(w, h) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w, h);
    }
    
    drawBody(w, h) {
        this.ctx.fillStyle = '#2563eb';
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2, h / 2);
        this.ctx.lineTo(-w / 2, -h / 2 + 12);
        this.ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + 8, -h / 2);
        this.ctx.lineTo(w / 2 - 8, -h / 2);
        this.ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 12);
        this.ctx.lineTo(w / 2, h / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Darker roof
        this.ctx.fillStyle = '#1d4ed8';
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, 15);
    }
    
    drawGrille(w, h) {
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.fillRect(-w / 2 + 6, -h / 2 + 4, w - 12, 10);
        
        this.ctx.strokeStyle = '#6b7280';
        this.ctx.lineWidth = 1;
        for (let i = -w / 2 + 10; i < w / 2 - 6; i += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, -h / 2 + 4);
            this.ctx.lineTo(i, -h / 2 + 14);
            this.ctx.stroke();
        }
    }
    
    drawWindshield(w, h) {
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 16, w - 8, 18);
        
        // Glare
        this.ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 6, -h / 2 + 18);
        this.ctx.lineTo(w / 2 - 10, -h / 2 + 18);
        this.ctx.lineTo(-w / 2 + 6, -h / 2 + 28);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Side windows
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.fillRect(-w / 2 + 3, -h / 2 + 36, 8, 14);
        this.ctx.fillRect(w / 2 - 11, -h / 2 + 36, 8, 14);
    }
    
    drawDetails(w, h) {
        // Headlights
        this.ctx.fillStyle = '#fef9c3';
        this.drawCircle(-w / 2 + 10, -h / 2 + 8, 4, '#fef9c3');
        this.drawCircle(w / 2 - 10, -h / 2 + 8, 4, '#fef9c3');
        
        // Headlight glow
        this.ctx.fillStyle = 'rgba(254, 249, 195, 0.3)';
        this.drawCircle(-w / 2 + 10, -h / 2 + 8, 7, 'rgba(254, 249, 195, 0.3)');
        this.drawCircle(w / 2 - 10, -h / 2 + 8, 7, 'rgba(254, 249, 195, 0.3)');
        
        // Roof marker lights
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -10; i <= 10; i += 5) {
            this.drawCircle(i, -h / 2 + 3, 2, '#f59e0b');
        }
        
        // Fifth wheel plate
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 + 8, h / 2 - 10, w - 16, 8);
    }
    
    drawExhausts(w, h) {
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(-w / 2 - 4, -h / 2 + 18, 5, 30);
        this.ctx.fillRect(w / 2 - 1, -h / 2 + 18, 5, 30);
        
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 - 5, -h / 2 + 16, 7, 4);
        this.ctx.fillRect(w / 2 - 2, -h / 2 + 16, 7, 4);
    }
    
    drawMirrors(w, h) {
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 10, -h / 2 + 20, 8, 14);
        this.ctx.fillRect(w / 2 + 2, -h / 2 + 20, 8, 14);
        
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(-w / 2 - 9, -h / 2 + 22, 6, 10);
        this.ctx.fillRect(w / 2 + 3, -h / 2 + 22, 6, 10);
    }
    
    drawWheels(w, h, steeringAngle) {
        // Front wheels (steered)
        this.drawSteerableWheel(-w / 2 - 6, -h / 2 + 24, steeringAngle);
        this.drawSteerableWheel(w / 2 + 6, -h / 2 + 24, steeringAngle);
        
        // Rear dual wheels
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 30, 12, 18);
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 10, 12, 18);
        this.ctx.fillRect(w / 2 - 4, h / 2 - 30, 12, 18);
        this.ctx.fillRect(w / 2 - 4, h / 2 - 10, 12, 18);
        
        // Wheel hubs
        this.drawCircle(-w / 2 - 2, h / 2 - 21, 4, '#6b7280');
        this.drawCircle(-w / 2 - 2, h / 2 - 1, 4, '#6b7280');
        this.drawCircle(w / 2 + 2, h / 2 - 21, 4, '#6b7280');
        this.drawCircle(w / 2 + 2, h / 2 - 1, 4, '#6b7280');
    }
    
    drawSteerableWheel(x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-5, -10, 10, 20);
        
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}

