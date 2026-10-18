class Shop {
    constructor() { this.slot = 'hat'; this.profile = Storage.profile(); this.preview = new Player(); this.bind(); this.render(); }
    bind() {
        document.getElementById('btn-shop').addEventListener('click', () => this.open());
        document.getElementById('btn-shop-back').addEventListener('click', () => this.close());
        document.querySelectorAll('[data-shop-slot]').forEach(button => button.addEventListener('click', () => { this.slot = button.dataset.shopSlot; this.render(); }));
        document.getElementById('shop-items').addEventListener('click', event => {
            const button = event.target.closest('[data-item-id]'); if (!button) return;
            const item = cosmeticFor(button.dataset.itemId); if (!item) return;
            this.profile = Storage.profile();
            if (this.profile.owned.includes(item.id)) {
                Storage.equip(item.slot, item.id); this.profile = Storage.profile(); this.message(`${item.name} kuşanıldı.`);
            } else {
                const result = Storage.purchase(item.id, item.price); this.profile = result.profile;
                this.message(result.ok ? `${item.name} satın alındı!` : result.reason === 'funds' ? 'Bu ürün için coin yetmiyor.' : 'Bu ürün zaten sende.');
            }
            this.render(); if (typeof game !== 'undefined') { game.profile = Storage.profile(); game.player.cosmetics = game.profile.equipped; game.updateUI(); }
        });
    }
    open() { this.profile = Storage.profile(); this.render(); document.getElementById('screen-menu').classList.add('hidden'); document.getElementById('screen-shop').classList.remove('hidden'); }
    close() { document.getElementById('screen-shop').classList.add('hidden'); document.getElementById('screen-menu').classList.remove('hidden'); }
    message(text) { document.getElementById('shop-message').textContent = text; }
    render() {
        this.profile = Storage.profile();
        const balance = document.getElementById('shop-balance'); if (balance) balance.textContent = this.profile.balance;
        document.querySelectorAll('[data-shop-slot]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shopSlot === this.slot)));
        const items = COSMETICS.filter(item => item.slot === this.slot);
        document.getElementById('shop-items').innerHTML = items.map(item => {
            const owned = this.profile.owned.includes(item.id), equipped = this.profile.equipped[item.slot] === item.id;
            const label = equipped ? 'KUŞANILDI' : owned ? 'KUŞAN' : `SATIN AL · ${item.price} ◉`;
            return `<article class="shop-card"><canvas class="shop-icon" data-cosmetic-id="${item.id}" width="24" height="24" aria-hidden="true"></canvas><div><b>${item.name}</b><small>${owned ? (equipped ? 'Seçili görünüm' : 'Sahip olunan') : `${item.price} coin`}</small></div><button class="shop-action" data-item-id="${item.id}" ${equipped ? 'disabled' : ''}>${label}</button></article>`;
        }).join('');
        document.querySelectorAll('#shop-items [data-cosmetic-id]').forEach(canvas => {
            const cosmetic = cosmeticFor(canvas.dataset.cosmeticId), context = canvas.getContext('2d');
            if (cosmetic && context) PixelIcons.draw(context, `cosmetic:${cosmetic.slot}`, 0, 0, 24, cosmetic.color, cosmetic.id);
        });
        this.drawPreview();
    }
    drawPreview() {
        const canvas = document.getElementById('shop-preview'), context = canvas.getContext('2d'); context.clearRect(0, 0, canvas.width, canvas.height);
        this.preview.x = 66; this.preview.y = 30; this.preview.facing = 1; this.preview.cosmetics = this.profile.equipped; this.preview.draw(context, 0);
    }
}
