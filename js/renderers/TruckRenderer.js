// Truck Renderer - Single Responsibility: Render truck cab only
import { BaseRenderer } from './BaseRenderer.js';

export class TruckRenderer extends BaseRenderer {
    constructor(ctx) {
        super(ctx);
        // Truck colors - blue like reference
        this.cabColor = '#1e40af';
        this.cabDarkColor = '#1e3a8a';
        this.cabLightColor = '#3b82f6';
    }
    
    render(truck) {
        this.ctx.save();
        this.ctx.translate(truck.x, truck.y);
        this.ctx.rotate(truck.angle);
        
        const w = truck.width;
        const h = truck.height;
        
        this.drawShadow(w, h);
        this.drawCabBody(w, h);
        this.drawHood(w, h);
        this.drawRoofDetails(w, h);
        this.drawWindshield(w, h);
        this.drawExhausts(w, h);
        this.drawMirrors(w, h);
        this.drawFifthWheel(w, h);
        this.drawWheels(w, h, truck.steeringAngle);
        
        this.ctx.restore();
    }
    
    drawShadow(w, h) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 + 4, -h / 2 + 4, w + 2, h + 2, 4);
        this.ctx.fill();
    }
    
    drawCabBody(w, h) {
        // Main cab body
        this.ctx.fillStyle = this.cabColor;
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2, -h / 2 + 6, w, h - 10, [6, 6, 3, 3]);
        this.ctx.fill();
        
        // Side shading for 3D effect
        this.ctx.fillStyle = this.cabDarkColor;
        this.ctx.fillRect(-w / 2, -h / 2 + 8, 3, h - 16);
        this.ctx.fillRect(w / 2 - 3, -h / 2 + 8, 3, h - 16);
        
        // Top edge highlight
        this.ctx.fillStyle = this.cabLightColor;
        this.ctx.fillRect(-w / 2 + 3, -h / 2 + 8, w - 6, 2);
        
        // Sleeper section line
        this.ctx.strokeStyle = this.cabDarkColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 4, -h / 2 + h * 0.55);
        this.ctx.lineTo(w / 2 - 4, -h / 2 + h * 0.55);
        this.ctx.stroke();
    }
    
    drawHood(w, h) {
        // Front hood area
        this.ctx.fillStyle = this.cabColor;
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 + 2, -h / 2, w - 4, 10, [5, 5, 0, 0]);
        this.ctx.fill();
        
        // Hood highlight
        this.ctx.fillStyle = this.cabLightColor;
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 2, w - 8, 2);
        
        // Grille
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(-w / 2 + 5, -h / 2 + 1, w - 10, 5);
        
        // Grille lines
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 1;
        for (let i = -w / 2 + 8; i < w / 2 - 5; i += 3) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, -h / 2 + 1);
            this.ctx.lineTo(i, -h / 2 + 6);
            this.ctx.stroke();
        }
        
        // Headlights
        this.ctx.fillStyle = '#fef9c3';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 + 3, -h / 2 + 1, 6, 4, 1);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.roundRect(w / 2 - 9, -h / 2 + 1, 6, 4, 1);
        this.ctx.fill();
    }
    
    drawRoofDetails(w, h) {
        // Air dam/fairing on roof
        this.ctx.fillStyle = this.cabDarkColor;
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 6, -h / 2 + 7);
        this.ctx.lineTo(-w / 2 + 10, -h / 2 + 4);
        this.ctx.lineTo(w / 2 - 10, -h / 2 + 4);
        this.ctx.lineTo(w / 2 - 6, -h / 2 + 7);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Marker lights on roof
        this.ctx.fillStyle = '#fbbf24';
        for (let i = -6; i <= 6; i += 4) {
            this.ctx.beginPath();
            this.ctx.arc(i, -h / 2 + 6, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawWindshield(w, h) {
        // Main windshield
        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 + 4, -h / 2 + 11, w - 8, 14, [2, 2, 0, 0]);
        this.ctx.fill();
        
        // Windshield glare
        this.ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 6, -h / 2 + 13);
        this.ctx.lineTo(w / 2 - 10, -h / 2 + 13);
        this.ctx.lineTo(-w / 2 + 6, -h / 2 + 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Side windows
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 27, 5, 10);
        this.ctx.fillRect(w / 2 - 7, -h / 2 + 27, 5, 10);
    }
    
    drawExhausts(w, h) {
        // Chrome exhaust stacks - positioned beside cab
        const stackH = 28;
        const stackY = -h / 2 + 12;
        
        // Left stack
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-w / 2 - 4, stackY, 4, stackH);
        this.ctx.fillStyle = '#d1d5db';
        this.ctx.fillRect(-w / 2 - 3, stackY, 2, stackH);
        
        // Left cap
        this.ctx.fillStyle = '#4b5563';
        this.ctx.beginPath();
        this.ctx.ellipse(-w / 2 - 2, stackY - 1, 3, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right stack
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(w / 2, stackY, 4, stackH);
        this.ctx.fillStyle = '#d1d5db';
        this.ctx.fillRect(w / 2 + 1, stackY, 2, stackH);
        
        // Right cap
        this.ctx.fillStyle = '#4b5563';
        this.ctx.beginPath();
        this.ctx.ellipse(w / 2 + 2, stackY - 1, 3, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMirrors(w, h) {
        // Mirror arms
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 - 10, -h / 2 + 14, 8, 2);
        this.ctx.fillRect(w / 2 + 2, -h / 2 + 14, 8, 2);
        
        // Mirror housings
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 12, -h / 2 + 12, 5, 12);
        this.ctx.fillRect(w / 2 + 7, -h / 2 + 12, 5, 12);
        
        // Mirror glass
        this.ctx.fillStyle = '#93c5fd';
        this.ctx.fillRect(-w / 2 - 11, -h / 2 + 14, 3, 8);
        this.ctx.fillRect(w / 2 + 8, -h / 2 + 14, 3, 8);
    }
    
    drawFifthWheel(w, h) {
        // Fifth wheel plate
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 + 4, h / 2 - 10, w - 8, 8, 2);
        this.ctx.fill();
        
        // Kingpin slot
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.arc(0, h / 2 - 6, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawWheels(w, h, steeringAngle) {
        // Front steerable wheels
        this.drawWheel(-w / 2 - 3, -h / 2 + 18, steeringAngle, true);
        this.drawWheel(w / 2 + 3, -h / 2 + 18, steeringAngle, true);
        
        // Rear drive wheels (dual axle)
        this.drawWheel(-w / 2 - 3, h / 2 - 22, 0, false);
        this.drawWheel(-w / 2 - 3, h / 2 - 8, 0, false);
        this.drawWheel(w / 2 + 3, h / 2 - 22, 0, false);
        this.drawWheel(w / 2 + 3, h / 2 - 8, 0, false);
    }
    
    drawWheel(x, y, angle, steerable) {
        this.ctx.save();
        this.ctx.translate(x, y);
        if (steerable) {
            this.ctx.rotate(angle);
        }
        
        // Tire
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.roundRect(-4, -8, 8, 16, 2);
        this.ctx.fill();
        
        // Rim
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hub
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}
