// Trailer Renderer - Single Responsibility: Render trailer only
import { BaseRenderer } from './BaseRenderer.js';

export class TrailerRenderer extends BaseRenderer {
    constructor(ctx) {
        super(ctx);
    }
    
    render(trailer) {
        this.ctx.save();
        this.ctx.translate(trailer.x, trailer.y);
        this.ctx.rotate(trailer.angle);
        
        const w = trailer.width;
        const h = trailer.height;
        
        this.drawShadow(w, h);
        this.drawBody(w, h);
        this.drawRidges(w, h);
        this.drawLogo(w, h);
        this.drawDoors(w, h);
        this.drawBumper(w, h);
        this.drawLights(w, h);
        this.drawReflectors(w, h);
        this.drawWheels(w, h);
        
        this.ctx.restore();
    }
    
    drawShadow(w, h) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-w / 2 + 5, -h / 2 + 5, w, h);
    }
    
    drawBody(w, h) {
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.strokeStyle = '#d1d5db';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
    
    drawRidges(w, h) {
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        for (let i = -h / 2 + 10; i < h / 2 - 10; i += 6) {
            this.ctx.beginPath();
            this.ctx.moveTo(-w / 2 + 3, i);
            this.ctx.lineTo(w / 2 - 3, i);
            this.ctx.stroke();
        }
    }
    
    drawLogo(w, h) {
        // Logo background
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Logo text
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = 'bold 8px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('TRUCK', 0, 0);
    }
    
    drawDoors(w, h) {
        this.ctx.fillStyle = '#e5e7eb';
        this.ctx.fillRect(-w / 2 + 3, h / 2 - 20, w / 2 - 5, 16);
        this.ctx.fillRect(2, h / 2 - 20, w / 2 - 5, 16);
        
        // Door line
        this.ctx.strokeStyle = '#9ca3af';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, h / 2 - 20);
        this.ctx.lineTo(0, h / 2 - 4);
        this.ctx.stroke();
        
        // Handles
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-6, h / 2 - 14, 4, 6);
        this.ctx.fillRect(2, h / 2 - 14, 4, 6);
    }
    
    drawBumper(w, h) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
        
        // Yellow stripes
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -w / 2; i < w / 2; i += 12) {
            this.ctx.fillRect(i, h / 2 - 4, 6, 4);
        }
    }
    
    drawLights(w, h) {
        // Tail lights
        this.drawCircle(-w / 2 + 8, h / 2 - 12, 5, '#ef4444');
        this.drawCircle(w / 2 - 8, h / 2 - 12, 5, '#ef4444');
    }
    
    drawReflectors(w, h) {
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-w / 2, -h / 2 + 20, 3, 15);
        this.ctx.fillRect(-w / 2, h / 2 - 35, 3, 15);
        this.ctx.fillRect(w / 2 - 3, -h / 2 + 20, 3, 15);
        this.ctx.fillRect(w / 2 - 3, h / 2 - 35, 3, 15);
    }
    
    drawWheels(w, h) {
        this.ctx.fillStyle = '#1f2937';
        
        // Tandem axle wheels
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 55, 10, 18);
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 33, 10, 18);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 55, 10, 18);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 33, 10, 18);
        
        // Wheel rims
        this.drawCircle(-w / 2 - 3, h / 2 - 46, 4, '#6b7280');
        this.drawCircle(-w / 2 - 3, h / 2 - 24, 4, '#6b7280');
        this.drawCircle(w / 2 + 3, h / 2 - 46, 4, '#6b7280');
        this.drawCircle(w / 2 + 3, h / 2 - 24, 4, '#6b7280');
    }
}

