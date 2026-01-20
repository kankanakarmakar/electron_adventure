param(
    [string]$Mode = "interactive",
    [string]$ServerHost = "localhost",
    [int]$ServerPort = 8081
)

# Museum Circuit Display System - Windows Startup Script

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Museum Circuit Display - Two Screen System (Windows)    ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║   Display Screen (Port 3001) → Large TV/Projector        ║" -ForegroundColor Cyan
Write-Host "║   Control Screen (Port 3002) → Hardware Control Panel    ║" -ForegroundColor Cyan
Write-Host "║   WebSocket Server (Port 8081) → Real-time Sync          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

function Write-Info {
    Write-Host "ℹ $args" -ForegroundColor Blue
}

function Write-Success {
    Write-Host "✓ $args" -ForegroundColor Green
}

function Write-Warning {
    Write-Host "⚠ $args" -ForegroundColor Yellow
}

function Write-Error {
    Write-Host "✗ $args" -ForegroundColor Red
}

function Check-NodeJS {
    Write-Info "Checking Node.js..."
    
    try {
        $version = node --version
        Write-Success "Node.js found: $version"
        return $true
    } catch {
        Write-Error "Node.js not found. Please install Node.js 16+ first."
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
        return $false
    }
}

function Check-NPM {
    Write-Info "Checking npm..."
    
    try {
        $version = npm --version
        Write-Success "npm found: $version"
        return $true
    } catch {
        Write-Error "npm not found."
        return $false
    }
}

function Install-Dependencies {
    Write-Info "Installing dependencies..."
    npm install | Out-Null
    Write-Success "Dependencies installed"
}

function Detect-SetupType {
    Write-Host ""
    Write-Host "Installation Scenarios:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) Single Machine (Dev/Demo)"
    Write-Host "   - Everything on one computer"
    Write-Host "   - Best for: Testing, small museums"
    Write-Host ""
    Write-Host "2) Multiple Machines (Production)"
    Write-Host "   - Server + separate display/control screens"
    Write-Host "   - Best for: Large museums, distributed setup"
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1 or 2)"
    
    switch ($choice) {
        "1" {
            Write-Success "Single machine mode selected"
            return "single"
        }
        "2" {
            Write-Success "Distributed mode selected"
            $hostInput = Read-Host "Enter WebSocket Server IP/Hostname [localhost]"
            if ([string]::IsNullOrWhiteSpace($hostInput)) {
                $ServerHost = "localhost"
            } else {
                $ServerHost = $hostInput
            }
            Write-Info "Server address: ws://$($ServerHost):8081"
            return "distributed"
        }
        default {
            Write-Error "Invalid choice"
            exit 1
        }
    }
}

function Select-StartupMode {
    Write-Host ""
    Write-Host "Startup Modes:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) Server Only (for network deployment)"
    Write-Host "   Runs WebSocket server on port 8081"
    Write-Host ""
    Write-Host "2) All-In-One (single computer)"
    Write-Host "   Server + Display (3001) + Control (3002)"
    Write-Host ""
    Write-Host "3) Display Screen Only (port 3001)"
    Write-Host "   Large TV/Projector display only"
    Write-Host ""
    Write-Host "4) Control Screen Only (port 3002)"
    Write-Host "   Hardware buttons/control panel only"
    Write-Host ""
    Write-Host "5) Start All in New Windows"
    Write-Host "   Server + Display + Control (recommended)"
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-5)"
    return $choice
}

function Start-ServerOnly {
    Write-Info "Starting WebSocket Server..."
    Write-Info "Listening on: ws://localhost:$($ServerPort)"
    Write-Host ""
    
    npm run server
}

function Start-FullDev {
    Write-Info "Starting Full Development Environment..."
    Write-Info "Server: ws://localhost:$($ServerPort)"
    Write-Info "Display: http://localhost:8080?mode=display"
    Write-Info "Control: http://localhost:8080?mode=control"
    Write-Host ""
    
    if (-not (Get-Command concurrently -ErrorAction SilentlyContinue)) {
        Write-Warning "Installing concurrently..."
        npm install --save-dev concurrently | Out-Null
    }
    
    npm run start:museum
}

function Start-DisplayScreen {
    Write-Info "Starting Display Screen..."
    Write-Info "Connecting to: ws://$($ServerHost):$($ServerPort)"
    Write-Host ""
    
    $env:REACT_APP_WS_HOST = $ServerHost
    npm run dev:display
}

function Start-ControlScreen {
    Write-Info "Starting Control Screen..."
    Write-Info "Connecting to: ws://$($ServerHost):$($ServerPort)"
    Write-Host ""
    
    $env:REACT_APP_WS_HOST = $ServerHost
    npm run dev:control
}

function Start-AllInWindows {
    Write-Info "Starting all services in separate windows..."
    
    # Start server
    Write-Info "Starting WebSocket Server (new window)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run server"
    Start-Sleep -Seconds 2
    
    # Start dev environment
    Write-Info "Starting Vite dev server (new window)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Start-Sleep -Seconds 3
    
    # Open screens in browser
    Write-Info "Opening screens in default browser..."
    $env:REACT_APP_WS_HOST = $ServerHost
    
    Start-Process "http://localhost:8080?mode=display"
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:8080?mode=control"
    
    Write-Success "All services started in separate windows"
    Write-Host ""
    Write-Host "Windows started:" -ForegroundColor Cyan
    Write-Host "- Server Console (WebSocket)"
    Write-Host "- Vite Dev Server Console"
    Write-Host "- Display Screen (Browser)"
    Write-Host "- Control Screen (Browser)"
    Write-Host ""
    Write-Host "Keep all windows open for continuous operation" -ForegroundColor Yellow
    
    Read-Host "Press Enter to exit this window"
}

# Main execution
try {
    # Check prerequisites
    Write-Info "Checking prerequisites..."
    
    if (-not (Check-NodeJS)) { exit 1 }
    if (-not (Check-NPM)) { exit 1 }
    
    # Check if dependencies installed
    if (-not (Test-Path "node_modules")) {
        Write-Host ""
        Install-Dependencies
    }
    
    Write-Success "Prerequisites OK"
    
    # Detect setup type
    $setupType = Detect-SetupType
    
    # Configure environment
    Write-Info "Configuring environment..."
    if ($setupType -eq "distributed" -and $ServerHost -ne "localhost") {
        Write-Warning "Manual configuration may be needed:"
        Write-Host "  - Edit src/hooks/useWebSocketSync.ts" -ForegroundColor Yellow
        Write-Host "  - Update wsUrl to: ws://$($ServerHost):$($ServerPort)" -ForegroundColor Yellow
    }
    Write-Success "Environment configured"
    
    # Interactive or automated mode
    if ($Mode -eq "interactive") {
        $startupChoice = Select-StartupMode
    } else {
        $startupChoice = $Mode
    }
    
    # Execute based on selection
    switch ($startupChoice) {
        "1" {
            Start-ServerOnly
        }
        "2" {
            Start-FullDev
        }
        "3" {
            Start-DisplayScreen
        }
        "4" {
            Start-ControlScreen
        }
        "5" {
            Start-AllInWindows
        }
        default {
            Write-Error "Invalid choice"
            exit 1
        }
    }
    
} catch {
    Write-Error "An error occurred: $_"
    Read-Host "Press Enter to exit"
    exit 1
}
