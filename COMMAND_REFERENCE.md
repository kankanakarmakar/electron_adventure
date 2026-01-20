# Museum Two-Screen System - Command Reference

## 🎯 System Overview

```
                 Your Museum Setup
                        
        Large TV Display          Control Panel
           (Port 3001)            (Port 3002)
              |                       |
              └───────┬───────────────┘
                      |
            WebSocket Server
              (Port 8081)
```

---

## ⚡ Quickest Start (All in One Command)

```bash
npm run start:museum
```

✅ Automatically starts:
- WebSocket Server (8081)
- Display Screen (3001)
- Control Screen (3002)

All three open in new windows automatically!

---

## 🚀 Individual Startup Commands

### Start WebSocket Server
```bash
npm run server
```
✅ Listens on http://localhost:8081

### Start Display Screen (Large TV)
```bash
npm run dev:display
```
✅ Opens http://localhost:3001
✅ Fullscreen-ready for TV/projector

### Start Control Screen (Small Panel)
```bash
npm run dev:control
```
✅ Opens http://localhost:3002
✅ Touch-friendly buttons

### Start All At Once (3 Terminals)
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev:display

# Terminal 3
npm run dev:control
```

---

## 🏗️ Production Build Commands

### Build Everything
```bash
npm run build:all
```
Creates:
- `dist-display/` → Large display (3001)
- `dist-control/` → Control panel (3002)

### Build Display Only
```bash
npm run build:display
```
Output: `dist-display/`

### Build Control Only
```bash
npm run build:control
```
Output: `dist-control/`

---

## 👁️ Preview/Test Production Builds

### Preview Display
```bash
npm run preview:display
```
Serves on http://localhost:3001

### Preview Control
```bash
npm run preview:control
```
Serves on http://localhost:3002

---

## 🌐 Network Deployment

### Tell Systems Where Server Is

**Edit `src/hooks/useWebSocketSync.ts`** on Display and Control machines:

Change this line:
```typescript
wsUrl = `ws://${window.location.hostname}:${process.env.REACT_APP_WS_PORT || 8081}`
```

To your server IP (example):
```typescript
wsUrl = `ws://192.168.1.100:8081`
```

Or use environment variable when running:
```bash
REACT_APP_WS_HOST=192.168.1.100 npm run dev:display
REACT_APP_WS_HOST=192.168.1.100 npm run dev:control
```

---

## 📋 Development Workflow

```bash
# Step 1: Install dependencies (one time)
npm install

# Step 2: Start WebSocket server
npm run server

# Step 3: In new terminal, start display
npm run dev:display
# → Browser opens: http://localhost:3001

# Step 4: In another terminal, start control
npm run dev:control
# → Browser opens: http://localhost:3002

# Now test:
# - Click buttons on Control (3002)
# - Watch Display (3001) update in real-time!
```

---

## 🎯 Museum Installation

### Phase 1: Development (Your Computer)
```bash
npm install
npm run start:museum
```

### Phase 2: Network Setup (Three Machines)

**Machine 1 - Server (Office/Closet)**
```bash
npm install
npm run server
```
Note the IP: e.g., `192.168.1.100`

**Machine 2 - Display (Large TV)**
```bash
npm install
# Edit src/hooks/useWebSocketSync.ts with server IP
npm run dev:display
# Press F11 for fullscreen
```

**Machine 3 - Control (Buttons)**
```bash
npm install
# Edit src/hooks/useWebSocketSync.ts with server IP
npm run dev:control
# Integrate GPIO buttons
```

---

## ✅ Verify Everything Works

### Check Server
```bash
curl http://localhost:8081/health
```
Should return JSON with client count

### Check Display
```bash
curl http://localhost:3001
```
Should return HTML

### Check Control
```bash
curl http://localhost:3002
```
Should return HTML

### Full Test
1. Open Display: http://localhost:3001
2. Open Control: http://localhost:3002
3. Both should show "Connected" (green)
4. Click button on Control
5. Display should update immediately

---

## 🔨 Build & Deploy Steps

### Build All Apps
```bash
npm run build:all
```

### For Display Machine
```bash
# Copy dist-display folder to display machine
scp -r dist-display user@192.168.1.20:/var/www/

# On display machine:
cd /var/www/dist-display
npx serve -l 3001

# Or with Python:
python3 -m http.server 3001
```

### For Control Machine
```bash
# Copy dist-control folder to control machine
scp -r dist-control user@192.168.1.30:/var/www/

# On control machine:
cd /var/www/dist-control
npx serve -l 3002

# Or with Python:
python3 -m http.server 3002
```

---

## 🔌 Hardware Button Integration

### Modify Control Screen for GPIO

Edit `src/screens/HardwareControlScreen.tsx`:

```typescript
import Gpio from 'onoff').Gpio;

// Map GPIO pins to buttons
const button = new Gpio(17, 'in', 'rising');
button.watch(() => {
  handleButtonPress(hardwareButtons[0]); // Voltage increment
});
```

### Test Hardware
```bash
# After wiring GPIO buttons:
# 1. Start control screen
npm run dev:control

# 2. Press physical buttons
# 3. Should see updates on display
```

---

## 📊 Environment Variables

```bash
# Set WebSocket host
REACT_APP_WS_HOST=192.168.1.100 npm run dev:display

# Set WebSocket port
REACT_APP_WS_PORT=9000 npm run dev:display

# Development mode
NODE_ENV=development npm run dev:display

# Production mode
NODE_ENV=production npm run build:display
```

---

## 🆘 Quick Troubleshooting Commands

```bash
# Check if server is running
curl http://localhost:8081/health

# Check if display is running
curl http://localhost:3001

# Check if control is running
curl http://localhost:3002

# Test network connectivity
ping 192.168.1.100  # Replace with your server IP

# Check which process is using port 8081
lsof -i :8081          # Mac/Linux
netstat -ano | findstr :8081  # Windows
```

---

## 📁 Key Files to Know

```
BITM/
├── ws-server.ts                    # WebSocket server
├── display.html                    # Display entry point
├── control.html                    # Control entry point
├── src/
│   ├── main-display.tsx           # Display app code
│   ├── main-control.tsx           # Control app code
│   ├── screens/
│   │   ├── DisplayScreen.tsx      # Large display component
│   │   └── HardwareControlScreen.tsx  # Control panel
│   └── hooks/
│       └── useWebSocketSync.ts    # Real-time sync
├── QUICKSTART_2SCREEN.md          # Quick reference (USE THIS!)
├── MUSEUM_DISPLAY_SETUP.md        # Detailed guide
└── package.json                   # All scripts here
```

---

## 🎯 Most Common Scenarios

### Scenario A: Development (Single Computer)
```bash
npm run start:museum
# Done! All three apps open automatically
```

### Scenario B: Museum (Three Machines)
```bash
# On Server Machine:
npm install && npm run server

# On Display Machine:
npm install
# Edit src/hooks/useWebSocketSync.ts
npm run dev:display

# On Control Machine:
npm install
# Edit src/hooks/useWebSocketSync.ts
npm run dev:control
```

### Scenario C: Production Deployment
```bash
# Build on one machine:
npm run build:all

# Deploy dist-display to display machine on port 3001
# Deploy dist-control to control machine on port 3002
# Run server on server machine on port 8081
```

---

## 🚀 One-Liners

```bash
# Start everything for development
npm run start:museum

# Build everything for production
npm run build:all

# Just start server
npm run server

# Just start display
npm run dev:display

# Just start control
npm run dev:control

# Quick health check
curl http://localhost:8081/health

# Full test setup (3 terminals)
npm run server & npm run dev:display & npm run dev:control
```

---

## 📱 Ports Quick Reference

| Port | What | Command |
|------|------|---------|
| 3001 | Display (Large TV) | `npm run dev:display` |
| 3002 | Control (Small Panel) | `npm run dev:control` |
| 8081 | WebSocket Server | `npm run server` |

---

## 🎓 Learning Path

1. **5 minutes**: Run `npm run start:museum` and see it work
2. **10 minutes**: Read QUICKSTART_2SCREEN.md
3. **15 minutes**: Read MUSEUM_DISPLAY_SETUP.md
4. **30 minutes**: Run TESTING_CHECKLIST.md
5. **Ready**: Deploy to your museum!

---

## ✨ Summary

```
npm run start:museum     ← Do this to test everything!
npm run server          ← Start server
npm run dev:display     ← Start large display (3001)
npm run dev:control     ← Start control panel (3002)
npm run build:all       ← Build for production
```

That's it! 🎉

---

*Last Updated: January 20, 2026*
