import { Snake } from '../game/Snake.js';
import { BFSPathfinder } from './pathfinding.js';

export class AISnake extends Snake {
    constructor(x, y, direction, color, board) {
        super(x, y, direction, color);
        this.board = board;
        this.pathfinder = new BFSPathfinder(board);
        this.difficulty = 'medium'; // easy, medium, hard
        this.lastPathUpdate = 0;
        this.pathUpdateInterval = 200; // ms
        this.currentPath = [];
        this.targetFood = null;
    }
    
    update(playerSnake, food) {
        // Analyze current game state
        const gameState = this.analyzeGameState(playerSnake, food);
        
        // Update AI decision making with strategy
        this.makeDecision(playerSnake, food);
        
        // Apply strategy-specific modifications
        const obstacles = this.createObstacleMap(playerSnake);
        this.applyStrategy(this.strategy, obstacles);
        
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
        
        // If no direct path to food, implement competitive strategy
        if (this.currentPath.length === 0) {
            this.implementCompetitiveStrategy(playerSnake, food, obstacles);
        } else {
            // Evaluate if we should compete for food or find alternative
            this.evaluateCompetitiveOpportunity(playerSnake, food, obstacles);
        }
    }
    
    createObstacleMap(playerSnake) {
        const obstacles = new Set();
        
        // Add player snake as obstacles (with prediction for moving obstacles)
        const playerPredicted = playerSnake.getPredictedPositions(2);
        for (let segment of playerPredicted) {
            obstacles.add(`${segment.x},${segment.y}`);
        }
        
        // Add own body as obstacles (except head)
        for (let i = 1; i < this.body.length; i++) {
            obstacles.add(`${this.body[i].x},${this.body[i].y}`);
        }
        
        return obstacles;
    }
    
    implementCompetitiveStrategy(playerSnake, food, obstacles) {
        // Strategy 1: Try to block player's path to food
        const playerToFood = this.pathfinder.findPath(
            { x: playerSnake.head.x, y: playerSnake.head.y },
            { x: food.x, y: food.y },
            obstacles
        );
        
        if (playerToFood.length > 2) {
            // Try to intercept player's path
            const interceptPoint = playerToFood[Math.floor(playerToFood.length / 2)];
            this.currentPath = this.pathfinder.findPath(
                { x: this.head.x, y: this.head.y },
                interceptPoint,
                obstacles
            );
        }
        
        // Strategy 2: If interception fails, find longest safe path (survival mode)
        if (this.currentPath.length === 0) {
            const safePath = this.pathfinder.findLongestSafePath(
                { x: this.head.x, y: this.head.y },
                obstacles
            );
            this.currentPath = safePath.slice(0, 5); // Take first 5 moves
        }
    }
    
    evaluateCompetitiveOpportunity(playerSnake, food, obstacles) {
        // Calculate distances to food
        const aiDistance = this.currentPath.length;
        const playerPath = this.pathfinder.findPath(
            { x: playerSnake.head.x, y: playerSnake.head.y },
            { x: food.x, y: food.y },
            obstacles
        );
        const playerDistance = playerPath.length;
        
        // If player is much closer, consider alternative strategies
        if (playerDistance > 0 && aiDistance > playerDistance + 3) {
            // Look for strategic positioning instead of direct food pursuit
            this.findStrategicPosition(playerSnake, food, obstacles);
        }
    }
    
    findStrategicPosition(playerSnake, food, obstacles) {
        // Find positions that could block future player movements
        const strategicTargets = [];
        const foodNeighbors = this.board.getNeighbors(food.x, food.y);
        
        for (let neighbor of foodNeighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!obstacles.has(neighborKey)) {
                strategicTargets.push(neighbor);
            }
        }
        
        // Use BFS to find best strategic position
        if (strategicTargets.length > 0) {
            const bestPath = this.pathfinder.findBestPath(
                { x: this.head.x, y: this.head.y },
                strategicTargets,
                obstacles
            );
            
            if (bestPath.length > 0) {
                this.currentPath = bestPath;
            }
        }
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
                
                // Use BFS-based safety evaluation
                const safetyScore = this.pathfinder.evaluatePositionSafety(
                    { x: newX, y: newY }, 
                    obstacles
                );
                safeDirections.push({ direction: dir, safety: safetyScore });
            }
        }
        
        if (safeDirections.length > 0) {
            // Choose the safest direction using BFS evaluation
            safeDirections.sort((a, b) => b.safety - a.safety);
            this.setDirection(safeDirections[0].direction);
        } else {
            // Emergency: try any valid direction to avoid immediate collision
            for (let dir of directions) {
                if (this.isValidDirectionChange(dir)) {
                    this.setDirection(dir);
                    break;
                }
            }
        }
    }
    
    // Enhanced difficulty system specifically for BFS behavior
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        switch (difficulty) {
            case 'easy':
                this.pathUpdateInterval = 500; // Slower updates
                this.competitiveMode = false;
                break;
            case 'medium':
                this.pathUpdateInterval = 200; // Standard updates
                this.competitiveMode = true;
                break;
            case 'hard':
                this.pathUpdateInterval = 100; // Fast updates
                this.competitiveMode = true;
                this.aggressiveBlocking = true;
                break;
        }
    }
    
    // Analyze game state to make strategic decisions
    analyzeGameState(playerSnake, food) {
        const analysis = {
            playerScore: playerSnake.score,
            aiScore: this.score,
            scoreDifference: this.score - playerSnake.score,
            playerLength: playerSnake.getLength(),
            aiLength: this.getLength(),
            distanceToFood: this.board.getDistance(this.head.x, this.head.y, food.x, food.y),
            playerDistanceToFood: this.board.getDistance(playerSnake.head.x, playerSnake.head.y, food.x, food.y)
        };
        
        // Determine strategy based on analysis
        if (analysis.scoreDifference < -20) {
            this.strategy = 'aggressive'; // Behind in score, be more aggressive
        } else if (analysis.scoreDifference > 20) {
            this.strategy = 'defensive'; // Ahead in score, play it safe
        } else {
            this.strategy = 'balanced'; // Close game, balanced approach
        }
        
        return analysis;
    }
    
    // Implement strategy-specific behavior modifications
    applyStrategy(strategy, obstacles) {
        switch (strategy) {
            case 'aggressive':
                // More willing to take risks for food
                this.pathUpdateInterval = Math.max(50, this.pathUpdateInterval - 50);
                break;
            case 'defensive':
                // Prioritize safety over food acquisition
                this.pathUpdateInterval = Math.min(300, this.pathUpdateInterval + 100);
                // Look for longer safe paths
                if (this.currentPath.length < 3) {
                    const safePath = this.pathfinder.findLongestSafePath(
                        { x: this.head.x, y: this.head.y },
                        obstacles,
                        10
                    );
                    if (safePath.length > this.currentPath.length) {
                        this.currentPath = safePath.slice(0, 8);
                    }
                }
                break;
            case 'balanced':
                // Standard behavior - no modifications needed
                break;
        }
    }
}
}