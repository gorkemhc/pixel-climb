class Player {
    constructor() {
        this.w = 39;
        this.h = 51;
        this.reset();
    }

    reset() {
        this.x = W / 2 - this.w / 2;
        this.y = H - 120;
        this.vx = 0;
        this.vy = 0;
        
        // CALIBRATED ARCADE PHYSICS (Gentle, controlled, playable)
        this.maxSpeed = 7.2;       // Calibrated for the wider desktop viewport
        this.accel = 0.92;         // Smooth progressive acceleration
        this.friction = 0.76;      // Responsive ground stopping
        this.jumpForce = -8.8;     // Calibrated floaty jump (no more twitchy millisecond leaps!)
        this.gravity = 0.28;       // Softer gravity for readable hang-time
        
        this.grounded = false;
        this.facing = 1;
        this.health = 4;
        this.maxHealth = 4;
        this.coins = 0;
        this.score = 0;
        this.maxAltitude = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;
        this.invulnerableTimer = 0;
        
        // Power-ups
        this.hasDoubleJump = true;
        this.canDoubleJump = true;
        this.hasShield = false;
        this.magnetTimer = 0;
        this.superJumpTimer = 0;
        this.jetpackTimer = 0; // Jet Rocket Power-up

        // Squash & Stretch visual scaling
        this.scaleX = 1;
        this.scaleY = 1;

        this.animFrame = 0;
        this.animTimer = 0;
        this.isDead = false;
    }

    jump(isSpring = false) {
        if (this.jetpackTimer > 0) return;

        if (isSpring) {
            this.vy = -14.2;
            this.scaleX = 0.75;
            this.scaleY = 1.35;
            sounds.playSpring();
            return;
        }

        if (this.grounded) {
            this.vy = this.superJumpTimer > 0 ? this.jumpForce * 1.35 : this.jumpForce;
            this.grounded = false;
            this.scaleX = 0.8;
            this.scaleY = 1.25; // Jump stretch
            sounds.playJump();
        } else if (this.canDoubleJump && this.hasDoubleJump) {
            this.vy = this.jumpForce * 0.95;
            this.canDoubleJump = false;
            this.scaleX = 0.85;
            this.scaleY = 1.2;
            sounds.playJump();
            for (let i = 0; i < 8; i++) {
                game.particles.push(new Particle(
                    this.x + this.w/2, this.y + this.h,
                    (Math.random() - 0.5) * 3, Math.random() * 2,
                    '#81d4fa', 3, 20
                ));
            }
        }
    }

    hit() {
        if (this.invulnerableTimer > 0 || this.jetpackTimer > 0) return;
        if (this.hasShield) {
            this.hasShield = false;
            this.invulnerableTimer = 60;
            sounds.playHit();
            return;
        }

        this.health--;
        this.invulnerableTimer = 75;
        sounds.playHit();
        this.combo = 1;

        if (this.health <= 0) {
            game.triggerGameOver();
        }
    }

    update(keys) {
        if (this.isDead) return;

        // --- JETPACK ROCKET FLIGHT ---
        if (this.jetpackTimer > 0) {
            this.jetpackTimer--;
            this.vy = -7.2; // Smooth steady high-speed climb across 10-12 platforms
            this.grounded = false;
            this.canDoubleJump = true;
            this.invulnerableTimer = 30;

            // Jet flame & smoke particles
            if (Math.random() < 0.8) {
                game.particles.push(new Particle(
                    this.x + (this.facing === 1 ? 4 : this.w - 4), this.y + this.h,
                    (Math.random() - 0.5) * 1.5, 3 + Math.random() * 3,
                    Math.random() < 0.5 ? '#ff9100' : '#ffea00', 4, 22
                ));
                game.particles.push(new Particle(
                    this.x + (this.facing === 1 ? 4 : this.w - 4), this.y + this.h + 8,
                    (Math.random() - 0.5) * 2, 2 + Math.random() * 2,
                    'rgba(200, 200, 200, 0.7)', 3, 18
                ));
            }
        } else {
            // Normal Gravity
            this.vy += this.gravity;
            if (this.vy > 9.5) this.vy = 9.5; // Capped terminal velocity for controllable descent
        }

        // --- HORIZONTAL MOVEMENT (WASD / ARROWS) ---
        let moveX = 0;
        if (keys['ArrowLeft'] || keys['KeyA'] || game.touchLeft) moveX -= 1;
        if (keys['ArrowRight'] || keys['KeyD'] || game.touchRight) moveX += 1;

        if (moveX !== 0) {
            this.facing = moveX > 0 ? 1 : -1;
            this.vx += moveX * this.accel;
            if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
            if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

            this.animTimer++;
            if (this.animTimer > 7) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
            this.animFrame = 0;
        }

        // --- JUMP INPUT ---
        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || game.touchJump) && !game.jumpKeyHeld) {
            this.jump();
            game.jumpKeyHeld = true;
        }
        if (!keys['Space'] && !keys['ArrowUp'] && !keys['KeyW'] && !game.touchJump) {
            game.jumpKeyHeld = false;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Smooth squash recovery
        this.scaleX += (1 - this.scaleX) * 0.12;
        this.scaleY += (1 - this.scaleY) * 0.12;

        // Cliff Boundaries
        if (this.x < 36) {
            this.x = 36;
            this.vx = 0;
        } else if (this.x + this.w > W - 36) {
            this.x = W - 36 - this.w;
            this.vx = 0;
        }

        // Dotted Jump Arc trail emission (Matches Image 1)
        if (this.vy < -1 && Math.random() < 0.5) {
            game.jumpTrails.push(new JumpTrailDot(this.x + this.w / 2, this.y + this.h));
        }

        // Timers
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.magnetTimer > 0) this.magnetTimer--;
        if (this.superJumpTimer > 0) this.superJumpTimer--;

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0 && this.combo > 1) {
                this.combo = 1;
            }
        }

        this.grounded = false;
    }

    draw(ctx, camY) {
        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
            return;
        }

        const px = Math.floor(this.x);
        const py = Math.floor(this.y - camY);

        ctx.save();
        ctx.translate(px + this.w / 2, py + this.h);
        ctx.scale(this.facing * this.scaleX * 1.5, this.scaleY * 1.5);
        ctx.translate(-13, -34);

        // --- JETPACK ON BACK (if active) ---
        if (this.jetpackTimer > 0) {
            ctx.fillStyle = '#78909c';
            ctx.fillRect(-6, 12, 8, 18);
            ctx.fillStyle = '#b0bec5';
            ctx.fillRect(-5, 14, 6, 14);
            ctx.fillStyle = '#d32f2f';
            ctx.fillRect(-6, 26, 8, 4); // Nozzle
        }

        // --- 2.5D SHADED PIXEL CHARACTER (Image 1 faithful) ---
        const look = this.cosmetics || { hat: 'none', top: 'classic-red', bottom: 'classic-blue', shoes: 'classic-white' };
        const topItem = cosmeticFor(look.top), bottomItem = cosmeticFor(look.bottom), shoeItem = cosmeticFor(look.shoes), hatItem = cosmeticFor(look.hat);
        // 1. Spiky Brown Hair with 3D Depth & Highlights
        ctx.fillStyle = '#4e342e'; // Dark shadow hair
        ctx.fillRect(4, 2, 18, 8);
        ctx.fillStyle = '#6d4c41'; // Midtone hair
        ctx.fillRect(4, 0, 18, 8);
        ctx.fillRect(2, 4, 22, 6);
        ctx.fillRect(0, 7, 6, 5);
        ctx.fillStyle = '#8d6e63'; // Sun highlight on top hair
        ctx.fillRect(8, 0, 10, 2);
        ctx.fillRect(6, 2, 4, 2);
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(1, 4, 5, 5); ctx.fillRect(4, 1, 5, 4); ctx.fillRect(19, 2, 4, 6);
        ctx.fillStyle = '#795548'; ctx.fillRect(11, 1, 4, 2); ctx.fillRect(17, 4, 3, 2);

        // 2. Face / Skin with Ambient Shading
        ctx.fillStyle = '#ffb74d'; // Cheek shadow
        ctx.fillRect(5, 12, 16, 4);
        ctx.fillStyle = '#ffcc80'; // Main skin peach
        ctx.fillRect(5, 7, 16, 9);
        ctx.fillStyle = '#ffe0a6'; ctx.fillRect(7, 8, 5, 2);
        ctx.fillStyle = '#d88a55'; ctx.fillRect(18, 13, 3, 3);
        // Eye (Sharp pixel pupil & shine)
        ctx.fillStyle = '#212121';
        ctx.fillRect(11, 9, 2, 3); ctx.fillRect(16, 9, 3, 4);
        ctx.fillStyle = '#6d3d2f'; ctx.fillRect(10, 7, 4, 1); ctx.fillRect(15, 7, 5, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 9, 1, 1); ctx.fillRect(16, 9, 1, 2);
        ctx.fillStyle = '#9e523c'; ctx.fillRect(13, 14, 4, 1);

        // 3. Red T-Shirt with White Inner Collar & Sleeve Shading
        ctx.fillStyle = topItem?.color || '#e53935'; // Shadow side shirt
        ctx.globalAlpha = .72;
        ctx.fillRect(4, 18, 18, 8);
        ctx.globalAlpha = 1;
        ctx.fillStyle = topItem?.color || '#e53935'; // Costume color
        ctx.fillRect(4, 16, 18, 8);
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(6, 18, 2, 5); ctx.fillRect(9, 22, 8, 1);
        ctx.fillStyle = 'rgba(88,16,26,.34)'; ctx.fillRect(19, 19, 2, 5);
        ctx.fillStyle = '#ffffff'; // White collar
        ctx.fillRect(8, 16, 6, 3);
        ctx.fillStyle = '#d9e8ee'; ctx.fillRect(9, 18, 4, 1);
        // Sleeves
        ctx.fillStyle = '#b71c1c';
        const runPose = this.grounded && Math.abs(this.vx) > 1 ? (this.animFrame % 2 ? 2 : -2) : (this.grounded ? 0 : this.vy < 0 ? -2 : 2);
        ctx.fillRect(2, 17 + runPose, 4, 6);
        ctx.fillRect(18, 17 - runPose, 4, 6);

        // Hands
        ctx.fillStyle = '#ffcc80';
        ctx.fillRect(1, 21 + runPose, 3, 3);
        ctx.fillRect(20, 21 - runPose, 3, 3);

        // 4. Blue Jeans / Shorts
        ctx.fillStyle = '#0d47a1'; // Deep shadow jean
        ctx.fillRect(5, 27, 6, 4);
        ctx.fillRect(14, 27, 6, 4);
        ctx.fillStyle = bottomItem?.color || '#1e88e5'; // Cosmetic trousers
        if (this.animFrame % 2 === 1 && !this.grounded) {
            ctx.fillRect(5, 26, 6, 5);
            ctx.fillRect(14, 25, 6, 4);
        } else if (this.grounded && Math.abs(this.vx) > 1) {
            ctx.fillRect(5, 26 + runPose, 6, 5);
            ctx.fillRect(14, 26 - runPose, 6, 5);
        } else {
            ctx.fillRect(5, 26, 6, 5);
            ctx.fillRect(14, 26, 6, 5);
        }

        // 5. White & Red Sneakers
        ctx.fillStyle = shoeItem?.color || '#ffffff';
        ctx.fillRect(4, 30 + (this.grounded ? runPose : 0), 7, 4);
        ctx.fillRect(14, 30 - (this.grounded ? runPose : 0), 7, 4);
        ctx.fillStyle = '#d32f2f'; // Sneaker red stripe
        ctx.fillRect(4, 31 + (this.grounded ? runPose : 0), 7, 1);
        ctx.fillRect(14, 31 - (this.grounded ? runPose : 0), 7, 1);

        if (hatItem) {
            ctx.fillStyle = hatItem.color;
            if (look.hat === 'gold-crown') { ctx.fillRect(4, -2, 18, 3); ctx.fillRect(5, -6, 3, 5); ctx.fillRect(11, -8, 4, 7); ctx.fillRect(18, -6, 3, 5); }
            else if (look.hat === 'wizard-hat') { ctx.fillRect(5, -2, 16, 3); ctx.fillRect(8, -6, 10, 4); ctx.fillRect(11, -11, 5, 6); }
            else { ctx.fillRect(3, 0, 20, 3); ctx.fillRect(7, -4, 13, 5); if (look.hat === 'explorer-cap') ctx.fillRect(1, 1, 8, 2); }
            ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(8, -3, 5, 1);
        }

        ctx.restore();

        // Active Shield Bubble
        if (this.hasShield) {
            ctx.strokeStyle = '#42a5f5';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(px + this.w/2, py + this.h/2, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(66, 165, 245, 0.2)';
            ctx.fill();
        }

        // Active Magnet Indicator
        if (this.magnetTimer > 0) {
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(px + this.w/2 - 4, py - 8, 8, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + this.w/2 - 2, py - 6, 4, 2);
        }
    }
}

