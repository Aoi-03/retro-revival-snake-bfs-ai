import { Snake } from './Snake.js';
import { AISnake } from '../ai/AISnake.js';
import { Food } from './Food.js';
import { Board } from './Board.js';
import { Renderer } from '../graphics/Renderer.js';

export class Game {
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