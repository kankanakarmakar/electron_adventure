# Quick Reference - Two-Screen Setup

## 🎯 What You Have

```
Large TV Display     (Port 3001)  ←→  WebSocket Server  ←→  Control Panel
(Full Circuits)                       (Port 8081)              (Buttons)
                                                               (Port 3002)
```

---

## ⚡ Start Everything (3 Terminals)

### Terminal 1: Start Server
```bash
npm run server
```

### Terminal 2: Start Display (Large TV)
```bash
npm run dev:display
```
✅ Opens http://localhost:3001 (fullscreen on main display)

### Terminal 3: Start Control (Small Panel)
```bash
npm run dev:control
```
✅ Opens http://localhost:3002 (control buttons)

### Or All-In-One
```bash
npm run start:museum
```

---

## 🖥️ Production Build

```bash
# Build all 3 applications
npm run build:all

# Creates:
# dist-display/  → Large TV display
# dist-control/  → Control panel
```

---

## 🌐 Network Deployment

### Server Machine
```bash
npm run server
# Runs on: localhost:8081
```

### Display Machine (Large TV)
Edit `src/hooks/useWebSocketSync.ts`:
```typescript
wsUrl = `ws://192.168.1.100:8081`  // Your server IP
```

Then:
```bash
npm run dev:display
# Runs on: localhost:3001
```

### Control Machine
Edit `src/hooks/useWebSocketSync.ts`:
```typescript
wsUrl = `ws://192.168.1.100:8081`  // Your server IP
```

Then:
```bash
npm run dev:control
# Runs on: localhost:3002
```

---

## 📊 What Gets Built

| Command | Output | Purpose |
|---------|--------|---------|
| `npm run build:display` | `dist-display/` | Large TV display |
| `npm run build:control` | `dist-control/` | Control panel |
| `npm run build:all` | Both folders | Complete system |

---

## 🔌 Hardware Buttons

The control panel (`control.html`) is ready for GPIO button integration:

```typescript
// Map buttons to GPIO pins (Raspberry Pi example)
// Button → GPIO pin → handleButtonPress() → WebSocket → Display
```

See **MUSEUM_DISPLAY_SETUP.md** for full hardware guide.

---

## ✅ Verify It Works

1. ✓ Server shows: `WebSocket Server listening on ws://localhost:8081`
2. ✓ Display loads: `http://localhost:3001`
3. ✓ Control loads: `http://localhost:3002`
4. ✓ Both show green "Connected" status
5. ✓ Click button on Control → Display updates

---

## 🚀 Common Commands

```bash
# Development
npm run server              # WebSocket server
npm run dev:display         # Large TV display
npm run dev:control         # Control panel
npm run start:museum        # All three together

# Production
npm run build:all           # Build all 3 apps
npm run preview:display     # Preview display build
npm run preview:control     # Preview control build

# Network Setup
REACT_APP_WS_HOST=192.168.1.100 npm run dev:display
REACT_APP_WS_HOST=192.168.1.100 npm run dev:control
```

---

## 📍 Ports

| Port | Service |
|------|---------|
| 3001 | Display Screen (Large TV) |
| 3002 | Control Screen (Small Panel) |
| 8081 | WebSocket Server |

---

## 🎓 Files You Need to Know

- **display.html** - Entry for large TV display
- **control.html** - Entry for control panel
- **src/main-display.tsx** - Display app code
- **src/main-control.tsx** - Control app code
- **ws-server.ts** - WebSocket server
- **MUSEUM_DISPLAY_SETUP.md** - Full documentation

---

## 💡 Museum Setup Example

```
┌─ Server Computer ─────┐
│ npm run server        │  ← Runs on :8081
└───────────────────────┘
          ↑
    Museum Network
          ↑
    ┌─────┴─────┐
    ↓           ↓
┌──────────┐  ┌──────────┐
│Display   │  │Control   │
│Machine   │  │Machine   │
│:3001     │  │:3002     │
│(55" TV)  │  │(Buttons) │
└──────────┘  └──────────┘
```

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| Won't connect | Check server running: `npm run server` |
| Buttons don't work | Check WebSocket URL matches server IP |
| Slow updates | Check network: `ping SERVER_IP` |
| No display | Open http://localhost:3001 in browser |
| No controls | Open http://localhost:3002 in browser |

---

## 📚 More Help

- **Quick Setup**: QUICKSTART.md (5 min)
- **Full Guide**: MUSEUM_DISPLAY_SETUP.md (15 min)
- **All Details**: MUSEUM_SETUP.md (30 min)
- **Tests**: TESTING_CHECKLIST.md (30 min)

---

**Ready to go? Run:** `npm run start:museum`

🎓⚡🔌
