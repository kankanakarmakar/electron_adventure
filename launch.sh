#!/bin/bash
# Museum Circuit Display - Quick Launch Script
# Linux/macOS version

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Museum Circuit Display - Production Launcher             ║"
echo "║   Version 2.1 - Ready for Deployment                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Install from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js $NODE_VERSION found"
echo ""

# Ask deployment method
echo "Select deployment method:"
echo ""
echo "  1) All-in-One (Single machine, all services)"
echo "  2) Server Only (WebSocket on port 8081)"
echo "  3) Display Only (Large screen on port 3001)"
echo "  4) Control Only (Control panel on port 3002)"
echo "  5) Display + Control (Both screens, connect to server)"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting ALL-IN-ONE deployment..."
        echo "   • WebSocket Server: port 8081"
        echo "   • Display Screen:   port 3001"
        echo "   • Control Panel:    port 3002"
        echo ""
        npm run start:museum
        ;;
    2)
        echo ""
        echo "🚀 Starting WebSocket SERVER only..."
        echo "   • Server on port 8081"
        echo "   • Run display and control on separate machines"
        echo ""
        npm run server
        ;;
    3)
        echo ""
        echo "🚀 Starting DISPLAY SCREEN only..."
        echo "   • Display on port 3001"
        echo "   • Connect to server on: localhost:8081"
        echo ""
        npm run dev:display
        ;;
    4)
        echo ""
        echo "🚀 Starting CONTROL PANEL only..."
        echo "   • Control on port 3002"
        echo "   • Connect to server on: localhost:8081"
        echo ""
        npm run dev:control
        ;;
    5)
        echo ""
        echo "🚀 Starting DISPLAY + CONTROL..."
        echo "   • Display Screen: port 3001"
        echo "   • Control Panel:  port 3002"
        echo "   • Connect to server on: localhost:8081"
        echo ""
        npm run dev:all
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  System Shutting Down                      ║"
echo "║              Press Ctrl+C to stop anytime                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
