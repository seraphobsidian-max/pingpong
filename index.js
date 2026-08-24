const login = require("ws3-fca");
const fs = require("fs");

const DB_FILE = "database.json";
let db = { users: {}, admins: ["100012345678901"] }; // Ilagay ang main owner UID mo dito

if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
} else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const PREFIX = "!";
const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

login({ appState: appState }, (err, api) => {
    if (err) return console.error("❌ Login Error:", err);

    console.log("✅ All-in-One Bot with Set All Nicknames is online!");
    api.setOptions({ listenEvents: true, selfListen: false });

    api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        // 1. WELCOME EVENT
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants;
            
            addedParticipants.forEach(newMember => {
                const name = newMember.fullName || "Kaibigan";
                api.sendMessage(`🎉 Welcome sa GC, ${name}! Enjoy ka rito at mag-ingat. Huwag kalimutang i-type ang !help para sa mga commands.`, threadID);
            });
            return;
        }

        // 2. MESSAGES AT COMMANDS
        if (event.type === "message") {
            const threadID = event.threadID;
            const senderID = event.senderID;
            const body = event.body ? event.body.trim() : "";

            // --- EXP & CURRENCY SYSTEM ---
            if (!db.users[senderID]) {
                db.users[senderID] = { money: 100, exp: 0, level: 1 };
            }
            db.users[senderID].exp += 10;
            db.users[senderID].money += 1; 

            let currentExp = db.users[senderID].exp;
            let currentLevel = db.users[senderID].level;
            if (currentExp >= currentLevel * 100) {
                db.users[senderID].level += 1;
                api.sendMessage(`✨ Congrats! Nag-level up ka sa Level ${db.users[senderID].level}!`, threadID);
            }
            saveDB();

            if (!body.startsWith(PREFIX)) return;

            const args = body.slice(PREFIX.length).trim().split(" ");
            const command = args[0].toLowerCase();

            // --- HELP COMMAND ---
            if (command === "help") {
                const helpText = 
`🤖 --- ZARK BOTZ COMMANDS --- 🤖
1. ${PREFIX}bal - Tignan ang Pera at Exp
2. ${PREFIX}coinflip [taya] [head/tail] - Coin Flip game
3. ${PREFIX}slot [taya] - Slot Machine game
4. ${PREFIX}topmoney - Leaderboard ng pinakamayaman
5. ${PREFIX}setall [bagong pangalan] - Palitan ang nickname ng lahat sa GC (Admin/Owner only)
6. ${PREFIX}addadmin [UID] - Magdagdag ng Bot Admin (Owner only)
7. ${PREFIX}help - Ipakita ang menu na ito`;
                api.sendMessage(helpText, threadID);
            }

            // --- BALANCE COMMAND ---
            else if (command === "bal" || command === "wallet") {
                const user = db.users[senderID];
                api.sendMessage(`💰 Wallet Balance:\n- Pera: $${user.money}\n- Exp: ${user.exp}\n- Level: ${user.level}`, threadID);
            }

            // --- COIN FLIP COMMAND ---
            else if (command === "coinflip" || command === "cf") {
                let bet = parseInt(args[1]);
                let choice = args[2] ? args[2].toLowerCase() : "";

                if (isNaN(bet) || bet <= 0) return api.sendMessage("⚠️ Maglagay ng tamang halaga! Halimbawa: !coinflip 50 head", threadID);
                if (choice !== "head" && choice !== "tail") return api.sendMessage("⚠️ Mamili sa 'head' o 'tail'. Halimbawa: !coinflip 50 head", threadID);
                if (db.users[senderID].money < bet) return api.sendMessage("❌ Kulang ang pera mo sa wallet!", threadID);

                let result = Math.random() < 0.5 ? "head" : "tail";
                if (choice === result) {
                    db.users[senderID].money += bet;
                    api.sendMessage(`🪙 Lumabas ay: **${result.toUpperCase()}**!\n🎉 Panalo ka! Nanalo ka ng $${bet}.`, threadID);
                } else {
                    db.users[senderID].money -= bet;
                    api.sendMessage(`🪙 Lumabas ay: **${result.toUpperCase()}**!\n😢 Natalo ka at nabawasan ng $${bet}.`, threadID);
                }
                saveDB();
            }

            // --- SLOT MACHINE COMMAND ---
            else if (command === "slot" || command === "slots") {
                let bet = parseInt(args[1]);
                if (isNaN(bet) || bet <= 0) return api.sendMessage("⚠️ Maglagay ng tamang taya! Halimbawa: !slot 50", threadID);
                if (db.users[senderID].money < bet) return api.sendMessage("❌ Kulang ang pera mo sa wallet!", threadID);

                const symbols = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎"];
                let s1 = symbols[Math.floor(Math.random() * symbols.length)];
                let s2 = symbols[Math.floor(Math.random() * symbols.length)];
                let s3 = symbols[Math.floor(Math.random() * symbols.length)];

                let slotDisplay = `[ ${s1} | ${s2} | ${s3} ]`;

                if (s1 === s2 && s2 === s3) {
                    let winnings = bet * 5;
                    db.users[senderID].money += winnings;
                    api.sendMessage(`${slotDisplay}\n🎉 JACKPOT! Nanalo ka ng $${winnings}!`, threadID);
                } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                    let winnings = Math.floor(bet * 1.5);
                    db.users[senderID].money += winnings;
                    api.sendMessage(`${slotDisplay}\n✨ Nice! Dalawa ang nag-match. Nanalo ka ng $${winnings}!`, threadID);
                } else {
                    db.users[senderID].money -= bet;
                    api.sendMessage(`${slotDisplay}\n😢 Walang nag-match. Natalo ka ng $${bet}.`, threadID);
                }
                saveDB();
            }

            // --- TOP MONEY LEADERBOARD ---
            else if (command === "topmoney" || command === "richest") {
                let sortedUsers = Object.entries(db.users)
                    .sort((a, b) => b[1].money - a[1].money)
                    .slice(0, 5);

                let msg = "🏆 --- TOP 5 PINAKAMAYAMAN --- 🏆\n";
                let rank = 1;
                for (let [uid, data] of sortedUsers) {
                    msg += `${rank}. UID: ${uid.slice(0, 5)}... - $${data.money} (Lvl ${data.level})\n`;
                    rank++;
                }
                api.sendMessage(msg, threadID);
            }

            // --- SET ALL NICKNAMES COMMAND ---
            else if (command === "setall") {
                // I-check kung Bot Admin o Owner ang nag-command
                if (!db.admins.includes(senderID)) {
                    return api.sendMessage("❌ Pasensya na, tanging Bot Admins at Owner lang ang pwedeng gumamit nito.", threadID);
                }

                // Kunin ang buong text matapos ang !setall command bilang bagong nickname
                let newNickname = args.slice(1).join(" ");
                if (!newNickname) return api.sendMessage("⚠️ Maglagay ng bagong pangalan. Halimbawa: !setall Gwapo Ko", threadID);

                // Kunin ang impormasyon ng GC para malista ang lahat ng miyembro
                api.getThreadInfo(threadID, (err, info) => {
                    if (err) return console.error("Error sa pagkuha ng GC info:", err);

                    api.sendMessage(`⏳ Sinasimulan nang palitan ang nickname ng lahat sa GC na: "${newNickname}"...`, threadID);

                    // Isa-isang palitan ang nickname ng mga miyembro
                    info.participantIDs.forEach(participantID => {
                        api.changeNickname(newNickname, threadID, participantID, (err) => {
                            if (err) {
                                // Minsan nagkakaroon ng error kung ang bot ay walang karapatan o naka-block
                                console.log(`Hindi mapalitan ang nickname ni ${participantID}`);
                            }
                        });
                    });

                    setTimeout(() => {
                        api.sendMessage("✅ Tapos na! Na-update na ang mga nicknames sa GC.", threadID);
                    }, 3000);
                });
            }

            // --- ADD ADMIN COMMAND (Owner Only) ---
            else if (command === "addadmin") {
                if (!db.admins.includes(senderID)) {
                    return api.sendMessage("❌ Bot Owner lang ang pwedeng magdagdag ng admin.", threadID);
                }
                let newAdminUID = args[1];
                if (!newAdminUID) return api.sendMessage("⚠️ Ilagay ang UID. Halimbawa: !addadmin 1000xxxxxx", threadID);

                if (!db.admins.includes(newAdminUID)) {
                    db.admins.push(newAdminUID);
                    saveDB();
                    api.sendMessage(`✅ Naidagdag na ang UID ${newAdminUID} bilang Bot Admin!`, threadID);
                } else {
                    api.sendMessage("ℹ️ Ang UID na ito ay admin na dati.", threadID);
                }
            }
        }
    });
});
