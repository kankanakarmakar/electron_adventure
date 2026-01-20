@echo off
REM ============================================
REM Museum Circuit Display - Production Deployment
REM Windows Batch Script
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Museum Circuit Display - Production Deployment           ║
echo ║   Windows Server Setup                                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js installation
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found

REM Install dependencies
echo.
echo [2/5] Installing dependencies...
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)

REM Build production versions
echo.
echo [3/5] Building production versions...
call npm run build:all
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✓ Production builds complete

REM Verify builds
echo.
echo [4/5] Verifying build outputs...
if exist "dist" (
    echo ✓ dist/ folder exists
) else (
    echo ❌ dist/ folder not found
    pause
    exit /b 1
)
echo ✓ All builds verified

REM Create .env file if needed
echo.
echo [5/5] Configuring environment...
if not exist ".env" (
    (
        echo # Museum Circuit Display Configuration
        echo VITE_WS_HOST=localhost
        echo VITE_WS_PORT=8081
        echo VITE_APP_NAME=Museum Circuit Display
        echo NODE_ENV=production
    ) > .env
    echo ✓ Created .env configuration
) else (
    echo ✓ Configuration file exists
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              DEPLOYMENT COMPLETE ✅                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📁 Build Outputs:
echo    • dist/              - Production builds (all apps)
echo    • dist-display/      - Display screen app
echo    • dist-control/      - Control panel app
echo.
echo 🚀 To Start Production Deployment:
echo.
echo    Option 1: All-in-one (Single Machine)
echo    └─► npm run start:museum
echo.
echo    Option 2: Separate Processes
echo    └─► Terminal 1: npm run server
echo    └─► Terminal 2: npm run preview:display
echo    └─► Terminal 3: npm run preview:control
echo.
echo    Option 3: Three Different Machines
echo    └─► Server Machine:   npm run server
echo    └─► Display Machine:  npm run preview:display
echo    └─► Control Machine:  npm run preview:control
echo.
echo 🌐 Access URLs:
echo    Display Screen: http://localhost:3001
echo    Control Panel:  http://localhost:3002
echo    WebSocket:      ws://localhost:8081
echo.
echo 📖 Documentation:
echo    Read: QUICKSTART_2SCREEN.md for quick reference
echo    Read: MUSEUM_DISPLAY_SETUP.md for full details
echo.
pause
