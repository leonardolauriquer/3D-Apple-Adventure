import * as THREE from 'three';
import { LevelData, LevelTheme } from '../types';

const LEVEL_THEMES: LevelTheme[] = [
    // 1. Pradaria
    {
        nameKey: 'themes.prairie',
        background: new THREE.Color(0x87CEEB), fog: new THREE.Fog(0x87CEEB, 50, 150),
        platformColor: () => `hsl(${120 + Math.random() * 40}, 70%, 50%)`,
        ambientLight: 0.8
    },
    // 2. Deserto
    {
        nameKey: 'themes.desert',
        background: new THREE.Color(0xF0E68C), fog: new THREE.Fog(0xF0E68C, 40, 140),
        platformColor: () => `hsl(${30 + Math.random() * 20}, ${50 + Math.random() * 20}%, ${60 + Math.random() * 10}%)`,
        ambientLight: 0.9
    },
    // 3. Caverna de Lava
    {
        nameKey: 'themes.lava_cave',
        background: new THREE.Color(0x110500), fog: new THREE.Fog(0x8B0000, 20, 100),
        platformColor: () => `hsl(${10 + Math.random() * 20}, 30%, ${20 + Math.random() * 10}%)`,
        ambientLight: 0.5
    },
    // 4. Floresta Assombrada
    {
        nameKey: 'themes.haunted_forest',
        background: new THREE.Color(0x0a190a), fog: new THREE.Fog(0x1a2a1a, 30, 110),
        platformColor: () => `hsl(${90 + Math.random() * 20}, 25%, ${25 + Math.random() * 10}%)`,
        ambientLight: 0.4
    },
    // 5. Geleira
    {
        nameKey: 'themes.glacier',
        background: new THREE.Color(0xddeeff), fog: new THREE.Fog(0xddeeff, 30, 120),
        platformColor: () => `hsl(${190 + Math.random() * 20}, 80%, ${70 + Math.random() * 10}%)`,
        ambientLight: 0.9
    },
    // 6. Fundo do Mar
    {
        nameKey: 'themes.seabed',
        background: new THREE.Color(0x00008B), fog: new THREE.Fog(0x0000CD, 25, 100),
        platformColor: () => `hsl(${200 + Math.random() * 40}, 70%, ${40 + Math.random() * 10}%)`,
        ambientLight: 0.6
    },
    // 7. Cyberpunk
    {
        nameKey: 'themes.cyberpunk',
        background: new THREE.Color(0x000022), fog: new THREE.Fog(0x2a004a, 40, 130),
        platformColor: () => `hsl(${280 + Math.random() * 60}, 90%, 30%)`,
        ambientLight: 0.6
    },
    // 8. Ruínas Antigas
    {
        nameKey: 'themes.ancient_ruins',
        background: new THREE.Color(0x998B7E), fog: new THREE.Fog(0x998B7E, 45, 145),
        platformColor: () => `hsl(${35 + Math.random() * 15}, 20%, ${50 + Math.random() * 15}%)`,
        ambientLight: 0.7
    },
    // 9. Cidade Celeste
    {
        nameKey: 'themes.sky_city',
        background: new THREE.Color(0xB0E0E6), fog: new THREE.Fog(0xB0E0E6, 60, 160),
        platformColor: () => `hsl(${50 + Math.random() * 20}, 70%, 80%)`,
        ambientLight: 0.95
    },
    // 10. Terra dos Doces
    {
        nameKey: 'themes.candyland',
        background: new THREE.Color(0xFFC0CB), fog: new THREE.Fog(0xFFD1DC, 40, 130),
        platformColor: () => `hsl(${330 + Math.random() * 40}, 100%, 85%)`,
        ambientLight: 0.9
    },
    // 11. Cinzas Vulcânicas
    {
        nameKey: 'themes.volcanic_ash',
        background: new THREE.Color(0x222222), fog: new THREE.Fog(0x444444, 15, 90),
        platformColor: () => `hsl(${0}, 0%, ${15 + Math.random() * 10}%)`,
        ambientLight: 0.3
    },
    // 12. Cavernas de Cristal
    {
        nameKey: 'themes.crystal_caverns',
        background: new THREE.Color(0x191970), fog: new THREE.Fog(0x30195C, 25, 110),
        platformColor: () => `hsl(${240 + Math.random() * 60}, 80%, 55%)`,
        ambientLight: 0.5
    },
    // 13. Floresta de Cogumelos
    {
        nameKey: 'themes.mushroom_forest',
        background: new THREE.Color(0x00203F), fog: new THREE.Fog(0xADEFD1, 30, 120),
        platformColor: () => `hsl(${160 + Math.random() * 40}, 60%, 40%)`,
        ambientLight: 0.4
    },
    // 14. Pântano Sombrio
    {
        nameKey: 'themes.gloom_swamp',
        background: new THREE.Color(0x2F4F4F), fog: new THREE.Fog(0x556B2F, 20, 95),
        platformColor: () => `hsl(${85 + Math.random() * 20}, 30%, 20%)`,
        ambientLight: 0.4
    },
    // 15. Cidade Steampunk
    {
        nameKey: 'themes.steampunk_city',
        background: new THREE.Color(0x6B4F3A), fog: new THREE.Fog(0x8B7355, 35, 125),
        platformColor: () => `hsl(${25 + Math.random() * 10}, 40%, 35%)`,
        ambientLight: 0.6
    },
    // 16. Vazio Cósmico
    {
        nameKey: 'themes.cosmic_void',
        background: new THREE.Color(0x000010), fog: new THREE.Fog(0x100020, 50, 150),
        platformColor: () => `hsl(${250 + Math.random() * 80}, 90%, 50%)`,
        ambientLight: 0.7
    },
    // 17. Jardim Japonês
    {
        nameKey: 'themes.japanese_garden',
        background: new THREE.Color(0x98FB98), fog: new THREE.Fog(0xADFF2F, 40, 130),
        platformColor: () => `hsl(${100 + Math.random() * 20}, 40%, 60%)`,
        ambientLight: 0.8
    },
    // 18. Floresta de Outono
    {
        nameKey: 'themes.autumn_forest',
        background: new THREE.Color(0xD2691E), fog: new THREE.Fog(0xFFA500, 30, 110),
        platformColor: () => `hsl(${20 + Math.random() * 25}, 80%, 50%)`,
        ambientLight: 0.75
    },
    // 19. Pôr do Sol Synthwave
    {
        nameKey: 'themes.synthwave_sunset',
        background: new THREE.Color(0x2E0249), fog: new THREE.Fog(0x570A57, 40, 140),
        platformColor: () => `hsl(${310 + Math.random() * 40}, 95%, 45%)`,
        ambientLight: 0.6
    },
    // 20. Quarto de Brinquedos
    {
        nameKey: 'themes.toy_room',
        background: new THREE.Color(0xFFFFE0), fog: new THREE.Fog(0xFFFFF0, 50, 150),
        platformColor: () => `hsl(${Math.random() * 360}, 90%, 70%)`,
        ambientLight: 0.9
    }
];

const BOSS_THEME: LevelTheme = {
    nameKey: 'themes.boss_arena',
    background: new THREE.Color(0x100010), // Roxo/preto bem escuro
    fog: new THREE.Fog(0x8B0000, 15, 80),   // Névoa vermelha escura
    platformColor: () => `hsl(0, 30%, 15%)`, // Plataformas cinza/vermelho escuras
    ambientLight: 0.3
};

const getThemeForLevel = (level: number): LevelTheme => {
    // Cada tema dura 5 níveis. O operador de módulo (%) faz o ciclo se repetir.
    const themeIndex = Math.floor((level - 1) / 5) % LEVEL_THEMES.length;
    return LEVEL_THEMES[themeIndex];
}

const generateBossLevelData = (level: number): LevelData => {
    const theme = BOSS_THEME;
    const platformsData = [];
    const bossArenaRadius = 20;

    platformsData.push({
        position: new THREE.Vector3(0, -1, -10),
        width: bossArenaRadius * 2,
        depth: bossArenaRadius * 2,
        color: theme.platformColor(),
        id: 'boss_arena'
    });

    return {
        theme,
        platforms: platformsData,
        apples: [], dangers: [], hearts3D: [], stompers: [], ghosts: [],
        movingPlatforms: [], jumpPads: [], shrinkingPlatforms: [], bouncePads: [],
        lasers: [], spikeBlocks: [], ramBots: [], sentinelEyes: [],
        checkpoint: { position: new THREE.Vector3(0, 0.5, bossArenaRadius - 5) },
        endTunnel: { position: new THREE.Vector3(0, 2.5, -10) }, // O túnel final é tornado visível após a derrota do chefe
        boss: {
            type: 'SKULL_KING',
            health: 2 + Math.floor(level / 10),
            position: new THREE.Vector3(0, 8, -25)
        },
        numApples: 0,
    };
};

export const generateLevelData = (level: number): LevelData => {
    // Os níveis de chefe ocorrem a cada 10 níveis
    if (level > 0 && level % 10 === 0) {
        return generateBossLevelData(level);
    }

    const theme = getThemeForLevel(level);
    const platformsData: any[] = []; const applesData: any[] = []; const dangersData: any[] = [];
    const hearts3DData: any[] = []; const stompersData: any[] = []; const ghostsData: any[] = [];
    const movingPlatformsData: any[] = []; const jumpPadsData: any[] = [];
    const shrinkingPlatformsData: any[] = []; const bouncePadsData: any[] = []; const lasersData: any[] = [];
    const spikeBlocksData: any[] = []; const ramBotsData: any[] = []; const sentinelEyesData: any[] = [];
    let checkpointData: any | null = null; let endTunnelData: any | null = null;
    
    let currentNumApples = 0; let appleIdCounter = 0;
    const difficulty = Math.min((level - 1) / 99, 1.0);
    const platformCount = Math.min(Math.floor(10 + level * 1.5), 120);
    let currentPos = new THREE.Vector3(0, 0, 0);
    let heartSpawned = false;
    const allPlatformPositions: any[] = [];

    for (let i = 0; i < platformCount; i++) {
        const isStartOrEnd = i === 0 || i === platformCount - 1;
        const platWidth = isStartOrEnd ? 8 : THREE.MathUtils.lerp(6, 2.5, difficulty) + Math.random();
        const platDepth = isStartOrEnd ? 8 : THREE.MathUtils.lerp(7, 3, difficulty) + Math.random();
        
        if (i > 0) {
             const prevPlatform = allPlatformPositions[allPlatformPositions.length-1];
             const zGap = THREE.MathUtils.lerp(2, 5, difficulty);
             const yDiffRange = THREE.MathUtils.lerp(1, 3.5, difficulty);
             currentPos.x = prevPlatform.position.x + (Math.random() - 0.5) * (8 - difficulty * 4);
             currentPos.z = prevPlatform.position.z - prevPlatform.depth / 2 - zGap - Math.random() * 2;
             const yDiff = (Math.random() - 0.5) * yDiffRange * 2;
             currentPos.y = THREE.MathUtils.clamp(prevPlatform.position.y + yDiff, prevPlatform.position.y - yDiffRange, prevPlatform.position.y + yDiffRange);
        }
        const position = currentPos.clone();
        const commonPlatformData = { position, width: platWidth, depth: platDepth, color: theme.platformColor(), id: i };
        allPlatformPositions.push(commonPlatformData);
        
        const isMovingPlatform = level > 3 && Math.random() < THREE.MathUtils.lerp(0.08, 0.28, difficulty);
        const isJumpPad = level > 2 && Math.random() < THREE.MathUtils.lerp(0.08, 0.18, difficulty);
        const isShrinkingPlatform = level > 7 && Math.random() < THREE.MathUtils.lerp(0.05, 0.25, difficulty);
        const isBouncePad = level > 9 && Math.random() < THREE.MathUtils.lerp(0.05, 0.15, difficulty);

        if (isMovingPlatform) movingPlatformsData.push({ ...commonPlatformData, userData: { isMoving: true, initialPosition: position.clone(), moveAxis: Math.random() < 0.5 ? 'x' : 'y', moveRange: 3 + Math.random() * 4, moveSpeed: 0.5 + Math.random() * 0.5 }});
        else if (isJumpPad) jumpPadsData.push(commonPlatformData);
        else if (isShrinkingPlatform) shrinkingPlatformsData.push({ ...commonPlatformData, shrinkDuration: THREE.MathUtils.lerp(2.0, 0.5, difficulty) });
        else if (isBouncePad) bouncePadsData.push(commonPlatformData);
        else platformsData.push(commonPlatformData);
    }

    allPlatformPositions.forEach((platData, i) => {
        if (i === 0 || i === allPlatformPositions.length - 1) return;
        const { position, width, depth } = platData;
        const occupiedZones: { pos: THREE.Vector2, radius: number }[] = [];
        const isPositionFree = (pos: THREE.Vector2, radius: number) => !occupiedZones.some(zone => pos.distanceTo(zone.pos) < zone.radius + radius);
        
        const tryPlaceObject = (yOffset: number, radius: number) => {
            for (let attempt = 0; attempt < 10; attempt++) {
                const x = position.x + (Math.random() - 0.5) * (width - radius * 2);
                const z = position.z + (Math.random() - 0.5) * (depth - radius * 2);
                const pos2D = new THREE.Vector2(x, z);
                if (isPositionFree(pos2D, radius)) {
                    occupiedZones.push({ pos: pos2D, radius });
                    return new THREE.Vector3(x, position.y + yOffset, z);
                }
            } return null;
        };

        if (Math.random() < 0.7) { const pos = tryPlaceObject(1.5, 2.0); if(pos) { applesData.push({ position: pos, id: appleIdCounter++ }); currentNumApples++; } }
        if (Math.random() < THREE.MathUtils.lerp(0.15, 0.4, difficulty)) { const pos = tryPlaceObject(1.0, 2.5); if (pos) { dangersData.push({ position: pos, patrolDistance: Math.random() * Math.min(width, depth) / 2.5 }); } }
        if (level >= 4 && Math.random() < THREE.MathUtils.lerp(0.05, 0.2, difficulty)) { const pos = tryPlaceObject(1.2, 2.5); if(pos) spikeBlocksData.push({ position: pos, patrolDistance: Math.random() * Math.min(width, depth) / 2.5 }); }
        if (level > 4 && Math.random() < THREE.MathUtils.lerp(0.05, 0.25, difficulty)) { const pos = tryPlaceObject(1.5, 3.0); if(pos) ghostsData.push({position: pos, initialY: pos.y}); }
        if (level > 5 && Math.random() < THREE.MathUtils.lerp(0.05, 0.3, difficulty)) { const pos = tryPlaceObject(15, 2.0); if(pos) stompersData.push({ position: pos, floorY: position.y + 1 }); }
        if (level >= 9 && Math.random() < THREE.MathUtils.lerp(0.05, 0.20, difficulty)) { const pos = tryPlaceObject(1, 2.0); if(pos) ramBotsData.push({ position: pos, platformBounds: {minX: position.x - width/2, maxX: position.x + width/2, minZ: position.z - depth/2, maxZ: position.z + depth/2} }); }
        if (level >= 14 && Math.random() < THREE.MathUtils.lerp(0.05, 0.18, difficulty)) { const pos = tryPlaceObject(1.5, 2.0); if(pos) sentinelEyesData.push({ position: pos, range: 25 }); }
        if (level > 12 && Math.random() < THREE.MathUtils.lerp(0.05, 0.20, difficulty)) { const pos = new THREE.Vector3(position.x, position.y + 2, position.z); const type = Math.random() < 0.5 ? 'rotating' : 'sweeping'; lasersData.push({ position: pos, type, speed: 0.5 + difficulty, range: Math.min(width, depth) / 2 }); }
        if (i > 5 && !heartSpawned && Math.random() < 0.2) { const pos = tryPlaceObject(1.5, 2.0); if(pos) { hearts3DData.push({ position: pos }); heartSpawned = true; } }
    });
    
    const midPlatformIndex = Math.floor(allPlatformPositions.length / 2);
    checkpointData = { position: allPlatformPositions[midPlatformIndex].position.clone().add(new THREE.Vector3(0, 0.5, 0)) };
    const lastPlatformPos = allPlatformPositions[allPlatformPositions.length - 1].position;
    endTunnelData = { position: lastPlatformPos.clone().add(new THREE.Vector3(0, 2.5, 0)) };

    let totalEnemies = dangersData.length + stompersData.length + ghostsData.length + spikeBlocksData.length + ramBotsData.length + sentinelEyesData.length + lasersData.length;
    if (totalEnemies < 3 && allPlatformPositions.length > 5) {
        const needed = 3 - totalEnemies;
        const availablePlatforms = allPlatformPositions.filter((p, i) => i > 0 && i < allPlatformPositions.length - 1);
        for(let i = 0; i < needed && availablePlatforms.length > 0; i++) {
            const platIndex = Math.floor(Math.random() * availablePlatforms.length);
            const platData = availablePlatforms.splice(platIndex, 1)[0];
            const pos = platData.position.clone().add(new THREE.Vector3(0, 1.0, 0));
            dangersData.push({ position: pos, patrolDistance: 0 });
        }
    }

    if (currentNumApples === 0 && allPlatformPositions.length > 2) { const midPlatform = allPlatformPositions[midPlatformIndex]; applesData.push({ position: midPlatform.position.clone().add(new THREE.Vector3(0, 1.5, 0)), id: appleIdCounter++ }); currentNumApples = 1; }
    
    return { theme, platforms: platformsData, apples: applesData, dangers: dangersData, hearts3D: hearts3DData, stompers: stompersData, ghosts: ghostsData, movingPlatforms: movingPlatformsData, jumpPads: jumpPadsData, checkpoint: checkpointData, endTunnel: endTunnelData, numApples: currentNumApples, shrinkingPlatforms: shrinkingPlatformsData, bouncePads: bouncePadsData, lasers: lasersData, spikeBlocks: spikeBlocksData, ramBots: ramBotsData, sentinelEyes: sentinelEyesData, boss: null };
}