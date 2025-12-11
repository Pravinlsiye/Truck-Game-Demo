// Base Vehicle class - Single Responsibility: Define common vehicle behavior
export class Vehicle {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.angle = config.angle || 0;
        this.width = config.width || 40;
        this.height = config.height || 60;
    }
    
    // Get direction vector for an angle
    getDirection(angle) {
        return {
            x: Math.sin(angle),
            y: -Math.cos(angle)
        };
    }
    
    // Get corners for collision detection
    getCorners() {
        return this.getRotatedRectCorners(
            this.x, this.y, this.width, this.height, this.angle
        );
    }
    
    // Get corners of a rotated rectangle
    getRotatedRectCorners(cx, cy, width, height, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const hw = width / 2;
        const hh = height / 2;
        
        return [
            { x: cx + (-hw * cos - -hh * sin), y: cy + (-hw * sin + -hh * cos) },
            { x: cx + (hw * cos - -hh * sin), y: cy + (hw * sin + -hh * cos) },
            { x: cx + (hw * cos - hh * sin), y: cy + (hw * sin + hh * cos) },
            { x: cx + (-hw * cos - hh * sin), y: cy + (-hw * sin + hh * cos) }
        ];
    }
}

