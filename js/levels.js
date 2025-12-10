// Level Loader and Level Data
export class LevelLoader {
    constructor() {
        this.levels = this.defineLevels();
        this.currentLevelIndex = 0;
    }
    
    // Define all levels inline (easier for GitHub Pages deployment)
    defineLevels() {
        return [
            // Level 1 - Easy: Straight Back
            {
                id: 1,
                name: "Straight Back",
                description: "Back the trailer straight into the parking zone",
                truck: { x: 400, y: 450, angle: Math.PI },
                parkingZone: { x: 350, y: 80, width: 100, height: 160, angle: 0 },
                obstacles: [
                    { type: 'barrier', x: 220, y: 60, width: 20, height: 180 },
                    { type: 'barrier', x: 560, y: 60, width: 20, height: 180 }
                ]
            },
            // Level 2 - Medium: Angled Approach
            {
                id: 2,
                name: "Angled Dock",
                description: "Navigate the angle and park precisely",
                truck: { x: 600, y: 480, angle: Math.PI + Math.PI / 6 },
                parkingZone: { x: 100, y: 80, width: 100, height: 160, angle: 0 },
                obstacles: [
                    { type: 'wall', x: 250, y: 280, width: 150, height: 20 },
                    { type: 'barrier', x: 50, y: 60, width: 20, height: 180 },
                    { type: 'cone', x: 300, y: 150, width: 20, height: 20 },
                    { type: 'cone', x: 350, y: 200, width: 20, height: 20 }
                ]
            },
            // Level 3 - Hard: Tight Squeeze
            {
                id: 3,
                name: "Tight Squeeze",
                description: "Navigate through obstacles to the parking spot",
                truck: { x: 650, y: 500, angle: Math.PI },
                parkingZone: { x: 100, y: 60, width: 100, height: 150, angle: 0 },
                obstacles: [
                    { type: 'car', x: 280, y: 350, width: 50, height: 90 },
                    { type: 'car', x: 450, y: 400, width: 50, height: 90 },
                    { type: 'wall', x: 0, y: 250, width: 250, height: 20 },
                    { type: 'wall', x: 350, y: 250, width: 200, height: 20 },
                    { type: 'barrier', x: 50, y: 40, width: 20, height: 170 },
                    { type: 'cone', x: 300, y: 150, width: 20, height: 20 },
                    { type: 'cone', x: 400, y: 100, width: 20, height: 20 },
                    { type: 'cone', x: 250, y: 80, width: 20, height: 20 }
                ]
            },
            // Level 4 - Expert: The Maze
            {
                id: 4,
                name: "The Maze",
                description: "Find your way through the maze",
                truck: { x: 700, y: 520, angle: Math.PI },
                parkingZone: { x: 50, y: 50, width: 100, height: 130, angle: 0 },
                obstacles: [
                    { type: 'wall', x: 200, y: 0, width: 20, height: 180 },
                    { type: 'wall', x: 200, y: 260, width: 20, height: 340 },
                    { type: 'wall', x: 400, y: 100, width: 20, height: 300 },
                    { type: 'wall', x: 580, y: 0, width: 20, height: 250 },
                    { type: 'wall', x: 580, y: 350, width: 20, height: 250 },
                    { type: 'barrier', x: 0, y: 30, width: 20, height: 150 },
                    { type: 'car', x: 250, y: 400, width: 50, height: 90 },
                    { type: 'cone', x: 300, y: 200, width: 20, height: 20 }
                ]
            },
            // Level 5 - Master: Parallel Park
            {
                id: 5,
                name: "Parallel Park",
                description: "The ultimate test - parallel park the trailer",
                truck: { x: 400, y: 500, angle: Math.PI },
                parkingZone: { x: 280, y: 100, width: 160, height: 80, angle: Math.PI / 2 },
                obstacles: [
                    { type: 'car', x: 100, y: 70, width: 50, height: 100 },
                    { type: 'car', x: 500, y: 70, width: 50, height: 100 },
                    { type: 'wall', x: 0, y: 40, width: 800, height: 20 },
                    { type: 'barrier', x: 200, y: 200, width: 100, height: 20 },
                    { type: 'barrier', x: 450, y: 200, width: 100, height: 20 },
                    { type: 'cone', x: 260, y: 250, width: 20, height: 20 },
                    { type: 'cone', x: 480, y: 250, width: 20, height: 20 }
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

