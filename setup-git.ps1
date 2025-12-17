Write-Host "🐍 Setting up Git repository for Retro Revival Snake Game..." -ForegroundColor Green

# Set Git configuration
Write-Host "`nConfiguring Git..." -ForegroundColor Yellow
git config user.name "Abhijit"
git config user.email "child.abhijit@gmail.com"

# Check current status
Write-Host "`nCurrent Git status:" -ForegroundColor Yellow
git status --short

# Commit the project
Write-Host "`nCommitting project..." -ForegroundColor Yellow
git commit -m "Retro Revival Snake Game with BFS AI

Features:
- Classic Snake gameplay with smooth controls  
- Intelligent AI opponent using BFS pathfinding algorithm
- Competitive AI strategies: blocking, interception, survival mode
- Retro aesthetics with pixel-perfect graphics and CRT effects
- Chiptune audio with Web Audio API
- Settings system with volume control and difficulty selection
- High scores tracking with local storage
- Responsive design for desktop and mobile
- Complete technical documentation and specifications

Technical Implementation:
- BFS pathfinding guarantees shortest paths for AI
- Real-time obstacle avoidance and dynamic replanning
- Performance optimized for 60 FPS gameplay
- Modular architecture with clear separation of concerns
- Browser-compatible vanilla JavaScript (no build tools required)"

Write-Host "`n✅ Git setup complete! Repository is ready." -ForegroundColor Green

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to github.com and create a new repository named: retro-revival-snake-bfs-ai"
Write-Host "2. Copy this command and run it:"
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/retro-revival-snake-bfs-ai.git" -ForegroundColor White
Write-Host "3. Then run: git push -u origin main" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")