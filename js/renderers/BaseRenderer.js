// Base Renderer - Single Responsibility: Common rendering utilities
export class BaseRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawRotatedRect(cx, cy, width, height, angle, fillStyle, strokeStyle = null) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(angle);
        
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.strokeRect(-width / 2, -height / 2, width, height);
        }
        
        this.ctx.restore();
    }
    
    drawCircle(x, y, radius, fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawLine(x1, y1, x2, y2, strokeStyle, lineWidth = 1) {
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
}

