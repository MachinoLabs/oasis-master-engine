document.addEventListener("DOMContentLoaded", function() {
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
        document.documentElement.style.setProperty("--bg1", DNA.branding.bodyRadialStart || "#ffffff");
        document.documentElement.style.setProperty("--bg2", DNA.branding.bodyRadialEnd || "#f8f1f4");
        document.documentElement.style.setProperty("--primary", DNA.branding.primaryBackground || "#fefdfb");
        document.documentElement.style.setProperty("--accent", DNA.branding.accent || "#dedede");
        document.documentElement.style.setProperty("--accent2", DNA.branding.accentLight || "#f8f1f4");
        document.title = (DNA.businessName || "Promo") + " — " + (DNA.promotion.type || "Offer");
        q("#logoMark").textContent = initialsFromName(DNA.businessName);
        q("#bizName").textContent = DNA.businessName || "";
        q("#tagline").textContent = DNA.tagline || "";
        q("#eyebrowText").textContent = DNA.promotion.eyebrow || "Exclusive Offer";
        q("#promoHeadline").textContent = DNA.promotion.headline || "Spin To Win";
        q("#promoSubHeadline").textContent = DNA.promotion.subHeadline || "";
        q("#wheelCenterText").textContent = DNA.wheel.wheelCenterText || "SPIN";
        q("#limitText").textContent = DNA.terms.limitText || "";
        q("#spinBtn").textContent = DNA.callToAction.buttonText || "SPIN TO WIN";
        q("#bizDescription").textContent = DNA.businessProfile.description || "";
        
        var chips = [ DNA.businessProfile.credibilityLine1, DNA.businessProfile.credibilityLine2, DNA.businessProfile.servicesHighlight ].filter(Boolean);
        q("#credRow").innerHTML = chips.map(function(t) { return '<span class="chip">' + escapeHtml(t) + '</span>'; }).join("");
        
        var selectedPrizeCount = DNA.wheel.segments || 8;
        var listPrizes = (DNA.prizes || []).slice(0, selectedPrizeCount);
        q("#prizeList").innerHTML = listPrizes.map(function(p) { return "<li><strong>" + escapeHtml(p.amount) + "</strong> — " + escapeHtml(p.description) + "</li>"; }).join("");
        
        q("#locLine").textContent = [DNA.location.addressLine, DNA.location.city, DNA.location.state].filter(Boolean).join(" • ");
        q("#footerLine1").textContent = DNA.location.footerLine1 || "";
        q("#footerLine2").textContent = DNA.location.footerLine2 || "";
        q("#callBtn").textContent = "CALL NOW";
        q("#callLink").href = normalizeTel(DNA.callToAction.phoneTel || DNA.callToAction.phoneDisplay || "");
        q("#modalFooter1").textContent = DNA.location.footerLine1 || "";
        q("#modalFooter2").textContent = DNA.location.footerLine2 || "";
        q("#modalLimit").textContent = DNA.terms.limitText || "";
        q("#screenshotNote").style.display = DNA.terms.screenshotReminder ? "" : "none";
    })();

    var prizes = (DNA.prizes || []).slice(0, DNA.wheel.segments || 8);
    var wheelCanvas = q("#wheel");
    var wctx = wheelCanvas.getContext("2d");
    var pointerEl = q(".pointer");
    var rotation = 0; var spinning = false; var lastTickIndex = -1; var pointerAngle = -Math.PI / 2;

    function drawWheel(){
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
        for(var i=0; i < prizes.length; i++){
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
    function pickIndexWeighted(){ var total = prizes.reduce(function(a,b){return a + (b.weight||1);},0); var r = Math.random() * total; for(var i=0; i<prizes.length; i++){ r -= (prizes[i].weight||1); if(r<=0) return i; } return prizes.length-1; }

    function spin(){
        if (spinning) return;
        spinning = true; q("#spinBtn").disabled = true;
        var winnerIndex = pickIndexWeighted(); var seg = (Math.PI * 2) / prizes.length; var targetMod = pointerAngle - ((winnerIndex + 0.5) * seg);
        var fullTurns = 6 + Math.floor(Math.random() * 2); var duration = 5500;
        var startRot = rotation; var baseEnd = (fullTurns * Math.PI * 2) + targetMod;
        var overshootEnd = baseEnd + (seg * 0.11);
        var startTime = performance.now(); var gateDropped = false; 

        function frame(now){
            var t = Math.min(1, (now - startTime) / duration);
            if (t < 0.88) { rotation = startRot + (overshootEnd - startRot) * easeOutCubic(t / 0.88); } 
            else { rotation = overshootEnd + (baseEnd - overshootEnd) * easeOutBack(Math.min(1, (t - 0.88) / 0.12)); }
            
            var normalized = ((pointerAngle - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            var currentIndex = Math.floor(normalized / seg);
            if (currentIndex !== lastTickIndex){ lastTickIndex = currentIndex; pointerEl.classList.remove("tick"); void pointerEl.offsetWidth; pointerEl.classList.add("tick"); }

            if (t > 0.75 && !gateDropped) {
                gateDropped = true; window.winningPrize = prizes[winnerIndex];
                if(typeof MachinoEngine !== 'undefined') { MachinoEngine.triggerLuckGame("Spin-To-Win", window.winningPrize.description, DNA.niche); } 
            }
            if (t < 1){ requestAnimationFrame(frame); return; }
            rotation = ((baseEnd % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
            spinning = false; q("#spinBtn").disabled = false;
        }
        requestAnimationFrame(frame);
    }

    q("#spinBtn").addEventListener("click", spin);
    q(".wheelShell").addEventListener("click", spin);

    var modal = q("#modal");
    function openModal(prize){
        q("#winAmount").textContent = prize.amount; q("#winDesc").textContent = prize.description; q("#winCode").textContent = prize.code;
        q("#claimLine").textContent = "Mention code " + prize.code + " when booking!";
        modal.classList.add("show");
    }
    q("#closeModal").addEventListener("click", function(){ modal.classList.remove("show"); });
    window.addEventListener('machinoLeadCaptured', function() { openModal(window.winningPrize); });
});