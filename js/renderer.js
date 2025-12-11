// Canvas Renderer - Enhanced Version
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.trailPoints = []; // Store trail path
        this.maxTrailPoints = 500;
        this.resize();
    }
    
    resize() {
        this.canvas.width = 900;
        this.canvas.height = 650;
    }
    
    // Add point to trail
    addTrailPoint(x, y) {
        this.trailPoints.push({ x, y });
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
    }
    
    clearTrail() {
        this.trailPoints = [];
    }
    
    clear() {
        // Asphalt background
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add asphalt texture
        this.drawAsphaltTexture();
        
        // Draw boundary frame
        this.drawBoundaryFrame();
    }
    
    drawAsphaltTexture() {
        // Create subtle asphalt noise pattern
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Add some lighter specs
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawBoundaryFrame() {
        const margin = 15;
        const thickness = 8;
        
        // Outer dark border
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = thickness + 4;
        this.ctx.strokeRect(margin, margin, this.canvas.width - margin * 2, this.canvas.height - margin * 2);
        
        // Inner reddish-brown border
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = thickness;
        this.ctx.strokeRect(margin, margin, this.canvas.width - margin * 2, this.canvas.height - margin * 2);
    }
    
    // Draw the trail path
    drawTrail() {
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
    
    drawParkingZone(parkingZone) {
        const { x, y, width, height, angle = 0 } = parkingZone;
        const cx = x + width / 2;
        const cy = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        // Dark parking spot background
        this.ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // White parking lines (thick, solid)
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        // Left line
        this.ctx.beginPath();
        this.ctx.moveTo(-width / 2, -height / 2);
        this.ctx.lineTo(-width / 2, height / 2);
        this.ctx.stroke();
        
        // Right line
        this.ctx.beginPath();
        this.ctx.moveTo(width / 2, -height / 2);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.stroke();
        
        // Back line
        this.ctx.beginPath();
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
    
    // Draw additional parking bays (like in reference)
    drawParkingBays(parkingZone) {
        const { x, y, width, height, angle = 0 } = parkingZone;
        
        // Draw 2 additional empty bays next to the target
        for (let i = 1; i <= 2; i++) {
            this.ctx.save();
            const offsetX = x + (width + 10) * i;
            const cx = offsetX + width / 2;
            const cy = y + height / 2;
            
            this.ctx.translate(cx, cy);
            this.ctx.rotate(angle);
            
            // Empty bay background
            this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
            this.ctx.fillRect(-width / 2, -height / 2, width, height);
            
            // White lines
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
    
    drawObstacles(obstacles) {
        for (const obstacle of obstacles) {
            this.drawObstacle(obstacle);
        }
    }
    
    drawObstacle(obstacle) {
        const { x, y, width, height, angle = 0, type = 'barrier' } = obstacle;
        const cx = x + width / 2;
        const cy = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        if (type === 'barrier') {
            // Hazard striped barrier (yellow/black)
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(-width / 2, -height / 2, width, height);
            
            // Yellow/black diagonal stripes
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(-width / 2, -height / 2, width, height);
            this.ctx.clip();
            
            const stripeWidth = 10;
            this.ctx.fillStyle = '#f59e0b';
            for (let i = -width - height; i < width + height; i += stripeWidth * 2) {
                this.ctx.save();
                this.ctx.translate(i, 0);
                this.ctx.rotate(Math.PI / 4);
                this.ctx.fillRect(-5, -height, 10, height * 3);
                this.ctx.restore();
            }
            this.ctx.restore();
            
            // Border
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-width / 2, -height / 2, width, height);
            
        } else if (type === 'wall') {
            // Concrete wall
            this.ctx.fillStyle = '#6b7280';
            this.ctx.fillRect(-width / 2, -height / 2, width, height);
            this.ctx.strokeStyle = '#4b5563';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-width / 2, -height / 2, width, height);
            
        } else if (type === 'cone') {
            // Traffic cone
            this.ctx.fillStyle = '#f97316';
            this.ctx.beginPath();
            this.ctx.moveTo(0, -height / 2);
            this.ctx.lineTo(width / 2, height / 2);
            this.ctx.lineTo(-width / 2, height / 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // White stripes on cone
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(-width / 3, -height / 4, width / 1.5, 4);
            this.ctx.fillRect(-width / 4, height / 6, width / 2, 4);
            
        } else if (type === 'car') {
            // Parked car
            this.ctx.fillStyle = '#374151';
            this.ctx.fillRect(-width / 2, -height / 2, width, height);
            
            // Windows
            this.ctx.fillStyle = '#1f2937';
            this.ctx.fillRect(-width / 2 + 5, -height / 4, width - 10, height / 2);
            
            // Lights
            this.ctx.fillStyle = '#fef08a';
            this.ctx.fillRect(-width / 2 + 3, -height / 2 + 3, 6, 4);
            this.ctx.fillRect(width / 2 - 9, -height / 2 + 3, 6, 4);
        }
        
        this.ctx.restore();
    }
    
    drawTruck(truck) {
        // Draw guide lines first (behind everything)
        this.drawGuideLines(truck);
        
        // Draw trailer
        this.drawTrailer(truck);
        
        // Draw hitch connection
        this.drawHitch(truck);
        
        // Draw truck cab
        this.drawCab(truck);
    }
    
    // Guide lines from trailer corners
    drawGuideLines(truck) {
        const corners = truck.getTrailerCorners();
        if (corners.length < 4) return;
        
        // Get rear corners (index 2 and 3)
        const rearLeft = corners[3];
        const rearRight = corners[2];
        
        // Calculate extension direction
        const dx = rearLeft.x - corners[0].x;
        const dy = rearLeft.y - corners[0].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / len;
        const dirY = dy / len;
        
        // Draw red guide line (left)
        this.ctx.beginPath();
        this.ctx.moveTo(rearLeft.x, rearLeft.y);
        this.ctx.lineTo(rearLeft.x + dirX * 200, rearLeft.y + dirY * 200);
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        
        // Draw green guide line (right)
        this.ctx.beginPath();
        this.ctx.moveTo(rearRight.x, rearRight.y);
        this.ctx.lineTo(rearRight.x + dirX * 200, rearRight.y + dirY * 200);
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    drawTrailer(truck) {
        const centerX = truck.trailerCenterX;
        const centerY = truck.trailerCenterY;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(truck.trailerAngle);
        
        const w = truck.trailerWidth;
        const h = truck.trailerHeight;
        
        // === WHITE CONTAINER TRAILER ===
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-w / 2 + 5, -h / 2 + 5, w, h);
        
        // Main container body (white)
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.strokeStyle = '#d1d5db';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
        
        // Container ridges (corrugated sides)
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        for (let i = -h / 2 + 10; i < h / 2 - 10; i += 6) {
            this.ctx.beginPath();
            this.ctx.moveTo(-w / 2 + 3, i);
            this.ctx.lineTo(w / 2 - 3, i);
            this.ctx.stroke();
        }
        
        // Company logo/branding area
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Logo text (simplified truck icon)
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = 'bold 8px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('TRUCK', 0, 0);
        
        // Rear doors
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
        
        // Door handles
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-6, h / 2 - 14, 4, 6);
        this.ctx.fillRect(2, h / 2 - 14, 4, 6);
        
        // Hazard striped rear bumper
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
        
        // Yellow stripes on bumper
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -w / 2; i < w / 2; i += 12) {
            this.ctx.fillRect(i, h / 2 - 4, 6, 4);
        }
        
        // Tail lights
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 + 8, h / 2 - 12, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 - 8, h / 2 - 12, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reflective tape (sides)
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-w / 2, -h / 2 + 20, 3, 15);
        this.ctx.fillRect(-w / 2, h / 2 - 35, 3, 15);
        this.ctx.fillRect(w / 2 - 3, -h / 2 + 20, 3, 15);
        this.ctx.fillRect(w / 2 - 3, h / 2 - 35, 3, 15);
        
        // Wheels (tandem axle)
        this.ctx.fillStyle = '#1f2937';
        
        // Left side wheels
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 55, 10, 18);
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 33, 10, 18);
        
        // Right side wheels
        this.ctx.fillRect(w / 2 - 2, h / 2 - 55, 10, 18);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 33, 10, 18);
        
        // Wheel rims
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 3, h / 2 - 46, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 3, h / 2 - 24, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 3, h / 2 - 46, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 3, h / 2 - 24, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawHitch(truck) {
        const hitch = truck.getHitchPoint();
        const trailerFront = truck.getTrailerFrontPoint();
        
        // Get truck rear position
        const backDir = truck.getDirection(truck.angle + Math.PI);
        const truckRearX = truck.x + backDir.x * (truck.height / 2);
        const truckRearY = truck.y + backDir.y * (truck.height / 2);
        
        // Draw hitch bar
        this.ctx.beginPath();
        this.ctx.moveTo(truckRearX, truckRearY);
        this.ctx.lineTo(hitch.x, hitch.y);
        this.ctx.lineTo(trailerFront.x, trailerFront.y);
        this.ctx.strokeStyle = '#4b5563';
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
        
        // Hitch point
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(hitch.x, hitch.y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawCab(truck) {
        this.ctx.save();
        this.ctx.translate(truck.x, truck.y);
        this.ctx.rotate(truck.angle);
        
        const w = truck.width;
        const h = truck.height;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w, h);
        
        // === BLUE SEMI TRUCK CAB ===
        
        // Main cab body
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
        
        // Darker blue roof/top
        this.ctx.fillStyle = '#1d4ed8';
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, 15);
        
        // Chrome grille
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.fillRect(-w / 2 + 6, -h / 2 + 4, w - 12, 10);
        
        // Grille lines
        this.ctx.strokeStyle = '#6b7280';
        this.ctx.lineWidth = 1;
        for (let i = -w / 2 + 10; i < w / 2 - 6; i += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, -h / 2 + 4);
            this.ctx.lineTo(i, -h / 2 + 14);
            this.ctx.stroke();
        }
        
        // Windshield
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 16, w - 8, 18);
        
        // Windshield glare
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
        
        // Headlights
        this.ctx.fillStyle = '#fef9c3';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 + 10, -h / 2 + 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 - 10, -h / 2 + 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Headlight glow
        this.ctx.fillStyle = 'rgba(254, 249, 195, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 + 10, -h / 2 + 8, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 - 10, -h / 2 + 8, 7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Roof marker lights
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -10; i <= 10; i += 5) {
            this.ctx.beginPath();
            this.ctx.arc(i, -h / 2 + 3, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Side mirrors
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 10, -h / 2 + 20, 8, 14);
        this.ctx.fillRect(w / 2 + 2, -h / 2 + 20, 8, 14);
        
        // Mirror glass
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(-w / 2 - 9, -h / 2 + 22, 6, 10);
        this.ctx.fillRect(w / 2 + 3, -h / 2 + 22, 6, 10);
        
        // Exhaust stacks
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(-w / 2 - 4, -h / 2 + 18, 5, 30);
        this.ctx.fillRect(w / 2 - 1, -h / 2 + 18, 5, 30);
        
        // Exhaust tops
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 - 5, -h / 2 + 16, 7, 4);
        this.ctx.fillRect(w / 2 - 2, -h / 2 + 16, 7, 4);
        
        // Fifth wheel plate
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 + 8, h / 2 - 10, w - 16, 8);
        
        // Front wheels (with steering)
        this.ctx.save();
        this.ctx.translate(-w / 2 - 6, -h / 2 + 24);
        this.ctx.rotate(truck.steeringAngle);
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-5, -10, 10, 20);
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.translate(w / 2 + 6, -h / 2 + 24);
        this.ctx.rotate(truck.steeringAngle);
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-5, -10, 10, 20);
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // Rear wheels (dual)
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 30, 12, 18);
        this.ctx.fillRect(-w / 2 - 8, h / 2 - 10, 12, 18);
        this.ctx.fillRect(w / 2 - 4, h / 2 - 30, 12, 18);
        this.ctx.fillRect(w / 2 - 4, h / 2 - 10, 12, 18);
        
        // Rear wheel hubs
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 2, h / 2 - 21, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 2, h / 2 - 1, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 2, h / 2 - 21, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 2, h / 2 - 1, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawCollisionEffect() {
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawSuccessEffect() {
        this.ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawJacknifeWarning(truck) {
        if (!truck) return;
        
        const jacknifeAngle = truck.getJacknifeAngle();
        const maxAngle = Math.PI / 2.5;
        const warningThreshold = maxAngle * 0.8;
        
        if (Math.abs(jacknifeAngle) > warningThreshold) {
            const isLocked = Math.abs(jacknifeAngle) >= maxAngle;
            
            if (isLocked) {
                this.ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            } else {
                this.ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
            }
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.save();
            this.ctx.fillStyle = isLocked ? '#ef4444' : '#fbbf24';
            this.ctx.font = 'bold 18px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            
            const message = isLocked ? '⚠ JACKKNIFE! Drive forward to recover' : '⚠ Warning: Extreme angle';
            
            // Background for text
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.canvas.width / 2 - 180, 25, 360, 30);
            
            this.ctx.fillStyle = isLocked ? '#ef4444' : '#fbbf24';
            this.ctx.fillText(message, this.canvas.width / 2, 32);
            this.ctx.restore();
        }
    }
}
