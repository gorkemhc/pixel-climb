const COSMETICS = [
    { id: 'classic-red', slot: 'top', name: 'Kırmızı Kaşif', price: 0, color: '#e53935', owned: true },
    { id: 'classic-blue', slot: 'bottom', name: 'Klasik Denim', price: 0, color: '#1e88e5', owned: true },
    { id: 'classic-white', slot: 'shoes', name: 'Klasik Sneaker', price: 0, color: '#ffffff', owned: true },
    { id: 'forest-cap', slot: 'hat', name: 'Orman Şapkası', price: 20, color: '#69b34c' },
    { id: 'explorer-cap', slot: 'hat', name: 'Kaşif Şapkası', price: 35, color: '#c58b45' },
    { id: 'wizard-hat', slot: 'hat', name: 'Büyücü Şapkası', price: 65, color: '#8657c8' },
    { id: 'gold-crown', slot: 'hat', name: 'Altın Taç', price: 120, color: '#ffd54f' },
    { id: 'forest-top', slot: 'top', name: 'Orman Ceketi', price: 35, color: '#358b54' },
    { id: 'snow-top', slot: 'top', name: 'Kar Kaşifi', price: 55, color: '#49b9d0' },
    { id: 'night-top', slot: 'top', name: 'Gece Nöbetçisi', price: 80, color: '#55449b' },
    { id: 'amber-bottom', slot: 'bottom', name: 'Sonbahar Pantolonu', price: 30, color: '#d07a35' },
    { id: 'night-bottom', slot: 'bottom', name: 'Gece Pantolonu', price: 55, color: '#39445e' },
    { id: 'gold-shoes', slot: 'shoes', name: 'Altın Taban', price: 45, color: '#ffd54f' },
    { id: 'ice-shoes', slot: 'shoes', name: 'Buz Adımı', price: 60, color: '#7eeaff' }
];
const COSMETIC_SLOTS = { hat: 'Şapkalar', top: 'Üst kıyafet', bottom: 'Alt kıyafet', shoes: 'Ayakkabılar' };
function cosmeticFor(id) { return COSMETICS.find(item => item.id === id); }
