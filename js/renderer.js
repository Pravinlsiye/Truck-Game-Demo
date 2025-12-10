// Canvas Renderer
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
    }
    
    resize() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
    }
    
    clear() {
        this.ctx.fillStyle = '#2a2a3e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid pattern
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawParkingZone(parkingZone) {
        const { x, y, width, height, angle = 0 } = parkingZone;
        const cx = x + width / 2;
        const cy = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        // Draw parking zone fill
        this.ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Draw dashed border
        this.ctx.strokeStyle = '#4ade80';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Draw corner markers
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 4;
        const cornerSize = 15;
        
        // Top-left
        this.ctx.beginPath();
        this.ctx.moveTo(-width / 2, -height / 2 + cornerSize);
        this.ctx.lineTo(-width / 2, -height / 2);
        this.ctx.lineTo(-width / 2 + cornerSize, -height / 2);
        this.ctx.stroke();
        
        // Top-right
        this.ctx.beginPath();
        this.ctx.moveTo(width / 2 - cornerSize, -height / 2);
        this.ctx.lineTo(width / 2, -height / 2);
        this.ctx.lineTo(width / 2, -height / 2 + cornerSize);
        this.ctx.stroke();
        
        // Bottom-left
        this.ctx.beginPath();
        this.ctx.moveTo(-width / 2, height / 2 - cornerSize);
        this.ctx.lineTo(-width / 2, height / 2);
        this.ctx.lineTo(-width / 2 + cornerSize, height / 2);
        this.ctx.stroke();
        
        // Bottom-right
        this.ctx.beginPath();
        this.ctx.moveTo(width / 2 - cornerSize, height / 2);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.lineTo(width / 2, height / 2 - cornerSize);
        this.ctx.stroke();
        
        // Draw "P" indicator
        this.ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
        this.ctx.font = 'bold 40px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('P', 0, 0);
        
        this.ctx.restore();
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
        
        // Different colors based on obstacle type
        const colors = {
            barrier: { fill: '#ef4444', stroke: '#dc2626' },
            wall: { fill: '#64748b', stroke: '#475569' },
            cone: { fill: '#fbbf24', stroke: '#f59e0b' },
            car: { fill: '#6366f1', stroke: '#4f46e5' }
        };
        
        const color = colors[type] || colors.barrier;
        
        // Draw obstacle
        this.ctx.fillStyle = color.fill;
        this.ctx.strokeStyle = color.stroke;
        this.ctx.lineWidth = 2;
        
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        this.ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Add hazard stripes for barriers
        if (type === 'barrier') {
            this.ctx.fillStyle = '#fbbf24';
            const stripeWidth = 8;
            this.ctx.beginPath();
            for (let i = -width / 2; i < width / 2; i += stripeWidth * 2) {
                this.ctx.rect(i, -height / 2, stripeWidth, height);
            }
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawTruck(truck) {
        // Draw trailer first (behind truck)
        this.drawTrailer(truck);
        
        // Draw hitch connection
        this.drawHitch(truck);
        
        // Draw truck cab
        this.drawCab(truck);
    }
    
    drawTrailer(truck) {
        // Use trailer center position directly
        const centerX = truck.trailerCenterX;
        const centerY = truck.trailerCenterY;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(truck.trailerAngle);
        
        const w = truck.trailerWidth;
        const h = truck.trailerHeight;
        
        // === SEMI TRAILER (Container/Box) ===
        
        // Trailer undercarriage/frame
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 + 5, -h / 2, w - 10, h);
        
        // Main container body
        this.ctx.fillStyle = '#dc2626';
        this.ctx.strokeStyle = '#991b1b';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(-w / 2, -h / 2 + 5, w, h - 20);
        this.ctx.strokeRect(-w / 2, -h / 2 + 5, w, h - 20);
        
        // Container ridges (corrugated sides)
        this.ctx.strokeStyle = '#b91c1c';
        this.ctx.lineWidth = 1;
        for (let i = -h / 2 + 15; i < h / 2 - 20; i += 8) {
            this.ctx.beginPath();
            this.ctx.moveTo(-w / 2 + 2, i);
            this.ctx.lineTo(w / 2 - 2, i);
            this.ctx.stroke();
        }
        
        // Side panel accent stripe
        this.ctx.fillStyle = '#fef3c7';
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 30, w - 4, 8);
        
        // Front wall (kingpin area)
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 + 3, -h / 2, w - 6, 8);
        
        // Kingpin
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, -h / 2 + 2, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rear doors
        this.ctx.fillStyle = '#b91c1c';
        this.ctx.fillRect(-w / 2 + 2, h / 2 - 18, w / 2 - 4, 12);
        this.ctx.fillRect(w / 2 - w / 2 + 2, h / 2 - 18, w / 2 - 4, 12);
        
        // Door handles
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-4, h / 2 - 14, 2, 6);
        this.ctx.fillRect(2, h / 2 - 14, 2, 6);
        
        // Door hinges
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 + 3, h / 2 - 16, 3, 2);
        this.ctx.fillRect(-w / 2 + 3, h / 2 - 10, 3, 2);
        this.ctx.fillRect(w / 2 - 6, h / 2 - 16, 3, 2);
        this.ctx.fillRect(w / 2 - 6, h / 2 - 10, 3, 2);
        
        // Rear bumper/ICC bar
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-w / 2 + 5, h / 2 - 4, w - 10, 3);
        
        // Tail lights
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 + 8, h / 2 - 10, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 - 8, h / 2 - 10, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Turn signals (amber)
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 + 8, h / 2 - 18, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 - 8, h / 2 - 18, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reflective tape
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-w / 2, h / 2 - 25, 2, 20);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 25, 2, 20);
        
        // Side marker lights
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(-w / 2, -h / 2 + 20, 3, 4);
        this.ctx.fillRect(-w / 2, h / 2 - 30, 3, 4);
        this.ctx.fillRect(w / 2 - 3, -h / 2 + 20, 3, 4);
        this.ctx.fillRect(w / 2 - 3, h / 2 - 30, 3, 4);
        
        // Tandem axle wheels (dual wheels)
        this.ctx.fillStyle = '#1f2937';
        
        // Left side - front axle
        this.ctx.fillRect(-w / 2 - 6, h / 2 - 50, 8, 14);
        // Left side - rear axle
        this.ctx.fillRect(-w / 2 - 6, h / 2 - 32, 8, 14);
        
        // Right side - front axle
        this.ctx.fillRect(w / 2 - 2, h / 2 - 50, 8, 14);
        // Right side - rear axle
        this.ctx.fillRect(w / 2 - 2, h / 2 - 32, 8, 14);
        
        // Wheel hubs
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 2, h / 2 - 43, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 2, h / 2 - 25, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 2, h / 2 - 43, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 2, h / 2 - 25, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Mud flaps
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 4, h / 2 - 15, 6, 10);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 15, 6, 10);
        
        this.ctx.restore();
    }
    
    drawHitch(truck) {
        const hitch = truck.getHitchPoint();
        const trailerFront = truck.getTrailerFrontPoint();
        
        // Get truck rear position
        const backDir = truck.getDirection(truck.angle + Math.PI);
        const truckRearX = truck.x + backDir.x * (truck.height / 2);
        const truckRearY = truck.y + backDir.y * (truck.height / 2);
        
        // Draw hitch bar from truck rear to trailer front
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(truckRearX, truckRearY);
        this.ctx.lineTo(hitch.x, hitch.y);
        this.ctx.lineTo(trailerFront.x, trailerFront.y);
        this.ctx.stroke();
        
        // Hitch point
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(hitch.x, hitch.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCab(truck) {
        this.ctx.save();
        this.ctx.translate(truck.x, truck.y);
        this.ctx.rotate(truck.angle);
        
        const w = truck.width;
        const h = truck.height;
        
        // === SEMI TRUCK CAB ===
        
        // Main cab body (darker base)
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.strokeStyle = '#0f2744';
        this.ctx.lineWidth = 2;
        
        // Cab shape with flat front
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2, h / 2);
        this.ctx.lineTo(-w / 2, -h / 2 + 8);
        this.ctx.lineTo(-w / 2 + 4, -h / 2);
        this.ctx.lineTo(w / 2 - 4, -h / 2);
        this.ctx.lineTo(w / 2, -h / 2 + 8);
        this.ctx.lineTo(w / 2, h / 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Hood section (front part - slightly raised)
        this.ctx.fillStyle = '#2563eb';
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 2, -h / 2 + 8);
        this.ctx.lineTo(-w / 2 + 5, -h / 2 + 2);
        this.ctx.lineTo(w / 2 - 5, -h / 2 + 2);
        this.ctx.lineTo(w / 2 - 2, -h / 2 + 8);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Grille
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 + 8, -h / 2 + 3, w - 16, 6);
        
        // Grille lines
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 1;
        for (let i = -w / 2 + 12; i < w / 2 - 8; i += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, -h / 2 + 3);
            this.ctx.lineTo(i, -h / 2 + 9);
            this.ctx.stroke();
        }
        
        // Cabin body (blue)
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(-w / 2 + 3, -h / 2 + 12, w - 6, h - 20);
        
        // Windshield (large, angled)
        this.ctx.fillStyle = '#1e293b';
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 5, -h / 2 + 14);
        this.ctx.lineTo(-w / 2 + 7, -h / 2 + 10);
        this.ctx.lineTo(w / 2 - 7, -h / 2 + 10);
        this.ctx.lineTo(w / 2 - 5, -h / 2 + 14);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Windshield glass
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2 + 6, -h / 2 + 13);
        this.ctx.lineTo(-w / 2 + 8, -h / 2 + 11);
        this.ctx.lineTo(w / 2 - 8, -h / 2 + 11);
        this.ctx.lineTo(w / 2 - 6, -h / 2 + 13);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Side windows
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(-w / 2 + 4, -h / 2 + 16, 6, 12);
        this.ctx.fillRect(w / 2 - 10, -h / 2 + 16, 6, 12);
        
        // Sleeper cab (back section)
        this.ctx.fillStyle = '#2563eb';
        this.ctx.fillRect(-w / 2 + 3, -h / 2 + 30, w - 6, 20);
        
        // Exhaust stacks
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(-w / 2 - 2, -h / 2 + 12, 4, 25);
        this.ctx.fillRect(w / 2 - 2, -h / 2 + 12, 4, 25);
        
        // Exhaust stack tops
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(-w / 2 - 3, -h / 2 + 10, 6, 4);
        this.ctx.fillRect(w / 2 - 3, -h / 2 + 10, 6, 4);
        
        // Side mirrors
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-w / 2 - 8, -h / 2 + 14, 6, 10);
        this.ctx.fillRect(w / 2 + 2, -h / 2 + 14, 6, 10);
        
        // Mirror glass
        this.ctx.fillStyle = '#93c5fd';
        this.ctx.fillRect(-w / 2 - 7, -h / 2 + 15, 4, 8);
        this.ctx.fillRect(w / 2 + 3, -h / 2 + 15, 4, 8);
        
        // Headlights
        this.ctx.fillStyle = '#fef08a';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 + 6, -h / 2 + 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 - 6, -h / 2 + 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Turn signals (amber)
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillRect(-w / 2 + 2, -h / 2 + 4, 2, 3);
        this.ctx.fillRect(w / 2 - 4, -h / 2 + 4, 2, 3);
        
        // Roof lights (marker lights)
        this.ctx.fillStyle = '#f59e0b';
        for (let i = -8; i <= 8; i += 4) {
            this.ctx.beginPath();
            this.ctx.arc(i, -h / 2 + 10, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Fifth wheel (coupling plate at rear)
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(-w / 2 + 5, h / 2 - 8, w - 10, 6);
        
        // Front wheels (steered)
        this.ctx.fillStyle = '#1f2937';
        
        this.ctx.save();
        this.ctx.translate(-w / 2 - 4, -h / 2 + 20);
        this.ctx.rotate(truck.steeringAngle);
        this.ctx.fillRect(-4, -8, 7, 16);
        // Wheel hub
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.translate(w / 2 + 4, -h / 2 + 20);
        this.ctx.rotate(truck.steeringAngle);
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(-3, -8, 7, 16);
        // Wheel hub
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // Rear dual wheels (tandem axle)
        this.ctx.fillStyle = '#1f2937';
        // Left side dual wheels
        this.ctx.fillRect(-w / 2 - 6, h / 2 - 25, 8, 14);
        this.ctx.fillRect(-w / 2 - 6, h / 2 - 8, 8, 14);
        // Right side dual wheels
        this.ctx.fillRect(w / 2 - 2, h / 2 - 25, 8, 14);
        this.ctx.fillRect(w / 2 - 2, h / 2 - 8, 8, 14);
        
        // Wheel hubs for rear
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 2, h / 2 - 18, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(-w / 2 - 2, h / 2 - 1, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 2, h / 2 - 18, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(w / 2 + 2, h / 2 - 1, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // Draw collision flash effect
    drawCollisionEffect() {
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw success effect
    drawSuccessEffect() {
        this.ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw jackknife warning
    drawJacknifeWarning(truck) {
        if (!truck) return;
        
        const jacknifeAngle = truck.getJacknifeAngle();
        const maxAngle = Math.PI / 2.5;
        const warningThreshold = maxAngle * 0.8;
        
        if (Math.abs(jacknifeAngle) > warningThreshold) {
            const isLocked = Math.abs(jacknifeAngle) >= maxAngle;
            
            // Draw warning overlay
            if (isLocked) {
                this.ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            } else {
                this.ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
            }
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw warning text
            this.ctx.save();
            this.ctx.fillStyle = isLocked ? '#ef4444' : '#fbbf24';
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            
            const message = isLocked ? 'JACKKNIFE! Drive forward to recover' : 'Warning: Extreme angle';
            this.ctx.fillText(message, this.canvas.width / 2, 10);
            this.ctx.restore();
        }
    }
}

