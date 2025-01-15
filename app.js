const express = require('express');
const cors = require('cors');
const ngrok = require('ngrok');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Set port and Ngrok auth token directly
const PORT = 4000; // You can change this to your desired port
const NGROK_AUTH_TOKEN = '2q6sTwP7x8DGGdUElKiUcDyGeds_4f6EHDrtuviG476E52f7f';

// Database Connection
require('./db doc/atlas_conn');

// Routes
const router = require('./router/router');
app.use(router);

// Start Server
app.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);

    try {
        // Connect Ngrok with static domain
        const url = await ngrok.connect({
            addr: PORT,
            domain: 'ultimate-caiman-enormously.ngrok-free.app', // Static domain
            authtoken: NGROK_AUTH_TOKEN, // Ngrok auth token
        });
        console.log(`Public URL: ${url}`);
    } catch (error) {
        console.error('Error connecting to Ngrok:', error.message);
    }
});
