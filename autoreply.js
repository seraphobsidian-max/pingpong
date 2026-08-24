const login = require("ws3-fca");
const fs = require("fs");

// 📌 ILAGAY DITO ANG MGA TARGET THREAD IDs MO
// Pwede itong Group Chat ID o User ID ng ka-chat mo
const targetThreads = ["123456789012345", "987654321098765"]; 

// Kunin ang cookies mula sa appstate.json
const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

login({ appState: appState }, (err, api) => {
    if (err) {
        return console.error("❌ Login Error:", err);
    }

    console.log("✅ Bot is online! Nakikinig lang sa mga target threads...");
    api.setOptions({ listenEvents: true, selfListen: false });

    // Pakinggan ang mga incoming messages
    api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        // Kapag may pumasok na text message
        if (event.type === "message") {
            const threadID = event.threadID;
            const message = event.body.toLowerCase();

            // 🎯 I-CHECK KUNG ANG THREAD ID AY NASA LISTAHAN NATIN
            if (targetThreads.includes(threadID)) {
                
                // --- AUTO-REPLY COMMANDS PARA SA TARGET THREADS ---
                if (message === "ping") {
                    api.sendMessage("Pong! 🏓 Active ang bot sa thread na ito.", threadID);
                } 
                else if (message === "info") {
                    api.sendMessage(`Hello! Ang Thread ID ng chat na ito ay: ${threadID}`, threadID);
                }

            } else {
                // I-log sa terminal kapag may nag-message sa ibang thread na hindi target
                console.log(`[IGNORED] May nag-chat sa hindi target na thread: ${threadID}`);
            }
        }
    });
});
