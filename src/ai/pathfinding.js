export class BFSPathfinder {
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
    
    // Find the longest safe path for survival mode
    findLongestSafePath(start, obstacles, maxDepth = 20) {
        const startTime = performance.now();
        const visited = new Set();
        const getKey = (node) => `${node.x},${node.y}`;
        
        let longestPath = [start];
        
        const dfs = (current, path, depth) => {
            if (performance.now() - startTime > this.maxCalculationTime || depth >= maxDepth) {
                return;
            }
            
            const currentKey = getKey(current);
            visited.add(currentKey);
            
            if (path.length > longestPath.length) {
                longestPath = [...path];
            }
            
            // Try all neighbors
            for (let neighbor of this.board.getNeighbors(current.x, current.y)) {
                const neighborKey = getKey(neighbor);
                
                if (!visited.has(neighborKey) && !obstacles.has(neighborKey)) {
                    path.push(neighbor);
                    dfs(neighbor, path, depth + 1);
                    path.pop();
                }
            }
            
            visited.delete(currentKey);
        };
        
        dfs(start, [start], 0);
        return longestPath;
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