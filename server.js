import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Navigation state for dual-screen sync
let navigationState = {
    component: 'home' // 'home', 'resistor', 'capacitor', 'inductor', 'diode'
};

// Navigation namespace for Display <-> Control sync
const navigationNsp = io.of('/navigation');

navigationNsp.on('connection', (socket) => {
    console.log(`[Navigation] User connected: ${socket.id}`);

    // Send current navigation state to new connection
    socket.emit('currentState', navigationState);

    // Handle navigation request
    socket.on('navigate', (component) => {
        console.log(`[Navigation] Navigate to: ${component}`);
        navigationState.component = component;
        // Broadcast to ALL clients including sender
        navigationNsp.emit('navigate', component);
    });

    // Handle state request
    socket.on('requestState', () => {
        socket.emit('currentState', navigationState);
    });

    socket.on('disconnect', () => {
        console.log(`[Navigation] User disconnected: ${socket.id}`);
    });
});

// Initial States for all components (for individual component controls)
const states = {
    resistor: {
        mode: 'simple',
        values: {
            voltage: 12,
            r1: 10,
            r2: 20
        }
    },
    inductor: {
        mode: 'simple', // 'simple', 'series', 'parallel'
        values: {
            voltage: 12,
            l1: 10,  // mH
            l2: 20,  // mH
            currentRate: 5 // A/s
        },
        currentDirection: 'forward',
        currentOn: true
    },
    capacitor: {
        mode: 'simple', // 'simple', 'series', 'parallel'
        voltage: 9,
        capacitance: 100, // uF
        capacitance2: 200,
        capacitance3: 150,
        stage: 'initial' // 'initial', 'connecting', 'charging', 'charged', 'disconnecting', 'discharge', 'discharged'
    },
    diode: {
        tab: 'intro', // 'intro', 'forward', 'reverse', 'breakdown'
        intro: {
            joined: false
        },
        forward: {
            voltage: 0
        },
        reverse: {
            voltage: 0
        },
        breakdown: {
            voltage: 0,
            type: 'zener' // 'zener', 'avalanche'
        }
    }
};

// Create a namespace for each component
['resistor', 'inductor', 'capacitor', 'diode'].forEach((component) => {
    const nsp = io.of(`/${component}`);

    nsp.on('connection', (socket) => {
        console.log(`User connected to ${component} namespace`);

        // Send current state for this component
        socket.emit('initialState', states[component]);

        socket.on('updateState', (newState) => {
            // Custom merge for known nested objects
            if (newState.values && states[component].values) {
                states[component] = {
                    ...states[component],
                    ...newState,
                    values: { ...states[component].values, ...newState.values }
                };
            } else {
                states[component] = { ...states[component], ...newState };
            }

            // Broadcast to all clients in this namespace
            nsp.emit('stateUpdated', states[component]);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected from ${component}`);
        });
    });
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`\n============================================`);
    console.log(`   ELECTRON ADVENTURES - SYNC SERVER`);
    console.log(`============================================`);
    console.log(`Socket.IO server running on port ${PORT}`);
    console.log(`\nNamespaces:`);
    console.log(`  /navigation - Display <-> Control sync`);
    console.log(`  /resistor   - Resistor state sync`);
    console.log(`  /capacitor  - Capacitor state sync`);
    console.log(`  /inductor   - Inductor state sync`);
    console.log(`  /diode      - Diode state sync`);
    console.log(`============================================\n`);
});
