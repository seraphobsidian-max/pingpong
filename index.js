const fs = require("fs");
const login = require("ws3-fca");

// Binabasa ang appstate.json para maka-login
const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

login({ appState: appState }, (err, api) => {
    if (err) {
        console.error("❌ May error sa pag-login. Check mo ang appstate.json mo.");
        return console.error(err);
    }

    console.log("✅ Bot is now online and listening to messages!");

    // Set options para makatanggap ng events
    api.setOptions({ listenEvents: true, selfListen: false });

    // Nakikinig sa mga incoming messages
    api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        // Kapag may nag-message
        if (event.type === "message") {
            const message = event.body.toLowerCase();
            const threadID = event.threadID;

            // Auto-reply commands
            if (message === "hello") {
                api.sendMessage("Hello! 👋 Ako ay isang auto-bot. Paano kita matutulungan?", threadID);
            } 
            
            else if (message === "ping") {
                api.sendMessage("Pong! 🏓 Active ang bot.", threadID);
            }
        }
    });
});
