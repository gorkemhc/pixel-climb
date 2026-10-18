// Main Engine with Fixed Delta Timing (Runs identically on 60Hz, 120Hz, 144Hz screens)
class GameEngine {
    constructor() {
        this.player = new Player();
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.jumpTrails = [];
        this.clouds = [];
        this.sceneries = [];
        this.world = new WorldRenderer();

        this.camY = 0;
        this.highestGeneratedY = H - 70;
        this.lastPlatformX = W / 2 - 125;
        this.state = 'MENU';
        this.keys = {};
        this.jumpKeyHeld = false;
        this.profile=Storage.profile();this.highScore=this.profile.bestHeight;this.bestScore=this.profile.bestScore;this.settings=Storage.settings();sounds.setSettings(this.settings);this.player.cosmetics=this.profile.equipped;this.runSettled=false;

        this.platformCounter = 0; // Counts platforms for rare Jetpack spawn (~every 20 platforms)

        // Mobile touch states
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;

        // Delta time accumulator for uniform 60fps physics
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.step = 1000 / 60; // 16.67ms fixed physics step

        this.initEnvironment();
        this.bindEvents();
        this.updateUI();
    }

    initEnvironment() {
        for (let i = 0; i < 12; i++) {
            this.clouds.push(new Cloud(-i * 180 + 300));
        }
        for (let i = 0; i < 6; i++) {
            this.sceneries.push(new SkyScenery(-i * 380 + 200));
        }
    }

    startNewGame() {
        sounds.init(); this.runSettled=false; this.profile=Storage.profile(); this.player.cosmetics=this.profile.equipped;
        sounds.setSettings(this.settings);sounds.startMusic('game');this.player.reset();
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.jumpTrails = [];

        this.camY = 0;
        this.highestGeneratedY = H - 70;
        this.platformCounter = 0;
        this.lastPlatformX = W / 2 - 125;

        // The starting ledge is a spawn surface, not a scoring landing.
        const startingPlatform = new Platform(this.lastPlatformX, H - 70, 250, PLAT_NORMAL);
        startingPlatform.scored = true;
        this.platforms.push(startingPlatform);
        this.player.y = startingPlatform.y - this.player.h;
        this.player.grounded = true;

        for (let i = 0; i < 14; i++) {
            this.generateNextPlatform();
        }

        this.state = 'PLAYING';
        this.hideAllOverlays();
    }

    generateNextPlatform() {
        this.platformCounter++;
        const currentM = Math.floor(Math.abs(this.highestGeneratedY - (H - 70)) / 10);
        let platW = 250;
        let vertGap = 65;

        if (currentM >= 1500) {
            platW = 150;
            vertGap = 86;
        } else if (currentM >= 1000) {
            platW = 175;
            vertGap = 80;
        } else if (currentM >= 500) {
            platW = 215;
            vertGap = 74;
        } else {
            platW = 250;
            vertGap = 68;
        }

        const nextY = this.highestGeneratedY - vertGap - (Math.random() * 16);
        const minX = 48, maxX = W - 48 - platW;
        const center = this.lastPlatformX + (Math.random() * 2 - 1) * 158;
        const nextX = Math.max(minX, Math.min(maxX, center));

        let type = PLAT_NORMAL;
        const rand = Math.random();
        if (rand < 0.22) {
            type = PLAT_MOVING;
        } else if (rand < 0.38) {
            type = PLAT_CRUMBLE;
        } else if (rand < 0.52 && currentM >= 500) {
            type = PLAT_ICE;
        } else if (rand < 0.68) {
            type = PLAT_SPRING;
        }

        const p = new Platform(nextX, nextY, platW, type);

        // --- RARE JETPACK SPAWN (~Every 20 Platforms) ---
        if (this.platformCounter % 20 === 0 && this.platformCounter > 10) {
            this.powerups.push(new PowerUpItem(nextX + platW/2 - 9, nextY - 26, 'jetpack'));
        } else if (Math.random() < 0.08) {
            const types = ['shield', 'magnet', 'wings'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            this.powerups.push(new PowerUpItem(nextX + platW/2 - 9, nextY - 26, chosen));
        }

        if (type !== PLAT_CRUMBLE && Math.random() < 0.65) {
            p.hasCoin = true;
            const coinCount = Math.floor(Math.random() * 3) + 1;
            for (let c = 0; c < coinCount; c++) {
                const cx = nextX + 15 + (c * 22);
                if (cx < nextX + platW - 10) {
                    this.coins.push(new Coin(cx, nextY - 14));
                }
            }
        } else if (Math.random() < 0.15 && type === PLAT_NORMAL) {
            p.hasCrate = true;
        } else if (Math.random() < 0.18 && currentM > 300 && type !== PLAT_SPRING) {
            p.hasSpikes = true;
        }

        if (Math.random() < 0.22 && currentM > 200) {
            if (Math.random() < 0.5) {
                this.enemies.push(new Enemy(nextX, nextY - 50, 'bird'));
            } else if (p.w >= 100 && !p.hasSpikes) {
                this.enemies.push(new Enemy(nextX + 10, nextY - 16, 'slime'));
            }
        }

        this.platforms.push(p);
        this.lastPlatformX = nextX;
        this.highestGeneratedY = nextY;
    }

    triggerGameOver() {
        if (this.state === 'GAMEOVER') return;
        this.player.isDead = true;
        this.state = 'GAMEOVER';
        sounds.playGameOver();sounds.stopMusic();

        for (let i = 0; i < 40; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 6;
            this.particles.push(new Particle(
                this.player.x + this.player.w/2, this.player.y + this.player.h/2,
                Math.cos(ang) * spd, Math.sin(ang) * spd,
                ['#ff1744', '#ff9100', '#ffea00', '#ffffff'][Math.floor(Math.random() * 4)],
                4, 45
            ));
        }

        if (!this.runSettled) { this.profile=Storage.completeRun({coins:this.player.coins,score:this.player.score,height:this.player.maxAltitude});this.runSettled=true;this.highScore=this.profile.bestHeight;this.bestScore=this.profile.bestScore;this.updateUI(); }
        sounds.stopMusic();

        setTimeout(() => {
            document.getElementById('go-height').innerText = `${this.player.maxAltitude} u`;
            document.getElementById('go-coins').innerText = this.player.coins;
            document.getElementById('go-bank').innerText = this.profile.balance;
            document.getElementById('go-combo').innerText = `x${this.player.maxCombo}`;
            document.getElementById('go-score').innerText = this.player.score.toLocaleString();
            document.getElementById('go-best').innerText = `${this.highScore} u`;
            if(this.state==='GAMEOVER')document.getElementById('screen-gameover').classList.remove('hidden');
        }, 550);
    }

    // Fixed 60FPS Physics Step
    fixedUpdate() {
        if (this.state !== 'PLAYING') return;

        this.player.update(this.keys);
        if (this.state !== 'PLAYING') return;

        // Smooth Camera Follow
        const targetScroll = this.player.y - H * 0.55;
        if (targetScroll < this.camY) {
            this.camY += (targetScroll - this.camY) * 0.08;
        }

        const currentAltitude = Math.max(0, Math.floor((H - 120 - this.player.y) / 10));
        if (currentAltitude > this.player.maxAltitude) {
            this.player.maxAltitude = currentAltitude;
            // Height is distance only; scoring is awarded by discrete gameplay events.
        }

        while (this.highestGeneratedY > this.camY - 200) {
            this.generateNextPlatform();
        }

        if (this.player.y - this.camY > H + 50) {
            this.triggerGameOver();
            return;
        }

        for (let p of this.platforms) {
            p.update();

            // Platform collision landing
            if (!p.isBroken && 
                this.player.vy > 0 &&
                this.player.x + this.player.w > p.x &&
                this.player.x < p.x + p.w &&
                this.player.y + this.player.h >= p.y &&
                this.player.y + this.player.h <= p.y + 14) {
                
                this.player.y = p.y - this.player.h;
                this.player.vy = 0;
                this.player.grounded = true;
                this.player.canDoubleJump = true;
                this.player.scaleX = 1.15; // Landing squash
                this.player.scaleY = 0.85;

                if (!p.scored) { p.scored = true; this.player.score += GAME_CONFIG.platformPoints; }

                if (p.type === PLAT_ICE) {
                    this.player.vx *= 0.96;
                }

                if (p.type === PLAT_CRUMBLE && !p.stepped) {
                    p.stepped = true;
                }

                if (p.type === PLAT_SPRING) {
                    p.springAnim = 10;
                    this.player.jump(true);
                }

                if (p.hasSpikes) {
                    this.player.hit();
                }

                if (p.hasCrate) {
                    p.hasCrate = false;
                    sounds.playCoin();
                    this.player.coins += 5;
                    this.player.score += GAME_CONFIG.cratePoints;
                    for (let i = 0; i < 8; i++) {
                        game.particles.push(new Particle(p.x + p.w/2, p.y - 10, (Math.random()-0.5)*4, (Math.random()-0.5)*4, '#a1662f', 4, 25));
                    }
                }
            }
        }

        // Coins & Magnet / Jetpack collection
        for (let c of this.coins) {
            c.update(this.player);
            if (!c.collected) {
                const dist = Math.hypot((this.player.x + this.player.w/2) - c.x, (this.player.y + this.player.h/2) - c.y);
                if (dist < 24) {
                    c.collected = true;
                    this.player.coins++;
                    this.player.score += GAME_CONFIG.coinPoints + Math.min(8, (this.player.combo - 1) * 2);
                    
                    this.player.combo = Math.min(5, this.player.combo + 1);
                    if (this.player.combo > this.player.maxCombo) {
                        this.player.maxCombo = this.player.combo;
                    }
                    this.player.comboTimer = 180;

                    if (this.player.combo % 3 === 0) {
                        sounds.playCombo();
                    } else {
                        sounds.playCoin();
                    }

                    for (let i = 0; i < 6; i++) {
                        this.particles.push(new Particle(c.x, c.y, (Math.random()-0.5)*3, (Math.random()-0.5)*3, '#ffeb3b', 3, 20));
                    }
                }
            }
        }

        // Powerups collection (Jetpack, Shield, Magnet, Wings)
        for (let pw of this.powerups) {
            pw.update();
            if (!pw.collected) {
                const dist = Math.hypot((this.player.x + this.player.w/2) - (pw.x + 9), (this.player.y + this.player.h/2) - (pw.y + 9));
                if (dist < 24) {
                    pw.collected = true;
                    if (pw.kind === 'jetpack') {
                        sounds.playJet();
                        this.player.jetpackTimer = 110; // Soars through ~10-12 platforms!
                    } else {
                        sounds.playPowerup();
                        if (pw.kind === 'shield') this.player.hasShield = true;
                        if (pw.kind === 'magnet') this.player.magnetTimer = 600;
                        if (pw.kind === 'wings') this.player.hasDoubleJump = true;
                    }
                }
            }
        }

        // Enemies collision
        for (let e of this.enemies) {
            e.update();
            const dist = Math.hypot((this.player.x + this.player.w/2) - (e.x + e.w/2), (this.player.y + this.player.h/2) - (e.y + e.h/2));
            if (dist < 20) {
                this.player.hit();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.jumpTrails.length - 1; i >= 0; i--) {
            this.jumpTrails[i].update();
            if (this.jumpTrails[i].life <= 0) this.jumpTrails.splice(i, 1);
        }

        for (let c of this.clouds) c.update();

        const purgeY = this.camY + H + 120;
        this.platforms = this.platforms.filter(p => p.y < purgeY);
        this.coins = this.coins.filter(c => c.y < purgeY && !c.collected);
        this.enemies = this.enemies.filter(e => e.y < purgeY);
        this.powerups = this.powerups.filter(pw => pw.y < purgeY && !pw.collected);
    }

    draw() {
        const biome = getCurrentBiome(this.player.maxAltitude);

        this.world.draw(ctx, biome, this.camY, this.player.maxAltitude, performance.now() / 1000);
        for (let t of this.jumpTrails) t.draw(ctx, this.camY);

        this.drawBorders(ctx, biome);

        for (let p of this.platforms) p.draw(ctx, this.camY, biome);
        for (let pw of this.powerups) pw.draw(ctx, this.camY);
        for (let c of this.coins) c.draw(ctx, this.camY);
        for (let e of this.enemies) e.draw(ctx, this.camY);
        for (let pt of this.particles) pt.draw(ctx, this.camY);

        this.player.draw(ctx, this.camY);

        // HUD - NO BUTTON OVERLAPS! Exactly matched to Image 1
        this.drawHUD(ctx, biome);
    }

    drawBorders(ctx, biome) {
        const scroll = (this.camY * .72) % 54, cliff = 26;
        ctx.fillStyle = '#1b2c37'; ctx.fillRect(0, 0, cliff, H); ctx.fillRect(W - cliff, 0, cliff, H);
        for (let y = -54; y < H + 54; y += 27) {
            const py = y - scroll, tone = ((y / 27) | 0) % 2 ? '#334b53' : '#263d46';
            ctx.fillStyle = tone; ctx.fillRect(0, py, cliff - 3, 18); ctx.fillRect(W - cliff + 3, py + 8, cliff - 3, 18);
            ctx.fillStyle = '#15272f'; ctx.fillRect(3, py + 18, cliff - 5, 3); ctx.fillRect(W - cliff + 5, py + 26, cliff - 5, 3);
            ctx.fillStyle = '#52715a'; ctx.fillRect(cliff - 5, py + 4, 7, 3); ctx.fillRect(W - cliff - 2, py + 17, 7, 4);
        }
        ctx.fillStyle = biome.grassCol || '#4caf50';
        for (let y = -40; y < H + 40; y += 46) {
            const py = y - scroll;
            ctx.fillRect(22, py, 5, 10); ctx.fillRect(18, py + 6, 5, 13);
            ctx.fillRect(W - 27, py + 13, 5, 12); ctx.fillRect(W - 22, py + 8, 5, 15);
        }
    }

    drawHUD(ctx, biome) {
        // --- TOP LEFT: Hearts & Coin Counter ---
        for (let i = 0; i < this.player.maxHealth; i++) {
            const hx = 44 + (i * 20);
            const hy = 20;
            ctx.fillStyle = i < this.player.health ? '#e53935' : '#455a64';
            ctx.beginPath();
            ctx.arc(hx, hy, 5, Math.PI, 0, false);
            ctx.arc(hx + 9, hy, 5, Math.PI, 0, false);
            ctx.lineTo(hx + 4.5, hy + 10);
            ctx.closePath();
            ctx.fill();
        }

        // Pixel-art coin icon, shared with pickups and the shop.
        PixelIcons.draw(ctx, 'coin', 39, 39, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText(`x ${this.player.coins}`, 58, 51);

        // COMBO Badge
        if (this.player.combo > 1) {
            ctx.fillStyle = 'rgba(13, 27, 62, 0.85)';
            ctx.strokeStyle = '#ffd600';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(12, 68, 140, 25);
            ctx.fillRect(12, 68, 140, 25);

            ctx.fillStyle = '#ffd600';
            ctx.font = '11px monospace';
            ctx.fillText(`COMBO x${this.player.combo}`, 20, 85);
        }

        // --- TOP RIGHT: Altitude, Score & Pause Button (CLEAN & NON-OVERLAPPING) ---
        // Altitude Box
        ctx.fillStyle = 'rgba(10, 24, 50, 0.88)';
        ctx.strokeStyle = '#1e88e5';
        ctx.lineWidth = 2;
        ctx.strokeRect(W - 300, 12, 104, 44);
        ctx.fillRect(W - 300, 12, 104, 44);
        ctx.fillStyle = '#90caf9';
        ctx.font = '9px monospace';
        ctx.fillText('YÜKSEKLİK', W - 292, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px monospace';
        ctx.fillText(`${this.player.maxAltitude} u`, W - 292, 47);

        // Score Box
        ctx.fillStyle = 'rgba(10, 24, 50, 0.88)';
        ctx.strokeStyle = '#1e88e5';
        ctx.strokeRect(W - 186, 12, 96, 44);
        ctx.fillRect(W - 186, 12, 96, 44);
        ctx.fillStyle = '#90caf9';
        ctx.font = '9px monospace';
        ctx.fillText('SKOR', W - 178, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px monospace';
        ctx.fillText(`${this.player.score}`, W - 178, 47);

        // Pause Button [ || ]
        ctx.fillStyle = 'rgba(10, 24, 50, 0.88)';
        ctx.strokeStyle = '#1e88e5';
        ctx.strokeRect(W - 74, 12, 58, 44);
        ctx.fillRect(W - 74, 12, 58, 44);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(W - 55, 25, 5, 18);
        ctx.fillRect(W - 42, 25, 5, 18);

        // --- RIGHT SIDE: Region Indicator & Vertical Tracker ---
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText(`BÖLGE ${biome.id}`, W - 115, 78);
        ctx.fillStyle = '#90caf9';
        ctx.font = '8px monospace';
        ctx.fillText(biome.subText, W - 115, 92);

        const trackX = W - 26;
        const trackY1 = 116;
        const trackY2 = 290;
        ctx.strokeStyle = '#0288d1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(trackX, trackY1);
        ctx.lineTo(trackX, trackY2);
        ctx.stroke();

        for (let i = 0; i < 5; i++) {
            const ty = trackY1 + (i * ((trackY2 - trackY1) / 4));
            ctx.fillStyle = (5 - i) <= biome.id ? '#00e676' : '#546e7a';
            ctx.beginPath();
            ctx.arc(trackX, ty, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        const ratio = Math.min(1, Math.max(0, (this.player.maxAltitude % 1000) / 1000));
        const markerY = trackY2 - (ratio * (trackY2 - trackY1));
        ctx.fillStyle = '#ffd600';
        ctx.beginPath();
        ctx.arc(trackX, markerY, 7, 0, Math.PI * 2);
        ctx.fill();

        // --- BOTTOM LEFT: Keyboard Guide (PC) ---
        ctx.fillStyle = 'rgba(10, 24, 50, 0.82)';
        ctx.strokeStyle = '#1e88e5';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(12, H - 98, 132, 42);
        ctx.fillRect(12, H - 98, 132, 42);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('A D / ◀ ▶', 20, H - 80);
        ctx.fillStyle = '#90caf9';
        ctx.font = '8px monospace';
        ctx.fillText('Hareket', 20, H - 64);

        ctx.fillStyle = 'rgba(10, 24, 50, 0.82)';
        ctx.strokeStyle = '#1e88e5';
        ctx.strokeRect(12, H - 50, 132, 42);
        ctx.fillRect(12, H - 50, 132, 42);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('SPACE', 20, H - 32);
        ctx.fillStyle = '#90caf9';
        ctx.font = '8px monospace';
        ctx.fillText('Zıplama', 20, H - 16);

        // --- BOTTOM RIGHT: Record Box (Image 1) ---
        ctx.fillStyle = 'rgba(10, 24, 50, 0.88)';
        ctx.strokeStyle = '#1e88e5';
        ctx.strokeRect(W - 176, H - 52, 160, 42);
        ctx.fillRect(W - 176, H - 52, 160, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`BEST ${this.highScore} u`, W - 166, H - 34);
        ctx.fillStyle = '#ffd54f';
        ctx.font = '8px monospace';
        ctx.fillText('YÜKSEKLİK', W - 166, H - 18);
    }

    hideAllOverlays() {
        document.getElementById('screen-menu').classList.add('hidden');
        document.getElementById('screen-howto').classList.add('hidden');
        document.getElementById('screen-settings').classList.add('hidden');
        document.getElementById('screen-pause').classList.add('hidden');
        document.getElementById('screen-gameover').classList.add('hidden');
        document.getElementById('screen-shop').classList.add('hidden');
    }

    updateUI(){this.profile=Storage.profile();document.getElementById('high-score-val').innerText=this.highScore+' u';document.getElementById('menu-balance').textContent=this.profile.balance;document.getElementById('menu-runs').textContent=this.profile.runsPlayed;document.getElementById('menu-earned').textContent=this.profile.lifetimeEarned;this.updateSettingsUI()}
    updateSettingsUI(){const m=document.getElementById('btn-music'),s=document.getElementById('btn-sfx');if(!m||!s)return;m.textContent=this.settings.musicEnabled?'AÇIK':'KAPALI';s.textContent=this.settings.sfxEnabled?'AÇIK':'KAPALI';m.setAttribute('aria-pressed',this.settings.musicEnabled);s.setAttribute('aria-pressed',this.settings.sfxEnabled);document.getElementById('music-volume').value=this.settings.musicVolume*100;document.getElementById('sfx-volume').value=this.settings.sfxVolume*100;}

    bindEvents() {
        document.addEventListener('pointerdown', () => { sounds.init(); if (this.state === 'MENU') sounds.startMusic('menu'); });
        window.addEventListener('keydown', e => {
            if (this.state === 'MENU') sounds.startMusic('menu');
            if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)&&!['INPUT','BUTTON'].includes(e.target.tagName))e.preventDefault();
            sounds.init();
            this.keys[e.code] = true;
            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup',e=>{this.keys[e.code]=false});window.addEventListener('blur',()=>{this.keys={};this.touchLeft=this.touchRight=this.touchJump=false});document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='PLAYING')this.togglePause()});

        canvas.addEventListener('click', e => {
            sounds.init();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            // Match the pause button drawn in the upper-right HUD.
            if (clickX >= W - 74 && clickX <= W - 16 && clickY >= 12 && clickY <= 56) {
                this.togglePause();
            }
        });

        // Mobile touch controls setup
        const setupTouch=(id,onStart,onEnd)=>{const b=document.getElementById(id);b.addEventListener('pointerdown',ev=>{ev.preventDefault();sounds.init();b.setPointerCapture(ev.pointerId);onStart()});for(const n of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(n,onEnd)};

        setupTouch('btn-left', () => this.touchLeft = true, () => this.touchLeft = false);
        setupTouch('btn-right', () => this.touchRight = true, () => this.touchRight = false);
        setupTouch('btn-jump', () => this.touchJump = true, () => this.touchJump = false);

        // Menu Buttons
        document.getElementById('btn-start').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-retry').addEventListener('click', () => this.startNewGame());
        
        document.getElementById('btn-howto').addEventListener('click', () => {
            document.getElementById('screen-howto').classList.remove('hidden');
        });
        document.getElementById('btn-back-howto').addEventListener('click', () => {
            document.getElementById('screen-howto').classList.add('hidden');
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('screen-settings').classList.remove('hidden');
        });
        document.getElementById('btn-back-settings').addEventListener('click', () => {
            document.getElementById('screen-settings').classList.add('hidden');
        });

        document.getElementById('btn-reset-data').addEventListener('click', () => {
            if(confirm('En iyi yükseklik ve skor silinsin mi?')){Storage.clearRecords();this.highScore=0;this.bestScore=0;this.updateUI();}
        });

        const resetDialog = document.getElementById('reset-confirm-dialog');
        const resetStatus = document.getElementById('settings-status');
        document.getElementById('btn-reset-all').addEventListener('click', () => {
            resetStatus.textContent = '';
            if (!resetDialog.open) resetDialog.showModal();
        });
        document.getElementById('btn-reset-cancel').addEventListener('click', () => {
            resetDialog.close();
            resetStatus.textContent = 'Sıfırlama iptal edildi; kayıtların korundu.';
        });
        resetDialog.addEventListener('cancel', () => {
            resetStatus.textContent = 'Sıfırlama iptal edildi; kayıtların korundu.';
        });
        document.getElementById('btn-reset-confirm').addEventListener('click', () => {
            const result = Storage.resetAll();
            this.profile = result.profile;
            this.settings = result.settings;
            this.highScore = 0;
            this.bestScore = 0;
            this.player.cosmetics = this.profile.equipped;
            sounds.stopMusic();
            sounds.setSettings(this.settings);
            resetDialog.close();
            this.state = 'MENU';
            this.hideAllOverlays();
            document.getElementById('screen-menu').classList.remove('hidden');
            if (this.settings.musicEnabled) sounds.startMusic('menu');
            if (typeof shop !== 'undefined') { shop.profile = this.profile; shop.render(); }
            this.updateUI();
            document.getElementById('btn-start').focus();
            resetStatus.textContent = result.persisted
                ? 'Tüm Pixel Climb kayıtları sıfırlandı.'
                : 'Oturum sıfırlandı. Tarayıcı kalıcı depolamaya erişemedi; yenilemeden sonra eski kayıtlar dönebilir.';
        });

        const apply=()=>{Storage.saveSettings(this.settings);sounds.setSettings(this.settings);if(this.settings.musicEnabled&&this.state==='MENU')sounds.startMusic('menu');this.updateSettingsUI()};
        document.getElementById('btn-music').addEventListener('click',()=>{sounds.init();this.settings.musicEnabled=!this.settings.musicEnabled;apply()});
        document.getElementById('btn-sfx').addEventListener('click',()=>{sounds.init();this.settings.sfxEnabled=!this.settings.sfxEnabled;apply()});
        document.getElementById('music-volume').addEventListener('input',ev=>{this.settings.musicVolume=+ev.target.value/100;apply()});document.getElementById('sfx-volume').addEventListener('input',ev=>{this.settings.sfxVolume=+ev.target.value/100;apply()});

        document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-settings-pause').addEventListener('click', () => { const panel=document.getElementById('screen-settings');panel.style.zIndex='70';panel.classList.remove('hidden'); });
        document.getElementById('btn-back-settings').addEventListener('click', () => { document.getElementById('screen-settings').style.zIndex='';document.getElementById('screen-settings').classList.add('hidden'); });
        document.getElementById('btn-restart-pause').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-quit').addEventListener('click', () => {
            this.state = 'MENU';
            this.hideAllOverlays();
            this.updateUI();
            document.getElementById('screen-menu').classList.remove('hidden');
        });
        document.getElementById('btn-menu-go').addEventListener('click', () => {
            this.state = 'MENU';
            this.hideAllOverlays();
            this.updateUI();
            document.getElementById('screen-menu').classList.remove('hidden');
        });
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED'; sounds.pauseMusic();
            document.getElementById('screen-pause').classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING'; sounds.resumeMusic('game');
            document.getElementById('screen-pause').classList.add('hidden');
        }
    }

    loop(currentTime) {
        const delta = Math.min(100, currentTime - this.lastTime);
        this.lastTime = currentTime;
        this.accumulator += delta;

        // Fixed timestep loop (Smooth 60 Hz physics updates regardless of monitor 144Hz/240Hz refresh rate)
        while (this.accumulator >= this.step) {
            this.fixedUpdate();
            this.accumulator -= this.step;
        }

        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }
}

