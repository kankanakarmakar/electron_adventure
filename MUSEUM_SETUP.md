# Multi-Screen Museum Circuit Display System

## Architecture Overview

This system is designed for museum installations with two separate screens:

1. **Display Screen** - Shows circuit visualization with real-time animations
2. **Control Screen** - Hardware buttons interface for operators to control the display

Both screens communicate in real-time via WebSocket for seamless synchronization.

## System Components

### 1. WebSocket Server (`ws-server.ts`)
- Central hub for multi-screen communication
- Handles message routing between display and control screens
- Maintains circuit state
- Provides health check endpoint

**Default Port:** `8081`

### 2. Frontend Architecture

#### Display Screen (`src/screens/DisplayScreen.tsx`)
- Main circuit visualization component
- Receives control actions from the control screen
- Broadcasts circuit state updates
- Shows live connection status
- Auto-updates at regular intervals

#### Control Screen (`src/screens/HardwareControlScreen.tsx`)
- Hardware button interface
- Controls for voltage, frequency, and circuit selection
- Displays real-time synced values
- Shows connection status
- Large buttons optimized for physical button mapping

#### Communication Layer
- **Hook:** `src/hooks/useWebSocketSync.ts` - React hook for WebSocket integration
- **Service:** `src/services/websocket-sync.ts` - Core WebSocket client
- **Types:** `src/types/sync.ts` - Shared TypeScript interfaces

## Setup Instructions

### Prerequisites
- Node.js 16+ (or Bun 1.3.4+)
- npm or bun package manager

### Installation

1. Install dependencies:
```bash
bun install
# or
npm install
```

2. Install additional packages for WebSocket server:
```bash
bun add ws
bun add --dev ts-node @types/ws @types/node
# or
npm install ws
npm install --save-dev ts-node @types/ws @types/node
```

### Running the System

#### Option 1: Full Museum Setup (Recommended)
```bash
npm run start:museum
```
This starts:
- WebSocket server on port 8081
- Vite dev server on port 8080
- Opens both display and control screens

#### Option 2: Manual Setup

Terminal 1 - Start WebSocket Server:
```bash
npm run server
```

Terminal 2 - Start Display Screen:
```bash
npm run dev:display
```

Terminal 3 - Start Control Screen (optional, can be on different machine):
```bash
npm run dev:control
```

#### Option 3: Network Deployment
For multi-machine setup, modify the WebSocket URL in `src/hooks/useWebSocketSync.ts`:

```typescript
wsUrl = `ws://<server-ip>:8081`
```

## URL Parameters

### Display Screen
```
http://localhost:8080?mode=display
```

### Control Screen
```
http://localhost:8080?mode=control
```

## API Reference

### Message Types

#### SCREEN_REGISTER
Register screen on connection
```json
{
  "type": "SCREEN_REGISTER",
  "payload": {
    "screenId": "display-xxx",
    "screenType": "display"
  },
  "timestamp": 1234567890,
  "sourceScreen": "display"
}
```

#### CIRCUIT_UPDATE
Broadcast circuit state
```json
{
  "type": "CIRCUIT_UPDATE",
  "payload": {
    "type": "resistor",
    "voltage": 5,
    "current": 0.05,
    "resistance": 100,
    "frequency": 50,
    "timestamp": 1234567890
  },
  "timestamp": 1234567890,
  "sourceScreen": "display"
}
```

#### CONTROL_ACTION
Send control command
```json
{
  "type": "CONTROL_ACTION",
  "payload": {
    "action": "VOLTAGE_CHANGE",
    "value": 6,
    "timestamp": 1234567890
  },
  "timestamp": 1234567890,
  "sourceScreen": "control"
}
```

#### SYNC_REQUEST
Request current state
```json
{
  "type": "SYNC_REQUEST",
  "payload": {
    "requestedBy": "control-xxx"
  },
  "timestamp": 1234567890,
  "sourceScreen": "control"
}
```

## Using the React Hook

### Basic Usage
```typescript
import { useWebSocketSync } from '@/hooks/useWebSocketSync';

const MyComponent = () => {
  const {
    isConnected,
    screenId,
    broadcastCircuitState,
    sendControlAction,
  } = useWebSocketSync({
    screenType: 'display',
    onCircuitStateUpdate: (state) => {
      console.log('Circuit state:', state);
    },
    onControlAction: (action) => {
      console.log('Control action:', action);
    },
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};
```

## Hardware Button Mapping

The control screen includes buttons for:

- **Voltage Control**
  - Increment/Decrement buttons (±1V per press)

- **Frequency Control**
  - Increment/Decrement buttons (±10Hz per press)

- **Circuit Selection**
  - Resistor, Capacitor, Inductor, Diode buttons

- **Reset**
  - Reset all values to defaults

### Custom Hardware Button Integration

To map physical buttons to hardware buttons:

1. Override `handleButtonPress()` in `HardwareControlScreen.tsx`
2. Connect to your hardware input system
3. Trigger `sendControlAction()` based on button events

Example with GPIO (Raspberry Pi):
```typescript
import Gpio from 'onoff').Gpio;

const button = new Gpio(17, 'in', 'rising');
button.watch((err, value) => {
  if (value === 1) {
    handleButtonPress(hardwareButtons[0]); // Voltage increment
  }
});
```

## Deployment

### Single Machine
- WebSocket server: `http://localhost:8081`
- Display Screen: `http://localhost:8080?mode=display`
- Control Screen: `http://localhost:8080?mode=control`

### Multi-Machine (Museum Network)
1. Deploy WebSocket server on central machine:
   ```bash
   WS_PORT=8081 npm run server
   ```

2. Deploy Display Screen on display machine:
   - Update `wsUrl` in `useWebSocketSync` to server IP
   - Run: `npm run dev:display`

3. Deploy Control Screen on control machine:
   - Update `wsUrl` in `useWebSocketSync` to server IP
   - Run: `npm run dev:control`

### Production Build

```bash
npm run build
```

This creates optimized builds in `dist/`. Serve with:
```bash
npm run preview
```

## Health Check

Monitor server status:
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

## Troubleshooting

### Connection Issues
1. Ensure WebSocket server is running: `npm run server`
2. Check firewall allows port 8081
3. Verify `wsUrl` matches server address
4. Check browser console for errors

### Missing Message Updates
1. Verify connection status on screen
2. Check WebSocket message format
3. Look for errors in server logs
4. Ensure `screenType` is set correctly

### Circuit State Not Syncing
1. Check that Display Screen is broadcasting updates
2. Verify Control Screen is receiving messages
3. Review message handler subscriptions
4. Check for message type mismatches

## Performance Optimization

- WebSocket messages sent at 500ms intervals from display
- Heartbeat check every 30 seconds
- Auto-reconnect with exponential backoff
- Message compression can be added via middleware

## Future Enhancements

- [ ] WebSocket compression (permessage-deflate)
- [ ] Message encryption for secure museums
- [ ] Multiple display screens with fallback
- [ ] Recording and playback of sessions
- [ ] Advanced analytics and logging
- [ ] Gesture control integration
- [ ] Mobile app control support
- [ ] Voice command integration

## License

This project is part of a museum educational display system.
