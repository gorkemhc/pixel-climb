const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const jsFiles = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1]);
const missing = [...jsFiles, ...cssFiles].filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Missing referenced files: ${missing.join(', ')}`);
for (const required of ['btn-start', 'btn-howto', 'btn-settings', 'btn-shop', 'screen-shop', 'shop-items', 'btn-shop-back', 'btn-retry', 'btn-resume', 'btn-music', 'btn-sfx', 'music-volume', 'sfx-volume', 'btn-fullscreen', 'btn-reset-data', 'btn-reset-all', 'reset-confirm-dialog', 'btn-reset-cancel', 'btn-reset-confirm']) {
  if (!html.includes(`id="${required}"`)) throw new Error(`Missing UI element: ${required}`);
}
if (!html.includes('Diğer projelere göz at.') || html.includes('Yeni oyunlara göz at')) throw new Error('Project rail copy is outdated');
const world = fs.readFileSync(path.join(root, 'js/world.js'), 'utf8');
if (!world.includes('farCanvas') || !world.includes("blur(1.35px)")) throw new Error('Background blur layers are missing');
if (world.includes('treeLine')) throw new Error('Background tree renderer remains');
const icons = fs.readFileSync(path.join(root, 'js/icons.js'), 'utf8');
for (const icon of ['magnet', 'rocket', 'shield', 'coin', 'cosmetic:']) if (!icons.includes(icon)) throw new Error('Missing pixel icon: ' + icon);
if (!html.includes('js/icons.js') || !fs.readFileSync(path.join(root, 'js/collectibles.js'), 'utf8').includes('PixelIcons.draw(ctx, icon')) throw new Error('Pickup icons do not use the shared renderer');
const iconContext = { save() {}, restore() {}, translate() {}, scale() {}, fillRect() { this.rects++; }, rects: 0 };
const iconRenderer = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/icons.js'), 'utf8') + '\nPixelIcons;', {});
for (const icon of ['coin', 'magnet', 'rocket', 'shield', 'wings', 'controller', 'platform', 'enemy', 'cosmetic:hat', 'cosmetic:top', 'cosmetic:bottom', 'cosmetic:shoes']) iconRenderer.draw(iconContext, icon, 0, 0, 24, '#ffd54f', 'forest-cap');
if (iconContext.rects < 100) throw new Error('Pixel icon renderer did not draw the full icon set');
const game = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
if (game.includes('strokeRect(12, 12, 44, 44)')) throw new Error('Removed avatar HUD tile remains');
const cancelHandler = game.slice(game.indexOf("getElementById('btn-reset-cancel')"), game.indexOf("getElementById('btn-reset-confirm')"));
if (!cancelHandler.includes('resetDialog.close()') || cancelHandler.includes('Storage.')) throw new Error('Reset cancellation does not preserve storage');
if (!game.includes("getElementById('btn-retry').addEventListener('click', () => this.startNewGame())") || !game.includes("getElementById('btn-restart-pause').addEventListener('click', () => this.startNewGame())")) throw new Error('Normal restart flow is missing');
const audio = fs.readFileSync(path.join(root, 'js/audio.js'), 'utf8');
if (!audio.includes('pauseMusic()') || !audio.includes('resumeMusic(')) throw new Error('Pause/resume music support is missing');
for (const url of ['https://gorkemhc.github.io/promptla/', 'https://gorkemhc.github.io/PixelForge/', 'https://gorkemhc.github.io/SnakeRush/', 'https://github.com/gorkemhc']) {
  if (!html.includes(url)) throw new Error(`Missing project link: ${url}`);
}
const player = fs.readFileSync(path.join(root, 'js/player.js'), 'utf8');
if (/this\.(coins|score|maxAltitude) = (24|12450|782);/.test(player)) throw new Error('Fake starting progress remains');
if (!player.includes('this.coins = 0;') || !player.includes('this.score = 0;')) throw new Error('New run does not start at zero');
for (const file of jsFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (/\b(flag|bayrak|checkpoint)\b/i.test(source)) throw new Error(`Flag/checkpoint feature remains in ${file}`);
  new Function(source);
}
const store = new Map();
const sandbox = { localStorage: { getItem: key => store.has(key) ? store.get(key) : null, setItem: (key, value) => store.set(key, String(value)) } };
const S = vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/storage.js'), 'utf8')}\nStorage;`, sandbox), initial = S.profile();
if (initial.balance !== 0 || initial.version !== 2) throw new Error('New profile defaults are incorrect');
let profile = S.completeRun({ coins: 40, score: 50, height: 120 });
if (profile.balance !== 40 || profile.bestScore !== 50 || profile.bestHeight !== 120) throw new Error('Run settlement did not save economy and records');
if (!S.purchase('forest-cap', 20).ok || S.profile().balance !== 20) throw new Error('Affordable cosmetic purchase failed');
if (S.purchase('forest-cap', 20).reason !== 'owned') throw new Error('Duplicate cosmetic purchase was allowed');
if (S.purchase('gold-crown', 120).reason !== 'funds') throw new Error('Unaffordable cosmetic purchase was allowed');
if (!S.equip('hat', 'forest-cap') || S.profile().equipped.hat !== 'forest-cap') throw new Error('Cosmetic equip did not persist');
const legacyStore = new Map([['pixel_climb_best', '340'], ['pixel_climb_records_v1', JSON.stringify({ height: 290, score: 640 })]]);
const legacySandbox = { localStorage: { getItem: key => legacyStore.has(key) ? legacyStore.get(key) : null, setItem: (key, value) => legacyStore.set(key, String(value)) } };
const legacyStorage = vm.runInNewContext(`${fs.readFileSync(path.join(root, 'js/storage.js'), 'utf8')}\nStorage;`, legacySandbox);
if (legacyStorage.profile().bestHeight !== 340 || legacyStorage.profile().bestScore !== 640) throw new Error('Legacy records were not migrated');
legacyStorage.saveSettings({ musicEnabled: false, sfxEnabled: true, musicVolume: .2, sfxVolume: .8 });
if (legacyStorage.settings().musicEnabled !== false || legacyStorage.settings().sfxEnabled !== true) throw new Error('Independent audio settings did not persist');
const fullStore = new Map([
  ['pixel_climb_profile_v2', JSON.stringify({ version: 2, balance: 230, lifetimeEarned: 400, runsPlayed: 7, bestScore: 900, bestHeight: 800, owned: ['classic', 'rare-hat'], equipped: { hat: 'rare-hat' } })],
  ['pixel_climb_best', '800'],
  ['pixel_climb_records_v1', JSON.stringify({ height: 800, score: 900 })],
  ['pixel_climb_settings_v1', JSON.stringify({ musicEnabled: false, sfxEnabled: false, musicVolume: .1, sfxVolume: .2 })],
  ['another_site_data', 'must-stay']
]);
const fullSandbox = { localStorage: { getItem: key => fullStore.has(key) ? fullStore.get(key) : null, setItem: (key, value) => fullStore.set(key, String(value)), removeItem: key => fullStore.delete(key) } };
const fullStorage = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/storage.js'), 'utf8') + '\nStorage;', fullSandbox);
fullStorage.profile(); fullStorage.settings();
const reset = fullStorage.resetAll();
if (!reset.persisted || reset.profile.balance || reset.profile.bestScore || reset.profile.bestHeight || reset.profile.runsPlayed || reset.profile.owned.includes('rare-hat') || reset.profile.equipped.hat !== 'none') throw new Error('Full reset did not clear persistent progression');
if (!reset.settings.musicEnabled || !reset.settings.sfxEnabled || fullStore.size !== 1 || fullStore.get('another_site_data') !== 'must-stay') throw new Error('Full reset did not clear only Pixel Climb keys');
const reloadSandbox = { localStorage: fullSandbox.localStorage };
const afterReload = vm.runInNewContext(fs.readFileSync(path.join(root, 'js/storage.js'), 'utf8') + '\nStorage;', reloadSandbox);
if (afterReload.profile().balance !== 0 || afterReload.profile().bestHeight !== 0 || !afterReload.settings().musicEnabled) throw new Error('Full reset data returned from storage after reload');
console.log('Smoke check passed: scripts parse, paths/links/UI resolve, no tree or flag renderer remains, economy/shop transactions and confirmed-reset storage scope pass.');
