// OpenStreetMap Map Loader - Fetch real-world map data
export class OSMMapLoader {
    constructor() {
        this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    }
    
    /**
     * Load map data from OpenStreetMap for a given area
     * @param {number} lat - Center latitude
     * @param {number} lon - Center longitude  
     * @param {number} radius - Radius in meters (default 100m)
     * @param {boolean} freeRoam - If true, no parking objective
     * @returns {Promise<Object>} - Level data
     */
    async loadArea(lat, lon, radius = 100, freeRoam = false) {
        this.freeRoam = freeRoam;
        // Calculate bounding box
        const bbox = this.getBoundingBox(lat, lon, radius);
        
        // Fetch buildings and roads from OSM
        const query = this.buildQuery(bbox);
        const data = await this.fetchOSMData(query);
        
        // Convert to game level
        return this.convertToLevel(data, bbox);
    }
    
    getBoundingBox(lat, lon, radius) {
        // Approximate degrees per meter
        const latDelta = radius / 111320;
        const lonDelta = radius / (111320 * Math.cos(lat * Math.PI / 180));
        
        return {
            south: lat - latDelta,
            north: lat + latDelta,
            west: lon - lonDelta,
            east: lon + lonDelta,
            centerLat: lat,
            centerLon: lon,
            radiusMeters: radius
        };
    }
    
    buildQuery(bbox) {
        // Overpass QL query for buildings, parking areas, and barriers
        return `
            [out:json][timeout:25];
            (
                // Buildings
                way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
                // Parking areas
                way["amenity"="parking"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
                // Barriers and walls
                way["barrier"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
                // Roads (for reference, won't be obstacles)
                way["highway"]["highway"!="footway"]["highway"!="path"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
            );
            out body;
            >;
            out skel qt;
        `;
    }
    
    async fetchOSMData(query) {
        try {
            const response = await fetch(this.overpassUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'data=' + encodeURIComponent(query)
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch OSM data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('OSM fetch error:', error);
            throw error;
        }
    }
    
    convertToLevel(osmData, bbox) {
        const obstacles = [];
        const roads = []; // Store road paths
        const nodes = new Map();
        
        // Index nodes by ID
        for (const element of osmData.elements) {
            if (element.type === 'node') {
                nodes.set(element.id, { lat: element.lat, lon: element.lon });
            }
        }
        
        // Dynamic world size based on area - scale with map radius
        // 1m real = ~12px game (matches truck scale: 250px / ~21m)
        const metersToPixels = 12;
        const radiusMeters = Math.max(bbox.radiusMeters || 500, 200);
        
        // Calculate world size based on actual area
        const baseSize = this.freeRoam 
            ? Math.min(radiusMeters * metersToPixels * 2, 60000)  // Max 60000px (allows ~5km area)
            : 1200;
        const gameWidth = Math.max(baseSize, 2000);
        const gameHeight = Math.round(gameWidth * 0.7);
        const latRange = bbox.north - bbox.south;
        const lonRange = bbox.east - bbox.west;
        
        const toGameCoords = (lat, lon) => {
            const x = ((lon - bbox.west) / lonRange) * gameWidth + 50;
            const y = ((bbox.north - lat) / latRange) * gameHeight + 50;  // Flip Y
            return { x, y };
        };
        
        // Find parking area for parking zone
        let parkingZone = null;
        
        // Process ways (buildings, parking, etc.)
        for (const element of osmData.elements) {
            if (element.type !== 'way' || !element.nodes) continue;
            
            const tags = element.tags || {};
            
            // Get way coordinates
            const coords = element.nodes
                .map(nodeId => nodes.get(nodeId))
                .filter(n => n);
            
            if (coords.length < 2) continue;
            
            // Calculate bounding box of this way
            const gameCoords = coords.map(c => toGameCoords(c.lat, c.lon));
            const minX = Math.min(...gameCoords.map(c => c.x));
            const maxX = Math.max(...gameCoords.map(c => c.x));
            const minY = Math.min(...gameCoords.map(c => c.y));
            const maxY = Math.max(...gameCoords.map(c => c.y));
            
            const width = maxX - minX;
            const height = maxY - minY;
            
            // Skip very small or very large elements
            if (width < 5 || height < 5) continue;
            if (width > 800 || height > 600) continue;
            
            // Determine type based on OSM tags
            if (tags.amenity === 'parking') {
                // Use first parking area as the parking zone
                if (!parkingZone && width > 40 && height > 40) {
                    // Find a spot within the parking area
                    parkingZone = {
                        x: minX + width / 2 - 28,
                        y: minY + 10,
                        width: 56,
                        height: 170,
                        angle: 0
                    };
                }
                // Don't add parking as obstacle, it's driveable
                continue;
            }
            
            if (tags.highway) {
                // Add road path for rendering
                roads.push({
                    points: gameCoords,
                    type: tags.highway,
                    name: tags.name
                });
                continue;
            }
            
            if (tags.building) {
                obstacles.push({
                    type: 'wall',
                    x: minX,
                    y: minY,
                    width: Math.max(width, 15),
                    height: Math.max(height, 15)
                });
            } else if (tags.barrier) {
                obstacles.push({
                    type: 'barrier',
                    x: minX,
                    y: minY,
                    width: Math.max(width, 10),
                    height: Math.max(height, 10)
                });
            }
        }
        
        // Default parking zone if none found - place at top center
        if (!parkingZone) {
            parkingZone = {
                x: gameWidth / 2 - 28 + 50,
                y: 60,
                width: 56,
                height: 170,
                angle: 0
            };
        }
        
        // Find a good starting position (prioritize center for free roam)
        const truckStart = this.freeRoam 
            ? this.findCenterStartPosition(obstacles, gameWidth, gameHeight)
            : this.findStartPosition(obstacles, gameWidth, gameHeight);
        
        // If very few obstacles, add some default dock barriers (only if not free roam)
        if (obstacles.length < 3 && !this.freeRoam) {
            // Add dock barriers around parking zone
            obstacles.push({
                type: 'barrier',
                x: parkingZone.x - 15,
                y: parkingZone.y,
                width: 10,
                height: parkingZone.height
            });
            obstacles.push({
                type: 'barrier',
                x: parkingZone.x + parkingZone.width + 5,
                y: parkingZone.y,
                width: 10,
                height: parkingZone.height
            });
            obstacles.push({
                type: 'wall',
                x: parkingZone.x - 100,
                y: 40,
                width: parkingZone.width + 200,
                height: 15
            });
        }
        
        return {
            id: 'osm-custom',
            name: this.freeRoam ? 'Free Roam' : 'Real World Map',
            description: `Location: ${bbox.centerLat.toFixed(4)}, ${bbox.centerLon.toFixed(4)}`,
            truck: truckStart,
            parkingTarget: 'trailer',
            parkingZone: this.freeRoam ? null : parkingZone,
            obstacles: obstacles,
            roads: roads,
            freeRoam: this.freeRoam,
            worldWidth: gameWidth,
            worldHeight: gameHeight
        };
    }
    
    findCenterStartPosition(obstacles, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const margin = 200;
        
        // 1. Check exact center first
        if (this.isPositionClear(centerX, centerY, obstacles, margin)) {
            return { x: centerX, y: centerY, angle: Math.PI };
        }
        
        // 2. Spiral out from center to find nearest clear spot
        let radius = 50;
        let angle = 0;
        
        // Search max 1000 pixels out
        while (radius < 1000) {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Stay within bounds
            if (x > 100 && x < width - 100 && y > 100 && y < height - 100) {
                if (this.isPositionClear(x, y, obstacles, margin)) {
                    return { x, y, angle: Math.PI };
                }
            }
            
            angle += 0.5; // Rotate
            if (angle > Math.PI * 2) {
                angle = 0;
                radius += 50; // Expand
            }
        }
        
        // Fallback
        return { x: centerX, y: centerY, angle: Math.PI };
    }

    findStartPosition(obstacles, width, height) {
        // Grid search for a clear spot - much more thorough
        const margin = 250;  // Space needed for truck + trailer (increased)
        
        // Try many positions across the map, starting from bottom
        for (let y = height - 200; y > 300; y -= 80) {
            for (let x = 200; x < width - 200; x += 80) {
                if (this.isPositionClear(x, y, obstacles, margin)) {
                    return { x, y, angle: Math.PI };
                }
            }
        }
        
        // If still no position, find the largest clear area
        let bestPos = { x: width / 2, y: height - 100, angle: Math.PI };
        let bestDist = 0;
        
        for (let y = 200; y < height - 100; y += 50) {
            for (let x = 150; x < width - 100; x += 50) {
                const dist = this.getMinDistanceToObstacle(x, y, obstacles);
                if (dist > bestDist) {
                    bestDist = dist;
                    bestPos = { x, y, angle: Math.PI };
                }
            }
        }
        
        return bestPos;
    }
    
    isPositionClear(x, y, obstacles, margin) {
        // Check area for truck cab AND trailer behind it
        // Trailer extends upward (negative Y) from truck position
        const trailerLength = 200;
        
        for (const obs of obstacles) {
            const obsLeft = obs.x - margin;
            const obsRight = obs.x + (obs.width || 30) + margin;
            const obsTop = obs.y - margin;
            const obsBottom = obs.y + (obs.height || 30) + margin;
            
            // Check truck area
            if (x > obsLeft && x < obsRight && y > obsTop && y < obsBottom) {
                return false;
            }
            
            // Check trailer area (above truck)
            if (x > obsLeft && x < obsRight && 
                (y - trailerLength) > obsTop && (y - trailerLength) < obsBottom) {
                return false;
            }
        }
        return true;
    }
    
    getMinDistanceToObstacle(x, y, obstacles) {
        let minDist = Infinity;
        for (const obs of obstacles) {
            const cx = obs.x + obs.width / 2;
            const cy = obs.y + obs.height / 2;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            minDist = Math.min(minDist, dist);
        }
        return minDist;
    }
}

