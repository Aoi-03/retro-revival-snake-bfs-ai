@echo off
echo Setting up Git repository for Retro Revival Snake Game...

REM Set Git configuration
git config user.name "Abhijit"
git config user.email "child.abhijit@gmail.com"

REM Check Git status
echo.
echo Current Git status:
git status --short

REM Commit the project
echo.
echo Committing project...
git commit -m "Retro Revival Snake Game with BFS AI - Complete implementation with pathfinding algorithm, competitive strategies, and retro aesthetics"

REM Show the result
echo.
echo Git setup complete! Repository is ready.
echo.
echo Next steps:
echo 1. Go to github.com and create a new repository named: retro-revival-snake-bfs-ai
echo 2. Copy this command and run it:
echo    git remote add origin https://github.com/YOUR_USERNAME/retro-revival-snake-bfs-ai.git
echo 3. Then run: git push -u origin main
echo.
pause