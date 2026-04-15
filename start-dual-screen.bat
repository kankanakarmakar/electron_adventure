@echo off
title Electron Adventures - Dual Screen Launcher
echo ============================================
echo   ELECTRON ADVENTURES - DUAL SCREEN MODE
echo ============================================
echo.
echo Starting Sync Server on port 3002...
echo Starting Display Screen on port 3001...
echo Starting Control Panel on port 3003...
echo.

:: Start Socket.IO server in background
start "Sync Server (Port 3002)" cmd /k "cd /d "%~dp0" && node server.js"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Start Display Screen (circuits) on port 3001
start "Display Screen (Port 3001)" cmd /k "cd /d "%~dp0" && set APP=display && npx vite --port 3001"

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start Control Panel on port 3003
start "Control Panel (Port 3003)" cmd /k "cd /d "%~dp0" && set APP=control && npx vite --port 3003"

:: Wait for servers to start
timeout /t 6 /nobreak >nul

:: Open browsers
echo.
echo Opening browsers...
start http://localhost:3001/display.html
start http://localhost:3003/control.html

echo.
echo ============================================
echo   ALL SYSTEMS STARTED!
echo ============================================
echo.
echo   Display Screen: http://localhost:3001/display.html
echo   Control Panel:  http://localhost:3003/control.html
echo   Sync Server:    http://localhost:3002
echo.
echo   HOW IT WORKS:
echo   - Click components in Control Panel
echo   - Display Screen shows the circuit
echo   - Controls sync in real-time!
echo.
echo   Press any key to exit this window...
echo   (The servers will keep running in their own windows)
echo ============================================
pause >nul
