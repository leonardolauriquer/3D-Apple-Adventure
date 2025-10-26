import * as THREE from 'three';

export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'hi' | 'ar';
export type GameState = 'playing' | 'gameOver' | 'levelComplete';
export type View = 'menu' | 'game' | 'levelCompleteScreen' | 'langSelect' | 'wiki' | 'diamondShop' | 'dailyReward';
export type CharacterId = string;

export interface Upgrades {
  speed: number;
  jump: number;
  doubleJump: boolean;
  tripleJump: boolean;
  groundPound: boolean;
  maxLives: number;
}

export interface LevelTheme {
    background: THREE.Color;
    fog: THREE.Fog;
    platformColor: () => string;
    ambientLight: number;
    nameKey: string;
}

export interface LevelData {
    theme: LevelTheme;
    platforms: any[]; apples: any[]; dangers: any[]; hearts3D: any[];
    stompers: any[]; ghosts: any[]; movingPlatforms: any[];
    jumpPads: any[]; checkpoint: any | null; endTunnel: any | null;
    shrinkingPlatforms: any[]; bouncePads: any[]; lasers: any[];
    spikeBlocks: any[]; ramBots: any[]; sentinelEyes: any[];
    boss: any | null;
    numApples: number;
}
