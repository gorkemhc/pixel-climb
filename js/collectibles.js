// Gold Coin with 3D Rotation Animation
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.collected = false;
    }

    update(player) {
        this.frame++;
        // Magnet attraction
        if (player.magnetTimer > 0 || player.jetpackTimer > 0) {
            const dx = (player.x + player.w/2) - this.x;
            const dy = (player.y + player.h/2) - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                this.x += (dx / dist) * 7.5;
                this.y += (dy / dist) * 7.5;
            }
        }
    }

    draw(ctx, camY) {
        if (this.collected) return;
        const cx = Math.floor(this.x);
        const cy = Math.floor(this.y - camY);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(Math.max(0.2, Math.abs(Math.sin(this.frame * 0.08))), 1);
        PixelIcons.draw(ctx, 'coin', -8, -10, 16);
        ctx.restore();
    }
}

// PowerUp Item (Double Jump, Shield, Magnet, JETPACK ROCKET)
class PowerUpItem {
    constructor(x, y, kind) {
        this.x = x;
        this.y = y;
        this.kind = kind; // 'jetpack', 'shield', 'magnet', 'wings'
        this.collected = false;
        this.timer = 0;
    }

    update() {
        this.timer++;
    }

    draw(ctx, camY) {
        if (this.collected) return;
        const bob = Math.sin(this.timer * 0.1) * 3;
        const px = Math.floor(this.x);
        const py = Math.floor(this.y - camY + bob);

        ctx.save();
        // Golden glowing aura for Jetpack, cyan for shield
        ctx.fillStyle = this.kind === 'jetpack' ? 'rgba(255, 177, 48, 0.36)' : this.kind === 'magnet' ? 'rgba(255, 104, 88, 0.3)' : this.kind === 'shield' ? 'rgba(79, 207, 255, 0.32)' : 'rgba(177, 232, 255, 0.28)';
        ctx.beginPath();
        ctx.arc(px + 9, py + 9, 14, 0, Math.PI * 2);
        ctx.fill();

        const icon = this.kind === 'jetpack' ? 'rocket' : this.kind;
        PixelIcons.draw(ctx, icon, px, py, 18);
        ctx.restore();
    }
}

