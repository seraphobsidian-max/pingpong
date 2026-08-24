const express = require('express');
const login = require('ws3-fca');
const path = require('path');

const app = express();
app.use(express.json());
// I-serve ang index.html na nasa loob ng "public" folder
app.use(express.static(path.join(__dirname, 'public'))); 

let botStatus = "Offline 🔴";

// Tumanggap ng appstate mula sa dashboard
app.post('/start-bot', (req, res) => {
    let appState;
    try {
        appState = JSON.parse(req.body.appState);
        botStatus = "Logging in... ⏳";
        res.json({ message: "Sinisimulan na ang bot..." });
    } catch (e) {
        botStatus = "Invalid Cookie Format ❌";
        return res.status(400).json({ message: "Mali ang format ng cookie." });
    }

    // Patakbuhin ang ws3-fca
    login({ appState: appState }, (err, api) => {
        if (err) {
            botStatus = "Error sa Login ❌";
            return console.error("Login Error:", err);
        }
        botStatus = "Online and Active ✅";
        api.setOptions({ listenEvents: true, selfListen: false });
        
        api.listenMqtt((err, event) => {
            if (err) {
                botStatus = "Disconnected ⚠️";
                return;
            }
            // Pwede mong ilagay ang auto-reply logic mo dito
        });
    });
});

// Listener endpoint para sa dashboard
app.get('/status', (req, res) => {
    res.json({ status: botStatus });
});

app.listen(3000, () => {
    console.log('✅ Dashboard running at http://localhost:3000');
});
