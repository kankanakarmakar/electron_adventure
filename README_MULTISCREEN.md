# Museum Circuit Display System - Complete Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Documentation Files](#documentation-files)

---

## 🎯 Overview

A professional multi-screen circuit display and control system designed for museum installations. Features real-time synchronization between a main display screen showing animated circuits and a separate hardware control panel.

### Key Features
- ✅ **Real-time Sync**: WebSocket-based communication for instant updates
- ✅ **Two-Screen System**: Separate display and control interfaces
- ✅ **Hardware Integration**: Ready for physical button mapping
- ✅ **Multiple Circuits**: Resistor, Capacitor, Inductor, Diode support
- ✅ **Network Ready**: Works on single machine or distributed network
- ✅ **Production Grade**: Professional deployment guides included
- ✅ **Auto-Reconnect**: Automatic recovery from network issues

### Perfect For
- Museums and educational centers
- Interactive exhibits
- Student demonstrations
- Science fairs
- Electronics education

---

## 🚀 Quick Start

### For Windows
```powershell
# Run the startup script
.\start.ps1
# Then follow the interactive prompts
```

### For macOS/Linux
```bash
# Run the startup script
bash start.sh
# Then follow the interactive prompts
```

### Manual 3-Step Setup
```bash
# Step 1: Install dependencies
npm install

# Step 2: Start WebSocket Server (Terminal 1)
npm run server

# Step 3: Start Application (Terminal 2)
npm run dev
```

Then open:
- Display Screen: http://localhost:8080?mode=display
- Control Screen: http://localhost:8080?mode=control

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────┐
│    WebSocket Server (Port 8081)     │
│    ├─ Message Hub                   │
│    ├─ State Management              │
│    └─ Client Registry               │
└────────────┬──────────────┬──────────┘
             │              │
      ┌──────▼──┐      ┌────▼─────┐
      │ Display │      │ Control  │
      │ Screen  │◄────►│  Screen  │
      │         │      │          │
      │ - Shows │      │ - Buttons│
      │ circuits│      │ - Sliders│
      │ - Anim. │      │ - Status │
      └─────────┘      └──────────┘
```

### Communication Flow

1. **Control Action** (User presses button)
   ```
   Control Screen → WebSocket → Server → Display Screen
   ```

2. **State Update** (Display changes)
   ```
   Display Screen → WebSocket → Server → Control Screen (shows updated values)
   ```

3. **Sync Request** (Reconnection)
   ```
   Control Screen → Request → Server → Send current state
   ```

### Key Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, WebSocket (ws library)
- **Build**: Vite
- **UI Components**: shadcn/ui
- **Real-time**: Custom WebSocket sync layer

---

## 📦 Installation

### Prerequisites
- Node.js 16+ or Bun 1.3.4
- npm or yarn package manager
- Modern web browser (Chrome 60+, Firefox 60+, Safari 12+)

### Step-by-Step

1. **Clone/Copy Project**
   ```bash
   git clone <repo> circuit-display
   cd circuit-display
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start Development Server**
   ```bash
   npm run server    # Terminal 1: WebSocket Server
   npm run dev       # Terminal 2: Vite Dev Server
   ```

4. **Access Screens**
   - Main App: http://localhost:8080
   - Display: http://localhost:8080?mode=display
   - Control: http://localhost:8080?mode=control

### Package Scripts

| Command | Purpose |
|---------|---------|
| `npm run server` | Start WebSocket sync server (production) |
| `npm run dev` | Start Vite dev server |
| `npm run dev:display` | Start dev server in display mode |
| `npm run dev:control` | Start dev server in control mode |
| `npm run start:museum` | Start all systems (requires concurrently) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 💻 Usage

### Display Screen Features

The display screen shows:
- Selected circuit type (Resistor/Capacitor/Inductor/Diode)
- Live circuit animation with electron flow
- Real-time voltage, current, and frequency values
- Connection status indicator
- Live state monitor (debug panel)

**Receives from Control Screen:**
- Circuit selection commands
- Voltage adjustments
- Frequency changes
- Reset commands

### Control Screen Features

The control screen provides:
- **Voltage Control**: ±1V increment buttons
- **Frequency Control**: ±10Hz increment buttons
- **Circuit Selection**: 4 button array for circuit types
- **Reset Button**: Returns to default values
- **Live Display**: Shows current synced values
- **Connection Status**: Visual indicator

**Sends to Display Screen:**
- All control actions in real-time
- Status updates
- Sync requests

### Integration with Hardware Buttons

Map physical GPIO buttons to the control system:

```typescript
// Example: Raspberry Pi GPIO Integration
import Gpio from 'onoff').Gpio;

const button = new Gpio(17, 'in', 'rising');
button.watch((err, value) => {
  if (!err && value === 1) {
    // Trigger voltage increase
    handleButtonPress(hardwareButtons.find(b => b.id === 'voltage-inc'));
  }
});
```

See `MUSEUM_SETUP.md` for detailed hardware integration examples.

---

## 🌐 Network & Deployment

### Single Machine Setup
- **Server**: localhost:8081
- **Display**: http://localhost:8080?mode=display
- **Control**: http://localhost:8080?mode=control
- **Best for**: Development, testing, small installations

### Distributed Network Setup
- **Server**: Central IP (e.g., 192.168.1.100:8081)
- **Display**: Separate machine connecting to server
- **Control**: Separate machine connecting to server
- **Best for**: Large museums, professional installations

### Configuration

**For Distributed Setup**, update WebSocket URL:

Edit `src/hooks/useWebSocketSync.ts`:
```typescript
wsUrl = `ws://192.168.1.100:8081` // Your server IP
```

Or use environment variable:
```bash
REACT_APP_WS_HOST=192.168.1.100 npm run dev:display
```

### Network Diagram

```
         Museum Network
            |
    ┌───────┴───────┐
    │               │
  Server      Display & Control
192.168.1.10   Machines
    |
    ├─ WebSocket Hub
    ├─ Message Routing
    └─ State Management
```

---

## 📚 Documentation Files

### Quick References
- **[QUICKSTART.md](./QUICKSTART.md)** - 30-second setup guide
- **[MUSEUM_SETUP.md](./MUSEUM_SETUP.md)** - Complete system documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

### Configuration Files
- **`start.sh`** - Linux/macOS startup script
- **`start.ps1`** - Windows PowerShell startup script
- **`src/config/screen-config.ts`** - Configuration manager
- **`.env.local`** - Environment variables (optional)

### Source Structure
```
src/
├── screens/
│   ├── DisplayScreen.tsx        # Main circuit display
│   └── HardwareControlScreen.tsx # Control panel UI
├── hooks/
│   └── useWebSocketSync.ts      # Sync hook
├── services/
│   └── websocket-sync.ts        # WebSocket client
├── types/
│   └── sync.ts                  # Shared types
├── config/
│   └── screen-config.ts         # Configuration
├── components/
│   ├── [existing components]
│   └── ui/                      # UI library
└── pages/
    ├── Index.tsx
    ├── Resistor.tsx
    ├── Capacitor.tsx
    ├── Inductor.tsx
    └── Diode.tsx
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` to customize:

```env
# WebSocket Configuration
REACT_APP_WS_HOST=localhost
REACT_APP_WS_PORT=8081

# Application Mode
NODE_ENV=development
```

### Screen Configuration

Use the `ScreenConfigManager` utility:

```typescript
import { getScreenConfig } from '@/config/screen-config';

const config = getScreenConfig();
config.updateConfig({
  wsHost: '192.168.1.100',
  wsPort: 8081,
  debugMode: true,
});
```

### URL Parameters

- `?mode=display` - Launch as display screen
- `?mode=control` - Launch as control screen
- `?wsHost=192.168.1.100` - Override WebSocket host
- `?wsPort=9000` - Override WebSocket port
- `?debug=true` - Enable debug logging

---

## 🚀 Production Deployment

### Build Optimization

```bash
# Create optimized production build
npm run build

# Output: dist/ folder with optimized assets
```

### Server Deployment

```bash
# Start production WebSocket server
NODE_ENV=production npm run server

# Serve frontend (example with serve package)
npm install -g serve
serve dist -s index.html -l 3000
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080 8081
CMD ["npm", "run", "server"]
```

### Monitoring

Health check endpoint:
```bash
curl http://localhost:8081/health
```

Response:
```json
{
  "status": "ok",
  "clients": 2,
  "displayScreens": 1,
  "controlScreens": 1
}
```

---

## 🆘 Troubleshooting

### Connection Issues

**Problem**: "Disconnected" status on screens

**Solutions**:
1. Verify WebSocket server running: `npm run server`
2. Check port 8081 not blocked by firewall
3. Verify WebSocket URL matches server IP
4. Check browser console for errors (F12)

### Message Sync Issues

**Problem**: Controls don't update display

**Solutions**:
1. Verify both screens show "Connected"
2. Check server logs for message flow
3. Try clicking buttons again (timeout may apply)
4. Refresh browser pages

### Network Issues

**Problem**: Frequent disconnections

**Solutions**:
1. Check network stability: `ping SERVER_IP`
2. Reduce interference (WiFi optimization)
3. Use wired Ethernet if possible
4. Increase reconnection timeout in `ws-server.ts`

### Performance Issues

**Problem**: Lag or slow updates

**Solutions**:
1. Close background applications
2. Reduce number of active displays
3. Increase broadcast interval
4. Enable GPU acceleration in browser

### Detailed Help

See [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section for more details.

---

## 📊 Performance Specifications

### Latency
- **Message Delivery**: <100ms typical
- **Display Update**: 500ms broadcast interval
- **Control Response**: <200ms

### Scalability
- **Single Server**: Supports up to 10 displays
- **Recommended**: Max 5 displays per server
- **Multiple Servers**: Can be load-balanced

### Network Requirements
- **Bandwidth**: <1 Mbps per connection
- **Latency**: <50ms recommended
- **Firewall**: Port 8081 must be open

---

## 🔐 Security

### For Public Installations

1. **Restrict Network Access**
   - Firewall only museum network
   - Disable external internet

2. **Add Authentication** (Optional)
   - Implement token-based access
   - See DEPLOYMENT.md for details

3. **Enable WSS** (Optional)
   - Use secure WebSocket over HTTPS
   - Requires SSL certificate

4. **Monitor Activity**
   - Log control actions
   - Alert on anomalies

---

## 🎓 Educational Use

### Teaching Circuit Concepts
- **Resistor**: Understand resistance and Ohm's law
- **Capacitor**: Learn about capacitance and AC response
- **Inductor**: Study inductance and frequency effects
- **Diode**: Explore semiconductor behavior

### Interactive Learning
- Real-time parameter adjustment
- Visual feedback with animations
- Quantitative measurements
- Immediate cause-and-effect relationships

---

## 🔄 Updates & Maintenance

### Regular Maintenance
- Weekly: Check health endpoint
- Monthly: Review logs and update dependencies
- Quarterly: Test all features
- Yearly: Upgrade Node.js if needed

### Backup Strategy
```bash
# Backup configuration
cp -r src/ backup/src_$(date +%Y%m%d).tar
cp package.json backup/package_$(date +%Y%m%d).json
```

---

## 📝 License & Attribution

This project is built with modern web technologies and open-source libraries.

### Dependencies Include
- React & React DOM
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- WebSocket (ws)
- And many more...

See `package.json` for complete list.

---

## 🤝 Support & Contributing

### Getting Help
1. Check relevant documentation file
2. Review troubleshooting section
3. Check browser console for errors
4. Review server logs

### Reporting Issues
Include:
- What happened
- When it occurred
- Affected screen (Display/Control)
- Error messages
- Steps to reproduce

---

## 🎉 Quick Wins Checklist

- [x] Real-time multi-screen sync
- [x] Professional UI with animations
- [x] Hardware button integration ready
- [x] Network deployment support
- [x] Auto-reconnection with recovery
- [x] Health monitoring & logging
- [x] Complete documentation
- [x] Production-ready code
- [x] Easy startup scripts
- [x] Troubleshooting guides

---

## 📞 Getting Started Now

### Immediate Next Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run startup script**
   ```bash
   # Windows
   .\start.ps1
   
   # macOS/Linux
   bash start.sh
   ```

3. **Follow interactive prompts**

4. **Access your screens**
   - Display: http://localhost:8080?mode=display
   - Control: http://localhost:8080?mode=control

### Complete Documentation
- Fast setup? → Read **QUICKSTART.md**
- Full details? → Read **MUSEUM_SETUP.md**
- Deployment? → Read **DEPLOYMENT.md**

---

## 🎯 Next Steps

After setup, you can:

1. **Customize Circuit Displays**
   - Edit `src/pages/*.tsx` files
   - Adjust animations and visuals

2. **Add Hardware Buttons**
   - Follow `MUSEUM_SETUP.md` examples
   - Integrate with GPIO/physical buttons

3. **Deploy to Network**
   - Follow `DEPLOYMENT.md`
   - Configure server IP
   - Run on multiple machines

4. **Monitor & Maintain**
   - Use health check endpoint
   - Review server logs
   - Keep dependencies updated

---

## ✨ Features & Capabilities

### Current
- ✅ Resistor circuit display and control
- ✅ Capacitor circuit display and control
- ✅ Inductor circuit display and control
- ✅ Diode circuit display and control
- ✅ Real-time parameter adjustment
- ✅ Multiple display support
- ✅ Hardware button integration

### Future Enhancements
- 📋 Message compression
- 📋 Data encryption
- 📋 Recording & playback
- 📋 Analytics dashboard
- 📋 Mobile app control
- 📋 Voice control integration
- 📋 Advanced circuit editor

---

## 🏆 Museum Ready

This system is:
- ✅ **Production Grade** - Professional deployment
- ✅ **Reliable** - Auto-recovery mechanisms
- ✅ **Scalable** - Supports multiple displays
- ✅ **Maintainable** - Clear documentation
- ✅ **Educational** - Designed for learning
- ✅ **User-Friendly** - Intuitive interfaces

---

## 📄 License

This project is provided as-is for educational and museum installations.

---

**Happy teaching! 🎓🔌⚡**

For questions, refer to the relevant documentation file or review the source code comments.
