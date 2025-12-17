// Retro Revival Snake Game - Browser Compatible Bundle
// All classes combined for direct browser execution

// Board class
class Board {
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

// Food class
class Food {
    constructor(board) {
        this.board = board;
        this.x = 0;
        this.y = 0;
        this.type = 'normal';
        this.value = 10;
        this.color = '#ffff41'; // Yellow
    }
    
    spawn(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Set properties based on food type
        switch (type) {
            case 'normal':
                this.value = 10;
                this.color = '#ffff41';
                break;
            case 'bonus':
                this.value = 25;
                this.color = '#ff41ff';
                break;
            case 'super':
                this.value = 50;
                this.color = '#41ffff';
                break;
        }
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    getValue() {
        return this.value;
    }
    
    getColor() {
        return this.color;
    }
}

// Snake class
class Snake {
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

// BFS Pathfinder class
class BFSPathfinder {
    constructor(board) {
        this.board = board;
        this.maxCalculationTime = 16; // Maximum 16ms per calculation for 60 FPS
    }
    
    findPath(start, goal, obstacles) {
        const startTime = performance.now();
        const queue = [start];
        const visited = new Set();
        const parent = new Map();
        
        const getKey = (node) => `${node.x},${node.y}`;
        
        visited.add(getKey(start));
        
        while (queue.length > 0) {
            // Check if we've exceeded our time budget
            if (performance.now() - startTime > this.maxCalculationTime) {
                console.warn('BFS calculation exceeded time limit, returning partial result');
                break;
            }
            
            const current = queue.shift();
            
            // Check if we reached the goal
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(parent, current);
            }
            
            // Explore neighbors in BFS order
            for (let neighbor of this.board.getNeighbors(current.x, current.y)) {
                const neighborKey = getKey(neighbor);
                
                // Skip if already visited or is an obstacle
                if (visited.has(neighborKey) || obstacles.has(neighborKey)) {
                    continue;
                }
                
                // Mark as visited and add to queue
                visited.add(neighborKey);
                parent.set(neighborKey, current);
                queue.push(neighbor);
            }
        }
        
        return []; // No path found
    }
    
    reconstructPath(parent, current) {
        const path = [current];
        const getKey = (node) => `${node.x},${node.y}`;
        
        while (parent.has(getKey(current))) {
            current = parent.get(getKey(current));
            path.unshift(current);
        }
        
        return path;
    }
    
    // Find multiple paths to different targets and return the best one
    findBestPath(start, targets, obstacles) {
        if (targets.length === 0) return [];
        if (targets.length === 1) return this.findPath(start, targets[0], obstacles);
        
        let bestPath = [];
        let shortestDistance = Infinity;
        
        for (let target of targets) {
            const path = this.findPath(start, target, obstacles);
            if (path.length > 0 && path.length < shortestDistance) {
                bestPath = path;
                shortestDistance = path.length;
            }
        }
        
        return bestPath;
    }
    
    // Evaluate how safe a position is (used for competitive behavior)
    evaluatePositionSafety(position, obstacles) {
        const queue = [position];
        const visited = new Set();
        const getKey = (node) => `${node.x},${node.y}`;
        
        let safeSpaces = 0;
        const maxEvaluation = 50; // Limit evaluation for performance
        
        visited.add(getKey(position));
        
        while (queue.length > 0 && safeSpaces < maxEvaluation) {
            const current = queue.shift();
            safeSpaces++;
            
            for (let neighbor of this.board.getNeighbors(current.x, current.y)) {
                const neighborKey = getKey(neighbor);
                
                if (!visited.has(neighborKey) && !obstacles.has(neighborKey)) {
                    visited.add(neighborKey);
                    queue.push(neighbor);
                }
            }
        }
        
        return safeSpaces;
    }
}

// AI Snake class
class AISnake extends Snake {
    constructor(x, y, direction, color, board) {
        super(x, y, direction, color);
        this.board = board;
        this.pathfinder = new BFSPathfinder(board);
        this.difficulty = 'medium';
        this.lastPathUpdate = 0;
        this.pathUpdateInterval = 200;
        this.currentPath = [];
        this.strategy = 'balanced';
    }
    
    update(playerSnake, food) {
        // Analyze current game state
        this.analyzeGameState(playerSnake, food);
        
        // Update AI decision making
        this.makeDecision(playerSnake, food);
        
        // Call parent update to move the snake
        super.update();
    }
    
    makeDecision(playerSnake, food) {
        const currentTime = Date.now();
        
        // Update path periodically or when needed
        if (currentTime - this.lastPathUpdate > this.pathUpdateInterval || 
            this.currentPath.length === 0) {
            this.updatePath(playerSnake, food);
            this.lastPathUpdate = currentTime;
        }
        
        // Follow the current path
        this.followPath();
    }
    
    updatePath(playerSnake, food) {
        // Create obstacle map including both snakes
        const obstacles = this.createObstacleMap(playerSnake);
        const start = { x: this.head.x, y: this.head.y };
        const goal = { x: food.x, y: food.y };
        
        // Try to find path to food using BFS
        this.currentPath = this.pathfinder.findPath(start, goal, obstacles);
        
        // If no direct path to food, find safe movement
        if (this.currentPath.length === 0) {
            this.findSafeMovement(obstacles);
        }
    }
    
    createObstacleMap(playerSnake) {
        const obstacles = new Set();
        
        // Add player snake as obstacles
        for (let segment of playerSnake.body) {
            obstacles.add(`${segment.x},${segment.y}`);
        }
        
        // Add own body as obstacles (except head)
        for (let i = 1; i < this.body.length; i++) {
            obstacles.add(`${this.body[i].x},${this.body[i].y}`);
        }
        
        return obstacles;
    }
    
    followPath() {
        if (this.currentPath.length > 1) {
            const nextStep = this.currentPath[1]; // Skip current position
            const head = this.head;
            
            // Determine direction to next step
            if (nextStep.x > head.x) {
                this.setDirection('right');
            } else if (nextStep.x < head.x) {
                this.setDirection('left');
            } else if (nextStep.y > head.y) {
                this.setDirection('down');
            } else if (nextStep.y < head.y) {
                this.setDirection('up');
            }
            
            // Remove current position from path
            this.currentPath.shift();
        }
    }
    
    findSafeMovement(obstacles) {
        const head = this.head;
        const directions = ['up', 'down', 'left', 'right'];
        const safeDirections = [];
        
        for (let dir of directions) {
            if (!this.isValidDirectionChange(dir)) continue;
            
            let newX = head.x;
            let newY = head.y;
            
            switch (dir) {
                case 'up': newY--; break;
                case 'down': newY++; break;
                case 'left': newX--; break;
                case 'right': newX++; break;
            }
            
            // Check if position is safe
            if (this.board.isValidPosition(newX, newY) && 
                !obstacles.has(`${newX},${newY}`)) {
                
                const safetyScore = this.pathfinder.evaluatePositionSafety(
                    { x: newX, y: newY }, 
                    obstacles
                );
                safeDirections.push({ direction: dir, safety: safetyScore });
            }
        }
        
        if (safeDirections.length > 0) {
            // Choose the safest direction
            safeDirections.sort((a, b) => b.safety - a.safety);
            this.setDirection(safeDirections[0].direction);
        }
    }
    
    analyzeGameState(playerSnake, food) {
        const scoreDifference = this.score - playerSnake.score;
        
        // Determine strategy based on analysis
        if (scoreDifference < -20) {
            this.strategy = 'aggressive';
        } else if (scoreDifference > 20) {
            this.strategy = 'defensive';
        } else {
            this.strategy = 'balanced';
        }
    }
}

// Renderer class
class Renderer {
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
}

// Audio Manager class
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.isPlaying = false;
        this.volume = 0.3;
        
        this.initializeAudio();
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    playBackgroundMusic() {
        if (!this.audioContext || this.isPlaying) return;
        
        this.isPlaying = true;
        this.playChiptune();
    }
    
    stopBackgroundMusic() {
        this.isPlaying = false;
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }
    
    playChiptune() {
        if (!this.audioContext) return;
        
        // Simple chiptune melody
        const melody = [
            { freq: 440, duration: 0.2 }, // A
            { freq: 523, duration: 0.2 }, // C
            { freq: 659, duration: 0.2 }, // E
            { freq: 784, duration: 0.4 }, // G
        ];
        
        this.playMelody(melody, 0);
    }
    
    playMelody(melody, index) {
        if (!this.isPlaying || index >= melody.length) {
            if (this.isPlaying) {
                // Loop the melody
                setTimeout(() => this.playMelody(melody, 0), 500);
            }
            return;
        }
        
        const note = melody[index];
        this.playTone(note.freq, note.duration);
        
        setTimeout(() => {
            this.playMelody(melody, index + 1);
        }, note.duration * 1000);
    }
    
    playTone(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square'; // Chiptune sound
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Envelope for retro sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

// Game class
class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.board = new Board(40, 30); // 40x30 grid
        this.renderer = new Renderer(ctx, this.board);
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        // Game entities
        this.playerSnake = null;
        this.aiSnake = null;
        this.food = null;
        
        // Callbacks
        this.onScoreUpdate = null;
        this.onGameOver = null;
        
        // Game settings
        this.gameSpeed = 150; // milliseconds between moves
        this.lastMoveTime = 0;
    }
    
    start() {
        this.initializeGame();
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop = setInterval(() => this.update(), 16); // 60 FPS
    }
    
    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    pause() {
        this.isPaused = !this.isPaused;
    }
    
    initializeGame() {
        // Create player snake (starts on left side)
        this.playerSnake = new Snake(
            5, 15, // x, y position
            'right', // initial direction
            '#00ff41' // green color
        );
        
        // Create AI snake (starts on right side)
        this.aiSnake = new AISnake(
            35, 15, // x, y position
            'left', // initial direction
            '#ff4141', // red color
            this.board
        );
        
        // Create food system
        this.food = new Food(this.board);
        this.spawnFood();
    }
    
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.gameSpeed) return;
        
        this.lastMoveTime = currentTime;
        
        // Update snakes
        this.playerSnake.update();
        this.aiSnake.update(this.playerSnake, this.food);
        
        // Check food consumption
        this.checkFoodConsumption();
        
        // Check collisions
        this.checkCollisions();
        
        // Update scores
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.playerSnake.score, this.aiSnake.score);
        }
        
        // Render everything
        this.render();
    }
    
    checkFoodConsumption() {
        // Check if player snake ate food
        if (this.playerSnake.head.x === this.food.x && this.playerSnake.head.y === this.food.y) {
            this.playerSnake.grow();
            this.playerSnake.addScore(10);
            this.spawnFood();
        }
        
        // Check if AI snake ate food
        if (this.aiSnake.head.x === this.food.x && this.aiSnake.head.y === this.food.y) {
            this.aiSnake.grow();
            this.aiSnake.addScore(10);
            this.spawnFood();
        }
    }
    
    checkCollisions() {
        const playerCollision = this.checkSnakeCollisions(this.playerSnake);
        const aiCollision = this.checkSnakeCollisions(this.aiSnake);
        
        if (playerCollision || aiCollision) {
            this.endGame(playerCollision, aiCollision);
        }
    }
    
    checkSnakeCollisions(snake) {
        const head = snake.head;
        
        // Wall collision
        if (head.x < 0 || head.x >= this.board.width || 
            head.y < 0 || head.y >= this.board.height) {
            return true;
        }
        
        // Self collision
        for (let i = 1; i < snake.body.length; i++) {
            if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                return true;
            }
        }
        
        // Collision with other snake
        const otherSnake = snake === this.playerSnake ? this.aiSnake : this.playerSnake;
        for (let segment of otherSnake.body) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    endGame(playerCollision, aiCollision) {
        this.stop();
        
        let winner;
        if (playerCollision && aiCollision) {
            winner = 'draw';
        } else if (playerCollision) {
            winner = 'ai';
        } else if (aiCollision) {
            winner = 'player';
        } else {
            // Compare scores if no collision
            if (this.playerSnake.score > this.aiSnake.score) {
                winner = 'player';
            } else if (this.aiSnake.score > this.playerSnake.score) {
                winner = 'ai';
            } else {
                winner = 'draw';
            }
        }
        
        if (this.onGameOver) {
            this.onGameOver(winner, this.playerSnake.score, this.aiSnake.score);
        }
    }
    
    spawnFood() {
        let validPosition = false;
        let x, y;
        
        // Find a position not occupied by snakes
        while (!validPosition) {
            x = Math.floor(Math.random() * this.board.width);
            y = Math.floor(Math.random() * this.board.height);
            
            validPosition = true;
            
            // Check player snake
            for (let segment of this.playerSnake.body) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check AI snake
            if (validPosition) {
                for (let segment of this.aiSnake.body) {
                    if (segment.x === x && segment.y === y) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
        
        this.food.spawn(x, y);
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawFood(this.food);
        this.renderer.drawSnake(this.playerSnake);
        this.renderer.drawSnake(this.aiSnake);
    }
    
    handleInput(key) {
        if (key === ' ') {
            this.pause();
            return;
        }
        
        // Handle player snake movement
        switch (key) {
            case 'ArrowUp':
                this.playerSnake.setDirection('up');
                break;
            case 'ArrowDown':
                this.playerSnake.setDirection('down');
                break;
            case 'ArrowLeft':
                this.playerSnake.setDirection('left');
                break;
            case 'ArrowRight':
                this.playerSnake.setDirection('right');
                break;
        }
    }
}

// Game App class
class GameApp {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = null;
        this.audioManager = new AudioManager();
        
        this.initializeUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        // Get UI elements
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        
        // Score elements
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl = document.getElementById('ai-score');
        this.finalPlayerScoreEl = document.getElementById('final-player-score');
        this.finalAiScoreEl = document.getElementById('final-ai-score');
        this.winnerTextEl = document.getElementById('winner-text');
    }
    
    setupEventListeners() {
        // Menu buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.menuBtn.addEventListener('click', () => this.showMainMenu());
        
        // Settings and High Scores buttons (placeholder functionality)
        this.settingsBtn = document.getElementById('settings-btn');
        this.scoresBtn = document.getElementById('scores-btn');
        
        this.settingsBtn.addEventListener('click', () => {
            alert('Settings: Use arrow keys to move, Space to pause. AI difficulty is set to Medium.');
        });
        
        this.scoresBtn.addEventListener('click', () => {
            const scores = this.getHighScores();
            if (scores.length === 0) {
                alert('No high scores yet! Play a game to set your first score.');
            } else {
                let message = 'HIGH SCORES:\n\n';
                scores.forEach((score, index) => {
                    const winner = score.winner === 'player' ? '👑 Player' : score.winner === 'ai' ? '🤖 AI' : '🤝 Draw';
                    message += `#${index + 1}: ${score.playerScore} points - ${winner}\n`;
                });
                alert(message);
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.game && this.game.isRunning) {
                this.game.handleInput(e.key);
            }
        });
        
        // Prevent arrow key scrolling
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    startGame() {
        this.hideAllOverlays();
        
        // Initialize new game
        this.game = new Game(this.canvas, this.ctx);
        this.game.onScoreUpdate = (playerScore, aiScore) => {
            this.updateScores(playerScore, aiScore);
        };
        this.game.onGameOver = (winner, playerScore, aiScore) => {
            this.showGameOver(winner, playerScore, aiScore);
        };
        
        // Start the game
        this.game.start();
        this.audioManager.playBackgroundMusic();
    }
    
    updateScores(playerScore, aiScore) {
        this.playerScoreEl.textContent = playerScore;
        this.aiScoreEl.textContent = aiScore;
    }
    
    showGameOver(winner, playerScore, aiScore) {
        // Save high score
        this.saveHighScore(playerScore, aiScore, winner);
        
        this.finalPlayerScoreEl.textContent = playerScore;
        this.finalAiScoreEl.textContent = aiScore;
        
        if (winner === 'player') {
            this.winnerTextEl.textContent = 'VICTORY!';
            this.winnerTextEl.style.color = '#00ff41';
        } else if (winner === 'ai') {
            this.winnerTextEl.textContent = 'AI WINS!';
            this.winnerTextEl.style.color = '#ff4141';
        } else {
            this.winnerTextEl.textContent = 'DRAW!';
            this.winnerTextEl.style.color = '#ffff41';
        }
        
        this.gameOverOverlay.classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
    }
    
    // High Scores functionality
    getHighScores() {
        try {
            const scores = localStorage.getItem('retro-snake-high-scores');
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveHighScore(playerScore, aiScore, winner) {
        const scores = this.getHighScores();
        const newScore = {
            playerScore,
            aiScore,
            winner,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.playerScore - a.playerScore);
        scores.splice(10); // Keep only top 10
        
        try {
            localStorage.setItem('retro-snake-high-scores', JSON.stringify(scores));
        } catch (e) {
            console.warn('Could not save high score');
        }
    }
    
    showMainMenu() {
        this.hideAllOverlays();
        this.menuOverlay.classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
        
        // Reset scores
        this.updateScores(0, 0);
    }
    
    hideAllOverlays() {
        this.menuOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});