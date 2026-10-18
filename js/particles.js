// Particle System
class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx, camY) {
        ctx.fillStyle = this.color;
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y - camY), this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

// Crisp White Dotted Jump Arc (Faithful to Image 1)
class JumpTrailDot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 28;
        this.maxLife = 28;
        this.size = 3.5;
    }
    update() {
        this.life--;
    }
    draw(ctx, camY) {
        const a = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
        ctx.fillRect(Math.floor(this.x - this.size/2), Math.floor(this.y - camY - this.size/2), this.size, this.size);
    }
}

class Cloud {
    constructor(y) {
        this.x = Math.random() * W;
        this.y = y;
        this.speed = 0.2 + Math.random() * 0.25;
        this.w = 60 + Math.random() * 80;
        this.h = 24 + Math.random() * 14;
    }
    update() {
        this.x += this.speed;
        if (this.x > W + 60) this.x = -this.w - 40;
    }
    draw(ctx, camY, col) {
        const py = this.y - camY * 0.35;
        ctx.fillStyle = col;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(this.x, py, this.w, this.h, 12);
        } else {
            ctx.rect(this.x, py, this.w, this.h);
        }
        ctx.fill();
    }
}

// Parallax Distant Fantasy Ruins & Waterfalls (Image 1 faithful)
class SkyScenery {
    constructor(y) {
        this.x = Math.random() < 0.5 ? 42 : W - 140;
        this.y = y;
    }
    draw(ctx, camY) {
        const py = this.y - camY * 0.22;
        ctx.fillStyle = 'rgba(74, 105, 153, 0.42)';
        ctx.fillRect(this.x, py, 45, 60);
        ctx.fillRect(this.x - 6, py + 10, 57, 10);
        ctx.fillRect(this.x + 8, py - 12, 10, 12);
        ctx.fillRect(this.x + 28, py - 12, 10, 12);

        // Waterfalls
        ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
        ctx.fillRect(this.x + 18, py + 20, 8, 85);
    }
}

