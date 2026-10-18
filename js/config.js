let W=896,H=504;
const LINKEDIN_URL = '';
const GAME_CONFIG = Object.freeze({ platformPoints: 10, coinPoints: 10, cratePoints: 20, enemyPoints: 20, comboLimit: 5 });
const BIOMES = [
    { name: 'Orman', id: 1, minH: 0, maxH: 500, skyTop: '#2d68c4', skyBot: '#92cbf5', cloudCol: 'rgba(255,255,255,0.7)', grassCol: '#4caf50', stoneCol: '#5d4037', subText: '(Orman)' },
    { name: 'Dağlar', id: 2, minH: 500, maxH: 1000, skyTop: '#15418c', skyBot: '#5fa4eb', cloudCol: 'rgba(255,255,255,0.85)', grassCol: '#43a047', stoneCol: '#455a64', subText: '(Dağlar)' },
    { name: 'Kar', id: 3, minH: 1000, maxH: 1500, skyTop: '#3949ab', skyBot: '#b0bec5', cloudCol: 'rgba(240,248,255,0.9)', grassCol: '#e0f7fa', stoneCol: '#37474f', subText: '(Kar)' },
    { name: 'Harabeler', id: 4, minH: 1500, maxH: 2000, skyTop: '#4a148c', skyBot: '#ff7043', cloudCol: 'rgba(255,214,180,0.6)', grassCol: '#8d6e63', stoneCol: '#3e2723', subText: '(Harabeler)' },
    { name: 'Gökyüzü', id: 5, minH: 2000, maxH: 99999, skyTop: '#05051a', skyBot: '#28154e', cloudCol: 'rgba(186,104,200,0.5)', grassCol: '#00e676', stoneCol: '#263238', subText: '(Gökyüzü)' }
];


function getCurrentBiome(h){for(const b of BIOMES)if(h>=b.minH&&h<b.maxH)return b;return BIOMES[BIOMES.length-1]}
