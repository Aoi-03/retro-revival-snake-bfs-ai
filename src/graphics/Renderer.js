export class Renderer {
    constructor(ctx, board) {
        this.ctx = ctx;
        this.board = board;
        this.cellSize = 20;
        
        // Set up canvas for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Calculate actual canvas size based on board
        this.canvasWidth = this.board.width * this.cellSize;
        this.canvasHeight = this.board.height * this.cellSize;
        
        // Set canvas size
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
    }
    
    clear() {
        // Clear with dark background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw subtle grid
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.board.width; x++) {
            const pixelX = x * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.board.height; y++) {
            const pixelY = y * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, pixelY);
            this.ctx.lineTo(this.canvasWidth, pixelY);
            this.ctx.stroke();
        }
    }
    
    drawSnake(snake) {
        for (let i = 0; i < snake.body.length; i++) {
            const segment = snake.body[i];
            const isHead = i === 0;
            
            this.drawSnakeSegment(
                segment.x, 
                segment.y, 
                snake.color, 
                isHead,
                snake.direction
            );
        }
    }
    
    drawSnakeSegment(x, y, color, isHead = false, direction = 'right') {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        const size = this.cellSize - 2; // Leave 1px border
        
        // Main body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, size, size);
        
        if (isHead) {
            // Draw head with direction indicator
            this.drawSnakeHead(pixelX + 1, pixelY + 1, size, color, direction);
        } else {
            // Draw body with inner highlight
            this.ctx.fillStyle = this.lightenColor(color, 0.3);
            this.ctx.fillRect(pixelX + 3, pixelY + 3, size - 4, size - 4);
        }
        
        // Outer glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 5;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX + 1, pixelY + 1, size, size);
        this.ctx.shadowBlur = 0;
    }
    
    drawSnakeHead(x, y, size, color, direction) {
        // Draw eyes based on direction
        this.ctx.fillStyle = '#ffffff';
        
        const eyeSize = 3;
        let eye1X, eye1Y, eye2X, eye2Y;
        
        switch (direction) {
            case 'up':
                eye1X = x + 4;
                eye1Y = y + 4;
                eye2X = x + size - 7;
                eye2Y = y + 4;
                break;
            case 'down':
                eye1X = x + 4;
                eye1Y = y + size - 7;
                eye2X = x + size - 7;
                eye2Y = y + size - 7;
                break;
            case 'left':
                eye1X = x + 4;
                eye1Y = y + 4;
                eye2X = x + 4;
                eye2Y = y + size - 7;
                break;
            case 'right':
                eye1X = x + size - 7;
                eye1Y = y + 4;
                eye2X = x + size - 7;
                eye2Y = y + size - 7;
                break;
        }
        
        this.ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
        this.ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
    }
    
    drawFood(food) {
        const pixelX = food.x * this.cellSize;
        const pixelY = food.y * this.cellSize;
        const size = this.cellSize - 4; // Smaller than snake segments
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
        const adjustedSize = size * pulse;
        const offset = (this.cellSize - adjustedSize) / 2;
        
        // Main food body
        this.ctx.fillStyle = food.color;
        this.ctx.fillRect(
            pixelX + offset, 
            pixelY + offset, 
            adjustedSize, 
            adjustedSize
        );
        
        // Inner highlight
        this.ctx.fillStyle = this.lightenColor(food.color, 0.5);
        this.ctx.fillRect(
            pixelX + offset + 2, 
            pixelY + offset + 2, 
            adjustedSize - 4, 
            adjustedSize - 4
        );
        
        // Glow effect
        this.ctx.shadowColor = food.color;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = food.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            pixelX + offset, 
            pixelY + offset, 
            adjustedSize, 
            adjustedSize
        );
        this.ctx.shadowBlur = 0;
    }
    
    lightenColor(color, factor) {
        // Simple color lightening
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
}