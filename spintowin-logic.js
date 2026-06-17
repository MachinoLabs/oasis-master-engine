function initSpinGame() {
    if (!window.APP_DNA) return console.error("No DNA Found");
    var DNA = window.APP_DNA;
    var q = function(sel) { return document.querySelector(sel); };

    function normalizeTel(value){ var raw = String(value || "").trim(); if (!raw) return "#"; if (raw.indexOf("tel:") === 0) return raw; var digits = raw.replace(/[^\d+]/g, ""); return "tel:" + digits; }
    function escapeHtml(s){ var text = String(s || ""); text = text.split("&").join("&amp;"); text = text.split("<").join("&lt;"); text = text.split(">").join("&gt;"); text = text.split('"').join("&quot;"); return text.split("'").join("&#39;"); }
    function initialsFromName(name){ var matches = String(name || "").match(/\b\w/g) || []; return matches.slice(0,2).join("").toUpperCase() || "GO"; }
    function hexToRgb(hex){ var h = String(hex || "").replace("#",""); if(h.length !== 6) return {r:255,g:255,b:255}; return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }; }
    function mix(hexA, hexB, t){ var a = hexToRgb(hexA), b = hexToRgb(hexB); var r = Math.round(a.r + (b.r - a.r) * t); var g = Math.round(a.g + (b.g - a.g) * t); var bl = Math.round(a.b + (b.b - a.b) * t); return "rgb(" + r + "," + g + "," + bl + ")"; }
    function getCss(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

    (function applyDNA(){
        var branding = DNA.branding || {};
        document.documentElement.style.setProperty("--bg1", branding.bodyRadialStart || "#ffffff");
        document.documentElement.style.setProperty("--bg2", branding.bodyRadialEnd || "#f8f1f4");
        document.documentElement.style.setProperty("--primary", branding.primaryBackground || "#fefdfb");
        document.documentElement.style.setProperty("--accent", branding.accent || "#dedede");
        document.documentElement.style.setProperty("--accent2", branding.accentLight || "#f8f1f4");
        document.documentElement.style.setProperty("--text", branding.textColor || "#000000");
        document.title = (DNA.businessName || "Spin To Win") + " — " + (DNA.promotion && DNA.promotion.type ? DNA.promotion.type : "Promotion");
        if(q("#logoMark")) q("#logoMark").textContent = initialsFromName(DNA.businessName);
        if(q("#bizName")) q("#bizName").textContent = DNA.businessName || "";
        if(q("#tagline")) q("#tagline").textContent = DNA.tagline || "";
        if(DNA.promotion) {
            if(q("#eyebrowText")) q("#eyebrowText").textContent = DNA.promotion.eyebrow || "Exclusive Offer";
            if(q("#promoHeadline")) q("#promoHeadline").textContent = DNA.promotion.headline || "Spin To Win";
            if(q("#promoSubHeadline")) q("#promoSubHeadline").textContent = DNA.promotion.subHeadline || "";
        }
        if(DNA.wheel && q("#wheelCenterText")) q("#wheelCenterText").textContent = DNA.wheel.wheelCenterText || "SPIN";
        if(DNA.terms && q("#limitText")) q("#limitText").textContent = DNA.terms.limitText || "";
        if(DNA.callToAction && q("#spinBtn")) q("#spinBtn").textContent = DNA.callToAction.buttonText || "SPIN TO WIN";
        if(DNA.businessProfile && q("#bizDescription")) q("#bizDescription").textContent = DNA.businessProfile.description || "";

        var credRow = q("#credRow");
        if(credRow && DNA.businessProfile) {
            var chips = [ DNA.businessProfile.credibilityLine1, DNA.businessProfile.credibilityLine2, DNA.businessProfile.servicesHighlight ].filter(Boolean);
            credRow.innerHTML = chips.map(function(t) { return '<span class="chip">' + escapeHtml(t) + '</span>'; }).join("");
        }

        var prizeList = q("#prizeList");
        if (prizeList) {
            var selectedPrizeCount = (DNA.wheel && DNA.wheel.segments) ? DNA.wheel.segments : 8;
            var listPrizes = (DNA.prizes || []).slice(0, selectedPrizeCount);
            prizeList.innerHTML = listPrizes.map(function(p) { return "<li><strong>" + escapeHtml(p.amount) + "</strong> — " + escapeHtml(p.description) + "</li>"; }).join("");
        }

        var loc = DNA.location || {};
        if(q("#locLine")) q("#locLine").textContent = [loc.addressLine, loc.city, loc.state].filter(Boolean).join(" • ");
        if(q("#footerLine1")) q("#footerLine1").textContent = loc.footerLine1 || "";
        if(q("#footerLine2")) q("#footerLine2").textContent = loc.footerLine2 || "";

        if(q("#callBtn")) q("#callBtn").textContent = "CALL NOW";
        if(q("#callLink")) q("#callLink").href = normalizeTel((DNA.callToAction && (DNA.callToAction.phoneTel || DNA.callToAction.phoneDisplay)) ? (DNA.callToAction.phoneTel || DNA.callToAction.phoneDisplay) : "");

        if(q("#modalFooter1")) q("#modalFooter1").textContent = loc.footerLine1 || "";
        if(q("#modalFooter2")) q("#modalFooter2").textContent = loc.footerLine2 || "";
        if(q("#modalLimit")) q("#modalLimit").textContent = (DNA.terms && DNA.terms.limitText) ? DNA.terms.limitText : "";
        if(q("#screenshotNote")) q("#screenshotNote").style.display = (DNA.terms && DNA.terms.screenshotReminder) ? "" : "none";
    })();

    // Confetti Engine
    var confCanvas = q("#confetti");
    var cctx = confCanvas ? confCanvas.getContext("2d") : null;
    var confettiParts = []; var confettiActiveUntil = 0; var confettiRunning = false;
    function resizeConfetti(){
        if(!confCanvas || !cctx) return;
        var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        confCanvas.width = Math.floor(window.innerWidth * dpr); confCanvas.height = Math.floor(window.innerHeight * dpr);
        confCanvas.style.width = window.innerWidth + "px"; confCanvas.style.height = window.innerHeight + "px";
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resizeConfetti); resizeConfetti();

    function confettiBurst(multiplier){
        if(!confCanvas || !cctx || !DNA.confetti || !DNA.confetti.enabled) return;
        multiplier = multiplier || 1;
        var colors = DNA.confetti.colors || ["#FFD700", "#FF1493", "#00FFF0", "#FF00FF", "#39FF14", "#FFFFFF"];
        var count = 400 * Math.max(1, multiplier); var w = window.innerWidth; var h = window.innerHeight;
        for(var i=0; i !== count; i++){
            var angle = Math.random() * Math.PI * 2; var velocity = 10 + Math.random() * 30;
            confettiParts.push({ x: Math.random() * w, y: Math.random() * (h * 0.8), vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity - 10, g: 0.5 + Math.random() * 0.6, w: 8 + Math.random() * 12, h: 6 + Math.random() * 10, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 1.5, color: colors[Math.floor(Math.random() * colors.length)], life: 0, ttl: 120 + Math.random() * 80 });
        }
        confettiActiveUntil = performance.now() + (4000 + 500 * multiplier);
        if (!confettiRunning){ confettiRunning = true; requestAnimationFrame(confettiLoop); }
    }
    function confettiLoop(now){
        if(!cctx) return;
        cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (confettiParts.length){
            var next = [];
            for (var i=0; i !== confettiParts.length; i++){
                var p = confettiParts[i];
                p.life++; if (p.life === p.ttl || p.life > p.ttl) continue;
                p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
                cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.rot); cctx.fillStyle = p.color; cctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); cctx.restore(); next.push(p);
            }
            confettiParts = next;
        }
        if (confettiActiveUntil > now || confettiParts.length !== 0){ requestAnimationFrame(confettiLoop); } else { confettiRunning = false; cctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }

    // Wheel Engine
    var SEGMENT_COUNT = (DNA.wheel && DNA.wheel.segments) ? Number(DNA.wheel.segments) : 8;
    var prizes = (DNA.prizes || []).slice(0, SEGMENT_COUNT);

    // ==========================================
    // ⚡ LIVE PRIZE FETCHING
    // ==========================================
    async function loadLivePrizes() {
        try {
            var webAppUrl = "https://script.google.com/macros/s/AKfycbzQA-9G3XPnAjdeik1AM5S5TI8_0MzZdAxMmv3goqfvub2a9opd6HLK6t1o3e6hqLe7/exec";
            var response = await fetch(webAppUrl + "?niche=" + DNA.niche);
            var data = await response.json();
            
            if (data.status === "success" && data.prizes && data.prizes.length > 0) {
                prizes = data.prizes.slice(0, SEGMENT_COUNT); 
                var prizeList = q("#prizeList");
                if (prizeList) {
                    prizeList.innerHTML = prizes.map(function(p) { 
                        return "<li><strong>" + escapeHtml(p.amount) + "</strong> — " + escapeHtml(p.description) + "</li>"; 
                    }).join("");
                }
            }
        } catch (error) {
            console.log("Could not load live prizes, using fallback DNA.", error);
        }
    }
    loadLivePrizes(); // Fire fetch command immediately
    // ==========================================

    var wheelCanvas = q("#wheel");
    var wctx = wheelCanvas ? wheelCanvas.getContext("2d") : null;
    var pointerEl = q(".pointer");

    var rotation = 0; var spinning = false; var lastTickIndex = -1; var pointerAngle = -Math.PI / 2;

    function drawWheel(){
        if(!wheelCanvas || !wctx) return;
        var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        var cssSize = wheelCanvas.getBoundingClientRect().width || 460;
        var size = Math.round(cssSize * dpr);
        if (wheelCanvas.width !== size) wheelCanvas.width = size;
        if (wheelCanvas.height !== size) wheelCanvas.height = size;
        var cx = size / 2; var cy = size / 2; var radius = size * 0.48; var seg = (Math.PI * 2) / prizes.length;
        wctx.clearRect(0,0,size,size);
        var halo = wctx.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius * 1.1);
        halo.addColorStop(0, "rgba(255,255,255,.96)"); halo.addColorStop(1, "rgba(240,240,240,.35)");
        wctx.fillStyle = halo; wctx.beginPath(); wctx.arc(cx, cy, radius * 1.03, 0, Math.PI * 2); wctx.fill();
        wctx.lineWidth = radius * 0.08; wctx.strokeStyle = mix(getCss("--accent2"), getCss("--accent"), 0.35);
        wctx.beginPath(); wctx.arc(cx, cy, radius, 0, Math.PI * 2); wctx.stroke();
        var baseA = mix(getCss("--primary"), getCss("--accent"), 0.18); var baseB = mix("#ffffff", getCss("--accent2"), 0.74);
        for(var i=0; i !== prizes.length; i++){
            var start = rotation + i * seg; var end = start + seg;
            wctx.beginPath(); wctx.moveTo(cx, cy); wctx.arc(cx, cy, radius * 0.92, start, end); wctx.closePath();
            var grad = wctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
            if(i % 2 === 0){ grad.addColorStop(0, baseA); grad.addColorStop(1, mix(baseA, "#ffffff", 0.25)); }
            else { grad.addColorStop(0, baseB); grad.addColorStop(1, mix(baseB, getCss("--accent2"), 0.18)); }
            wctx.fillStyle = grad; wctx.fill();
            wctx.strokeStyle = "rgba(0,0,0,.08)"; wctx.lineWidth = Math.max(1, radius * 0.006); wctx.stroke();
            var p = prizes[i]; var amount = String(p.amount || ""); var desc = String(p.description || ""); var mid = start + seg / 2;
            wctx.save(); wctx.translate(cx, cy); wctx.rotate(mid);
            wctx.textAlign = "right"; wctx.fillStyle = "rgba(40,40,40,.96)"; wctx.font = "900 " + Math.max(13, radius * 0.072) + "px system-ui, sans-serif"; wctx.fillText(amount, radius * 0.82, -radius * 0.03);
            wctx.fillStyle = "rgba(70,70,70,.9)"; wctx.font = "800 " + Math.max(10, radius * 0.038) + "px system-ui, sans-serif";
            var clipped = desc.length > 18 ? desc.slice(0,18) + "…" : desc; wctx.fillText(clipped, radius * 0.82, radius * 0.08);
            wctx.restore();
        }
        wctx.beginPath(); wctx.arc(cx, cy, radius * 0.20, 0, Math.PI * 2); wctx.fillStyle = "rgba(255,255,255,.86)"; wctx.fill();
        requestAnimationFrame(drawWheel);
    }
    drawWheel();

    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
    function easeOutBack(t){ var c1 = 1.70158; return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
    function pickIndexWeighted(){ var total = prizes.reduce(function(a,b){return a + Math.max(0.1, Number(b.weight||1));},0); var r = Math.random() * total; for(var i=0; i<prizes.length; i++){ r -= Math.max(0.1, Number(prizes[i].weight||1)); if(r<=0) return i; } return prizes.length-1; }

    function spin(){
        if (spinning) return;
        spinning = true; var spinBtn = q("#spinBtn"); if(spinBtn) spinBtn.disabled = true; lastTickIndex = -1;
        var winnerIndex = pickIndexWeighted(); var seg = (Math.PI * 2) / prizes.length; var targetMod = pointerAngle - ((winnerIndex + 0.5) * seg);
        var fullTurns = (DNA.wheel && DNA.wheel.spinRotations ? Number(DNA.wheel.spinRotations) : 6) + Math.floor(Math.random() * 2);
        var duration = Math.max(3200, (DNA.wheel && DNA.wheel.spinDuration ? Number(DNA.wheel.spinDuration) : 5.5) * 1000);
        var startRot = rotation; var baseEnd = (fullTurns * Math.PI * 2) + targetMod;
        var overshootEnabled = (DNA.wheel && DNA.wheel.finalOvershoot !== undefined) ? !!DNA.wheel.finalOvershoot : true;
        var overshootEnd = baseEnd + (overshootEnabled ? (seg * 0.11) : 0);
        var startTime = performance.now(); var gateDropped = false; 

        function frame(now){
            var t = Math.min(1, (now - startTime) / duration);
            if (overshootEnabled){ 
                if (t < 0.88){ rotation = startRot + (overshootEnd - startRot) * easeOutCubic(t / 0.88); } 
                else { rotation = overshootEnd + (baseEnd - overshootEnd) * easeOutBack(Math.min(1, (t - 0.88) / 0.12)); } 
            } else { rotation = startRot + (baseEnd - startRot) * easeOutCubic(t); }

            if (DNA.wheel && DNA.wheel.pointerTick && pointerEl){
                var normalized = ((pointerAngle - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                var currentIndex = Math.floor(normalized / seg);
                if (currentIndex !== lastTickIndex){ lastTickIndex = currentIndex; pointerEl.classList.remove("tick"); void pointerEl.offsetWidth; pointerEl.classList.add("tick"); }
            }

            if (t > 0.75 && !gateDropped) {
                gateDropped = true; window.winningPrize = prizes[winnerIndex];
                if(typeof MachinoEngine !== 'undefined') { MachinoEngine.triggerLuckGame("Spin-To-Win", window.winningPrize.description, DNA.niche); } 
                else { console.error("MachinoEngine script not found!"); }
            }
            if (t < 1){ requestAnimationFrame(frame); return; }
            rotation = ((baseEnd % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
            spinning = false; if(spinBtn) spinBtn.disabled = false;
        }
        requestAnimationFrame(frame);
    }

    if(q("#spinBtn")) q("#spinBtn").addEventListener("click", spin);
    if(q(".wheelShell")) q(".wheelShell").addEventListener("click", spin);

    var modal = q("#modal");
    function openModal(prize){
        if(q("#winAmount")) q("#winAmount").textContent = prize.amount || "PRIZE"; 
        if(q("#winDesc")) q("#winDesc").textContent = prize.description || ""; 
        if(q("#winCode")) q("#winCode").textContent = prize.code || "CODE";
        if(q("#claimLine")) {
            var claimTpl = (DNA.callToAction && DNA.callToAction.claimLine) ? DNA.callToAction.claimLine : "Mention code {CODE} when booking!";
            q("#claimLine").textContent = claimTpl.replace("{CODE}", prize.code || "CODE");
        }
        if(DNA.confetti && DNA.confetti.burstOnWin) { confettiBurst(prize.bigWin ? Number(DNA.confetti.bigWinMultiplier || 3) : 1); }
        if(modal) modal.classList.add("show");
    }
    
    if(q("#closeModal")) q("#closeModal").addEventListener("click", function(){ if(modal) modal.classList.remove("show"); });
    if(modal) modal.addEventListener("click", function(e) { if (e.target === modal) modal.classList.remove("show"); });
    window.addEventListener('machinoLeadCaptured', function() { 
        var engineOverlay = q('.machino-overlay');
        if (engineOverlay) engineOverlay.style.display = 'none';
        openModal(window.winningPrize); 
    });

    // THEME & INFO MODAL LOGIC
    const themeBtn = q('#themeToggleBtn');
    if (themeBtn) {
        if (localStorage.getItem('spinTheme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeBtn.textContent = '☀️';
        }
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('spinTheme', 'dark');
                themeBtn.textContent = '☀️';
            } else {
                localStorage.setItem('spinTheme', 'light');
                themeBtn.textContent = '🌙';
            }
        });
    }

    const infoBtn = q("#infoBtn");
    const infoOverlay = q("#infoOverlay");
    const infoModal = q("#infoModal");
    const infoCloseBtn = q("#infoCloseBtn");
    const tabButtons = Array.from(document.querySelectorAll(".ml-info-tab"));
    const panels = Array.from(document.querySelectorAll(".ml-info-panel"));

    if (infoBtn && infoOverlay && infoModal) {
        function openInfo() { infoOverlay.hidden = false; infoModal.hidden = false; }
        function closeInfo() { infoOverlay.hidden = true; infoModal.hidden = true; }
        function setActiveTab(tabName) {
            tabButtons.forEach(btn => btn.classList.toggle("ml-info-tab-active", btn.dataset.tab === tabName));
            panels.forEach(panel => panel.hidden = (panel.dataset.panel !== tabName));
        }
        infoBtn.addEventListener("click", () => infoModal.hidden ? openInfo() : closeInfo());
        infoOverlay.addEventListener("click", closeInfo);
        infoCloseBtn.addEventListener("click", closeInfo);
        tabButtons.forEach(btn => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));
        document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !infoModal.hidden) closeInfo(); });
        setActiveTab("about");
    }
}

// THE BULLETPROOF LAUNCHER
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpinGame);
} else {
    initSpinGame(); 
}
