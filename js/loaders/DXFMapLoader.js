// DXF Map Loader - Loads DXF files and converts to game obstacles
import DxfParser from 'dxf-parser';

export class DXFMapLoader {
    constructor() {
        this.parser = new DxfParser();
        this.scale = 1;  // Scale factor to convert DXF units to game units
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    /**
     * Load a DXF file from URL or file input
     * @param {string|File} source - URL string or File object
     * @returns {Promise<Object>} - Level data with obstacles
     */
    async load(source) {
        let dxfContent;
        
        if (typeof source === 'string') {
            // Load from URL
            const response = await fetch(source);
            dxfContent = await response.text();
        } else if (source instanceof File) {
            // Load from file input
            dxfContent = await this.readFile(source);
        } else {
            throw new Error('Invalid source: must be URL string or File object');
        }
        
        return this.parse(dxfContent);
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    /**
     * Parse DXF content and convert to level data
     * @param {string} dxfContent - Raw DXF file content
     * @returns {Object} - Level data
     */
    parse(dxfContent) {
        const dxf = this.parser.parseSync(dxfContent);
        
        if (!dxf || !dxf.entities) {
            throw new Error('Invalid DXF file or no entities found');
        }
        
        // Calculate bounds for auto-scaling
        const bounds = this.calculateBounds(dxf.entities);
        this.autoScale(bounds, 1100, 700);  // Target canvas size with margin
        
        const obstacles = [];
        const parkingZones = [];
        let truckStart = null;
        
        // Process each entity
        for (const entity of dxf.entities) {
            const result = this.processEntity(entity);
            if (result) {
                if (result.type === 'parkingZone') {
                    parkingZones.push(result.data);
                } else if (result.type === 'truckStart') {
                    truckStart = result.data;
                } else {
                    obstacles.push(result.data);
                }
            }
        }
        
        // Process by layer for special designations
        for (const entity of dxf.entities) {
            const layer = entity.layer?.toUpperCase() || '';
            
            if (layer.includes('PARKING') || layer.includes('TARGET')) {
                const zone = this.entityToRect(entity);
                if (zone) parkingZones.push(zone);
            } else if (layer.includes('TRUCK') || layer.includes('START')) {
                const start = this.entityToPoint(entity);
                if (start) truckStart = start;
            }
        }
        
        // Default truck start if not specified
        if (!truckStart) {
            truckStart = { x: 600, y: 600, angle: Math.PI };
        }
        
        // Default parking zone if not specified
        const parkingZone = parkingZones.length > 0 
            ? parkingZones[0] 
            : { x: 550, y: 50, width: 56, height: 170, angle: 0 };
        
        return {
            id: 'custom',
            name: 'Custom Map',
            description: 'Loaded from DXF file',
            truck: truckStart,
            parkingTarget: 'trailer',
            parkingZone: parkingZone,
            obstacles: obstacles
        };
    }
    
    calculateBounds(entities) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const entity of entities) {
            const points = this.getEntityPoints(entity);
            for (const point of points) {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
        }
        
        return { minX, minY, maxX, maxY };
    }
    
    autoScale(bounds, targetWidth, targetHeight) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        
        if (width === 0 || height === 0) {
            this.scale = 1;
            this.offsetX = 50;
            this.offsetY = 50;
            return;
        }
        
        const scaleX = targetWidth / width;
        const scaleY = targetHeight / height;
        this.scale = Math.min(scaleX, scaleY);
        
        // Center the map
        this.offsetX = (targetWidth - width * this.scale) / 2 + 50;
        this.offsetY = (targetHeight - height * this.scale) / 2 + 50;
        
        // Store bounds for coordinate transform
        this.boundsMinX = bounds.minX;
        this.boundsMinY = bounds.minY;
    }
    
    transformPoint(x, y) {
        return {
            x: (x - this.boundsMinX) * this.scale + this.offsetX,
            y: (y - this.boundsMinY) * this.scale + this.offsetY
        };
    }
    
    getEntityPoints(entity) {
        const points = [];
        
        switch (entity.type) {
            case 'LINE':
                if (entity.vertices) {
                    points.push(...entity.vertices);
                }
                break;
            case 'POLYLINE':
            case 'LWPOLYLINE':
                if (entity.vertices) {
                    points.push(...entity.vertices);
                }
                break;
            case 'CIRCLE':
                points.push({ x: entity.center.x, y: entity.center.y });
                points.push({ x: entity.center.x + entity.radius, y: entity.center.y });
                points.push({ x: entity.center.x - entity.radius, y: entity.center.y });
                break;
            case 'ARC':
                points.push({ x: entity.center.x, y: entity.center.y });
                break;
            case 'INSERT':
                points.push({ x: entity.position.x, y: entity.position.y });
                break;
        }
        
        return points;
    }
    
    processEntity(entity) {
        const layer = entity.layer?.toUpperCase() || '';
        
        // Skip certain layers
        if (layer.includes('TEXT') || layer.includes('DIM') || layer.includes('ANNOTATION')) {
            return null;
        }
        
        // Determine obstacle type from layer name
        let obstacleType = 'wall';
        if (layer.includes('BARRIER') || layer.includes('HAZARD')) {
            obstacleType = 'barrier';
        } else if (layer.includes('CAR') || layer.includes('VEHICLE')) {
            obstacleType = 'car';
        } else if (layer.includes('CONE')) {
            obstacleType = 'cone';
        } else if (layer.includes('TRAILER')) {
            obstacleType = 'parkedTrailer';
        }
        
        switch (entity.type) {
            case 'LINE':
                return this.lineToWall(entity, obstacleType);
            case 'POLYLINE':
            case 'LWPOLYLINE':
                return this.polylineToWalls(entity, obstacleType);
            case 'CIRCLE':
                return this.circleToObstacle(entity, obstacleType);
            case 'INSERT':
                return this.blockToObstacle(entity, obstacleType);
            default:
                return null;
        }
    }
    
    lineToWall(entity, type) {
        if (!entity.vertices || entity.vertices.length < 2) return null;
        
        const start = this.transformPoint(entity.vertices[0].x, entity.vertices[0].y);
        const end = this.transformPoint(entity.vertices[1].x, entity.vertices[1].y);
        
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const thickness = type === 'barrier' ? 10 : 15;
        
        return {
            type: 'obstacle',
            data: {
                type: type,
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(dx) < 5 ? thickness : Math.abs(dx),
                height: Math.abs(dy) < 5 ? thickness : Math.abs(dy),
                angle: 0
            }
        };
    }
    
    polylineToWalls(entity, type) {
        if (!entity.vertices || entity.vertices.length < 2) return null;
        
        // Get bounding box of polyline
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const vertex of entity.vertices) {
            const p = this.transformPoint(vertex.x, vertex.y);
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        // If it's a closed shape, treat as a filled obstacle
        if (entity.shape || (width > 10 && height > 10)) {
            return {
                type: 'obstacle',
                data: {
                    type: type,
                    x: minX,
                    y: minY,
                    width: Math.max(width, 10),
                    height: Math.max(height, 10)
                }
            };
        }
        
        return null;
    }
    
    circleToObstacle(entity, type) {
        if (!entity.center || !entity.radius) return null;
        
        const center = this.transformPoint(entity.center.x, entity.center.y);
        const radius = entity.radius * this.scale;
        
        return {
            type: 'obstacle',
            data: {
                type: 'cone',  // Circles become cones
                x: center.x - radius,
                y: center.y - radius,
                width: radius * 2,
                height: radius * 2
            }
        };
    }
    
    blockToObstacle(entity, type) {
        if (!entity.position) return null;
        
        const pos = this.transformPoint(entity.position.x, entity.position.y);
        
        // Blocks become cars or trailers based on name
        const blockName = entity.name?.toUpperCase() || '';
        let obstacleType = type;
        let width = 50;
        let height = 90;
        
        if (blockName.includes('TRAILER')) {
            obstacleType = 'parkedTrailer';
            width = 50;
            height = 150;
        } else if (blockName.includes('CAR')) {
            obstacleType = 'car';
            width = 50;
            height = 90;
        }
        
        return {
            type: 'obstacle',
            data: {
                type: obstacleType,
                x: pos.x - width / 2,
                y: pos.y - height / 2,
                width: width,
                height: height
            }
        };
    }
    
    entityToRect(entity) {
        if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
            if (entity.vertices && entity.vertices.length >= 4) {
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;
                
                for (const v of entity.vertices) {
                    const p = this.transformPoint(v.x, v.y);
                    minX = Math.min(minX, p.x);
                    minY = Math.min(minY, p.y);
                    maxX = Math.max(maxX, p.x);
                    maxY = Math.max(maxY, p.y);
                }
                
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                    angle: 0
                };
            }
        }
        return null;
    }
    
    entityToPoint(entity) {
        if (entity.type === 'INSERT' && entity.position) {
            const p = this.transformPoint(entity.position.x, entity.position.y);
            const rotation = entity.rotation || 0;
            return {
                x: p.x,
                y: p.y,
                angle: (rotation * Math.PI) / 180
            };
        } else if (entity.type === 'CIRCLE' && entity.center) {
            const p = this.transformPoint(entity.center.x, entity.center.y);
            return { x: p.x, y: p.y, angle: Math.PI };
        }
        return null;
    }
}

