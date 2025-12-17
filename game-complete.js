// Retro Revival Snake Game - Complete Browser Compatible Bundle
// All classes combined with Settings and High Scores functionality

// Storage Manager for high scores and settings
class StorageManager {
    constructor() {
        this.highScoresKey = 'retro-snake-high-scores';
        this.settingsKey = 'retro-snake-settings';
        this.defaultSettings = {
            volume: 0.3,
            difficulty: 'medium',
            soundEnabled: true
        };
    }
    
    getHighScores() {
        try {
            const scores = localStorage.getItem(this.highScoresKey);
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
            localStorage.setItem(this.highScoresKey, JSON.stringify(scores));
        } catch (e) {
            console.warn('Could not save high score');
        }
    }
    
    getSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? { ...this.defaultSettings, ...JSON.parse(settings) } : this.defaultSettings;
        } catch (e) {
            return this.defaultSettings;
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings');
        }
    }
}

// Board class
class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cellSize = 20;
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
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
        this.color = '#ffff41';
    }
    
    spawn(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        switch (type) {
            case 'normal':
                this.value = 10;
                this.color = '#ffff41';
                break;
            case 'bonus':
                this.value = 25;
                this.color = '#ff41ff';
                break;
        }
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
        if (this.isValidDirectionChange(this.nextDirection)) {
            this.direction = this.nextDirection;
        }
        
        const head = { ...this.head };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        this.body.unshift(head);
        
        if (this.growthPending > 0) {
            this.growthPending--;
        } else {
            this.body.pop();
        }
    }
    
    setDirection(newDirection) {
        this.nextDirection = newDirection;
    }
    
    isValidDirectionChange(newDirection) {
        const opposites = {
            'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left'
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
    
    getPredictedPositions(steps = 3) {
        const positions = [...this.body];
        let currentHead = { ...this.head };
        let currentDirection = this.direction;
        
        for (let i = 0; i < steps; i++) {
            switch (currentDirection) {
                case 'up': currentHead = { x: currentHead.x, y: currentHead.y - 1 }; break;
                case 'down': currentHead = { x: currentHead.x, y: currentHead.y + 1 }; break;
                case 'left': currentHead = { x: currentHead.x - 1, y: currentHead.y }; break;
                case 'right': currentHead = { x: currentHead.x + 1, y: currentHead.y }; break;
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
        this.maxCalculationTime = 16;
    }
    
    findPath(start, goal, obstacles) {
        const startTime = performance.now();
        const queue = [start];
        const visited = new Set();
        const parent = new Map();
        
        const getKey = (node) => `${node.x},${node.y}`;
        visited.add(getKey(start));
        
        while (queue.length > 0) {
            if (performance.now() - startTime > this.maxCalculationTime) {
                break;
            }
            
            const current = queue.shift();
            
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(parent, current);
            }
            
            for (let neighbor of this.board.getNeighbors(current.x, current.y)) {
                const neighborKey = getKey(neighbor);
                
                if (visited.has(neighborKey) || obstacles.has(neighborKey)) {
                    continue;
                }
                
                visited.add(neighborKey);
                parent.set(neighborKey, current);
                queue.push(neighbor);
            }
        }
        
        return [];
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
    
    evaluatePositionSafety(position, obstacles) {
        const queue = [position];
        const visited = new Set();
        const getKey = (node) => `${node.x},${node.y}`;
        
        let safeSpaces = 0;
        const maxEvaluation = 50;
        
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
    }
    
    update(playerSnake, food) {
        this.makeDecision(playerSnake, food);
        super.update();
    }
    
    makeDecision(playerSnake, food) {
        const currentTime = Date.now();
        
        if (currentTime - this.lastPathUpdate > this.pathUpdateInterval || 
            this.currentPath.length === 0) {
            this.updatePath(playerSnake, food);
            this.lastPathUpdate = currentTime;
        }
        
        this.followPath();
    }
    
    updatePath(playerSnake, food) {
        const obstacles = this.createObstacleMap(playerSnake);
        const start = { x: this.head.x, y: this.head.y };
        const goal = { x: food.x, y: food.y };
        
        this.currentPath = this.pathfinder.findPath(start, goal, obstacles);
        
        if (this.currentPath.length === 0) {
            this.findSafeMovement(obstacles);
        }
    }
    
    createObstacleMap(playerSnake) {
        const obstacles = new Set();
        
        for (let segment of playerSnake.body) {
            obstacles.add(`${segment.x},${segment.y}`);
        }
        
        for (let i = 1; i < this.body.length; i++) {
            obstacles.add(`${this.body[i].x},${this.body[i].y}`);
        }
        
        return obstacles;
    }
    
    followPath() {
        if (this.currentPath.length > 1) {
            const nextStep = this.currentPath[1];
            const head = this.head;
            
            if (nextStep.x > head.x) {
                this.setDirection('right');
            } else if (nextStep.x < head.x) {
                this.setDirection('left');
            } else if (nextStep.y > head.y) {
                this.setDirection('down');
            } else if (nextStep.y < head.y) {
                this.setDirection('up');
            }
            
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
            
            if (this.board.isValidPosition(newX, newY) && 
                !obstacles.has(`${newX},${newY}`)) {
                
                const safetyScore = this.pathfinder.evaluatePositionSafety(
                    { x: newX, y: newY }, obstacles
                );
                safeDirections.push({ direction: dir, safety: safetyScore });
            }
        }
        
        if (safeDirections.length > 0) {
            safeDirections.sort((a, b) => b.safety - a.safety);
            this.setDirection(safeDirections[0].direction);
        }
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        switch (difficulty) {
            case 'easy': this.pathUpdateInterval = 400; break;
            case 'medium': this.pathUpdateInterval = 200; break;
            case 'hard': this.pathUpdateInterval = 100; break;
        }
    }
}

// Renderer class
class Renderer {
    constructor(ctx, board) {
        this.ctx = ctx;
        this.board = board;
        this.cellSize = 20;
        
        this.ctx.imageSmoothingEnabled = false;
        this.canvasWidth = this.board.width * this.cellSize;
        this.canvasHeight = this.board.height * this.cellSize;
        
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
    }
    
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.board.width; x++) {
            const pixelX = x * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, this.canvasHeight);
            this.ctx.stroke();
        }
        
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
            
            this.drawSnakeSegment(segment.x, segment.y, snake.color, isHead, snake.direction);
        }
    }
    
    drawSnakeSegment(x, y, color, isHead = false, direction = 'right') {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        const size = this.cellSize - 2;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, size, size);
        
        if (isHead) {
            this.drawSnakeHead(pixelX + 1, pixelY + 1, size, color, direction);
        }
        
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 5;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX + 1, pixelY + 1, size, size);
        this.ctx.shadowBlur = 0;
    }
    
    drawSnakeHead(x, y, size, color, direction) {
        this.ctx.fillStyle = '#ffffff';
        const eyeSize = 3;
        let eye1X, eye1Y, eye2X, eye2Y;
        
        switch (direction) {
            case 'up':
                eye1X = x + 4; eye1Y = y + 4;
                eye2X = x + size - 7; eye2Y = y + 4;
                break;
            case 'down':
                eye1X = x + 4; eye1Y = y + size - 7;
                eye2X = x + size - 7; eye2Y = y + size - 7;
                break;
            case 'left':
                eye1X = x + 4; eye1Y = y + 4;
                eye2X = x + 4; eye2Y = y + size - 7;
                break;
            case 'right':
                eye1X = x + size - 7; eye1Y = y + 4;
                eye2X = x + size - 7; eye2Y = y + size - 7;
                break;
        }
        
        this.ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
        this.ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
    }
    
    drawFood(food) {
        const pixelX = food.x * this.cellSize;
        const pixelY = food.y * this.cellSize;
        const size = this.cellSize - 4;
        
        const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
        const adjustedSize = size * pulse;
        const offset = (this.cellSize - adjustedSize) / 2;
        
        this.ctx.fillStyle = food.color;
        this.ctx.fillRect(pixelX + offset, pixelY + offset, adjustedSize, adjustedSize);
        
        this.ctx.shadowColor = food.color;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = food.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pixelX + offset, pixelY + offset, adjustedSize, adjustedSize);
        this.ctx.shadowBlur = 0;
    }
}

// Audio Manager class
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.soundEnabled = true;
        
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
        if (!this.audioContext || this.isPlaying || !this.soundEnabled) return;
        
        this.isPlaying = true;
        this.playChiptune();
    }
    
    stopBackgroundMusic() {
        this.isPlaying = false;
    }
    
    playChiptune() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        const melody = [
            { freq: 440, duration: 0.2 },
            { freq: 523, duration: 0.2 },
            { freq: 659, duration: 0.2 },
            { freq: 784, duration: 0.4 }
        ];
        
        this.playMelody(melody, 0);
    }
    
    playMelody(melody, index) {
        if (!this.isPlaying || index >= melody.length) {
            if (this.isPlaying) {
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
        if (!this.audioContext || !this.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopBackgroundMusic();
        }
    }
}

// Game class
class Game {
    constructor(canvas, ctx, settings = {}) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.board = new Board(40, 30);
        this.renderer = new Renderer(ctx, this.board);
        this.settings = settings;
        
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        this.playerSnake = null;
        this.aiSnake = null;
        this.food = null;
        
        this.onScoreUpdate = null;
        this.onGameOver = null;
        
        this.gameSpeed = 150;
        this.lastMoveTime = 0;
    }
    
    start() {
        this.initializeGame();
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop = setInterval(() => this.update(), 16);
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
        this.playerSnake = new Snake(5, 15, 'right', '#00ff41');
        this.aiSnake = new AISnake(35, 15, 'left', '#ff4141', this.board);
        
        if (this.settings.difficulty) {
            this.aiSnake.setDifficulty(this.settings.difficulty);
        }
        
        this.food = new Food(this.board);
        this.spawnFood();
    }
    
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.gameSpeed) return;
        
        this.lastMoveTime = currentTime;
        
        this.playerSnake.update();
        this.aiSnake.update(this.playerSnake, this.food);
        
        this.checkFoodConsumption();
        this.checkCollisions();
        
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.playerSnake.score, this.aiSnake.score);
        }
        
        this.render();
    }
    
    checkFoodConsumption() {
        if (this.playerSnake.head.x === this.food.x && this.playerSnake.head.y === this.food.y) {
            this.playerSnake.grow();
            this.playerSnake.addScore(10);
            this.spawnFood();
        }
        
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
        
        if (head.x < 0 || head.x >= this.board.width || 
            head.y < 0 || head.y >= this.board.height) {
            return true;
        }
        
        for (let i = 1; i < snake.body.length; i++) {
            if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                return true;
            }
        }
        
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
        
        while (!validPosition) {
            x = Math.floor(Math.random() * this.board.width);
            y = Math.floor(Math.random() * this.board.height);
            
            validPosition = true;
            
            for (let segment of this.playerSnake.body) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
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
        
        switch (key) {
            case 'ArrowUp': this.playerSnake.setDirection('up'); break;
            case 'ArrowDown': this.playerSnake.setDirection('down'); break;
            case 'ArrowLeft': this.playerSnake.setDirection('left'); break;
            case 'ArrowRight': this.playerSnake.setDirection('right'); break;
        }
    }
}

// Game App class with Settings and High Scores
class GameApp {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = null;
        this.storageManager = new StorageManager();
        this.audioManager = new AudioManager();
        
        this.settings = this.storageManager.getSettings();
        this.applySettings();
        
        this.initializeUI();
        this.setupEventListeners();
        this.createSettingsOverlay();
        this.createHighScoresOverlay();
    }
    
    initializeUI() {
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.startBtn = document.getElementById('start-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.scoresBtn = document.getElementById('scores-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl = document.getElementById('ai-score');
        this.finalPlayerScoreEl = document.getElementById('final-player-score');
        this.finalAiScoreEl = document.getElementById('final-ai-score');
        this.winnerTextEl = document.getElementById('winner-text');
    }
    
    createSettingsOverlay() {
        const settingsOverlay = document.createElement('div');
        settingsOverlay.id = 'settings-overlay';
        settingsOverlay.className = 'overlay hidden';
        settingsOverlay.innerHTML = `
            <div class="menu">
                <h2>SETTINGS</h2>
                <div class="setting-item">
                    <label>Volume: <span id="volume-value">${Math.round(this.settings.volume * 100)}%</span></label>
                    <input type="range" id="volume-slider" min="0" max="100" value="${this.settings.volume * 100}">
                </div>
                <div class="setting-item">
                    <label>AI Difficulty:</label>
                    <select id="difficulty-select">
                        <option value="easy" ${this.settings.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="medium" ${this.settings.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hard" ${this.settings.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="sound-toggle" ${this.settings.soundEnabled ? 'checked' : ''}>
                        Sound Effects
                    </label>
                </div>
                <button id="settings-back-btn" class="menu-btn">BACK TO MENU</button>
            </div>
        `;
        document.body.appendChild(settingsOverlay);
        this.settingsOverlay = settingsOverlay;
    }
    
    createHighScoresOverlay() {
        const scoresOverlay = document.createElement('div');
        scoresOverlay.id = 'high-scores-overlay';
        scoresOverlay.className = 'overlay hidden';
        scoresOverlay.innerHTML = `
            <div class="menu">
                <h2>HIGH SCORES</h2>
                <div id="scores-list"></div>
                <button id="scores-back-btn" class="menu-btn">BACK TO MENU</button>
            </div>
        `;
        document.body.appendChild(scoresOverlay);
        this.highScoresOverlay = scoresOverlay;
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.scoresBtn.addEventListener('click', () => this.showHighScores());
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.menuBtn.addEventListener('click', () => this.showMainMenu());
        
        // Settings controls
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.settings.volume = e.target.value / 100;
            document.getElementById('volume-value').textContent = e.target.value + '%';
            this.audioManager.setVolume(this.settings.volume);
        });
        
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.settings.difficulty = e.target.value;
        });
        
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            this.audioManager.setSoundEnabled(this.settings.soundEnabled);
        });
        
        document.getElementById('settings-back-btn').addEventListener('click', () => {
            this.storageManager.saveSettings(this.settings);
            this.showMainMenu();
        });
        
        document.getElementById('scores-back-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.game && this.game.isRunning) {
                this.game.handleInput(e.key);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    applySettings() {
        this.audioManager.setVolume(this.settings.volume);
        this.audioManager.setSoundEnabled(this.settings.soundEnabled);
    }
    
    startGame() {
        this.hideAllOverlays();
        
        this.game = new Game(this.canvas, this.ctx, this.settings);
        this.game.onScoreUpdate = (playerScore, aiScore) => {
            this.updateScores(playerScore, aiScore);
        };
        this.game.onGameOver = (winner, playerScore, aiScore) => {
            this.showGameOver(winner, playerScore, aiScore);
        };
        
        this.game.start();
        if (this.settings.soundEnabled) {
            this.audioManager.playBackgroundMusic();
        }
    }
    
    updateScores(playerScore, aiScore) {
        this.playerScoreEl.textContent = playerScore;
        this.aiScoreEl.textContent = aiScore;
    }
    
    showGameOver(winner, playerScore, aiScore) {
        this.storageManager.saveHighScore(playerScore, aiScore, winner);
        
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
    
    showMainMenu() {
        this.hideAllOverlays();
        this.menuOverlay.classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
        this.updateScores(0, 0);
    }
    
    showSettings() {
        this.hideAllOverlays();
        this.settingsOverlay.classList.remove('hidden');
    }
    
    showHighScores() {
        this.hideAllOverlays();
        this.updateHighScoresList();
        this.highScoresOverlay.classList.remove('hidden');
    }
    
    updateHighScoresList() {
        const scores = this.storageManager.getHighScores();
        const scoresList = document.getElementById('scores-list');
        
        if (scores.length === 0) {
            scoresList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No high scores yet!</p>';
            return;
        }
        
        let html = '<div class="scores-table">';
        scores.forEach((score, index) => {
            const winnerIcon = score.winner === 'player' ? '👑' : score.winner === 'ai' ? '🤖' : '🤝';
            html += `
                <div class="score-row">
                    <span class="rank">#${index + 1}</span>
                    <span class="score">${score.playerScore}</span>
                    <span class="winner">${winnerIcon}</span>
                    <span class="date">${score.date}</span>
                </div>
            `;
        });
        html += '</div>';
        
        scoresList.innerHTML = html;
    }
    
    hideAllOverlays() {
        this.menuOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
        this.settingsOverlay.classList.add('hidden');
        this.highScoresOverlay.classList.add('hidden');
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});