@echo off
title Electronics Lab Setup
echo ============================================
echo   ELECTRONICS LAB - ONE-CLICK START
echo ============================================
echo.
echo Starting everything... 
echo.

:: Start the sync server in a hidden-ish or minimized way if possible, or just regular start
start "Sync Server" /min cmd /c "npm run server"

:: Give the server a second to start
timeout /t 2 /nobreak >nul

:: Start the Vite Display app without opening its own browser right away
start "Display Screens" /min cmd /c "npx cross-env APP=display vite --port 3001"

:: Start the Vite Control app
start "Control Screens" /min cmd /c "npx cross-env APP=control vite --port 3003"

:: Give Vite servers time to bind ports
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

:: Open the browser tabs
echo Opening Control Panel and Circuit View in browser...
start http://localhost:3003/control.html
start http://localhost:3001/display.html

echo.
echo ============================================
echo   LAB IS READY!
echo ============================================
echo.
echo Close this window at any time. The servers run in background windows.
pause
