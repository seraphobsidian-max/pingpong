// --- HELP COMMAND ---
            if (command === "help") {
                const helpText = 
`🤖 ═══ ZARK BOTZ HELP MENU ═══ 🤖

💰 ── [ ECONOMY & GAMES ] ── 💰
• !bal - Tignan ang iyong pera, exp, at level sa wallet.
• !coinflip [taya] [head/tail] - Maglaro ng coin toss.
• !slot [taya] - Subukan ang swerte sa slot machine.
• !topmoney - Tingnan ang Top 5 pinakamayaman sa bot.

🛠️ ── [ ADMIN & GC TOOLS ] ── 🛠️
• !setall [pangalan] - Palitan ang nickname ng lahat sa GC (Admin/Owner only).
• !addadmin [UID] - Magdagdag ng bagong bot admin (Owner only).

ℹ️ ── [ OTHER INFO ] ── ℹ️
• !help - Ipinapakita ang menu na ito.
• Taga-welcome: Awtomatikong bumabati sa mga bagong sali sa GC!

💡 Tip: Makipag-chat lang nang madalas para tumaas ang iyong Exp at Level!`;

                api.sendMessage(helpText, threadID);
            }
