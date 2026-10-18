const Storage = (() => {
    const KEY = 'pixel_climb_profile_v2';
    let memoryProfile = null, memorySettings = null;
    const defaults = () => ({ version: 2, balance: 0, lifetimeEarned: 0, totalCoinsCollected: 0, runsPlayed: 0, bestScore: 0, bestHeight: 0, owned: ['classic', 'classic-red', 'classic-blue', 'classic-white'], equipped: { hat: 'none', top: 'classic-red', bottom: 'classic-blue', shoes: 'classic-white' } });
    const read = (key, fallback = '') => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
    const write = (key, value) => { try { localStorage.setItem(key, String(value)); return true; } catch { return false; } };
    const normalize = value => {
        const d = defaults(); if (!value || typeof value !== 'object') return d;
        return { ...d, ...value, version: 2, balance: Math.max(0, Number(value.balance) || 0), lifetimeEarned: Math.max(0, Number(value.lifetimeEarned) || 0), totalCoinsCollected: Math.max(0, Number(value.totalCoinsCollected) || 0), runsPlayed: Math.max(0, Number(value.runsPlayed) || 0), bestScore: Math.max(0, Number(value.bestScore) || 0), bestHeight: Math.max(0, Number(value.bestHeight) || 0), owned: Array.isArray(value.owned) ? [...new Set([...d.owned, ...value.owned.filter(x => typeof x === 'string')])] : d.owned, equipped: { ...d.equipped, ...(value.equipped && typeof value.equipped === 'object' ? value.equipped : {}) } };
    };
    const save = p => { memoryProfile = normalize(p); write(KEY, JSON.stringify(memoryProfile)); return memoryProfile; };
    const profile = () => {
        try { const stored = JSON.parse(read(KEY, 'null')); if (stored) return save(normalize(stored)); } catch {}
        if (memoryProfile) return normalize(memoryProfile);
        const p = defaults();
        try { const old = JSON.parse(read('pixel_climb_records_v1', '{}')); p.bestHeight = Math.max(p.bestHeight, Number(old.height) || 0); p.bestScore = Math.max(p.bestScore, Number(old.score) || 0); } catch {}
        p.bestHeight = Math.max(p.bestHeight, parseInt(read('pixel_climb_best', '0'), 10) || 0); save(p); return p;
    };
    const defaultSettings = () => ({ musicEnabled: true, sfxEnabled: true, musicVolume: .35, sfxVolume: .65 });
    const settings = () => { if (memorySettings) return { ...memorySettings }; try { const s = JSON.parse(read('pixel_climb_settings_v1', '{}')); return (memorySettings = { musicEnabled: s.musicEnabled !== false, sfxEnabled: s.sfxEnabled !== false, musicVolume: Number.isFinite(s.musicVolume) ? Math.min(1, Math.max(0, s.musicVolume)) : .35, sfxVolume: Number.isFinite(s.sfxVolume) ? Math.min(1, Math.max(0, s.sfxVolume)) : .65 }); } catch { return (memorySettings = defaultSettings()); } };
    const completeRun = ({ coins = 0, score = 0, height = 0 } = {}) => { const p = profile(), earned = Math.max(0, Math.floor(coins)); p.balance += earned; p.lifetimeEarned += earned; p.totalCoinsCollected += earned; p.runsPlayed++; p.bestScore = Math.max(p.bestScore, Math.floor(score)); p.bestHeight = Math.max(p.bestHeight, Math.floor(height)); save(p); write('pixel_climb_best', p.bestHeight); write('pixel_climb_records_v1', JSON.stringify({ height: p.bestHeight, score: p.bestScore })); return p; };
    const purchase = (id, price) => { const p = profile(); if (p.owned.includes(id)) return { ok: false, reason: 'owned', profile: p }; if (p.balance < price) return { ok: false, reason: 'funds', profile: p }; p.balance -= price; p.owned.push(id); save(p); return { ok: true, profile: p }; };
    const equip = (slot, id) => { const p = profile(); if (!p.owned.includes(id)) return false; p.equipped[slot] = id; save(p); return true; };
    const saveSettings = s => { memorySettings = { ...s }; write('pixel_climb_settings_v1', JSON.stringify(s)); };
    const clearRecords = () => { const p = profile(); p.bestHeight = 0; p.bestScore = 0; save(p); write('pixel_climb_best', 0); write('pixel_climb_records_v1', JSON.stringify({ height: 0, score: 0 })); };
    const resetAll = () => {
        const keys = [KEY, 'pixel_climb_best', 'pixel_climb_records_v1', 'pixel_climb_settings_v1'];
        memoryProfile = defaults();
        memorySettings = defaultSettings();
        let persisted = false;
        try {
            for (const key of keys) localStorage.removeItem(key);
            persisted = keys.every(key => localStorage.getItem(key) === null);
        } catch {}
        return { profile: normalize(memoryProfile), settings: { ...memorySettings }, persisted };
    };
    return { profile, settings, completeRun, purchase, equip, saveSettings, clearRecords, resetAll, height: () => profile().bestHeight, score: () => profile().bestScore };
})();
