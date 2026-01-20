#!/bin/bash

# Museum Circuit Display System - Startup Script
# This script handles complete setup and startup for museum installation

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Museum Circuit Display System - Startup Assistant       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 16+ first."
        exit 1
    fi
    local node_version=$(node -v)
    print_success "Node.js found: $node_version"
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi
    print_success "npm found: $(npm -v)"
}

install_dependencies() {
    print_info "Installing dependencies..."
    npm install --silent
    print_success "Dependencies installed"
}

detect_setup() {
    echo ""
    echo "Detecting installation scenario..."
    echo ""
    echo "1) Single Machine (Dev/Demo)"
    echo "   - Everything on one computer"
    echo "   - Best for: Testing, small museums"
    echo ""
    echo "2) Multiple Machines (Production)"
    echo "   - Server + separate display/control screens"
    echo "   - Best for: Large museums, distributed setup"
    echo ""
    
    read -p "Enter choice (1 or 2): " setup_choice
    
    case $setup_choice in
        1)
            SETUP_TYPE="single"
            print_success "Single machine mode selected"
            ;;
        2)
            SETUP_TYPE="distributed"
            print_success "Distributed mode selected"
            
            echo ""
            read -p "Enter WebSocket Server IP/Hostname [localhost]: " ws_host
            WS_HOST="${ws_host:-localhost}"
            print_info "Server address: ws://$WS_HOST:8081"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

configure_environment() {
    print_info "Configuring environment..."
    
    if [ "$SETUP_TYPE" = "distributed" ] && [ ! -z "$WS_HOST" ] && [ "$WS_HOST" != "localhost" ]; then
        # Update configuration for distributed setup
        print_warning "Manual configuration required:"
        echo "  1. Edit src/hooks/useWebSocketSync.ts"
        echo "  2. Update wsUrl to: ws://$WS_HOST:8081"
        echo "  3. Or run with: REACT_APP_WS_HOST=$WS_HOST npm run dev:display"
    fi
    
    print_success "Environment configured"
}

select_startup_mode() {
    echo ""
    echo "Select startup mode:"
    echo ""
    echo "1) Server Only (distributed setup)"
    echo "2) Full Development (server + dev environment)"
    echo "3) Display Screen Only (connect to existing server)"
    echo "4) Control Screen Only (connect to existing server)"
    echo ""
    
    read -p "Enter choice (1-4): " startup_choice
}

start_server_only() {
    print_info "Starting WebSocket Server only..."
    echo ""
    npm run server
}

start_full_dev() {
    if ! command -v concurrently &> /dev/null; then
        print_warning "Installing concurrently for multi-process management..."
        npm install --save-dev concurrently
    fi
    
    print_info "Starting full development environment..."
    print_info "Server: ws://localhost:8081"
    print_info "Display: http://localhost:8080?mode=display"
    print_info "Control: http://localhost:8080?mode=control"
    echo ""
    
    npm run start:museum
}

start_display_screen() {
    if [ -z "$WS_HOST" ]; then
        read -p "Enter WebSocket Server address [localhost]: " ws_host
        WS_HOST="${ws_host:-localhost}"
    fi
    
    print_info "Starting Display Screen..."
    print_info "Connecting to: ws://$WS_HOST:8081"
    echo ""
    
    REACT_APP_WS_HOST=$WS_HOST npm run dev:display
}

start_control_screen() {
    if [ -z "$WS_HOST" ]; then
        read -p "Enter WebSocket Server address [localhost]: " ws_host
        WS_HOST="${ws_host:-localhost}"
    fi
    
    print_info "Starting Control Screen..."
    print_info "Connecting to: ws://$WS_HOST:8081"
    echo ""
    
    REACT_APP_WS_HOST=$WS_HOST npm run dev:control
}

# Main execution
echo ""

# Check prerequisites
print_info "Checking prerequisites..."
check_nodejs
check_npm

# Check if dependencies installed
if [ ! -d "node_modules" ]; then
    echo ""
    install_dependencies
fi

print_success "Prerequisites OK"

# Detect setup type
detect_setup

# Configure environment
configure_environment

# Select startup mode
select_startup_mode

case $startup_choice in
    1)
        start_server_only
        ;;
    2)
        start_full_dev
        ;;
    3)
        start_display_screen
        ;;
    4)
        start_control_screen
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac
