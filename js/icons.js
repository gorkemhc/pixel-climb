const PixelIcons = (() => {
    const px = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
    const draw = (ctx, kind, x = 0, y = 0, size = 24, color = '#e7f5ff', id = '') => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.imageSmoothingEnabled = false;
        if (kind === 'coin') {
            px(ctx, 7, 1, 10, 2, '#fff3a6'); px(ctx, 4, 3, 16, 3, '#ffdf57');
            px(ctx, 2, 6, 20, 12, '#a95708'); px(ctx, 4, 5, 16, 14, '#f5a900');
            px(ctx, 6, 6, 12, 12, '#ffd64a'); px(ctx, 8, 7, 3, 10, '#fff3a6');
            px(ctx, 15, 8, 3, 8, '#dc8510'); px(ctx, 5, 18, 14, 2, '#9b520d');
        } else if (kind === 'magnet') {
            // U-shaped horseshoe magnet with clearly distinct pole colors.
            px(ctx, 5, 2, 14, 4, '#26394b'); px(ctx, 3, 5, 5, 12, '#26394b'); px(ctx, 16, 5, 5, 12, '#26394b');
            px(ctx, 6, 3, 12, 3, '#dce9f2'); px(ctx, 4, 6, 4, 8, '#ef4444'); px(ctx, 16, 6, 4, 8, '#318be8');
            px(ctx, 3, 13, 6, 4, '#a52631'); px(ctx, 15, 13, 6, 4, '#2055a2');
            px(ctx, 4, 13, 4, 3, '#f1f6fa'); px(ctx, 16, 13, 4, 3, '#f1f6fa');
            px(ctx, 9, 8, 2, 2, '#ffd64a'); px(ctx, 13, 5, 2, 2, '#ffd64a');
            px(ctx, 8, 11, 2, 1, '#ffd64a');
        } else if (kind === 'rocket' || kind === 'jetpack') {
            px(ctx, 10, 1, 4, 2, '#d6e5ee'); px(ctx, 8, 3, 8, 3, '#e8f4fb');
            px(ctx, 6, 6, 12, 10, '#263d54'); px(ctx, 8, 6, 8, 10, '#e9f2f7');
            px(ctx, 8, 7, 2, 7, '#8da8bb'); px(ctx, 10, 7, 5, 7, '#e53935');
            px(ctx, 11, 8, 3, 3, '#64d8ff'); px(ctx, 12, 8, 1, 1, '#ffffff');
            px(ctx, 4, 12, 4, 5, '#ad2631'); px(ctx, 16, 12, 4, 5, '#ad2631');
            px(ctx, 9, 16, 6, 2, '#384e60'); px(ctx, 10, 18, 4, 2, '#ff9b2f');
            px(ctx, 11, 20, 2, 2, '#ffdf54'); px(ctx, 9, 20, 2, 2, '#e54b27'); px(ctx, 14, 20, 2, 2, '#e54b27');
        } else if (kind === 'shield') {
            px(ctx, 6, 2, 12, 2, '#eaf7ff'); px(ctx, 4, 4, 16, 3, '#273d59');
            px(ctx, 5, 5, 14, 3, '#54d7ff'); px(ctx, 3, 7, 18, 6, '#263f60');
            px(ctx, 5, 7, 14, 6, '#1e9ed1'); px(ctx, 6, 13, 12, 3, '#263f60');
            px(ctx, 8, 16, 8, 3, '#263f60'); px(ctx, 10, 19, 4, 2, '#263f60');
            px(ctx, 6, 8, 2, 4, '#aaf1ff'); px(ctx, 10, 8, 2, 3, '#d8fbff');
            px(ctx, 14, 8, 3, 5, '#0877ad'); px(ctx, 8, 14, 8, 2, '#62e4ff');
        } else if (kind === 'wings' || kind === 'jump') {
            px(ctx, 11, 4, 3, 13, '#f1f8ff'); px(ctx, 7, 6, 4, 3, '#50c7f1'); px(ctx, 4, 8, 4, 3, '#3da7dc');
            px(ctx, 3, 11, 4, 3, '#2785bd'); px(ctx, 14, 6, 4, 3, '#50c7f1'); px(ctx, 17, 8, 4, 3, '#3da7dc');
            px(ctx, 17, 11, 4, 3, '#2785bd'); px(ctx, 10, 2, 5, 3, '#ffe36a'); px(ctx, 10, 17, 5, 3, '#ffe36a');
        } else if (kind.startsWith('cosmetic:')) {
            const slot = kind.slice(9);
            px(ctx, 2, 2, 20, 20, '#162a40'); px(ctx, 3, 3, 18, 18, '#29435e');
            if (slot === 'hat') {
                if (id === 'gold-crown') {
                    px(ctx, 5, 7, 14, 3, '#77531b'); px(ctx, 6, 6, 12, 5, color);
                    px(ctx, 5, 3, 3, 5, '#fff0a0'); px(ctx, 10, 2, 4, 6, '#fff0a0'); px(ctx, 16, 3, 3, 5, '#fff0a0');
                } else if (id === 'wizard-hat') {
                    px(ctx, 5, 10, 14, 3, '#302349'); px(ctx, 7, 7, 10, 4, color); px(ctx, 9, 4, 7, 4, color);
                    px(ctx, 11, 2, 5, 3, '#c8b5ff'); px(ctx, 12, 7, 2, 2, '#ffe36a');
                } else {
                    px(ctx, 5, 8, 14, 4, '#293a46'); px(ctx, 7, 5, 11, 5, color); px(ctx, 4, 10, 16, 2, '#f0c87c');
                    px(ctx, 9, 6, 7, 2, '#fff0b5');
                }
            } else if (slot === 'top') {
                px(ctx, 8, 5, 8, 3, '#e8c095'); px(ctx, 5, 8, 14, 9, '#243449'); px(ctx, 7, 8, 10, 9, color);
                px(ctx, 4, 9, 4, 7, color); px(ctx, 16, 9, 4, 7, color); px(ctx, 9, 8, 2, 7, '#fff0d2'); px(ctx, 14, 10, 2, 2, '#fff0d2');
                px(ctx, 7, 16, 10, 2, '#1b2b40');
            } else if (slot === 'bottom') {
                px(ctx, 7, 4, 10, 3, '#e6c29e'); px(ctx, 6, 7, 12, 5, '#30465d');
                px(ctx, 7, 8, 4, 10, color); px(ctx, 13, 8, 4, 10, color); px(ctx, 11, 10, 2, 5, '#25364a');
                px(ctx, 6, 17, 5, 2, '#d7e8f1'); px(ctx, 13, 17, 5, 2, '#d7e8f1');
            } else {
                px(ctx, 5, 13, 6, 4, '#26394d'); px(ctx, 13, 13, 6, 4, '#26394d');
                px(ctx, 4, 16, 8, 4, color); px(ctx, 12, 16, 8, 4, color);
                px(ctx, 5, 16, 4, 1, '#ffffff'); px(ctx, 13, 16, 4, 1, '#ffffff');
            }
        } else if (kind === 'controller') {
            px(ctx, 5, 5, 14, 13, '#dbe9f1'); px(ctx, 3, 8, 5, 9, '#263b51'); px(ctx, 16, 8, 5, 9, '#263b51');
            px(ctx, 6, 9, 5, 5, '#17283b'); px(ctx, 7, 10, 3, 1, '#e8f4fa'); px(ctx, 8, 9, 1, 3, '#e8f4fa');
            px(ctx, 14, 10, 2, 2, '#e84e54'); px(ctx, 17, 13, 2, 2, '#4bc9ff');
        } else if (kind === 'platform') {
            px(ctx, 2, 7, 20, 6, '#32495d'); px(ctx, 3, 5, 18, 4, '#4ba450'); px(ctx, 4, 4, 3, 4, '#86dc64');
            px(ctx, 9, 3, 3, 5, '#7bd85a'); px(ctx, 16, 4, 3, 4, '#73cf58'); px(ctx, 4, 13, 6, 5, '#667c8c'); px(ctx, 11, 13, 8, 5, '#52697c');
        } else if (kind === 'enemy') {
            px(ctx, 6, 7, 12, 10, '#57339a'); px(ctx, 4, 9, 4, 4, '#31234d'); px(ctx, 16, 9, 4, 4, '#31234d');
            px(ctx, 8, 9, 3, 3, '#fff4c6'); px(ctx, 14, 9, 3, 3, '#fff4c6'); px(ctx, 9, 10, 1, 2, '#132338'); px(ctx, 15, 10, 1, 2, '#132338');
            px(ctx, 10, 14, 5, 2, '#ffbe47');
        }
        ctx.restore();
    };
    const mountDomIcons = (root = document) => root.querySelectorAll('[data-pixel-icon]').forEach(canvas => {
        const context = canvas.getContext('2d');
        if (context) draw(context, canvas.dataset.pixelIcon, 0, 0, Math.min(canvas.width, canvas.height));
    });
    return { draw, mountDomIcons };
})();
