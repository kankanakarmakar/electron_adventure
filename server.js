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

// Initial States for all components
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
        voltage: 12,
        resistance: 10,
        forwardBias: true,
        threshold: 0.7
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
            // Merge states shallowly? Or deeply?
            // For simple structures standard merge is fine. 
            // For nested like values, we need to be careful if we send partial updates.
            // We'll assume the client sends what it wants to update.
            // If they send { values: { ... } }, it overwrites values. 
            // Better to handle partial deep merge or clients send full sub-objects.
            // For now, let's do shallow merge of top keys.
            // If client sends { values: { ...newValues } }, it replaces values.
            // If we want partial updates to values, we need custom logic or deep merge.

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
    console.log(`Socket.IO server running on port ${PORT} with namespaces: /resistor, /inductor, /capacitor, /diode`);
});
