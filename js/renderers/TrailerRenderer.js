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
        this.drawUndercarriage(w, h);
        this.drawContainerBody(w, h);
        this.drawContainerRidges(w, h);
        this.drawBranding(w, h);
        this.drawFrontSection(w, h);
        this.drawRearDoors(w, h);
        this.drawLights(w, h);
        this.drawWheels(w, h);
        
        this.ctx.restore();
    }
    
    drawShadow(w, h) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w + 2, h + 2);
    }
    
    drawUndercarriage(w, h) {
        // Frame rails visible from top
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 + 4, h / 2 - 50, 3, 45);
        this.ctx.fillRect(w / 2 - 7, h / 2 - 50, 3, 45);
    }
    
    drawContainerBody(w, h) {
        // Main container - white/light gray
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2, -h / 2, w, h, 3);
        this.ctx.fill();
        
        // Container border
        this.ctx.strokeStyle = '#d4d4d4';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
        
        // Side edge shadows
        this.ctx.fillStyle = '#e5e5e5';
        this.ctx.fillRect(-w / 2, -h / 2, 3, h);
        this.ctx.fillRect(w / 2 - 3, -h / 2, 3, h);
    }
    
    drawContainerRidges(w, h) {
        // Horizontal corrugation lines
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        for (let y = -h / 2 + 8; y < h / 2 - 20; y += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(-w / 2 + 4, y);
            this.ctx.lineTo(w / 2 - 4, y);
            this.ctx.stroke();
        }
    }
    
    drawBranding(w, h) {
        // Logo circle background
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.ellipse(0, -h / 6, 16, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Logo border
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Logo icon (simplified truck)
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-6, -h / 6 - 4, 12, 8);
        this.ctx.fillRect(-8, -h / 6, 4, 4);
        
        // Brand text area
        this.ctx.fillStyle = '#374151';
        this.ctx.font = 'bold 7px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('TRUCK', 0, h / 10);
        this.ctx.fillText('PRO', 0, h / 10 + 9);
        
        // Small X mark (like reference)
        this.ctx.strokeStyle = '#9ca3af';
        this.ctx.lineWidth = 1;
        const xPos = w / 4;
        const yPos = -h / 4;
        this.ctx.beginPath();
        this.ctx.moveTo(xPos - 4, yPos - 4);
        this.ctx.lineTo(xPos + 4, yPos + 4);
        this.ctx.moveTo(xPos + 4, yPos - 4);
        this.ctx.lineTo(xPos - 4, yPos + 4);
        this.ctx.stroke();
    }
    
    drawFrontSection(w, h) {
        // Front reinforcement (where kingpin is)
        this.ctx.fillStyle = '#d4d4d4';
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, 10);
        
        // Kingpin area
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(0, -h / 2 + 6, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Kingpin center
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.arc(0, -h / 2 + 6, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRearDoors(w, h) {
        // Rear door section
        this.ctx.fillStyle = '#ebebeb';
        this.ctx.fillRect(-w / 2 + 3, h / 2 - 18, w - 6, 15);
        
        // Door split line
        this.ctx.strokeStyle = '#a3a3a3';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, h / 2 - 18);
        this.ctx.lineTo(0, h / 2 - 3);
        this.ctx.stroke();
        
        // Door handles
        this.ctx.fillStyle = '#525252';
        this.ctx.fillRect(-8, h / 2 - 12, 5, 6);
        this.ctx.fillRect(3, h / 2 - 12, 5, 6);
        
        // Rear bumper
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
        
        // Hazard stripes on bumper
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -w / 2 + 2; i < w / 2 - 4; i += 10) {
            this.ctx.fillRect(i, h / 2 - 3, 5, 3);
        }
    }
    
    drawLights(w, h) {
        // Tail lights
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 + 4, h / 2 - 10, 6, 5, 1);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.roundRect(w / 2 - 10, h / 2 - 10, 6, 5, 1);
        this.ctx.fill();
        
        // Turn signals
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(-w / 2 + 4, h / 2 - 16, 4, 4);
        this.ctx.fillRect(w / 2 - 8, h / 2 - 16, 4, 4);
        
        // Side marker lights (reflectors)
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-w / 2, -h / 2 + 25, 2, 12);
        this.ctx.fillRect(-w / 2, h / 2 - 60, 2, 12);
        this.ctx.fillRect(w / 2 - 2, -h / 2 + 25, 2, 12);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 60, 2, 12);
    }
    
    drawWheels(w, h) {
        // Tandem axle wheels at rear
        const wheelY1 = h / 2 - 45;
        const wheelY2 = h / 2 - 28;
        
        // Left side wheels
        this.drawWheel(-w / 2 - 4, wheelY1);
        this.drawWheel(-w / 2 - 4, wheelY2);
        
        // Right side wheels
        this.drawWheel(w / 2 + 4, wheelY1);
        this.drawWheel(w / 2 + 4, wheelY2);
    }
    
    drawWheel(x, y) {
        // Tire
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.roundRect(x - 4, y - 7, 8, 14, 2);
        this.ctx.fill();
        
        // Rim
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hub
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
