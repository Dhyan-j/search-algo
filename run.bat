@echo off
setlocal
title SearchCraft - Graph Traversal & Search Algorithm Visualizer

echo =========================================================
echo    SearchCraft - Algorithm Learning & Visualizer
echo =========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please download and install Node.js (v18 or newer) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node -v
npm -v
echo.

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Check your internet connection.
        pause
        exit /b %errorlevel%
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: Start dev server
echo =========================================================
echo  Starting local development server...
echo  Open your browser at: http://localhost:3000
echo  Press Ctrl+C to stop the server anytime.
echo =========================================================
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Server stopped with code %errorlevel%.
    pause
)
