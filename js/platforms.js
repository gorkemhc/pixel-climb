// 2.5D SHADED FLOATING ISLAND PLATFORMS (Image 1 Faithful Quality)
const PLAT_NORMAL = 1;
const PLAT_MOVING = 2;
const PLAT_CRUMBLE = 3;
const PLAT_ICE = 4;
const PLAT_SPRING = 5;

class Platform {
    constructor(x, y, w, type = PLAT_NORMAL) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = 28; // Taller depth for 2.5D stone block faces
        this.type = type;
        this.vx = type === PLAT_MOVING ? (Math.random() < 0.5 ? 2.1 : -2.1) : 0;
        this.minX = 42;
        this.maxX = W - 42 - this.w;

        this.stepped = false;
        this.scored = false;
        this.crumbleTimer = 38;
        this.shaking = 0;
        this.isBroken = false;
        this.springAnim = 0;

        this.hasCoin = false;
        this.hasCrate = false;
        this.hasSpikes = false;
        this.hasJetpack = false; // Rare Jetpack on platform
        let seed = (Math.floor(x * 13 + y * 7 + w * 3) >>> 0) || 1;
        const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        this.surfaceDetails = Array.from({ length: Math.max(5, Math.floor(w / 12)) }, () => ({ x: Math.floor(rand() * Math.max(1, w - 6)), h: 2 + Math.floor(rand() * 5), flower: rand() > .84 }));
        this.stoneDetails = Array.from({ length: Math.max(4, Math.floor(w / 25)) }, () => ({
            x: Math.floor(rand() * Math.max(1, w - 34)), y: 10 + Math.floor(rand() * 10),
            w: 15 + Math.floor(rand() * 19), h: 6 + Math.floor(rand() * 6),
            tone: Math.floor(rand() * 3), seam: rand() > .45
        }));
    }

    update() {
        if (this.type === PLAT_MOVING) {
            this.x += this.vx;
            if (this.x <= this.minX) {
                this.x = this.minX;
                this.vx *= -1;
            } else if (this.x >= this.maxX) {
                this.x = this.maxX;
                this.vx *= -1;
            }
        }

        if (this.type === PLAT_CRUMBLE && this.stepped) {
            this.crumbleTimer--;
            this.shaking = (Math.random() - 0.5) * 4;
            if (this.crumbleTimer <= 0 && !this.isBroken) {
                this.isBroken = true;
                for (let i = 0; i < 12; i++) {
                    game.particles.push(new Particle(
                        this.x + Math.random() * this.w, this.y + Math.random() * this.h,
                        (Math.random() - 0.5) * 4, Math.random() * 3,
                        '#5d4037', 4, 30
                    ));
                }
            }
        }

        if (this.springAnim > 0) this.springAnim--;
    }

    draw(ctx, camY, biome) {
        if (this.isBroken) return;
        const px = Math.floor(this.x + this.shaking);
        const py = Math.floor(this.y - camY);

        if (this.type === PLAT_ICE) {
            // 2.5D Translucent Ice Platform
            ctx.fillStyle = '#80deea';
            ctx.fillRect(px, py, this.w, 8);
            ctx.fillStyle = '#e0f7fa';
            ctx.fillRect(px, py, this.w, 2); // Highlight
            ctx.fillStyle = '#00acc1';
            ctx.fillRect(px, py + 8, this.w, 16);
            ctx.fillStyle = '#00838f';
            ctx.fillRect(px, py + 20, this.w, 8); // Shadow base
            // 3D Icicles
            ctx.fillStyle = '#e0f7fa';
            for (let i = 6; i < this.w - 6; i += 14) {
                ctx.beginPath();
                ctx.moveTo(px + i, py + 26);
                ctx.lineTo(px + i + 4, py + 34);
                ctx.lineTo(px + i + 8, py + 26);
                ctx.fill();
            }
        } else if (this.type === PLAT_CRUMBLE) {
            // 2.5D Cracked Stone Island
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(px, py, this.w, 8);
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(px, py + 8, this.w, 14);
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(px + 4, py + 20, this.w - 8, 8);
            // Cracks
            ctx.fillStyle = '#1b0000';
            ctx.fillRect(px + this.w * 0.3, py + 2, 2, 14);
            ctx.fillRect(px + this.w * 0.65, py + 6, 3, 16);
        } else {
            // --- 2.5D LUSH FLOATING ISLAND (Image 1 Precision) ---
            // 1. Top Grass Layer with Sun Highlight & Drooping Overhangs
            ctx.fillStyle = '#a5d6a7'; // Bright edge rim
            ctx.fillRect(px, py, this.w, 2);
            const isSnow = biome.name === 'Kar', isAutumn = biome.name === 'Harabeler';
            ctx.fillStyle = isSnow ? '#dff7ff' : isAutumn ? '#c6883d' : biome.grassCol || '#4caf50'; // Region surface
            ctx.fillRect(px, py + 2, this.w, 6);

            // Scalloped pixel grass fringes drooping down
            ctx.fillStyle = isSnow ? '#8fc9d6' : isAutumn ? '#844f2e' : '#2e7d32'; // Deep surface edge
            for (let i = 2; i < this.w - 2; i += 6) {
                ctx.fillRect(px + i, py + 8, 4, 3);
            }
            for (const d of this.surfaceDetails) {
                ctx.fillStyle = isSnow ? '#f7ffff' : isAutumn ? '#e8b650' : '#80cf62';
                ctx.fillRect(px + d.x, py + 1 - d.h, d.flower ? 2 : 1, d.h);
                if (d.flower) { ctx.fillStyle = isSnow ? '#a3e9ff' : '#ffe08a'; ctx.fillRect(px + d.x - 1, py - d.h, 3, 2); }
            }

            // Faceted, staggered rock courses with a consistent top-left light.
            ctx.fillStyle = '#17212a'; ctx.fillRect(px + 4, py + 10, this.w - 8, 19);
            const rock = biome.stoneCol || '#4e342e';
            ctx.fillStyle = rock; ctx.fillRect(px, py + 9, this.w, 10);
            ctx.fillStyle = 'rgba(230,238,224,.14)'; ctx.fillRect(px + 2, py + 9, this.w - 4, 2);
            for (let i = 0; i < this.stoneDetails.length; i++) {
                const d = this.stoneDetails[i], bx = px + d.x, by = py + d.y;
                const face = d.tone === 0 ? rock : d.tone === 1 ? '#53616a' : '#3a454d';
                ctx.fillStyle = '#19252a'; ctx.fillRect(bx + 2, by + 3, d.w, d.h);
                ctx.fillStyle = face; ctx.fillRect(bx, by, d.w, d.h);
                ctx.fillStyle = 'rgba(221,229,208,.25)'; ctx.fillRect(bx + 2, by + 1, Math.max(4, d.w - 7), 2);
                ctx.fillStyle = 'rgba(8,18,25,.34)'; ctx.fillRect(bx + d.w - 3, by + 2, 3, Math.max(2, d.h - 2));
                if (d.seam) { ctx.fillStyle = 'rgba(18,27,30,.55)'; ctx.fillRect(bx + Math.floor(d.w * .65), by + 4, 2, 2); }
            }
            ctx.fillStyle = '#1d2a2f'; ctx.fillRect(px + 7, py + 25, this.w - 14, 5);
            ctx.fillStyle = 'rgba(7,15,19,.48)'; ctx.fillRect(px + 16, py + 29, this.w - 32, 3);

            // Dangling vines / roots
            ctx.fillStyle = '#1b5e20';
            ctx.fillRect(px + 8, py + 24, 3, 7);
            ctx.fillRect(px + this.w - 12, py + 24, 3, 5);
        }

        // Special Decor: Moving Platform Direction Arrows
        if (this.type === PLAT_MOVING) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '7px monospace';
            ctx.fillText('◀ ▶', px + this.w/2 - 10, py + 18);
        }

        // Special Decor: 2.5D Spring Mechanism
        if (this.type === PLAT_SPRING) {
            const sy = this.springAnim > 0 ? 3 : 0;
            ctx.fillStyle = '#ffca28';
            ctx.fillRect(px + this.w/2 - 8, py - 5 + sy, 16, 5);
            ctx.fillStyle = '#ff6f00';
            ctx.fillRect(px + this.w/2 - 6, py + sy, 12, 4);
        }

        // Spikes Trap
        if (this.hasSpikes) {
            ctx.fillStyle = '#cfd8dc';
            const spikeCount = Math.floor(this.w / 16);
            for (let i = 0; i < spikeCount; i++) {
                const sx = px + 6 + i * 16;
                ctx.beginPath();
                ctx.moveTo(sx, py);
                ctx.lineTo(sx + 5, py - 11);
                ctx.lineTo(sx + 10, py);
                ctx.fill();
                // Spike shadow side
                ctx.fillStyle = '#90a4ae';
                ctx.beginPath();
                ctx.moveTo(sx + 5, py - 11);
                ctx.lineTo(sx + 10, py);
                ctx.lineTo(sx + 5, py);
                ctx.fill();
                ctx.fillStyle = '#cfd8dc';
            }
        }

        // Wooden Crate
        if (this.hasCrate) {
            const cx = px + this.w/2 - 9;
            const cy = py - 18;
            ctx.fillStyle = '#a1662f';
            ctx.fillRect(cx, cy, 18, 18);
            ctx.fillStyle = '#5c3818';
            ctx.strokeRect(cx, cy, 18, 18);
            ctx.beginPath();
            ctx.moveTo(cx, cy); ctx.lineTo(cx + 18, cy + 18);
            ctx.moveTo(cx + 18, cy); ctx.lineTo(cx, cy + 18);
            ctx.strokeStyle = '#5c3818';
            ctx.stroke();
        }
    }
}

