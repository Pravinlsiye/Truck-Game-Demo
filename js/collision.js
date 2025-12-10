// Collision Detection System
export class CollisionDetector {
    constructor() {}
    
    // Check if a point is inside a polygon (using ray casting)
    pointInPolygon(point, polygon) {
        let inside = false;
        const n = polygon.length;
        
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            if (((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        
        return inside;
    }
    
    // Check if two line segments intersect
    lineIntersects(p1, p2, p3, p4) {
        const d1 = this.direction(p3, p4, p1);
        const d2 = this.direction(p3, p4, p2);
        const d3 = this.direction(p1, p2, p3);
        const d4 = this.direction(p1, p2, p4);
        
        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }
        
        if (d1 === 0 && this.onSegment(p3, p4, p1)) return true;
        if (d2 === 0 && this.onSegment(p3, p4, p2)) return true;
        if (d3 === 0 && this.onSegment(p1, p2, p3)) return true;
        if (d4 === 0 && this.onSegment(p1, p2, p4)) return true;
        
        return false;
    }
    
    direction(p1, p2, p3) {
        return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
    }
    
    onSegment(p1, p2, p) {
        return Math.min(p1.x, p2.x) <= p.x && p.x <= Math.max(p1.x, p2.x) &&
               Math.min(p1.y, p2.y) <= p.y && p.y <= Math.max(p1.y, p2.y);
    }
    
    // Check if two polygons intersect (Separating Axis Theorem simplified)
    polygonsIntersect(poly1, poly2) {
        // Check if any vertex of poly1 is inside poly2
        for (const point of poly1) {
            if (this.pointInPolygon(point, poly2)) {
                return true;
            }
        }
        
        // Check if any vertex of poly2 is inside poly1
        for (const point of poly2) {
            if (this.pointInPolygon(point, poly1)) {
                return true;
            }
        }
        
        // Check if any edges intersect
        for (let i = 0; i < poly1.length; i++) {
            const p1 = poly1[i];
            const p2 = poly1[(i + 1) % poly1.length];
            
            for (let j = 0; j < poly2.length; j++) {
                const p3 = poly2[j];
                const p4 = poly2[(j + 1) % poly2.length];
                
                if (this.lineIntersects(p1, p2, p3, p4)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Get corners of an axis-aligned rectangle
    getRectCorners(rect) {
        return [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height }
        ];
    }
    
    // Get corners of a rotated rectangle (obstacle)
    getRotatedRectCorners(obstacle) {
        const cx = obstacle.x + obstacle.width / 2;
        const cy = obstacle.y + obstacle.height / 2;
        const angle = obstacle.angle || 0;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const hw = obstacle.width / 2;
        const hh = obstacle.height / 2;
        
        return [
            { x: cx + (-hw * cos - -hh * sin), y: cy + (-hw * sin + -hh * cos) },
            { x: cx + (hw * cos - -hh * sin), y: cy + (hw * sin + -hh * cos) },
            { x: cx + (hw * cos - hh * sin), y: cy + (hw * sin + hh * cos) },
            { x: cx + (-hw * cos - hh * sin), y: cy + (-hw * sin + hh * cos) }
        ];
    }
    
    // Check collision between truck/trailer and obstacles
    checkObstacleCollision(vehicleCorners, obstacles) {
        for (const obstacle of obstacles) {
            const obstacleCorners = this.getRotatedRectCorners(obstacle);
            if (this.polygonsIntersect(vehicleCorners, obstacleCorners)) {
                return true;
            }
        }
        return false;
    }
    
    // Check if vehicle is within canvas bounds
    checkBoundaryCollision(vehicleCorners, canvasWidth, canvasHeight) {
        for (const corner of vehicleCorners) {
            if (corner.x < 0 || corner.x > canvasWidth ||
                corner.y < 0 || corner.y > canvasHeight) {
                return true;
            }
        }
        return false;
    }
    
    // Check if trailer is parked correctly
    checkParkingSuccess(trailerCorners, parkingZone, maxAngleDiff = Math.PI / 12) {
        // Get parking zone corners (rotated rectangle)
        const parkingCorners = this.getRotatedRectCorners(parkingZone);
        
        // Check if all trailer corners are inside parking zone
        for (const corner of trailerCorners) {
            if (!this.pointInPolygon(corner, parkingCorners)) {
                return false;
            }
        }
        
        return true;
    }
}

