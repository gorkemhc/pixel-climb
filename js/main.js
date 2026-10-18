const canvas = document.getElementById('gameCanvas');
const playfieldOrientation = matchMedia('(max-width: 720px) and (orientation: portrait)');
const portraitPlayfield = playfieldOrientation.matches;
W = portraitPlayfield ? 480 : 896;
H = portraitPlayfield ? 720 : 504;
document.documentElement.classList.toggle('portrait-playfield', portraitPlayfield);
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d', { alpha: false });
const shop = new Shop();
const game = new GameEngine();
PixelIcons.mountDomIcons();

playfieldOrientation.addEventListener('change', () => {
    // Switch the logical canvas safely at a menu boundary; keep an active run's geometry stable.
    if (game.state === 'MENU' || game.state === 'GAMEOVER') location.reload();
});

const splash = document.getElementById('splash-overlay');
setTimeout(() => splash.classList.add('splash-dismissed'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1300);
requestAnimationFrame(time => { game.lastTime = time; game.loop(time); });

const fullScreenButton = document.getElementById('btn-fullscreen');
const updateFullscreenControl = () => {
    const active = document.fullscreenElement === document.getElementById('arcade-app');
    fullScreenButton.setAttribute('aria-pressed', String(active));
    fullScreenButton.textContent = active ? 'TAM EKRANDAN ÇIK' : 'TAM EKRAN';
};
fullScreenButton.addEventListener('click', async () => {
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.getElementById('arcade-app').requestFullscreen();
    } catch { fullScreenButton.title = 'Tam ekran bu tarayıcıda kullanılamıyor.'; }
});
document.addEventListener('fullscreenchange', updateFullscreenControl);

const linkedin = document.getElementById('social-linkedin');
if (LINKEDIN_URL) {
    linkedin.href = LINKEDIN_URL;
    linkedin.target = '_blank';
    linkedin.rel = 'noopener noreferrer';
    linkedin.removeAttribute('aria-disabled');
    linkedin.querySelector('small').textContent = 'PROFİLİ AÇ';
} else {
    linkedin.removeAttribute('href');
    linkedin.setAttribute('aria-disabled', 'true');
}
