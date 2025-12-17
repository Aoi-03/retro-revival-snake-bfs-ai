export class Snake {
    constructor(x, y, direction, color) {
        this.body = [{ x, y }];
        this.direction = direction;
        this.nextDirection = direction;
        this.color = color;
        this.score = 0;
        this.growthPending = 0;
    }
    
    get head() {
        return this.body[0];
    }
    
    update() {
        // Update direction (prevent immediate reversal)
        if (this.isValidDirectionChange(this.nextDirection)) {
            this.direction = this.nextDirection;
        }
        
        // Calculate new head position
        const head = { ...this.head };
        
        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Add new head
        this.body.unshift(head);
        
        // Handle growth
        if (this.growthPending > 0) {
            this.growthPending--;
        } else {
            // Remove tail if not growing
            this.body.pop();
        }
    }
    
    setDirection(newDirection) {
        this.nextDirection = newDirection;
    }
    
    isValidDirectionChange(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        return opposites[this.direction] !== newDirection;
    }
    
    grow() {
        this.growthPending += 1;
    }
    
    addScore(points) {
        this.score += points;
    }
    
    getLength() {
        return this.body.length;
    }
    
    // Check if a position is occupied by this snake
    occupiesPosition(x, y) {
        return this.body.some(segment => segment.x === x && segment.y === y);
    }
    
    // Get all positions this snake will occupy in the next few moves
    getPredictedPositions(steps = 3) {
        const positions = [...this.body];
        let currentHead = { ...this.head };
        let currentDirection = this.direction;
        
        for (let i = 0; i < steps; i++) {
            switch (currentDirection) {
                case 'up':
                    currentHead = { x: currentHead.x, y: currentHead.y - 1 };
                    break;
                case 'down':
                    currentHead = { x: currentHead.x, y: currentHead.y + 1 };
                    break;
                case 'left':
                    currentHead = { x: currentHead.x - 1, y: currentHead.y };
                    break;
                case 'right':
                    currentHead = { x: currentHead.x + 1, y: currentHead.y };
                    break;
            }
            positions.unshift(currentHead);
        }
        
        return positions;
    }
}