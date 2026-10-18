class WorldRenderer {
    constructor() {
        this.layerScale = .72;
        this.farCanvas = document.createElement('canvas');
        this.midCanvas = document.createElement('canvas');
        this.farCtx = this.farCanvas.getContext('2d');
        this.midCtx = this.midCanvas.getContext('2d');
        this.resizeLayers();
    }
    resizeLayers() {
        const width = Math.max(1, Math.round(W * this.layerScale));
        const height = Math.max(1, Math.round(H * this.layerScale));
        for (const layer of [this.farCanvas, this.midCanvas]) {
            if (layer.width !== width || layer.height !== height) { layer.width = width; layer.height = height; }
        }
        this.scaleX = width / W;
        this.scaleY = height / H;
    }
    draw(ctx, biome, camY, altitude, elapsed) {
        if (this.farCanvas.width !== Math.max(1, Math.round(W * this.layerScale)) || this.farCanvas.height !== Math.max(1, Math.round(H * this.layerScale))) this.resizeLayers();
        for (const layer of [this.farCanvas, this.midCanvas]) {
            const layerCtx = layer === this.farCanvas ? this.farCtx : this.midCtx;
            layerCtx.setTransform(this.scaleX, 0, 0, this.scaleY, 0, 0);
            layerCtx.clearRect(0, 0, W, H);
        }
        this.drawFar(this.farCtx, biome, camY, altitude, elapsed);
        this.drawMiddle(this.midCtx, biome, camY, altitude, elapsed);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.filter = 'blur(1.35px)';
        ctx.drawImage(this.farCanvas, 0, 0, W, H);
        ctx.filter = 'blur(.65px)';
        ctx.globalAlpha = .82;
        ctx.drawImage(this.midCanvas, 0, 0, W, H);
        ctx.restore();
    }
    drawFar(ctx, biome, camY, altitude, elapsed) {
        const dusk = Math.max(0, Math.min(1, (altitude - 1450) / 900));
        const index = BIOMES.indexOf(biome), next = BIOMES[Math.min(index + 1, BIOMES.length - 1)];
        const transition = biome.maxH < 99999 ? Math.max(0, Math.min(1, (altitude - (biome.maxH - 120)) / 120)) : 0;
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, this.mixColor(biome.skyTop, next.skyTop, transition)); sky.addColorStop(1, this.mixColor(biome.skyBot, next.skyBot, transition)); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        const sunX = W * .78, sunY = H * .25 - ((camY * .035) % 180);
        ctx.fillStyle = `rgba(255,226,151,${.12 + dusk * .12})`; ctx.beginPath(); ctx.arc(sunX, sunY, 47, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = dusk > .6 ? '#ffbd75' : '#fff4b6'; ctx.beginPath(); ctx.arc(sunX, sunY, 23, 0, Math.PI * 2); ctx.fill();
        this.mountains(ctx, camY, 0.09, H * .49, '#84b8dc', 110, 0);
        this.mountains(ctx, camY, 0.17, H * .66, dusk > .45 ? '#885f78' : '#477fae', 88, 1);
        this.clouds(ctx, camY, elapsed, biome.cloudCol);
    }
    drawMiddle(ctx, biome, camY, altitude, elapsed) {
        const dusk = Math.max(0, Math.min(1, (altitude - 1450) / 900));
        this.waterfalls(ctx, camY, elapsed);
        this.mountains(ctx, camY, 0.29, H * .82, dusk > .5 ? '#493d66' : '#315c7b', 60, 2);
        if (altitude > 650 && altitude < 1350) this.weather(ctx, elapsed, 'rain');
        else if (altitude > 1450) this.weather(ctx, elapsed, 'snow');
        if (altitude > 950 && altitude < 1700) { ctx.fillStyle = 'rgba(237,176,92,.08)'; ctx.fillRect(0, 0, W, H); }
        if (altitude > 1750) { ctx.fillStyle = 'rgba(196,210,255,.08)'; ctx.fillRect(0, 0, W, H); }
    }
    mixColor(a, b, t) {
        const parse = value => [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
        const aa = parse(a), bb = parse(b);
        return `rgb(${aa.map((v, i) => Math.round(v + (bb[i] - v) * t)).join(',')})`;
    }
    weather(ctx, time, type) {
        ctx.fillStyle = type === 'snow' ? 'rgba(239,250,255,.66)' : 'rgba(202,235,255,.32)';
        for (let i = 0; i < 18; i++) {
            const x = (i * 83 + time * (type === 'snow' ? 12 : 45)) % W;
            const y = (i * 127 + time * (type === 'snow' ? 24 : 110)) % H;
            ctx.fillRect(x, y, type === 'snow' ? 2 : 1, type === 'snow' ? 3 : 8);
        }
    }
    mountains(ctx, camY, speed, base, color, height, layer) {
        const spacing = 240;
        const offset = (camY * speed) % spacing;
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
        for (let i = -1; i <= Math.ceil(W / spacing) + 1; i++) { const x = i * spacing - offset; const peakY = base - height * (.55 + ((i * 37 + layer * 19) % 43) / 60); ctx.lineTo(x, peakY); ctx.lineTo(x + 110, base + 28); }
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(14,42,68,.12)';
        for (let i = -1; i <= Math.ceil(W / spacing) + 1; i++) {
            const x = i * spacing - offset, peakY = base - height * (.55 + ((i * 37 + layer * 19) % 43) / 60);
            ctx.beginPath(); ctx.moveTo(x, peakY); ctx.lineTo(x + 110, base + 24); ctx.lineTo(x + 73, peakY + height * .32); ctx.closePath(); ctx.fill();
        }
        for (let i = 0; i < 6; i++) {
            const x = (i * 173 + 44 - offset * .7 + W * 2) % (W + 80) - 40;
            const y = base - height * (.58 + ((i * 7 + layer) % 4) * .09);
            ctx.fillStyle = 'rgba(219,240,255,.24)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 15, y + 26); ctx.lineTo(x + 29, y + 30); ctx.lineTo(x + 16, y + 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 15, y + 26); ctx.lineTo(x + 10, y + 20); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(15,44,75,.12)'; ctx.beginPath(); ctx.moveTo(x + 16, y + 12); ctx.lineTo(x + 29, y + 30); ctx.lineTo(x + 23, y + 28); ctx.closePath(); ctx.fill();
        }
    }
    waterfalls(ctx, camY, elapsed) {
        for (const [x, y, height] of [[W * .12, H * .47, H * .46], [W * .77, H * .58, H * .36]]) {
            const phase = (elapsed * 35 + camY * .4) % 20;
            ctx.fillStyle = 'rgba(72,198,244,.17)'; ctx.fillRect(x, y, 13, height);
            ctx.fillStyle = 'rgba(121,224,255,.5)'; ctx.fillRect(x + 3, y, 3, height);
            ctx.fillStyle = 'rgba(223,250,255,.55)';
            for (let k = -20; k < height; k += 23) ctx.fillRect(x + ((k / 23 | 0) % 2) * 5 + 5, y + ((k + phase + height) % height), 3, 8);
            ctx.fillStyle = 'rgba(170,240,255,.4)'; ctx.fillRect(x - 4, y + height - 2, 22, 3);
            ctx.fillStyle = 'rgba(77,194,238,.15)'; ctx.fillRect(x - 18, y + height + 3, 48, 9);
            ctx.fillStyle = 'rgba(212,249,255,.38)'; ctx.fillRect(x - 11 + ((phase / 4) | 0) % 7, y + height + 5, 15, 1); ctx.fillRect(x + 5 - ((phase / 5) | 0) % 8, y + height + 8, 12, 1);
        }
    }
    clouds(ctx, camY, elapsed, color) {
        for (let i = 0; i < 9; i++) {
            const x = ((i * 137 + elapsed * (2 + i % 3) - camY * .035) % (W + 90) + (W + 90)) % (W + 90) - 45;
            const y = ((i * 117 - camY * .13) % (H + 130) + (H + 130)) % (H + 130) - 65;
            const width = 48 + (i % 3) * 13;
            ctx.fillStyle = 'rgba(46,92,143,.12)';
            ctx.fillRect(x + 7, y + 9, width, 10); ctx.fillRect(x + 17, y + 4, width * .58, 7);
            ctx.fillStyle = color || 'rgba(255,255,255,.65)';
            ctx.fillRect(x, y + 4, width, 10); ctx.fillRect(x + 9, y - 2, width * .58, 9); ctx.fillRect(x + 18, y - 6, width * .32, 7);
            ctx.fillStyle = 'rgba(255,255,255,.28)';
            ctx.fillRect(x + 11, y + 2, width * .43, 2); ctx.fillRect(x + 20, y - 3, width * .2, 2);
        }
    }
}
