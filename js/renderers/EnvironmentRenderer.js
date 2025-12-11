// Environment Renderer - Single Responsibility: Render environment elements
import { BaseRenderer } from './BaseRenderer.js';

export class EnvironmentRenderer extends BaseRenderer {
    constructor(ctx, canvas) {
        super(ctx);
        this.canvas = canvas;
    }
    
    renderBackground() {
        // Asphalt
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderAsphaltTexture();
        this.renderBoundaryFrame();
    }
    
    renderAsphaltTexture() {
        // Dark spots
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Light spots
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    renderBoundaryFrame() {
        const margin = 15;
        const thickness = 8;
        
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = thickness + 4;
        this.ctx.strokeRect(margin, margin, 
            this.canvas.width - margin * 2, 
            this.canvas.height - margin * 2);
        
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = thickness;
        this.ctx.strokeRect(margin, margin, 
            this.canvas.width - margin * 2, 
            this.canvas.height - margin * 2);
    }
    
    renderParkingZone(zone) {
        const { x, y, width, height, angle = 0 } = zone;
        const cx = x + width / 2;
        const cy = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        // Background
        this.ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // White lines
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        // Left, right, back lines
        this.ctx.beginPath();
        this.ctx.moveTo(-width / 2, -height / 2);
        this.ctx.lineTo(-width / 2, height / 2);
        this.ctx.moveTo(width / 2, -height / 2);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.moveTo(-width / 2, height / 2);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.stroke();
        
        // Entry arrow
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -height / 2 + 20);
        this.ctx.lineTo(-15, -height / 2 + 40);
        this.ctx.lineTo(15, -height / 2 + 40);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    renderParkingBays(zone, count = 2) {
        const { x, y, width, height, angle = 0 } = zone;
        
        for (let i = 1; i <= count; i++) {
            const offsetX = x + (width + 10) * i;
            const cx = offsetX + width / 2;
            const cy = y + height / 2;
            
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate(angle);
            
            this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
            this.ctx.fillRect(-width / 2, -height / 2, width, height);
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(-width / 2, -height / 2);
            this.ctx.lineTo(-width / 2, height / 2);
            this.ctx.lineTo(width / 2, height / 2);
            this.ctx.lineTo(width / 2, -height / 2);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    renderObstacle(obstacle) {
        const { x, y, width, height, angle = 0, type = 'barrier' } = obstacle;
        const cx = x + width / 2;
        const cy = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        switch (type) {
            case 'barrier':
                this.renderBarrier(width, height);
                break;
            case 'wall':
                this.renderWall(width, height);
                break;
            case 'cone':
                this.renderCone(width, height);
                break;
            case 'car':
                this.renderCar(width, height);
                break;
        }
        
        this.ctx.restore();
    }
    
    renderBarrier(w, h) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
        
        // Hazard stripes
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(-w / 2, -h / 2, w, h);
        this.ctx.clip();
        
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -w - h; i < w + h; i += 20) {
            this.ctx.save();
            this.ctx.translate(i, 0);
            this.ctx.rotate(Math.PI / 4);
            this.ctx.fillRect(-5, -h, 10, h * 3);
            this.ctx.restore();
        }
        this.ctx.restore();
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
    
    renderWall(w, h) {
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
        this.ctx.strokeStyle = '#4b5563';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
    
    renderCone(w, h) {
        this.ctx.fillStyle = '#f97316';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(w / 2, h / 2);
        this.ctx.lineTo(-w / 2, h / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-w / 3, -h / 4, w / 1.5, 4);
        this.ctx.fillRect(-w / 4, h / 6, w / 2, 4);
    }
    
    renderCar(w, h) {
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
        
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 + 5, -h / 4, w - 10, h / 2);
        
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-w / 2 + 3, -h / 2 + 3, 6, 4);
        this.ctx.fillRect(w / 2 - 9, -h / 2 + 3, 6, 4);
    }
}

