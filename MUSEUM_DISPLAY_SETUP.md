# Two-Screen Museum Display Setup

## 🎯 Architecture

Your museum installation has **two completely independent applications**:

```
                    WebSocket Server (Port 8081)
                            |
                    (Central Message Hub)
                            |
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼──────┐        ┌──────▼──────┐
        │ LARGE TV/    │        │   SMALL     │
        │ PROJECTOR    │        │  CONTROL    │
        │ DISPLAY      │◄──────►│   PANEL     │
        │              │        │             │
        │ Port: 3001   │        │ Port: 3002  │
        │ Full screen  │        │ Buttons +   │
        │ Circuits +   │        │ Controls    │
        │ Landing page │        │             │
        └──────────────┘        └─────────────┘
```

---

## 🚀 Development Setup

### Start WebSocket Server (Terminal 1)
```bash
npm run server
```
✅ Server runs on http://localhost:8081

### Start Display Screen (Terminal 2)
```bash
npm run dev:display
```
✅ Opens http://localhost:3001 (large TV display)

### Start Control Screen (Terminal 3)
```bash
npm run dev:control
```
✅ Opens http://localhost:3002 (small control panel)

### Or Start Both Together
```bash
npm run start:museum
```
✅ Starts server + both screens automatically

---

## 📁 File Structure

```
BITM/
├── ws-server.ts              # WebSocket server
├── index.html                # Main app (optional)
├── display.html              # Display screen entry point (NEW)
├── control.html              # Control screen entry point (NEW)
│
└── src/
    ├── main.tsx              # Main app entry
    ├── main-display.tsx      # Display app entry (NEW)
    ├── main-control.tsx      # Control app entry (NEW)
    ├── screens/
    │   ├── DisplayScreen.tsx   # Large TV display component
    │   └── HardwareControlScreen.tsx  # Control panel component
    └── [other files...]
```

---

## 💻 Deployment Scenarios

### Scenario 1: Single Computer (Development)

**Machine**: Your development computer

```
Terminal 1: npm run server
Terminal 2: npm run dev:display     → 3001
Terminal 3: npm run dev:control     → 3002
```

View both on same computer:
- Display: http://localhost:3001 (fullscreen on main monitor)
- Control: http://localhost:3002 (on secondary monitor or window)

---

### Scenario 2: Museum Installation (Two Machines)

**Setup**:
- **Machine 1 (Server + Control)**
  - WebSocket Server on port 8081
  - Control Screen on port 3002

- **Machine 2 (Display)**
  - Connected to large TV/Projector
  - Displays circuit visualization on port 3001

#### On Server/Control Machine:
```bash
# Terminal 1: Start WebSocket Server
npm run server

# Terminal 2: Start Control Screen
APP=control npm run dev
# or
npm run dev:control
```

#### On Display Machine:
```bash
# Edit src/hooks/useWebSocketSync.ts
# Change: ws://localhost:8081 → ws://SERVER_IP:8081

# Then start display
APP=display npm run dev
# or
npm run dev:display
```

Update the WebSocket URL in `src/hooks/useWebSocketSync.ts`:
```typescript
// Current (for localhost):
wsUrl = `ws://${window.location.hostname}:${process.env.REACT_APP_WS_PORT || 8081}`

// For network deployment, change to:
wsUrl = `ws://192.168.1.100:8081` // Your server IP
```

---

### Scenario 3: Three Machines (Professional Setup)

**Machine 1 (Server Room)**
- WebSocket Server only (no UI)
- Runs: `npm run server`

**Machine 2 (Gallery - Large Display)**
- Connected to 55"+ TV/Projector
- Fullscreen circuit display
- Runs: `npm run dev:display`

**Machine 3 (Control Room)**
- Control panel with hardware buttons
- Runs: `npm run dev:control`

All three machines on same museum network (192.168.1.0/24)

---

## 🏗️ Building for Production

### Build All Applications
```bash
npm run build:all
```

Creates three separate builds:
- `dist/` - Main app (if needed)
- `dist-display/` - Display screen (serve on port 3001)
- `dist-control/` - Control screen (serve on port 3002)

### Build Only Display
```bash
npm run build:display
# Output: dist-display/
```

### Build Only Control
```bash
npm run build:control
# Output: dist-control/
```

---

## 🚀 Production Deployment

### Display Screen (Large TV)

**Step 1: Build**
```bash
npm run build:display
```

**Step 2: Copy to Display Machine**
```bash
# Copy dist-display folder to display machine
scp -r dist-display user@display-machine:/var/www/
```

**Step 3: Serve on Port 3001**
```bash
npx serve dist-display -l 3001
```

**Step 4: Configure Browser**
- Open http://localhost:3001 or http://0.0.0.0:3001
- Make fullscreen (F11)
- Edit WebSocket URL if server on different machine

---

### Control Screen (Hardware Panel)

**Step 1: Build**
```bash
npm run build:control
```

**Step 2: Copy to Control Machine**
```bash
scp -r dist-control user@control-machine:/var/www/
```

**Step 3: Serve on Port 3002**
```bash
npx serve dist-control -l 3002
```

**Step 4: Configure Browser**
- Open http://localhost:3002
- Integrate with hardware GPIO buttons
- Configure WebSocket URL for server machine

---

## 🔌 Hardware Button Integration

The control screen is ready for hardware button integration.

### Example: Raspberry Pi GPIO

```typescript
// In src/screens/HardwareControlScreen.tsx
import Gpio from 'onoff').Gpio;

// Map GPIO pins to buttons
const buttons = {
  voltage_inc: new Gpio(17, 'in', 'rising'),    // GPIO 17
  voltage_dec: new Gpio(27, 'in', 'rising'),    // GPIO 27
  freq_inc: new Gpio(22, 'in', 'rising'),       // GPIO 22
  freq_dec: new Gpio(23, 'in', 'rising'),       // GPIO 23
  resistor: new Gpio(24, 'in', 'rising'),       // GPIO 24
  capacitor: new Gpio(25, 'in', 'rising'),      // GPIO 25
  inductor: new Gpio(5, 'in', 'rising'),        // GPIO 5
  diode: new Gpio(6, 'in', 'rising'),           // GPIO 6
  reset: new Gpio(12, 'in', 'rising'),          // GPIO 12
};

// Wire button presses
buttons.voltage_inc.watch(() => {
  handleButtonPress(hardwareButtons.find(b => b.id === 'voltage-inc'));
});

// ... repeat for other buttons
```

### Physical Button Setup

Create a custom PCB or use a breadboard with:
- 9x Pushbuttons (momentary switches)
- 9x Pull-up resistors (10kΩ)
- Wiring to Raspberry Pi GPIO pins

---

## 📊 Port Configuration

| Application | Port | Machine | Purpose |
|------------|------|---------|---------|
| WebSocket Server | 8081 | Server | Central hub for all communication |
| Display Screen | 3001 | Display | Large TV/Projector display |
| Control Screen | 3002 | Control | Hardware buttons panel |

### Firewall Rules

**Allow these ports** on museum network:
```bash
# Linux (UFW)
sudo ufw allow 8081/tcp   # WebSocket
sudo ufw allow 3001/tcp   # Display
sudo ufw allow 3002/tcp   # Control
```

---

## 🔄 Real-Time Communication

### Flow
1. User presses button on Control Screen (port 3002)
2. Button press sent via WebSocket to Server (port 8081)
3. Server routes message to Display Screen (port 3001)
4. Display updates immediately
5. Display broadcasts updated state back to Control
6. Control shows updated values

**Total Latency**: ~200ms (acceptable for museum display)

---

## 🧪 Testing Setup

### Verify Servers Running

**Check WebSocket Server:**
```bash
curl http://localhost:8081/health
# Response: {"status":"ok","clients":2,...}
```

**Check Display Screen:**
```bash
curl http://localhost:3001
# Response: HTML of display app
```

**Check Control Screen:**
```bash
curl http://localhost:3002
# Response: HTML of control app
```

### Test Sync

1. Open Display (http://localhost:3001)
2. Open Control (http://localhost:3002)
3. Click button on Control
4. Verify Display updates
5. Check both show "Connected" status

---

## ⚡ Quick Commands Reference

```bash
# Development (Start All)
npm run start:museum

# Development (Individual)
npm run server              # Terminal 1: Server
npm run dev:display         # Terminal 2: Display (port 3001)
npm run dev:control         # Terminal 3: Control (port 3002)

# Production Build
npm run build:all           # Build all 3 apps
npm run build:display       # Build display only
npm run build:control       # Build control only

# Production Preview
npm run preview:display     # Serve display on 3001
npm run preview:control     # Serve control on 3002
```

---

## 🎯 Recommended Museum Setup

**For best results in museum:**

1. **Large Display Machine**
   - Connected to 55"+ TV/Projector
   - Runs: `npm run dev:display`
   - Fullscreen mode (F11)
   - Point to WebSocket server IP

2. **Control Panel Machine**
   - Smaller monitor or tablet
   - Runs: `npm run dev:control`
   - Integrated hardware buttons
   - Point to WebSocket server IP

3. **Server Machine** (Optional)
   - Separate control computer or raspberry pi
   - Runs: `npm run server`
   - Centralized management

**All three connected via museum network (WiFi or Ethernet)**

---

## 🔐 Network Security

### For Public Museum Installation

1. **Firewall Rules**
   - Allow port 8081 only from museum network
   - Block external internet access if possible
   - Document network topology

2. **Monitor Access**
   ```bash
   # Check connected clients
   curl http://SERVER_IP:8081/health
   ```

3. **Optional: Add Authentication**
   - See DEPLOYMENT.md for details
   - Implement token-based access if needed

---

## 📱 Customization

### Change Ports

Edit `vite.config.ts`:
```typescript
if (isDisplay) {
  serverConfig.port = 5001;  // Change from 3001
} else if (isControl) {
  serverConfig.port = 5002;  // Change from 3002
}
```

### Change WebSocket Server Address

Edit `src/hooks/useWebSocketSync.ts`:
```typescript
wsUrl = `ws://your-server-ip:8081`
```

### Customize Display Layout

Edit `src/screens/DisplayScreen.tsx` to modify:
- Status bar styling
- Circuit display size
- Animation speed
- Color scheme

### Customize Control Buttons

Edit `src/screens/HardwareControlScreen.tsx` to:
- Add more buttons
- Change button layout
- Adjust button sizes
- Modify button colors

---

## 🆘 Troubleshooting

### Display and Control Don't Connect

**Check:**
1. Server running: `npm run server`
2. Port 8081 not blocked by firewall
3. WebSocket URL matches server IP
4. Browser console shows connection logs (F12)

### Buttons Don't Update Display

**Check:**
1. Both screens show "Connected" status
2. Check server logs for message routing
3. Verify message types in browser console
4. Try refreshing browser page

### Slow Updates

**Solutions:**
1. Check network latency: `ping SERVER_IP`
2. Reduce other network traffic
3. Use wired Ethernet instead of WiFi
4. Check CPU usage on server machine

---

## 📚 Related Documentation

- **QUICKSTART.md** - Fast setup (5 min)
- **MUSEUM_SETUP.md** - Complete reference (30 min)
- **DEPLOYMENT.md** - Advanced deployment (20 min)
- **TESTING_CHECKLIST.md** - Verification tests (30 min)

---

## 🎉 You're Ready!

Your museum is now ready for:
- ✅ Large TV circuit display
- ✅ Separate hardware control panel
- ✅ Real-time synchronization
- ✅ Educational engagement
- ✅ Professional presentation

**Next Step**: Run `npm run start:museum` to see it all working!

---

*Last Updated: January 20, 2026*
