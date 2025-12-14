// Level Loader and Level Data
export class LevelLoader {
    constructor() {
        this.levels = this.defineLevels();
        this.currentLevelIndex = 0;
    }
    
    // Canvas: 1200 x 800
    // Trailer: ~44 wide, ~160 long
    // Bay width needed: ~60px, height: ~170px
    defineLevels() {
        return [
            // Level 1 - Easy: Straight dock
            {
                id: 1,
                name: "First Delivery",
                description: "Back the TRAILER into the green zone",
                truck: { x: 600, y: 600, angle: Math.PI },
                parkingTarget: 'trailer',
                parkingZone: { x: 572, y: 50, width: 56, height: 170, angle: 0 },
                obstacles: [
                    // Back wall
                    { type: 'wall', x: 400, y: 30, width: 400, height: 15 },
                    // Side barriers
                    { type: 'barrier', x: 560, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 630, y: 45, width: 10, height: 180 }
                ]
            },
            
            // Level 2 - Easy: Loading dock with neighbors
            {
                id: 2,
                name: "Loading Bay",
                description: "Park TRAILER in the empty bay",
                truck: { x: 600, y: 600, angle: Math.PI },
                parkingTarget: 'trailer',
                parkingZone: { x: 422, y: 50, width: 56, height: 170, angle: 0 },
                obstacles: [
                    // Back wall
                    { type: 'wall', x: 200, y: 30, width: 600, height: 15 },
                    // Barriers between bays
                    { type: 'barrier', x: 270, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 340, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 410, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 480, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 550, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 620, y: 45, width: 10, height: 180 },
                    // Parked trailers
                    { type: 'parkedTrailer', x: 283, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 353, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 493, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 563, y: 55, width: 52, height: 155 }
                ]
            },
            
            // Level 3 - Medium: Angled approach
            {
                id: 3,
                name: "Angled Approach",
                description: "Approach from the side",
                truck: { x: 950, y: 500, angle: Math.PI * 0.7 },
                parkingTarget: 'trailer',
                parkingZone: { x: 272, y: 50, width: 56, height: 170, angle: 0 },
                obstacles: [
                    // Back wall
                    { type: 'wall', x: 100, y: 30, width: 500, height: 15 },
                    // Barriers
                    { type: 'barrier', x: 180, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 260, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 330, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 400, y: 45, width: 10, height: 180 },
                    // Parked trailers
                    { type: 'parkedTrailer', x: 193, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 343, y: 55, width: 52, height: 155 },
                    // Obstacles in yard
                    { type: 'car', x: 600, y: 300, width: 50, height: 90 },
                    { type: 'cone', x: 500, y: 400, width: 20, height: 20 },
                    { type: 'cone', x: 400, y: 350, width: 20, height: 20 }
                ]
            },
            
            // Level 4 - Hard: Busy yard
            {
                id: 4,
                name: "Busy Yard",
                description: "Navigate through traffic",
                truck: { x: 1000, y: 650, angle: Math.PI },
                parkingTarget: 'trailer',
                parkingZone: { x: 202, y: 50, width: 56, height: 170, angle: 0 },
                obstacles: [
                    // Back wall
                    { type: 'wall', x: 50, y: 30, width: 450, height: 15 },
                    // Barriers
                    { type: 'barrier', x: 120, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 190, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 260, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 330, y: 45, width: 10, height: 180 },
                    // Parked trailer
                    { type: 'parkedTrailer', x: 133, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 273, y: 55, width: 52, height: 155 },
                    // Yard obstacles
                    { type: 'car', x: 500, y: 300, width: 50, height: 90 },
                    { type: 'car', x: 650, y: 450, width: 50, height: 90 },
                    { type: 'car', x: 400, y: 500, width: 50, height: 90 },
                    { type: 'wall', x: 550, y: 550, width: 150, height: 80 },
                    // Cones
                    { type: 'cone', x: 350, y: 400, width: 20, height: 20 },
                    { type: 'cone', x: 300, y: 300, width: 20, height: 20 }
                ]
            },
            
            // Level 5 - Expert: Tight squeeze
            {
                id: 5,
                name: "Tight Squeeze",
                description: "Only one bay open!",
                truck: { x: 600, y: 650, angle: Math.PI },
                parkingTarget: 'trailer',
                parkingZone: { x: 492, y: 50, width: 56, height: 170, angle: 0 },
                obstacles: [
                    // Back wall
                    { type: 'wall', x: 200, y: 30, width: 800, height: 15 },
                    // Many barriers - tight spacing
                    { type: 'barrier', x: 270, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 340, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 410, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 480, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 550, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 620, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 690, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 760, y: 45, width: 10, height: 180 },
                    // All bays full except target
                    { type: 'parkedTrailer', x: 283, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 353, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 423, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 563, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 633, y: 55, width: 52, height: 155 },
                    { type: 'parkedTrailer', x: 703, y: 55, width: 52, height: 155 },
                    // Some yard obstacles
                    { type: 'car', x: 350, y: 400, width: 50, height: 90 },
                    { type: 'car', x: 750, y: 450, width: 50, height: 90 }
                ]
            },
            
            // Level 6 - Master: Navigate the yard
            {
                id: 6,
                name: "Shipping Yard",
                description: "Navigate to the far dock!",
                truck: { x: 300, y: 700, angle: Math.PI },
                parkingTarget: 'trailer',
                parkingZone: { x: 1022, y: 50, width: 56, height: 170, angle: 0 },
                obstacles: [
                    // Target dock at top right
                    { type: 'wall', x: 900, y: 30, width: 200, height: 15 },
                    { type: 'barrier', x: 1010, y: 45, width: 10, height: 180 },
                    { type: 'barrier', x: 1080, y: 45, width: 10, height: 180 },
                    // Central building
                    { type: 'wall', x: 400, y: 300, width: 200, height: 150 },
                    // Left dock area
                    { type: 'wall', x: 50, y: 30, width: 300, height: 15 },
                    { type: 'barrier', x: 100, y: 45, width: 10, height: 150 },
                    { type: 'barrier', x: 170, y: 45, width: 10, height: 150 },
                    { type: 'barrier', x: 240, y: 45, width: 10, height: 150 },
                    { type: 'parkedTrailer', x: 113, y: 55, width: 50, height: 130 },
                    { type: 'parkedTrailer', x: 183, y: 55, width: 50, height: 130 },
                    // Yard obstacles
                    { type: 'wall', x: 500, y: 400, width: 150, height: 80 },
                    { type: 'wall', x: 750, y: 550, width: 120, height: 100 },
                    // Cars in yard
                    { type: 'car', x: 550, y: 200, width: 50, height: 90 },
                    { type: 'car', x: 750, y: 350, width: 50, height: 90 },
                    { type: 'car', x: 500, y: 650, width: 50, height: 90 },
                    // Guide cones
                    { type: 'cone', x: 350, y: 500, width: 20, height: 20 },
                    { type: 'cone', x: 600, y: 400, width: 20, height: 20 },
                    { type: 'cone', x: 850, y: 300, width: 20, height: 20 },
                    { type: 'cone', x: 950, y: 250, width: 20, height: 20 }
                ]
            }
        ];
    }
    
    getLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            return this.levels[index];
        }
        return null;
    }
    
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }
    
    setCurrentLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
            return true;
        }
        return false;
    }
    
    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }
    
    getTotalLevels() {
        return this.levels.length;
    }
    
    isLastLevel() {
        return this.currentLevelIndex >= this.levels.length - 1;
    }
}
