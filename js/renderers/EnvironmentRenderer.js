// Environment Renderer - Single Responsibility: Render environment elements
import { BaseRenderer } from './BaseRenderer.js';

export class EnvironmentRenderer extends BaseRenderer {
    constructor(ctx, canvas) {
        super(ctx);
        this.canvas = canvas;
    }
    
    renderBackground(cameraX = 0, cameraY = 0) {
        // Optimization: Only draw background for the visible screen area
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Asphalt background (draw only visible area)
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(cameraX, cameraY, w, h);
        
        this.renderAsphaltTexture(cameraX, cameraY, w, h);
    }
    
    renderAsphaltTexture(x, y, w, h) {
        // Simple "grain" that moves with camera (screen space)
        const dotCount = 100;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        
        for (let i = 0; i < dotCount; i++) {
            const dx = Math.random() * w;
            const dy = Math.random() * h;
            this.ctx.fillRect(x + dx, y + dy, 2, 2);
        }
    }

    renderRoads(roads) {
        if (!roads || roads.length === 0) return;

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        for (const road of roads) {
            if (road.points.length < 2) continue;

            this.ctx.beginPath();
            const p0 = road.points[0];
            this.ctx.moveTo(p0.x, p0.y);
            
            for (let i = 1; i < road.points.length; i++) {
                this.ctx.lineTo(road.points[i].x, road.points[i].y);
            }

            // Road styles
            const isMainRoad = ['motorway', 'trunk', 'primary', 'secondary'].includes(road.type);
            // Scale: 12px/m. Lane ~3.5m. 
            // Main road (4 lanes) = 14m * 12 = 168px
            // Secondary (2 lanes) = 7m * 12 = 84px
            const width = isMainRoad ? 160 : 80;
            
            // Road border (curb)
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = width + 6;
            this.ctx.stroke();

            // Road surface
            this.ctx.strokeStyle = '#3d3d3d'; // Slightly lighter than background
            this.ctx.lineWidth = width;
            this.ctx.stroke();

            // Center line
            if (isMainRoad) {
                this.ctx.strokeStyle = '#eab308'; // Yellow
                this.ctx.lineWidth = 4;
                this.ctx.setLineDash([30, 30]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            } else {
                this.ctx.strokeStyle = '#666'; // White/Grey
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([20, 20]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
    }
    
    renderBoundaryFrame(worldWidth = null, worldHeight = null) {
        const margin = 15;
        const thickness = 8;
        const w = worldWidth || this.canvas.width;
        const h = worldHeight || this.canvas.height;
        
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = thickness + 4;
        this.ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
        
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = thickness;
        this.ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
    }
    
    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }
    
    renderParkingZone(zone, isActive = true) {
        const { x, y, width, height, angle = 0 } = zone;
        const cx = x + width / 2;
        const cy = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        // Animated glow effect
        const time = Date.now() / 500;
        const pulse = 0.5 + 0.3 * Math.sin(time);
        
        // Outer glow
        if (isActive) {
            this.ctx.shadowColor = '#22c55e';
            this.ctx.shadowBlur = 20 * pulse;
        }
        
        // Background with green tint
        this.ctx.fillStyle = isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(60, 60, 60, 0.5)';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Reset shadow for lines
        this.ctx.shadowBlur = 0;
        
        // Highlighted border
        const lineColor = isActive ? '#22c55e' : '#ffffff';
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Full border (left, right, back)
        this.ctx.beginPath();
        this.ctx.moveTo(-width / 2, -height / 2);
        this.ctx.lineTo(-width / 2, height / 2);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.lineTo(width / 2, -height / 2);
        this.ctx.stroke();
        
        // Corner markers
        this.ctx.fillStyle = lineColor;
        const cornerSize = 8;
        // Top-left
        this.ctx.fillRect(-width / 2 - 2, -height / 2 - 2, cornerSize, 4);
        this.ctx.fillRect(-width / 2 - 2, -height / 2 - 2, 4, cornerSize);
        // Top-right
        this.ctx.fillRect(width / 2 - cornerSize + 2, -height / 2 - 2, cornerSize, 4);
        this.ctx.fillRect(width / 2 - 2, -height / 2 - 2, 4, cornerSize);
        // Bottom-left
        this.ctx.fillRect(-width / 2 - 2, height / 2 - 2, cornerSize, 4);
        this.ctx.fillRect(-width / 2 - 2, height / 2 - cornerSize + 2, 4, cornerSize);
        // Bottom-right
        this.ctx.fillRect(width / 2 - cornerSize + 2, height / 2 - 2, cornerSize, 4);
        this.ctx.fillRect(width / 2 - 2, height / 2 - cornerSize + 2, 4, cornerSize);
        
        // Entry arrows pointing in
        this.ctx.fillStyle = isActive ? 'rgba(34, 197, 94, 0.6)' : 'rgba(255, 255, 255, 0.3)';
        // Arrow 1
        this.ctx.beginPath();
        this.ctx.moveTo(0, -height / 2 + 15);
        this.ctx.lineTo(-12, -height / 2 + 35);
        this.ctx.lineTo(12, -height / 2 + 35);
        this.ctx.closePath();
        this.ctx.fill();
        // Arrow 2
        this.ctx.beginPath();
        this.ctx.moveTo(0, -height / 2 + 40);
        this.ctx.lineTo(-10, -height / 2 + 55);
        this.ctx.lineTo(10, -height / 2 + 55);
        this.ctx.closePath();
        this.ctx.fill();
        
        // "PARK HERE" text for active zone
        if (isActive) {
            this.ctx.fillStyle = '#22c55e';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('PARK', 0, height / 2 - 25);
            this.ctx.fillText('HERE', 0, height / 2 - 13);
        }
        
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
            case 'parkedTrailer':
                this.renderParkedTrailer(width, height);
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
    
    renderParkedTrailer(w, h) {
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);
        
        // Main body - white container
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2, -h / 2, w, h, 2);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = '#d4d4d4';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
        
        // Side edges
        this.ctx.fillStyle = '#e5e5e5';
        this.ctx.fillRect(-w / 2, -h / 2, 2, h);
        this.ctx.fillRect(w / 2 - 2, -h / 2, 2, h);
        
        // Horizontal ridges
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        for (let i = -h / 2 + 6; i < h / 2 - 15; i += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(-w / 2 + 3, i);
            this.ctx.lineTo(w / 2 - 3, i);
            this.ctx.stroke();
        }
        
        // Rear section
        this.ctx.fillStyle = '#ebebeb';
        this.ctx.fillRect(-w / 2 + 2, h / 2 - 14, w - 4, 12);
        
        // Door line
        this.ctx.strokeStyle = '#a3a3a3';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, h / 2 - 14);
        this.ctx.lineTo(0, h / 2 - 2);
        this.ctx.stroke();
        
        // Bumper with hazard
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -w / 2 + 2; i < w / 2 - 3; i += 8) {
            this.ctx.fillRect(i, h / 2 - 2, 4, 2);
        }
        
        // Tail lights
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(-w / 2 + 3, h / 2 - 8, 4, 4);
        this.ctx.fillRect(w / 2 - 7, h / 2 - 8, 4, 4);
        
        // Wheels
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 - 3, h / 2 - 35, 5, 10, 1);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.roundRect(-w / 2 - 3, h / 2 - 22, 5, 10, 1);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.roundRect(w / 2 - 2, h / 2 - 35, 5, 10, 1);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.roundRect(w / 2 - 2, h / 2 - 22, 5, 10, 1);
        this.ctx.fill();
    }
}

