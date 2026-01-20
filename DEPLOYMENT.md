# Museum Deployment Guide

## Overview

This guide walks through deploying the multi-screen circuit display system for a museum installation.

## Deployment Scenarios

### Scenario A: Single Control Computer (Recommended for Small Museums)

**Setup:**
- 1 Control Computer runs everything:
  - WebSocket Server
  - Display Screen (via browser fullscreen)
  - Control Screen (via browser window or separate monitor)

**Advantages:**
- Easiest setup
- No network configuration needed
- Single point of management

**Steps:**

1. Install Node.js on the control computer
2. Clone/copy project to the machine
3. Run:
```bash
npm install
npm run start:museum
```

4. Arrange windows:
   - Display Screen: Full-screen on connected projector/monitor
   - Control Screen: On separate monitor or same computer

---

### Scenario B: Distributed Setup (For Large Museums)

**Setup:**
- Server Computer (in closet/server room):
  - Runs WebSocket Server on port 8081
  - Acts as central hub

- Display Computer #1 (Gallery area):
  - Runs Display Screen
  - Connects to WebSocket Server via network

- Display Computer #2 (Another gallery area):
  - Runs Display Screen
  - Connects to WebSocket Server via network

- Control Computer (Museum office):
  - Runs Control Screen
  - Manages all displays

**Advantages:**
- Multiple independent displays
- Central control location
- Professional network setup

**Steps:**

1. **On Server Computer:**
```bash
npm install
WS_PORT=8081 npm run server
```
Note the server IP address: e.g., `192.168.1.100`

2. **On Each Display Computer:**
   - Edit `src/hooks/useWebSocketSync.ts`:
   ```typescript
   // Change this line:
   wsUrl = `ws://192.168.1.100:8081` // Your server IP
   ```
   
   - Run:
   ```bash
   npm install
   npm run dev:display
   ```
   - Open: `http://localhost:8080?mode=display`
   - Make fullscreen (F11)

3. **On Control Computer:**
   - Edit `src/hooks/useWebSocketSync.ts` (same change as Display)
   - Run:
   ```bash
   npm install
   npm run dev:control
   ```
   - Open: `http://localhost:8080?mode=control`

---

### Scenario C: Cloud Deployment (For Remote Access)

**Setup:**
- Server on cloud (AWS, DigitalOcean, etc.)
- Display/Control screens connect over internet

**Additional Considerations:**
- Use WSS (secure WebSocket) instead of WS
- Add authentication layer
- Implement message encryption
- Use firewall rules to restrict access

---

## Installation Steps (Detailed)

### 1. Prerequisites

- Node.js 16+ or Bun 1.3.4+
- Modern web browsers (Chrome 60+, Firefox 60+, Safari 12+)
- Network connectivity between all machines

### 2. Clone/Install Project

```bash
# Clone or copy project to each machine
git clone <repository> circuit-display
cd circuit-display

# Install dependencies
npm install
# or if using Bun:
bun install
```

### 3. Configure WebSocket Server

**Server Machine Only:**

```bash
# Test server startup
npm run server

# Expected output:
# === Circuit Sync WebSocket Server Started ===
# WebSocket Server listening on ws://localhost:8081
# Health check available at http://localhost:8081/health
```

### 4. Configure Client Machines

For each Display/Control screen machine:

**Edit `src/hooks/useWebSocketSync.ts`:**

Find this line:
```typescript
wsUrl = `ws://${window.location.hostname}:${process.env.REACT_APP_WS_PORT || 8081}`
```

Replace with your server IP (e.g., for distributed setup):
```typescript
wsUrl = `ws://192.168.1.100:8081` // Your actual server IP
```

**Or** set environment variable:
```bash
REACT_APP_WS_HOST=192.168.1.100 npm run dev:display
```

### 5. Start All Components

**Terminal on Server Machine:**
```bash
npm run server
```

**Terminal on Display Machine #1:**
```bash
npm run dev:display
```

**Terminal on Control Machine:**
```bash
npm run dev:control
```

---

## Network Configuration

### Required Ports

| Port | Service | Direction | Required |
|------|---------|-----------|----------|
| 8081 | WebSocket Server | Both directions | Yes |
| 8080 | Vite Dev Server | Display → User | Yes (dev only) |
| 5173 | Vite Alt Port | Display → User | No (fallback) |

### Firewall Rules

**Allow inbound on Server:**
```bash
# Linux (UFW)
sudo ufw allow 8081/tcp

# Windows Firewall
netsh advfirewall firewall add rule name="WebSocket Port 8081" dir=in action=allow protocol=tcp localport=8081
```

### Network Architecture

```
[School Network / Museum WiFi]
      |
      +-- Server Computer (192.168.1.100:8081)
      |
      +-- Display Computer 1 (192.168.1.101)
      |
      +-- Display Computer 2 (192.168.1.102)
      |
      +-- Control Computer (192.168.1.103)
```

---

## Production Build

For permanent installation:

```bash
# On each client machine
npm run build

# This creates optimized 'dist/' folder
# Serve it with any web server:
npx serve dist -s index.html -l 3000
# Then open: http://localhost:3000?mode=display
```

---

## Monitoring & Maintenance

### Health Check

```bash
# From any machine with network access to server:
curl http://SERVER_IP:8081/health

# Response:
{
  "status": "ok",
  "clients": 3,
  "displayScreens": 2,
  "controlScreens": 1
}
```

### Logs to Monitor

**Server Logs:**
```
[timestamp] New WebSocket connection: display-xxx
[timestamp] Screen registered: display-xxx (display)
[timestamp] === Client Status ===
Total connections: 3
Display Screens: 2
Control Screens: 1
```

### Troubleshooting Checklist

- [ ] Server running: `curl http://SERVER_IP:8081/health`
- [ ] All machines on same network
- [ ] Firewall port 8081 open
- [ ] WebSocket URL matches server IP
- [ ] Browser showing "Connected" status
- [ ] Control buttons trigger display updates
- [ ] No console errors (F12 → Console)

---

## Scheduled Maintenance

### Daily
- Check health endpoint at opening
- Verify both screens connected
- Test control buttons

### Weekly
- Review server logs for errors
- Check network stability
- Restart server if needed

### Monthly
- Update dependencies: `npm update`
- Test all circuit types
- Backup configuration

### Yearly
- Review performance metrics
- Upgrade to latest Node.js if needed
- Test disaster recovery

---

## Backup & Recovery

### Backup Configuration
```bash
# Save current setup
cp -r src/ backup/src_$(date +%Y%m%d).tar
cp package.json backup/package_$(date +%Y%m%d).json
```

### Recovery from Failure

1. **If server crashes:**
   ```bash
   npm run server
   # Screens automatically reconnect
   ```

2. **If display disconnects:**
   - Page auto-refreshes (F5)
   - Or restart: `npm run dev:display`

3. **If network is down:**
   - All screens go "Disconnected"
   - Auto-reconnect with exponential backoff
   - Manual reconnect: Refresh browser

---

## Security Considerations

### For Public Installations

1. **Restrict Network Access:**
   - Firewall only museum network
   - Block external internet access

2. **Add Authentication:**
   ```typescript
   // Add token to WebSocket connection
   const wsUrl = `ws://server:8081?token=MUSEUM_TOKEN`
   ```

3. **Enable WSS (Secure WebSocket):**
   ```typescript
   const wsUrl = `wss://server:8081` // HTTPS required
   ```

4. **Monitor Activity:**
   - Log all control actions
   - Alert on unexpected changes

---

## Performance Optimization

### For Large Museums (5+ Displays)

1. **Reduce broadcast frequency:**
   ```typescript
   // In DisplayScreen.tsx
   const interval = setInterval(() => {
     broadcastCircuitState(circuitState);
   }, 1000); // Increase from 500ms
   ```

2. **Add message compression:**
   ```typescript
   // Implement permessage-deflate in ws-server.ts
   const wss = new WebSocket.Server({ 
     perMessageDeflate: true 
   });
   ```

3. **Load balance:**
   - Run multiple WebSocket servers
   - Use reverse proxy (nginx)

---

## Troubleshooting Guide

### Screens Not Connecting

**Problem:** Display shows "Disconnected"

**Solutions:**
1. Verify WebSocket server running: `npm run server`
2. Check firewall: `telnet SERVER_IP 8081`
3. Check wsUrl in code matches server IP
4. Review browser console (F12)

### Messages Not Syncing

**Problem:** Button presses don't update display

**Solutions:**
1. Check both screens show "Connected"
2. Verify message types match in console
3. Check for errors in server logs
4. Try clicking buttons again (30-second timeout)

### Network Connectivity Issues

**Problem:** Frequent disconnections

**Solutions:**
1. Check network stability: `ping SERVER_IP`
2. Reduce interference (WiFi channel)
3. Use wired Ethernet if possible
4. Increase heartbeat timeout in ws-server.ts

### Performance Issues

**Problem:** Lag when updating circuits

**Solutions:**
1. Close other applications
2. Reduce number of active displays
3. Increase broadcast interval
4. Enable browser hardware acceleration

---

## Emergency Procedures

### If Server Goes Down
- Displays stay frozen on last state
- Reconnection attempts every 3 seconds
- Restart server to resume service
- Estimate: 5-10 minute recovery

### If Control Screen Lost
- Display can be controlled locally via browser
- Open `http://display-ip:8080` directly
- Use keyboard/mouse until control restored

### If All Network Lost
- Displays show last known state (frozen)
- No synchronization possible
- Restart all when network restored

---

## Support & Reporting

### Error Reporting Template

When reporting issues:
```
**Symptom:** [What's not working]
**When:** [Date/Time it started]
**Affected:** [Display/Control screen]
**Environment:** [Scenario A/B/C]
**Server IP:** [If applicable]
**Error Message:** [From console]
**Steps to Reproduce:** [How to trigger]
```

---

## Conclusion

The museum circuit display system is designed to be robust and easy to maintain. Following this deployment guide ensures a successful installation that provides years of reliable educational service.

For questions or issues, refer to MUSEUM_SETUP.md and QUICKSTART.md for additional documentation.
