class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled=true;this.musicEnabled=true;this.musicVolume=.35;this.effectVolume=.65;this.musicTimer=null;this.musicStep=0;this.musicMode=null;this.musicPaused=false;this.musicVoices=new Set();
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSettings(s){this.musicEnabled=s.musicEnabled;this.enabled=s.sfxEnabled;this.musicVolume=s.musicVolume;this.effectVolume=s.sfxVolume;if(!this.musicEnabled||!this.musicVolume)this.pauseMusic()}
    startMusic(mode='menu'){
        if(!this.ctx||!this.musicEnabled||!this.musicVolume)return;
        if(this.musicTimer&&this.musicMode===mode)return;
        if(this.musicMode!==mode)this.musicStep=0;
        if(this.musicTimer)clearInterval(this.musicTimer);
        this.musicMode=mode;this.musicPaused=false;
        const tracks={menu:[523,659,784,659,587,698,880,698,523,659,784,1047,880,784,659,587],game:[659,784,880,1047,880,784,659,587,659,880,1047,1175,1047,880,784,659]};
        const notes=tracks[mode]||tracks.menu;
        this.musicTimer=setInterval(()=>{
            if(!this.ctx||this.ctx.state!=='running'||!this.musicEnabled||!this.musicVolume)return;
            const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
            o.type='square';o.frequency.value=notes[this.musicStep++%notes.length];
            g.gain.setValueAtTime(this.musicVolume*(mode==='game'?.045:.055),t);g.gain.exponentialRampToValueAtTime(.001,t+.16);
            o.connect(g);g.connect(this.ctx.destination);
            const voice={oscillator:o,gain:g};this.musicVoices.add(voice);o.onended=()=>this.musicVoices.delete(voice);
            o.start(t);o.stop(t+.17);
        },mode==='game'?150:190);
    }
    pauseMusic(){
        if(this.musicTimer)clearInterval(this.musicTimer);
        this.musicTimer=null;this.musicPaused=!!this.musicMode;
        const now=this.ctx?.currentTime;
        for(const voice of this.musicVoices){
            try{voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(0,now,.006);voice.oscillator.stop(now+.025)}catch{}
        }
    }
    resumeMusic(mode=this.musicMode||'game'){
        if(!this.musicEnabled||!this.musicVolume)return;
        this.startMusic(mode);
    }
    stopMusic(){
        this.pauseMusic();this.musicMode=null;this.musicStep=0;this.musicPaused=false;
    }
    playJump() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);
        gain.gain.setValueAtTime(0.12 * this.effectVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    playSpring() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.28);
        gain.gain.setValueAtTime(0.18 * this.effectVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
    }

    playJet() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        // White noise-like thruster burst
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.4);
        gain.gain.setValueAtTime(0.2 * this.effectVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    playCoin() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.16 * this.effectVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    }

    playCombo() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            gain.gain.setValueAtTime(0.1 * this.effectVolume, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.12);
        });
    }

    playHit() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.22);
        gain.gain.setValueAtTime(0.25 * this.effectVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    }

    playPowerup() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        [440, 554, 659, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0.12 * this.effectVolume, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.12);
        });
    }

    playGameOver() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        [320, 280, 240, 190].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.18 * this.effectVolume, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.18);
        });
    }
}

const sounds = new SoundSystem();
