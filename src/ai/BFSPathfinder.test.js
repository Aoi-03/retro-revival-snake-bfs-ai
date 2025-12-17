// Simple test suite for BFS Pathfinder
// Run with: node BFSPathfinder.test.js

import { BFSPathfinder } from './pathfinding.js';

class MockBoard {
    constructor(width = 10, height = 10) {
        this.width = width;
        this.height = height;
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
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

function runTests() {
    console.log('🧪 Running BFS Pathfinder Tests...\n');
    
    const board = new MockBoard(10, 10);
    const pathfinder = new BFSPathfinder(board);
    
    // Test 1: Basic pathfinding
    console.log('Test 1: Basic pathfinding');
    const start1 = { x: 0, y: 0 };
    const goal1 = { x: 3, y: 3 };
    const obstacles1 = new Set();
    const path1 = pathfinder.findPath(start1, goal1, obstacles1);
    
    console.log(`Path from (0,0) to (3,3): ${path1.length} steps`);
    console.log(`Expected: 7 steps (Manhattan distance + 1)`);
    console.log(`✅ Test 1: ${path1.length === 7 ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Pathfinding with obstacles
    console.log('Test 2: Pathfinding with obstacles');
    const start2 = { x: 0, y: 0 };
    const goal2 = { x: 2, y: 0 };
    const obstacles2 = new Set(['1,0']); // Block direct path
    const path2 = pathfinder.findPath(start2, goal2, obstacles2);
    
    console.log(`Path from (0,0) to (2,0) with obstacle at (1,0): ${path2.length} steps`);
    console.log(`Expected: > 3 steps (must go around obstacle)`);
    console.log(`✅ Test 2: ${path2.length > 3 ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: No path available
    console.log('Test 3: No path available');
    const start3 = { x: 0, y: 0 };
    const goal3 = { x: 2, y: 0 };
    const obstacles3 = new Set(['1,0', '0,1', '1,1']); // Surround start
    const path3 = pathfinder.findPath(start3, goal3, obstacles3);
    
    console.log(`Path when surrounded: ${path3.length} steps`);
    console.log(`Expected: 0 steps (no path possible)`);
    console.log(`✅ Test 3: ${path3.length === 0 ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Multiple targets
    console.log('Test 4: Multiple targets');
    const start4 = { x: 5, y: 5 };
    const targets4 = [
        { x: 7, y: 5 }, // 2 steps away
        { x: 5, y: 8 }, // 3 steps away
        { x: 2, y: 5 }  // 3 steps away
    ];
    const obstacles4 = new Set();
    const path4 = pathfinder.findBestPath(start4, targets4, obstacles4);
    
    console.log(`Best path to multiple targets: ${path4.length} steps`);
    console.log(`Expected: 3 steps (shortest path)`);
    console.log(`✅ Test 4: ${path4.length === 3 ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Safety evaluation
    console.log('Test 5: Safety evaluation');
    const pos5 = { x: 5, y: 5 }; // Center position
    const obstacles5 = new Set();
    const safety5 = pathfinder.evaluatePositionSafety(pos5, obstacles5);
    
    console.log(`Safety score for center position: ${safety5}`);
    console.log(`Expected: High safety score (> 20)`);
    console.log(`✅ Test 5: ${safety5 > 20 ? 'PASSED' : 'FAILED'}\n`);
    
    // Performance test
    console.log('Performance Test: Large grid pathfinding');
    const bigBoard = new MockBoard(40, 30);
    const bigPathfinder = new BFSPathfinder(bigBoard);
    const startTime = performance.now();
    
    const bigPath = bigPathfinder.findPath(
        { x: 0, y: 0 },
        { x: 39, y: 29 },
        new Set()
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Large grid pathfinding: ${duration.toFixed(2)}ms`);
    console.log(`Expected: < 16ms for 60 FPS`);
    console.log(`✅ Performance: ${duration < 16 ? 'PASSED' : 'FAILED'}\n`);
    
    console.log('🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    runTests();
}