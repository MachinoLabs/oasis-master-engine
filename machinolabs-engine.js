/**
 * 🚀 MACHINOLABS UNIVERSAL LEAD ENGINE (PHANTOM SYNC EDITION) 🚀
 * This script is 100% client agnostic. It dynamically accepts the niche
 * routing instructions directly from the game's DNA.
 */

const MachinoEngine = (function() {

    // ==========================================
    // 1. MASTER CONFIGURATION
    // ==========================================
    const CONFIG = {
        webhookUrl: "https://script.google.com/macros/s/AKfycbzQA-9G3XPnAjdeik1AM5S5TI8_0MzZdAxMmv3goqfvub2a9opd6HLK6t1o3e6hqLe7/exec",
        skillLevels: {
            "KIDS": [
                { minScore: 0,  maxScore: 19, prizeName: "Free Kids Drink" },
                { minScore: 20, maxScore: 99, prizeName: "Free Kids Ice Cream" }
            ],
            "TURBO_BLITZ": [
                { minScore: 0,  maxScore: 49, prizeName: "10% OFF Upsell" },
                { minScore: 50, maxScore: 99, prizeName: "Free High-Margin Item" },
                { minScore: 100, maxScore: 999, prizeName: "The Unicorn Prize" }
            ]
        }
    };

    let currentPrize = ""; let currentScore = "N/A"; let currentSource = "Unknown Game"; let currentNiche = "Unknown";

    // ==========================================
    // 2. AUTO-BUILD THE UI (Runs instantly)
    // ==========================================
    function injectUI() {
        const style = document.createElement('style');
        style.innerHTML = `
            .machino-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 9000; font-family: system-ui, -apple-system, sans-serif; }
            .machino-overlay.show { display: flex; animation: machinoFadeIn 0.3s ease-out; }
            .machino-modal { width: 100%; max-width: 360px; background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.14); padding: 26px 22px; text-align: center; }
            .dark-theme .machino-modal { background: #1a1a1a; border-color: rgba(255,255,255,0.1); }
            .machino-modal h3 { color: #222; font-size: 26px; font-weight: 900; margin: 0 0 8px; letter-spacing: -0.3px; }
            .dark-theme .machino-modal h3 { color: #fff; }
            .machino-modal p { color: #555; font-size: 14.5px; line-height: 1.45; margin-bottom: 16px; }
            .dark-theme .machino-modal p { color: #aaa; }
            .machino-highlight { color: #000; font-weight: 900; font-size: 18px; display: block; margin: 12px 0 16px; padding: 12px; background: #f8f1f4; border-radius: 14px; border: 1px dashed rgba(0,0,0,0.1); }
            .dark-theme .machino-highlight { background: #2a2528; color: #fff; border-color: rgba(255,255,255,0.2); }
            .machino-modal input { width: 100%; box-sizing: border-box; border: 1px solid rgba(0,0,0, 0.12); border-radius: 14px; padding: 14px; font-size: 16px; margin-bottom: 10px; outline: none; background: #fff; color: #000; transition: border-color 0.2s ease; }
            .dark-theme .machino-modal input { background: #222; color: #fff; border-color: rgba(255,255,255,0.1); }
            .machino-modal input:focus { border-color: #555; }
            .machino-btn { width: 100%; border: none; cursor: pointer; background: linear-gradient(180deg, #ffffff, #f8f1f4); color: #222; padding: 16px; border-radius: 16px; font-weight: 900; font-size: 15px; box-shadow: 0 12px 24px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06); text-transform: uppercase; margin-top: 6px; transition: transform 0.1s ease; }
            .dark-theme .machino-btn { background: linear-gradient(180deg, #333, #222); color: #fff; border-color: rgba(255,255,255,0.1); }
            .machino-btn:active { transform: translateY(1px) scale(0.98); }
            .machino-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .machino-status { min-height: 18px; color: #666; font-size: 13px; margin-top: 12px; font-weight: 600; }
            @keyframes machinoFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        `;
        document.head.appendChild(style);

        const overlayHTML = `
            <div class="machino-overlay" id="machino-overlay">
                <div class="machino-modal">
                    <h3 id="machino-headline">GAME OVER</h3>
                    <p id="machino-subtext">Enter your info to secure your prize.</p>
                    <span class="machino-highlight" id="machino-prize-display"></span>
                    <form id="machino-lead-form">
                        <input type="text" id="machino-name" placeholder="Your Name" required>
                        <input type="email" id="machino-email" placeholder="Email Address" required>
                        <input type="tel" id="machino-phone" placeholder="Phone Number (Optional)">
                        <button type="submit" class="machino-btn" id="machino-unlock-btn">CLAIM MY PRIZE</button>
                        <p class="machino-status" id="machino-status"></p>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlayHTML);

        document.getElementById('machino-lead-form').addEventListener('submit', handleFormSubmit);

        // Auto-Formatting Phone Listener
        document.getElementById('machino-phone').addEventListener('input', function(e) {
            let x = e.target.value.replace(/\D/g, ''); 
            if (x.length === 0) { e.target.value = ''; return; }
            if (x.charAt(0) !== '1') { x = '1' + x; } 
            x = x.substring(0, 11); 
            let formatted = "+1 ";
            if (x.length > 1) { formatted += "(" + x.substring(1, 4); }
            if (x.length >= 5) { formatted += ") " + x.substring(4, 7); }
            if (x.length >= 8) { formatted += "-" + x.substring(7, 11); }
            e.target.value = formatted;
        });
    }

    // ==========================================
    // 3. THE WEBHOOK LOGIC
    // ==========================================
    async function handleFormSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('machino-unlock-btn');
        const statusText = document.getElementById('machino-status');
        
        btn.disabled = true; btn.innerText = "SECURING..."; statusText.innerText = "Connecting to database...";

        const payload = {
            name: document.getElementById('machino-name').value,
            email: document.getElementById('machino-email').value,
            phone: document.getElementById('machino-phone').value || "N/A",
            source: currentSource, score: currentScore, niche: currentNiche, prize: currentPrize
        };

        try {
            await fetch(CONFIG.webhookUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
            statusText.innerText = "Success! Redirecting...";
            setTimeout(() => {
                document.getElementById('machino-overlay').classList.remove('show');
                window.dispatchEvent(new CustomEvent('machinoLeadCaptured', { detail: payload }));
            }, 800);
        } catch (error) {
            console.error("Machino Engine Transmission Error:", error);
            statusText.innerText = "Connection blocked. Please try again.";
            btn.disabled = false; btn.innerText = "CLAIM MY PRIZE";
        }
    }

    window.addEventListener('DOMContentLoaded', injectUI);

    // ==========================================
    // 4. PHANTOM SYNC 2.0 (The Ghost Updater)
    // ==========================================
    const LOCAL_VERSION = "v1"; // Matches your version.txt
    
    async function checkPhantomSync() {
        try {
            // Append a timestamp to the URL so the browser doesn't pull a cached version.txt
            const response = await fetch("https://oasis-master-engine.pages.dev/version.txt?t=" + Date.now());
            const liveVersion = (await response.text()).trim();
            
            if (liveVersion && liveVersion !== LOCAL_VERSION) {
                console.log("⚡ Phantom Sync: New version detected (" + liveVersion + "). Waiting in shadows...");
                
                if (document.visibilityState === 'hidden') {
                    window.location.reload(true);
                } else {
                    document.addEventListener('visibilitychange', function() {
                        if (document.visibilityState === 'hidden') {
                            console.log("⚡ Phantom Sync: Target lost focus. Executing reload.");
                            window.location.reload(true);
                        }
                    });
                }
            }
        } catch (e) { /* Fail silently if offline */ }
    }
    
    // Check for updates 2.5 seconds after load so it doesn't slow down the wheel graphic
    setTimeout(checkPhantomSync, 2500);

    // ==========================================
    // 5. THE PUBLIC API
    // ==========================================
    return {
        triggerLuckGame: function(gameName, prizeWon, clientNiche) {
            currentSource = gameName; currentPrize = prizeWon; currentScore = "N/A"; currentNiche = clientNiche || "Unknown"; 
            document.getElementById('machino-headline').innerText = "YOU WON!";
            document.getElementById('machino-subtext').innerText = "Enter your info to secure your prize.";
            document.getElementById('machino-prize-display').innerText = prizeWon;
            document.getElementById('machino-overlay').classList.add('show');
        },
        triggerSkillGame: function(gameName, finalScore, currentLevel, clientNiche) {
            currentSource = gameName; currentScore = finalScore; currentNiche = clientNiche || "Unknown"; 
            let unlockedPrize = "Thanks for playing!"; let prizeBucket = CONFIG.skillLevels[currentLevel];
            if (prizeBucket) {
                for (let i = 0; i < prizeBucket.length; i++) {
                    if (finalScore >= prizeBucket[i].minScore && finalScore <= prizeBucket[i].maxScore) {
                        unlockedPrize = prizeBucket[i].prizeName; break;
                    }
                }
            }
            currentPrize = unlockedPrize;
            document.getElementById('machino-headline').innerText = "GAME OVER";
            document.getElementById('machino-subtext').innerText = `You scored ${finalScore} points!`;
            document.getElementById('machino-prize-display').innerText = `Unlocked: ${currentPrize}`;
            document.getElementById('machino-overlay').classList.add('show');
        }
    };
})();
