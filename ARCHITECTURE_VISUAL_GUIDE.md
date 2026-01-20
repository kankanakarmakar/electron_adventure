# Two-Screen Museum System - Visual Architecture Guide

## 🎯 Your Complete Museum Setup

### Display & Control Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR MUSEUM                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐        ┌────────────────────┐ │
│  │                          │        │                    │ │
│  │   LARGE TV/PROJECTOR     │        │  CONTROL PANEL     │ │
│  │   (Gallery Display)      │        │  (Operator Area)   │ │
│  │                          │        │                    │ │
│  │  Shows:                  │        │  Shows:            │ │
│  │  - Circuit animations    │        │  - Buttons         │ │
│  │  - Voltage/Current       │        │  - Live values     │ │
│  │  - Frequency            │        │  - Status          │ │
│  │  - Electron flow        │        │                    │ │
│  │                          │        │  Hardware:         │ │
│  │  Port: 3001             │        │  - GPIO buttons    │ │
│  │  (Full screen)          │        │  - LEDs            │ │
│  │  Fullscreen on display  │        │  - Switches        │ │
│  │                          │        │                    │ │
│  │                          │        │  Port: 3002        │ │
│  │                          │        │                    │ │
│  └──────────────────────────┘        └────────────────────┘ │
│                                                               │
│         Both connected via Museum Network to:               │
│                                                               │
│           ┌──────────────────────────────┐                  │
│           │  WebSocket Server (8081)     │                  │
│           │                              │                  │
│           │  - Real-time message hub    │                  │
│           │  - State synchronization    │                  │
│           │  - Connection management    │                  │
│           │  - Health monitoring        │                  │
│           └──────────────────────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Communication Flow

```
┌────────────────────────────────────────────────────────────┐
│ VISITOR INTERACTION FLOW                                   │
└────────────────────────────────────────────────────────────┘

1. Visitor (or operator) presses VOLTAGE + button
   ↓
2. Control Screen (3002) receives button press
   ↓
3. sendControlAction() → {action: VOLTAGE_CHANGE, value: 6}
   ↓
4. WebSocket sends message to Server (8081)
   ↓
5. Server routes message to Display (3001)
   ↓
6. DisplayScreen.tsx receives onControlAction callback
   ↓
7. Updates circuit state: voltage = 6V
   ↓
8. Updates visualization (immediate visual feedback)
   ↓
9. broadcastCircuitState() sends new state
   ↓
10. Server routes back to Control (3002)
    ↓
11. Control Screen updates displayed values
    ↓
12. Visitor sees:
    - Circuit animation on display updates
    - Button feedback on control panel
    - New voltage value displayed
    
    ⏱️ Total latency: ~200ms (imperceptible)
```

---

## 🏗️ System Architecture

### Three Independent Applications

```
┌────────────────────────────────────────────────────────┐
│         APPLICATION 1: WebSocket Server                │
├────────────────────────────────────────────────────────┤
│                                                         │
│ File: ws-server.ts                                     │
│ Port: 8081                                             │
│ Type: Node.js WebSocket Hub                            │
│                                                         │
│ Responsibilities:                                      │
│ • Accept WebSocket connections                         │
│ • Route messages between screens                       │
│ • Maintain circuit state                               │
│ • Health check endpoint                                │
│ • Client registry                                      │
│                                                         │
│ Runs on: Server machine (can be in closet)             │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│         APPLICATION 2: Display Screen                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│ File: display.html → main-display.tsx                  │
│ Port: 3001                                             │
│ Browser: React application                             │
│                                                         │
│ What it shows:                                         │
│ • Circuit visualizations (Resistor, Capacitor, etc)   │
│ • Landing page                                         │
│ • Real-time animations                                 │
│ • Voltage/Current/Frequency values                     │
│ • Connection status                                    │
│ • Live state monitor                                   │
│                                                         │
│ Receives from Control:                                 │
│ • Button presses                                       │
│ • Circuit selection                                    │
│ • Parameter adjustments                                │
│                                                         │
│ Sends to Control:                                      │
│ • Updated state values                                 │
│ • Confirmation messages                                │
│                                                         │
│ Runs on: Display machine (connected to large TV)       │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│         APPLICATION 3: Control Screen                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│ File: control.html → main-control.tsx                  │
│ Port: 3002                                             │
│ Browser: React application                             │
│                                                         │
│ What it shows:                                         │
│ • Hardware button interface                            │
│ • Voltage +/- buttons                                  │
│ • Frequency +/- buttons                                │
│ • Circuit selection buttons                            │
│ • Reset button                                         │
│ • Live synced values                                   │
│ • Connection status                                    │
│                                                         │
│ Sends to Display:                                      │
│ • Button press actions                                 │
│ • Control commands                                     │
│                                                         │
│ Receives from Display:                                 │
│ • Circuit state updates                                │
│ • Value confirmations                                  │
│                                                         │
│ Runs on: Control machine (small monitor or tablet)     │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Topologies

### Topology 1: Single Computer (Development/Testing)

```
┌───────────────────────────────┐
│   Your Development Computer   │
├───────────────────────────────┤
│                               │
│  Terminal 1: npm run server   │
│  ↓ WebSocket (8081)           │
│                               │
│  Terminal 2: npm run dev:display
│  ↓ Browser Tab 1 (3001)       │
│                               │
│  Terminal 3: npm run dev:control
│  ↓ Browser Tab 2 (3002)       │
│                               │
│  All communicate via:         │
│  localhost:8081               │
│                               │
└───────────────────────────────┘
```

### Topology 2: Two Computers (Display Separated)

```
┌─────────────────────────┐         ┌─────────────────┐
│  Server/Control Machine │         │  Display Machine│
├─────────────────────────┤         ├─────────────────┤
│                         │         │                 │
│  npm run server         │         │  npm run        │
│  ↓ 8081                 │◄────────┤  dev:display    │
│                         │ Network │  ↓ 3001         │
│  npm run dev:control    │         │  (TV Display)   │
│  ↓ 3002                 │         │                 │
│  (Control Buttons)      │         │                 │
│                         │         │                 │
│  ← WebSocket on 8081 ───┤         │                 │
│                         │         │                 │
└─────────────────────────┘         └─────────────────┘

  Edit in both:
  src/hooks/useWebSocketSync.ts
  → ws://localhost:8081 (displays/controls)
```

### Topology 3: Three Computers (Professional Museum)

```
┌──────────────────────┐    ┌────────────────┐    ┌──────────────┐
│  Server Computer     │    │ Display Machine│    │Control Machine
│  (Office/Closet)     │    │  (Gallery)      │    │  (Control Room)
├──────────────────────┤    ├────────────────┤    ├──────────────┤
│                      │    │                │    │              │
│ npm run server       │    │ npm run        │    │ npm run      │
│ ↓ 8081               │    │ dev:display    │    │ dev:control  │
│                      │    │ ↓ 3001         │    │ ↓ 3002       │
│ (Central Hub)        │    │ (Large TV)     │    │ (Buttons)    │
│                      │    │                │    │              │
└──────────────────────┘    └────────────────┘    └──────────────┘
         ↑                           ↑                       ↑
         └───────────────┬───────────┴──────────────────────┘
                         │
                  Museum Network
                  192.168.1.0/24

Edit in both Display & Control:
src/hooks/useWebSocketSync.ts
→ ws://192.168.1.100:8081 (server IP)
```

---

## 📦 Build Output Structure

### Development Build (In-Memory)
```
npm run dev:display → http://localhost:3001
npm run dev:control → http://localhost:3002
npm run server → http://localhost:8081

All served from memory with hot-reload
```

### Production Build (Disk)
```
npm run build:all

Creates:
├── dist/
│   ├── index.html           (main app, optional)
│   ├── main.js
│   └── ...
│
├── dist-display/
│   ├── display.html         ← Load this in browser
│   ├── main-display.js
│   └── assets/
│
└── dist-control/
    ├── control.html         ← Load this in browser
    ├── main-control.js
    └── assets/
```

---

## 🔌 Network Diagram

### Museum Network Setup

```
                    Internet (Optional)
                           |
                    [Firewall/Gateway]
                           |
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │          Museum Internal Network    │
        │                                    │
    (WiFi/Ethernet)                      (WiFi)
        │                                    │
        │                                    │
   ┌────▼────┐                         ┌─────▼──┐
   │ Server  │◄──── Network ────────► │Display │
   │  (8081) │                        │ (3001) │
   │        │                         │        │
   │Also    │                         │  Large │
   │run     │                         │   TV   │
   │Control │                         │        │
   │(3002)  │                         └────────┘
   └────────┘
        │
        │
   ┌────▼──────┐
   │  Control  │
   │  Machine  │
   │  (3002)   │
   │           │
   │ + GPIO    │
   │ + Buttons │
   └───────────┘

Communication:
- All WebSocket traffic through 8081
- HTTP browser access on 3001 (display) and 3002 (control)
- Use wired Ethernet for server and display
- WiFi acceptable for control
```

---

## 🎮 Control Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ USER PRESSES BUTTON                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  Control Screen (Port 3002)     │
        │  HardwareControlScreen.tsx      │
        │                                 │
        │  handleButtonPress(button)      │
        └────────────┬────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────┐
        │  useWebSocketSync Hook          │
        │  sendControlAction(action)      │
        └────────────┬────────────────────┘
                     │
                     ▼ JSON Message
        ┌─────────────────────────────────┐
        │  WebSocket Connection           │
        │  ws://server:8081               │
        └────────────┬────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────┐
        │  WebSocket Server (8081)        │
        │  ws-server.ts                   │
        │                                 │
        │  handleMessage()                │
        │  routeToDisplay()               │
        └────────────┬────────────────────┘
                     │
                     ▼ Broadcast
        ┌─────────────────────────────────┐
        │  Display Screen (Port 3001)     │
        │  DisplayScreen.tsx              │
        │                                 │
        │  onControlAction()              │
        │  updateCircuitState()           │
        │  broadcastCircuitState()        │
        └────────────┬────────────────────┘
                     │
                     ▼ New State
        ┌─────────────────────────────────┐
        │  Circuit Visualization Updates  │
        │                                 │
        │  ✓ Animation updates            │
        │  ✓ Values refresh               │
        │  ✓ Instant visual feedback      │
        └─────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────┐
        │  Control Screen Updates         │
        │                                 │
        │  ✓ Shows new values             │
        │  ✓ Confirms button press        │
        └─────────────────────────────────┘

Total time: ~200ms (imperceptible)
```

---

## 📊 Data Message Format

### Control Action Message
```json
{
  "type": "CONTROL_ACTION",
  "payload": {
    "action": "VOLTAGE_CHANGE",
    "value": 6,
    "timestamp": 1706782800000
  },
  "timestamp": 1706782800000,
  "sourceScreen": "control"
}
```

### Circuit State Update
```json
{
  "type": "CIRCUIT_UPDATE",
  "payload": {
    "type": "resistor",
    "voltage": 6,
    "current": 0.06,
    "resistance": 100,
    "frequency": 50,
    "timestamp": 1706782800000
  },
  "timestamp": 1706782800000,
  "sourceScreen": "display"
}
```

---

## 🔧 Component Hierarchy

```
Browser Window
│
└─ React App (display.html)
   │
   ├─ QueryClientProvider
   │  │
   │  └─ TooltipProvider
   │     │
   │     └─ DisplayScreen (main component)
   │        │
   │        ├─ useWebSocketSync (custom hook)
   │        │  ├─ WebSocketSync service
   │        │  └─ Message handlers
   │        │
   │        └─ Circuit Components
   │           ├─ ResistorCircuit.tsx
   │           ├─ CapacitorCircuit.tsx
   │           ├─ InductorCircuit.tsx
   │           └─ DiodeCircuit.tsx

Browser Window
│
└─ React App (control.html)
   │
   ├─ QueryClientProvider
   │  │
   │  └─ TooltipProvider
   │     │
   │     └─ HardwareControlScreen (main component)
   │        │
   │        ├─ useWebSocketSync (custom hook)
   │        │  ├─ WebSocketSync service
   │        │  └─ Message handlers
   │        │
   │        └─ UI Components
   │           ├─ Button (Voltage +/-)
   │           ├─ Button (Frequency +/-)
   │           ├─ Button (Circuit Select)
   │           ├─ Button (Reset)
   │           └─ Status Display
```

---

## ✨ Feature Map

```
                    WebSocket Server (8081)
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
    Display Screen (3001)              Control Screen (3002)
        │                                       │
        ├─ Circuit Display                      ├─ Voltage Control
        │  │                                    │  │
        │  ├─ Resistor animation                │  └─ ±1V buttons
        │  ├─ Capacitor animation              │
        │  ├─ Inductor animation               ├─ Frequency Control
        │  └─ Diode animation                  │  │
        │                                      │  └─ ±10Hz buttons
        ├─ Real-time Values                    │
        │  │                                   ├─ Circuit Selection
        │  ├─ Voltage display                  │  │
        │  ├─ Current display                  │  └─ 4 circuit buttons
        │  └─ Frequency display                │
        │                                      ├─ Reset Function
        └─ Status Monitoring                   │  │
           │                                   │  └─ Reset button
           └─ Connection indicator             │
              Error messages                   ├─ Live Display
              Debug panel                      │  │
                                              ├─ Voltage value
                                              ├─ Current value
                                              └─ Frequency value
                                              
                                              └─ Status
                                                 │
                                                 └─ Connected/Disconnected
```

---

This visual guide helps you understand:
✅ How the two screens connect
✅ Where each application runs
✅ How data flows between components
✅ What the complete system looks like in a museum

**Ready to deploy? See MUSEUM_DISPLAY_SETUP.md for detailed instructions!**
