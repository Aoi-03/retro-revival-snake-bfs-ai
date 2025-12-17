export class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cellSize = 20; // pixels per cell
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }, // left
            { x: 1, y: 0 }   // right
        ];
        
        for (let dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            
            if (this.isValidPosition(newX, newY)) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
}