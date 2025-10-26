// Gerenciador de áudio atualizado para música e efeitos sonoros.

let isMutedGlobally = false;
const playingMusic: { [key: string]: HTMLAudioElement } = {};
const audioElements: { [key: string]: HTMLAudioElement } = {}; // Cache for preloaded audio

const musicUrls = {
    menu: 'https://opengameart.org/sites/default/files/Painted%20Dreams%20Mock-Up.mp3',
    prairie: 'https://opengameart.org/sites/default/files/Caketown%201.mp3',
    desert: 'https://opengameart.org/sites/default/files/Simple%20Desert_0.ogg',
    lava_cave: 'https://opengameart.org/sites/default/files/song18_0.mp3',
    haunted_forest: 'https://opengameart.org/sites/default/files/RPG_Ambient_4_The_Dark_Wood_.ogg',
    glacier: 'https://opengameart.org/sites/default/files/every_xmas_merry_xmas_0.ogg',
    seabed: 'https://opengameart.org/sites/default/files/island_cove.mp3',
    cyberpunk: 'https://opengameart.org/sites/default/files/CyberPunk_Chronicles.ogg',
    ancient_ruins: 'https://opengameart.org/sites/default/files/ruin_island_0.ogg',
    sky_city: 'https://opengameart.org/sites/default/files/Pacific%20Ocean_0.mp3',
    candyland: 'https://opengameart.org/sites/default/files/happy_0.mp3',
    volcanic_ash: 'https://opengameart.org/sites/default/files/fire_0.mp3',
    crystal_caverns: 'https://opengameart.org/sites/default/files/Ice%20Cave_0.mp3',
    mushroom_forest: 'https://opengameart.org/sites/default/files/Fairy%20on%20Fire_0.mp3',
    gloom_swamp: 'https://opengameart.org/sites/default/files/the_swamps_0.mp3',
    steampunk_city: 'https://opengameart.org/sites/default/files/glitchstairs_6.ogg',
    cosmic_void: 'https://opengameart.org/sites/default/files/OutThere_0.ogg',
    japanese_garden: 'https://opengameart.org/sites/default/files/dova_Cooler%20Ninjari%20Ninjarous%20miaster.mp3',
    autumn_forest: 'https://opengameart.org/sites/default/files/s6.mp3',
    synthwave_sunset: 'https://opengameart.org/sites/default/files/SchoolDay_0.ogg',
    toy_room: 'https://opengameart.org/sites/default/files/creepy_toy.wav',
    bossBattle: 'https://opengameart.org/sites/default/files/battleThemeA.mp3',
};

const soundUrls = {
    jump: 'https://opengameart.org/sites/default/files/slime_jump_0.mp3',
    collectApple: 'https://opengameart.org/sites/default/files/apple_bite_0.ogg',
    checkpoint: 'https://opengameart.org/sites/default/files/Picked%20Coin%20Echo%202.wav',
    levelComplete: 'https://opengameart.org/sites/default/files/newthingget_0.ogg',
    menuClick: 'https://opengameart.org/sites/default/files/Menu%20Selection%20Click.wav',
    playerHurt: 'https://opengameart.org/sites/default/files/best_snare_0.wav',
    enemyStomp: 'https://opengameart.org/sites/default/files/slime_step_1.ogg',
    purchase: 'https://opengameart.org/sites/default/files/Picked%20Coin%20Echo.wav',
    gameOver: 'https://opengameart.org/sites/default/files/GameOver_0.wav',
    collectHeart: 'https://opengameart.org/sites/default/files/17.mp3',
    ramBotCharge: 'https://opengameart.org/sites/default/files/burst%20fire_1.mp3',
    laserFire: 'https://opengameart.org/sites/default/files/tir.mp3',
    jumpPad: 'https://opengameart.org/sites/default/files/jump_0.wav',
    groundSlam: 'https://opengameart.org/sites/default/files/hit.wav',
    claimReward: 'https://opengameart.org/sites/default/files/bonus.wav',
};

export const setMuted = (muted: boolean): void => {
    isMutedGlobally = muted;
    // Aplica o estado mudo a todos os elementos de áudio de música gerenciados
    for (const key in playingMusic) {
        playingMusic[key].muted = isMutedGlobally;
    }
};

export const preloadAllSounds = async (): Promise<void> => {
    const allUrls = { ...musicUrls, ...soundUrls };
    const promises = Object.entries(allUrls).map(([key, url]) => {
        return new Promise<void>((resolve) => {
            const audio = new Audio(url);
            audio.addEventListener('canplaythrough', () => resolve(), { once: true });
            audio.addEventListener('error', () => resolve()); // Resolve on error too, to not block loading
            audioElements[key] = audio;
            // Timeout to prevent getting stuck
            setTimeout(resolve, 3000);
        });
    });
    await Promise.all(promises);
};

export const playMusic = (musicName: string, volume = 0.3, loop = false): void => {
    let effectiveMusicKey = musicName as keyof typeof musicUrls;
    if (!musicUrls[effectiveMusicKey]) {
        effectiveMusicKey = 'prairie'; // Fallback para o tema da pradaria
    }

    // Para qualquer música que não seja a que vamos tocar
    for (const key in playingMusic) {
        if (key !== effectiveMusicKey && !playingMusic[key].paused) {
            stopMusic(key);
        }
    }
    
    const musicUrl = musicUrls[effectiveMusicKey];
    if (!musicUrl) return;

    let audio = playingMusic[effectiveMusicKey];
    if (!audio) {
        // Usa o áudio pré-carregado se disponível, caso contrário, cria um novo
        audio = audioElements[effectiveMusicKey] ? audioElements[effectiveMusicKey] : new Audio(musicUrl);
        audio.loop = loop;
        playingMusic[effectiveMusicKey] = audio;
    }
    
    audio.volume = volume;
    audio.muted = isMutedGlobally;
    if (audio.paused) {
        audio.play().catch(e => console.error("Falha ao reproduzir áudio:", e));
    }
};

export const stopMusic = (musicName: string): void => {
    if (!musicName) return;
    let effectiveMusicKey = musicName as keyof typeof musicUrls;
    
    if (playingMusic[effectiveMusicKey]) {
        playingMusic[effectiveMusicKey].pause();
        playingMusic[effectiveMusicKey].currentTime = 0; // Volta para o início
    }
};

export const playSound = (soundName: string, volume = 0.5, playbackRate = 1.0): void => {
    if (isMutedGlobally) return;
    const soundKey = soundName as keyof typeof soundUrls;
    const soundUrl = soundUrls[soundKey];
    if (!soundUrl) return;

    // Para permitir que os sons se sobreponham (ex: coletar vários itens rapidamente),
    // criamos um novo objeto de áudio para cada reprodução.
    // Esta é uma abordagem simples e eficaz para efeitos sonoros curtos.
    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.play().catch(e => console.error(`Falha ao reproduzir o som ${soundName}:`, e));
};