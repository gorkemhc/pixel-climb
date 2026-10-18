// Enemies (Purple Bird & Slime)
class Enemy {
    constructor(x, y, type = 'bird') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.w = type === 'bird' ? 36 : 30;
        this.h = type === 'bird' ? 30 : 24;
        this.vx = (Math.random() < 0.5 ? 1 : -1) * (type === 'bird' ? 2.4 : 1.8);
        this.minX = 40;
        this.maxX = W - 40 - this.w;
        this.animTimer = 0;
    }

    update() {
        this.x += this.vx;
        if (this.x <= this.minX) {
            this.x = this.minX;
            this.vx *= -1;
        } else if (this.x >= this.maxX) {
            this.x = this.maxX;
            this.vx *= -1;
        }
        this.animTimer++;
    }

    draw(ctx, camY) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y - camY);

        ctx.save();
        if (this.vx > 0) {
            ctx.translate(px + this.w, py);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(px, py);
        }
        ctx.scale(1.5, 1.5);

        if (this.type === 'bird') {
            const flap = Math.sin(this.animTimer * 0.22) * 5;
            ctx.fillStyle = '#512da8';
            ctx.fillRect(0, 6 + flap, 8, 5);
            ctx.fillRect(16, 6 - flap, 8, 5);
            ctx.fillStyle = '#7b1fa2';
            ctx.fillRect(6, 4, 12, 12);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(7, 6, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(7, 7, 2, 2);
            ctx.fillStyle = '#ffb300';
            ctx.fillRect(4, 9, 3, 3);
        } else {
            const squash = Math.sin(this.animTimer * 0.18) * 2;
            ctx.fillStyle = '#e53935';
            ctx.fillRect(2, 4 + squash, 16, 12 - squash);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(6, 6 + squash, 3, 4);
            ctx.fillRect(12, 6 + squash, 3, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(7, 7 + squash, 2, 2);
            ctx.fillRect(13, 7 + squash, 2, 2);
        }

        ctx.restore();
    }
}

