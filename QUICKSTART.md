# Quick Start Guide - Museum Circuit Display System

## 🚀 30-Second Setup

### For Local Development (Single Machine)

1. **Terminal 1 - Start WebSocket Server:**
```bash
npm run server
```
Expected output: `WebSocket Server listening on ws://localhost:8081`

2. **Terminal 2 - Start Everything:**
```bash
npm run dev
```
This opens the main app on http://localhost:8080

3. **Open Additional Tabs/Windows:**
- Display Screen: http://localhost:8080?mode=display
- Control Screen: http://localhost:8080?mode=control

✅ Both screens will now sync in real-time!

---

## 🏛️ Museum Installation (Multi-Screen Setup)

### Scenario: Two Physical Screens + Control Panel

**Setup:**
- **Screen 1 (Display):** Mounted on wall showing circuits and animations
- **Screen 2 (Control):** Mounted elsewhere with hardware buttons
- **Server:** Can run on either screen machine or separate control computer

### Installation Steps:

1. **On Server Machine (e.g., control computer):**
```bash
npm install
npm run server
# Server runs on http://your-machine-ip:8081
```

2. **On Display Screen Machine:**
```bash
# Edit src/hooks/useWebSocketSync.ts
# Change: ws://localhost:8081 to ws://YOUR_SERVER_IP:8081

npm install
npm run dev:display
```

3. **On Control Screen Machine:**
```bash
# Edit src/hooks/useWebSocketSync.ts
# Change: ws://localhost:8081 to ws://YOUR_SERVER_IP:8081

npm install
npm run dev:control
```

---

## 🎛️ Hardware Button Integration

For physical buttons on the control screen:

### Example: GPIO Button (Raspberry Pi)
```typescript
// In src/screens/HardwareControlScreen.tsx

import Gpio from 'onoff').Gpio;

// Setup your hardware buttons
const voltageIncButton = new Gpio(17, 'in', 'rising');
const voltageDecButton = new Gpio(27, 'in', 'rising');

// Wire them to actions
voltageIncButton.watch(() => {
  handleButtonPress(hardwareButtons.find(b => b.id === 'voltage-inc'));
});

voltageDecButton.watch(() => {
  handleButtonPress(hardwareButtons.find(b => b.id === 'voltage-dec'));
});
```

---

## 📊 Monitoring & Debugging

### Check Server Health:
```bash
curl http://localhost:8081/health
```

Response shows connected screens and client count.

### Browser DevTools:
- Open DevTools on either screen (F12)
- Go to Console tab
- Watch for connection logs: `[display] Connected to sync server`
- Watch for message logs: `Display received control action...`

### Server Logs:
Check terminal where `npm run server` is running for detailed message flow.

---

## 🔌 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Screens not connecting** | Verify WebSocket server is running on port 8081 |
| **Control not syncing** | Check `wsUrl` matches your server IP |
| **Buttons not responding** | Check browser console for errors, verify connection status |
| **Frequent disconnections** | Check network stability, increase heartbeat timeout in ws-server.ts |
| **Performance lag** | Reduce broadcast frequency or add message throttling |

---

## 📁 File Structure

```
BITM/
├── ws-server.ts                    # WebSocket server (run this first!)
├── src/
│   ├── screens/
│   │   ├── DisplayScreen.tsx       # Circuit visualization screen
│   │   └── HardwareControlScreen.tsx # Control panel with buttons
│   ├── hooks/
│   │   └── useWebSocketSync.ts     # React hook for sync
│   ├── services/
│   │   └── websocket-sync.ts       # WebSocket client logic
│   ├── types/
│   │   └── sync.ts                 # TypeScript interfaces
│   └── App.tsx                     # Main app (auto-detects mode)
└── MUSEUM_SETUP.md                 # Full documentation
```

---

## 🌐 Network Setup Example

```
┌─────────────────────────────────────────────────┐
│  MUSEUM NETWORK (192.168.1.0/24)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Server: 192.168.1.10:8081                     │
│  ├── WebSocket Hub                             │
│  └── Routes messages between screens           │
│                                                 │
│  Display Screen: 192.168.1.20                  │
│  ├── Shows circuits & animations               │
│  └── Connects to ws://192.168.1.10:8081        │
│                                                 │
│  Control Screen: 192.168.1.30                  │
│  ├── Hardware buttons interface                │
│  └── Connects to ws://192.168.1.10:8081        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎮 Control Panel Button Layout

```
┌─────────────────────────────────┐
│   VOLTAGE CONTROL               │
│  [Voltage +] [Voltage -]        │
├─────────────────────────────────┤
│   FREQUENCY CONTROL             │
│  [Freq +]    [Freq -]           │
├─────────────────────────────────┤
│   CIRCUIT SELECTION             │
│  [Resistor] [Capacitor]         │
│  [Inductor] [Diode]             │
├─────────────────────────────────┤
│  [RESET ALL]                    │
└─────────────────────────────────┘
```

---

## 📝 Environment Variables

Create `.env.local` for custom settings:

```env
REACT_APP_WS_PORT=8081
REACT_APP_WS_HOST=localhost
NODE_ENV=development
```

Or set when running server:
```bash
WS_PORT=9000 npm run server
```

---

## 🚀 Production Deployment

### Build for Production:
```bash
npm run build
```

### Deploy WebSocket Server:
```bash
NODE_ENV=production npm run server
```

### Deploy to Web Server:
```bash
# Serve dist/ folder with your web server
# Make sure WebSocket server is accessible to clients
```

---

## 📞 Support

If screens don't connect:
1. Check that WebSocket server port 8081 is not blocked by firewall
2. Verify machines are on the same network
3. Test with: `telnet SERVER_IP 8081`
4. Check console logs for exact error messages

For continuous issues, add debugging in `src/hooks/useWebSocketSync.ts`:
```typescript
// Uncomment for verbose logging
console.log('[DEBUG] All WebSocket events logged');
```

---

## ✅ Verification Checklist

- [ ] Node.js/Bun installed
- [ ] Dependencies installed: `npm install`
- [ ] WebSocket server runs: `npm run server`
- [ ] Display screen opens: `npm run dev:display`
- [ ] Control screen opens: `npm run dev:control`
- [ ] Both show "Connected" status
- [ ] Clicking buttons on control updates display
- [ ] Changes propagate in real-time

🎉 You're ready for the museum!
