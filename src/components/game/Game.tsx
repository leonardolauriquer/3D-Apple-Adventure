import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Upgrades, CharacterId, GameState, LevelData } from '../../types';
import { BASE_JUMP_FORCE, BASE_PLAYER_SPEED, PLAYER_RADIUS, DEATH_Y_LEVEL, charactersData } from '../../config/constants';
import { generateLevelData } from '../../game/levelGenerator';
import { createApple, createCheckpointFlag, createSkull, createGhost, createHeart, createStomper, createLaser, createSpikeBlock, createRamBot, createSentinelEye, createProjectile, createBoss } from '../../game/models';
import { MobileControls } from './MobileControls';
import { playSound, playMusic, stopMusic } from '../../utils/audio';

interface GameProps {
    upgrades: Upgrades;
    characterId: CharacterId;
    onSessionEnd: (status: 'gameOver' | 'levelComplete') => void;
    initialLevel: number;
    lives: number;
    setLives: React.Dispatch<React.SetStateAction<number>>;
    joystickVector: React.MutableRefObject<{ x: number; y: number; }>;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

export const Game: React.FC<GameProps> = ({ upgrades, characterId, onSessionEnd, initialLevel, lives, setLives, joystickVector, t }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(initialLevel);
    const [numApples, setNumApples] = useState(0);
    const [gameState, setGameState] = useState<GameState>('playing');
    const [isLoading, setIsLoading] = useState(true);
    const [levelData, setLevelData] = useState<LevelData | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [bossHealth, setBossHealth] = useState<{ current: number, max: number } | null>(null);

    const playerVelocityRef = useRef(new THREE.Vector3());
    const playerRef = useRef<THREE.Mesh | null>(null);
    const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false, c: false, shift: false });
    const clockRef = useRef(new THREE.Clock());
    const checkpointPositionRef = useRef(new THREE.Vector3(0, 1, 0));
    const scoreRef = useRef(score);
    const isCompletingLevelRef = useRef(false);
    const invulnerabilityTimerRef = useRef(0);
    const jumpCountRef = useRef(0);
    const collectedApplesAtCheckpointRef = useRef(new Set<string>());
    const spacePressedSinceGrounded = useRef(false);
    const isGroundPoundingRef = useRef(false);
    const isMobile = 'ontouchstart' in window;
    const themeMusicName = useRef<string | null>(null);
    const isBossLevelRef = useRef(false);
    const bossRef = useRef<THREE.Group | null>(null);
    
    const JUMP_FORCE = BASE_JUMP_FORCE * (0.8 + upgrades.jump * 0.05);
    const PLAYER_SPEED = BASE_PLAYER_SPEED * (0.8 + upgrades.speed * 0.05);

    useEffect(() => { scoreRef.current = score; }, [score]);
    const handleSessionEndCallback = useCallback(onSessionEnd, []);

    useEffect(() => {
        setIsLoading(true);
        setLevelData(null);
        const generationTimeout = setTimeout(() => {
            const data = generateLevelData(level);
            setLevelData(data);
            setNumApples(data.numApples);
        }, 50);
        return () => clearTimeout(generationTimeout);
    }, [level]);

    const handleGiveUp = () => {
        playSound('menuClick');
        onSessionEnd('gameOver');
    };

    const handlePause = () => {
        playSound('menuClick');
        setIsPaused(true);
    };

    const handleResume = () => {
        playSound('menuClick');
        clockRef.current.getDelta();
        setIsPaused(false);
    };

    useEffect(() => {
        if (levelData) {
            const isBoss = !!levelData.boss;
            isBossLevelRef.current = isBoss; 
    
            const newMusicName = isBoss ? 'bossBattle' : levelData.theme.nameKey.split('.')[1];
            
            if (themeMusicName.current !== newMusicName) {
                if(themeMusicName.current) stopMusic(themeMusicName.current);
                themeMusicName.current = newMusicName;
            }
    
            if (!isPaused) {
                playMusic(themeMusicName.current, 0.5, true);
            } else {
                if (themeMusicName.current) stopMusic(themeMusicName.current);
            }
        }
    }, [levelData, isPaused]);

    useEffect(() => {
        return () => {
            if (themeMusicName.current) {
                stopMusic(themeMusicName.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!mountRef.current || !levelData) return;
        
        const currentMount = mountRef.current;
        let animationFrameId: number;

        const init = async () => {
            const difficulty = Math.min((level - 1) / 99, 1.0);
            clockRef.current.start();
            checkpointPositionRef.current = new THREE.Vector3(0, 1, 0);
            let checkpointReached = false;
            isCompletingLevelRef.current = false;
            spacePressedSinceGrounded.current = false;
            isGroundPoundingRef.current = false;

            const scene = new THREE.Scene();
            scene.background = levelData.theme.background;
            scene.fog = levelData.theme.fog;
            const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            currentMount.appendChild(renderer.domElement);
            const textureLoader = new THREE.TextureLoader();
            const ambientLight = new THREE.AmbientLight(0xffffff, levelData.theme.ambientLight);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(20, 30, 20);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 4096; directionalLight.shadow.mapSize.height = 4096;
            scene.add(directionalLight);
            
            const platforms: THREE.Mesh[] = []; const apples: THREE.Group[] = [];
            const dangers: THREE.Group[] = []; const hearts3D: THREE.Mesh[] = [];
            const stompers: THREE.Mesh[] = []; const ghosts: THREE.Group[] = [];
            const movingPlatforms: THREE.Mesh[] = []; const jumpPads: THREE.Mesh[] = [];
            const shrinkingPlatforms: THREE.Mesh[] = []; const bouncePads: THREE.Mesh[] = []; const lasers: THREE.Group[] = [];
            const spikeBlocks: THREE.Group[] = []; const ramBots: THREE.Group[] = []; const sentinelEyes: THREE.Group[] = [];
            const projectiles: THREE.Mesh[] = [];
            const activeEffects: { mesh: THREE.Mesh, startTime: number, duration: number }[] = [];
            const bossAttacks = new Set<THREE.Object3D>();
            let checkpoint: THREE.Group | null = null; let endTunnel: THREE.Mesh | null = null;
            const initialItemY = new Map<THREE.Object3D, number>();

            const createAndAddPlatform = (data: any, material: THREE.Material) => {
                const platformGeo = new THREE.BoxGeometry(data.width, 1, data.depth);
                const platform = new THREE.Mesh(platformGeo, material);
                platform.position.copy(data.position);
                platform.receiveShadow = true;
                scene.add(platform);
                return platform;
            };

            const createShockwave = (position: THREE.Vector3, isBoss: boolean = false) => {
                if (isBoss) {
                    const shockwaveGeo = new THREE.CylinderGeometry(1, 1, 1.0, 64, 1, true);
                    const shockwaveMat = new THREE.MeshStandardMaterial({
                        color: 0xff4444, emissive: 0xff0000, emissiveIntensity: 3,
                        transparent: true, opacity: 0.9, side: THREE.DoubleSide
                    });
                    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
                    shockwave.position.copy(position); shockwave.position.y += 0.5;
                    shockwave.userData = { isBossAttack: true, creationTime: clockRef.current.getElapsedTime(), isShockwave: true };
                    bossAttacks.add(shockwave);
                    scene.add(shockwave);
                } else {
                    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.2, 32);
                    const shockwaveMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true });
                    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
                    shockwave.position.copy(position); shockwave.rotation.x = -Math.PI / 2;
                    activeEffects.push({ mesh: shockwave, startTime: clockRef.current.getElapsedTime(), duration: 0.4 });
                    scene.add(shockwave);
                }
            };
            
            levelData.platforms.forEach(d => platforms.push(createAndAddPlatform(d, new THREE.MeshStandardMaterial({ color: d.color }))));
            levelData.jumpPads.forEach(d => jumpPads.push(createAndAddPlatform(d, new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0x7e22ce, emissiveIntensity: 0.8 }))));
            levelData.movingPlatforms.forEach(d => { const p = createAndAddPlatform(d, new THREE.MeshStandardMaterial({ color: d.color })); p.userData = { ...d.userData, velocity: new THREE.Vector3(), lastPosition: d.position.clone() }; movingPlatforms.push(p); });
            levelData.shrinkingPlatforms.forEach(d => { const p = createAndAddPlatform(d, new THREE.MeshStandardMaterial({ map: textureLoader.load('https://i.imgur.com/QzaKDek.jpeg') })); p.userData = { isShrinking: false, shrinkStartTime: 0, shrinkDuration: d.shrinkDuration }; shrinkingPlatforms.push(p); });
            levelData.bouncePads.forEach(d => bouncePads.push(createAndAddPlatform(d, new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.7 }))));
            
            levelData.apples.forEach(d => { const a = createApple(); a.position.copy(d.position); a.userData.id = d.id; scene.add(a); apples.push(a); });
            levelData.dangers.forEach(d => { const danger = createSkull(); danger.position.copy(d.position); danger.userData = { isDying: false, deathTimer: 0, initialPosition: d.position.clone(), patrolAxis: Math.random() < 0.5 ? 'x' : 'z', patrolDistance: d.patrolDistance, patrolSpeed: 0.5 + Math.random() * 0.5 }; scene.add(danger); dangers.push(danger); });
            levelData.ghosts.forEach(d => { const g = createGhost(); g.position.copy(d.position); g.userData = { isChasing: false, chaseSpeed: 0.8 + difficulty * 0.5, activationRadius: 10, initialY: d.initialY }; scene.add(g); ghosts.push(g); });
            levelData.stompers.forEach(d => { const s = createStomper(textureLoader); s.position.copy(d.position); s.userData = { floorY: d.floorY, speed: 1 + difficulty * 2 }; scene.add(s); stompers.push(s); });
            levelData.lasers.forEach(d => { const l = createLaser(); l.position.copy(d.position); l.userData = { ...d, initialPosition: d.position.clone() }; scene.add(l); lasers.push(l); });
            levelData.spikeBlocks.forEach(d => { const s = createSpikeBlock(); s.position.copy(d.position); s.userData = { initialPosition: d.position.clone(), patrolAxis: Math.random() < 0.5 ? 'x' : 'z', patrolDistance: d.patrolDistance, patrolSpeed: 0.4 + Math.random() * 0.4 }; scene.add(s); spikeBlocks.push(s); });
            levelData.ramBots.forEach(d => { const r = createRamBot(); r.position.copy(d.position); r.userData = { state: 'idle', stateTimer: 0, chargeSpeed: 12 + difficulty * 4, ...d }; scene.add(r); ramBots.push(r); });
            levelData.sentinelEyes.forEach(d => { const e = createSentinelEye(); e.position.copy(d.position); e.userData = { state: 'scan', stateTimer: 0, lastFired: 0, fireRate: 2 - difficulty, ...d }; scene.add(e); sentinelEyes.push(e); });
            levelData.hearts3D.forEach(d => { const h = createHeart(); h.position.copy(d.position); scene.add(h); hearts3D.push(h); initialItemY.set(h, h.position.y); });
            if (levelData.checkpoint) { checkpoint = createCheckpointFlag(); checkpoint.position.copy(levelData.checkpoint.position); scene.add(checkpoint); }
            if (levelData.endTunnel) { const tunnelGeo = new THREE.TorusGeometry(1.5, 0.4, 16, 100); const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x7e22ce, emissive: 0xa855f7, emissiveIntensity: 0.5 }); endTunnel = new THREE.Mesh(tunnelGeo, tunnelMat); endTunnel.position.copy(levelData.endTunnel.position); scene.add(endTunnel); }

            if (levelData.boss) {
                isBossLevelRef.current = true;
                const bossMesh = createBoss();
                bossMesh.position.copy(levelData.boss.position);
                bossMesh.userData = {
                    type: 'SKULL_KING',
                    health: levelData.boss.health,
                    state: 'intro',
                    stateTimer: 3.0,
                    initialPosition: levelData.boss.position.clone(),
                    targetPosition: levelData.boss.position.clone(),
                };
                scene.add(bossMesh);
                bossRef.current = bossMesh;
                setBossHealth({ current: levelData.boss.health, max: levelData.boss.health });
                if (endTunnel) endTunnel.visible = false;
            } else {
                isBossLevelRef.current = false;
                bossRef.current = null;
                setBossHealth(null);
            }

            const playerGeometry = new THREE.SphereGeometry(PLAYER_RADIUS, 32, 32);
            const characterInfo = charactersData.find(c => c.id === characterId) || charactersData[0];
            const playerTexture = characterInfo.textureUrl ? await textureLoader.loadAsync(characterInfo.textureUrl) : null;
            const playerMaterial = new THREE.MeshStandardMaterial({ map: playerTexture, color: playerTexture ? 0xffffff : 0xef4444 });
            const player = new THREE.Mesh(playerGeometry, playerMaterial);
            player.castShadow = true; player.position.copy(checkpointPositionRef.current);
            playerRef.current = player;
            scene.add(player);

            const loseLife = () => {
                playSound('playerHurt');
                setLives(prevLives => {
                    const newLives = prevLives - 1;
                    if (newLives > 0) {
                        player.position.copy(checkpointPositionRef.current);
                        playerVelocityRef.current.set(0, 0, 0);
                        let scoreAfterRespawn = 0;
                        apples.forEach(apple => {
                            if (collectedApplesAtCheckpointRef.current.has(apple.userData.id)) {
                                apple.visible = false; scoreAfterRespawn++;
                            } else {
                                apple.visible = true;
                            }
                        });
                        shrinkingPlatforms.forEach(p => {
                            p.visible = true;
                            p.scale.set(1, 1, 1);
                            p.userData.isShrinking = false;
                            p.userData.shrinkStartTime = 0;
                        });
                        setScore(scoreAfterRespawn);
                    } else {
                        playSound('gameOver');
                        setGameState('gameOver');
                        setTimeout(() => handleSessionEndCallback('gameOver'), 2000);
                    }
                    return newLives;
                });
                invulnerabilityTimerRef.current = 2.0;
            };

            const handleKeyDown = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (keysRef.current.hasOwnProperty(k)) keysRef.current[k as keyof typeof keysRef.current] = true; if (k === ' ') keysRef.current.space = true; };
            const handleKeyUp = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (keysRef.current.hasOwnProperty(k)) keysRef.current[k as keyof typeof keysRef.current] = false; if (k === ' ') keysRef.current.space = false; };
            window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
            const handleResize = () => { if (!currentMount) return; camera.aspect = currentMount.clientWidth / currentMount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(currentMount.clientWidth, currentMount.clientHeight); };
            window.addEventListener('resize', handleResize);
            setIsLoading(false);

            const updateBoss = (delta: number, elapsedTime: number) => {
                const boss = bossRef.current;
                const player = playerRef.current;
                if (!boss || !player) return;
            
                const bossInstance = Math.floor(level / 10);
            
                boss.userData.stateTimer -= delta;
                const bossEye = boss.getObjectByName('bossEye') as THREE.Mesh;
                const eyeMaterial = bossEye.material as THREE.MeshStandardMaterial;
                
                const movementLerpFactor = Math.min(0.2, 0.02 + Math.max(0, bossInstance - 1) * 0.015);
            
                if (boss.userData.state !== 'vulnerable') {
                    boss.position.lerp(boss.userData.targetPosition, movementLerpFactor);
                } else {
                    boss.position.lerp(boss.userData.targetPosition, 0.1);
                }
            
                switch(boss.userData.state) {
                    case 'intro':
                        if (boss.userData.stateTimer <= 0) { boss.userData.state = 'attacking'; boss.userData.stateTimer = 1.0; }
                        break;
                    case 'attacking':
                        eyeMaterial.color.setHex(0xff0000); eyeMaterial.emissive.setHex(0xff0000);
                        if (boss.userData.stateTimer <= 0) {
                            if (Math.random() < 0.5) {
                                boss.userData.state = 'attack_slam_rise';
                                boss.userData.stateTimer = Math.max(0.4, 1.5 - bossInstance * 0.1);
                                const slamX = (Math.random() - 0.5) * 15;
                                const slamZ = -10 + (Math.random() - 0.5) * 10;
                                boss.userData.targetPosition.set(slamX, 15, slamZ);
                            } else {
                                boss.userData.state = 'attack_projectiles_aim';
                                boss.userData.stateTimer = Math.max(0.6, 2.0 - bossInstance * 0.15);
                                const xPos = (Math.random() < 0.5 ? -1 : 1) * 10;
                                boss.userData.targetPosition.set(xPos, 10, -15);
                            }
                        }
                        break;
                    case 'attack_slam_rise':
                        if (boss.userData.stateTimer <= 0) { 
                            boss.userData.state = 'attack_slam_fall'; 
                            boss.userData.stateTimer = 0.5; 
                            boss.userData.targetPosition.y = 1; 
                        }
                        break;
                    case 'attack_slam_fall':
                        if (boss.userData.stateTimer <= 0) { 
                            boss.userData.state = 'vulnerable'; 
                            boss.userData.stateTimer = Math.max(2.5, 6.0 - bossInstance * 0.4);
                            boss.userData.targetPosition.set(boss.position.x, 2.5, boss.position.z);
                            createShockwave(new THREE.Vector3(boss.position.x, 0, boss.position.z), true); 
                        }
                        break;
                    case 'attack_projectiles_aim':
                        boss.lookAt(player.position);
                        if (boss.userData.stateTimer <= 0) {
                            boss.userData.state = 'attack_projectiles_fire';
                            boss.userData.stateTimer = 1.5; 
                            boss.userData.projectilesFired = 0;
                            boss.userData.numProjectiles = 1 + Math.floor(bossInstance / 2);
                        }
                        break;
                    case 'attack_projectiles_fire':
                        const totalFireDuration = 1.2;
                        const timeBetweenShots = totalFireDuration / boss.userData.numProjectiles;
            
                        if (boss.userData.projectilesFired < boss.userData.numProjectiles) {
                            const timeToFireThisShot = 1.5 - (boss.userData.projectilesFired * timeBetweenShots);
                            if (boss.userData.stateTimer <= timeToFireThisShot) {
                                const projSpeed = 15 + bossInstance * 0.5;
                                const p = createProjectile();
                                const spawnOffset = new THREE.Vector3(0, 0, 3);
                                spawnOffset.applyQuaternion(boss.quaternion);
                                p.position.copy(boss.position).add(spawnOffset);
                                
                                const spreadAmount = (boss.userData.projectilesFired - (boss.userData.numProjectiles - 1) / 2) * 0.2;
                                const targetDirection = player.position.clone().sub(p.position).normalize();
                                const spreadAxis = new THREE.Vector3().crossVectors(targetDirection, boss.up).normalize();
                                const finalDirection = targetDirection.add(spreadAxis.multiplyScalar(spreadAmount)).normalize();
            
                                p.userData = { velocity: finalDirection.multiplyScalar(projSpeed), creationTime: elapsedTime, isBossAttack: true }; 
                                scene.add(p); 
                                bossAttacks.add(p);
                                playSound('laserFire', 0.4, 1.2);
                                boss.userData.projectilesFired++;
                            }
                        }
                        
                        if (boss.userData.stateTimer <= 0) {
                            boss.userData.state = 'vulnerable';
                            boss.userData.stateTimer = Math.max(2.5, 6.0 - bossInstance * 0.4);
                            boss.userData.targetPosition.set(boss.position.x, 2.5, boss.position.z);
                        }
                        break;
                    case 'vulnerable':
                        eyeMaterial.color.setHex(0x00ff00); eyeMaterial.emissive.setHex(0x00ff00);
                        const playerBox = new THREE.Box3().setFromObject(player);
                        const eyeBox = new THREE.Box3().setFromObject(bossEye);
                        if (playerBox.intersectsBox(eyeBox) && playerVelocityRef.current.y < -0.1) {
                            boss.userData.health -= 1;
                            setBossHealth(h => h ? { ...h, current: boss.userData.health } : null);
                            playSound('enemyStomp', 0.8, 0.8);
                            playerVelocityRef.current.y = JUMP_FORCE;
                            if (boss.userData.health <= 0) {
                                boss.userData.state = 'dying';
                                boss.userData.stateTimer = 3.0;
                            } else {
                                boss.userData.state = 'hit';
                                boss.userData.stateTimer = 1.5;
                            }
                        }
                        if (boss.userData.stateTimer <= 0) { boss.userData.state = 'attacking'; boss.userData.stateTimer = 1.0; }
                        break;
                    case 'hit':
                        boss.visible = Math.floor(elapsedTime * 20) % 2 === 0;
                        if (boss.userData.stateTimer <= 0) { boss.visible = true; boss.userData.state = 'attacking'; boss.userData.stateTimer = 1.0; }
                        break;
                    case 'dying':
                        boss.rotation.x += 10 * delta; boss.rotation.y += 10 * delta;
                        boss.scale.multiplyScalar(1 - delta);
                        if (boss.userData.stateTimer <= 0) {
                            scene.remove(boss);
                            bossRef.current = null;
                            if (endTunnel) endTunnel.visible = true;
                        }
                        break;
                }
            };

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                const player = playerRef.current;
                if (!player || !levelData) return;
                
                if (isPaused) {
                    renderer.render(scene, camera);
                    return;
                }

                const delta = Math.min(clockRef.current.getDelta(), 0.05);
                const elapsedTime = clockRef.current.getElapsedTime();
                
                for (let i = activeEffects.length - 1; i >= 0; i--) {
                    const effect = activeEffects[i];
                    const progress = (elapsedTime - effect.startTime) / effect.duration;
                    if (progress >= 1) { scene.remove(effect.mesh); (effect.mesh.geometry as THREE.BufferGeometry).dispose(); (effect.mesh.material as THREE.Material).dispose(); activeEffects.splice(i, 1); } 
                    else { const scale = 1 + progress * 20; effect.mesh.scale.set(scale, scale, scale); (effect.mesh.material as THREE.Material).opacity = 1 - progress; }
                }

                if (invulnerabilityTimerRef.current > 0) { invulnerabilityTimerRef.current -= delta; player.visible = Math.floor(elapsedTime * 10) % 2 === 0; } 
                else { player.visible = true; }
                
                if (gameState === 'playing') {
                    let isGrounded = false; let highestPlatformY = -Infinity; let onMovingPlatform: THREE.Mesh | null = null;
                    const allPlatforms = [...platforms, ...movingPlatforms, ...shrinkingPlatforms, ...bouncePads, ...jumpPads];
                    const wasGrounded = jumpCountRef.current === 0;
                    
                    for (const platform of allPlatforms) {
                        if (!platform.visible) continue;
                        const halfWidth = (platform.geometry as THREE.BoxGeometry).parameters.width / 2;
                        const halfDepth = (platform.geometry as THREE.BoxGeometry).parameters.depth / 2;
                        const platformTopY = platform.position.y + 0.5;
                        const isHorizontallyAligned = player.position.x > platform.position.x - halfWidth - PLAYER_RADIUS && player.position.x < platform.position.x + halfWidth + PLAYER_RADIUS && player.position.z > platform.position.z - halfDepth - PLAYER_RADIUS && player.position.z < platform.position.z + halfDepth + PLAYER_RADIUS;
                        const isOnTop = player.position.y >= platformTopY - PLAYER_RADIUS && player.position.y <= platformTopY + PLAYER_RADIUS + 0.1;
                        if (isHorizontallyAligned && isOnTop && playerVelocityRef.current.y <= 0) {
                            highestPlatformY = Math.max(highestPlatformY, platformTopY);
                            if (shrinkingPlatforms.includes(platform as THREE.Mesh) && !platform.userData.isShrinking) { platform.userData.isShrinking = true; platform.userData.shrinkStartTime = elapsedTime; }
                            if (jumpPads.includes(platform as THREE.Mesh)) { playerVelocityRef.current.y = BASE_JUMP_FORCE * 1.8; playSound('jumpPad'); }
                            if (bouncePads.includes(platform as THREE.Mesh)) { playerVelocityRef.current.y = BASE_JUMP_FORCE * 2.5; playSound('jumpPad', 0.6, 1.2); }
                            if (movingPlatforms.includes(platform as THREE.Mesh)) onMovingPlatform = platform;
                        }
                    }
                    
                    if (player.position.y - PLAYER_RADIUS < highestPlatformY && playerVelocityRef.current.y <= 0) {
                        isGrounded = true; player.position.y = highestPlatformY + PLAYER_RADIUS;
                        playerVelocityRef.current.y = 0; jumpCountRef.current = 0;
                        if (onMovingPlatform) player.position.add(onMovingPlatform.userData.velocity.clone().multiplyScalar(delta));
                    }

                    if (isGrounded && !wasGrounded && isGroundPoundingRef.current) { isGroundPoundingRef.current = false; playSound('groundSlam', 0.8); createShockwave(new THREE.Vector3(player.position.x, player.position.y - PLAYER_RADIUS, player.position.z)); dangers.forEach(d => { if (!d.userData.isDying && d.position.distanceTo(player.position) < 4) { d.userData.isDying = true; d.userData.deathTimer = 0.5; } }); }

                    if (!isGroundPoundingRef.current) { const moveDirection = new THREE.Vector3(); const horizontalInput = isMobile ? joystickVector.current.x : (keysRef.current.d ? 1 : 0) - (keysRef.current.a ? 1 : 0); const verticalInput = isMobile ? joystickVector.current.y : (keysRef.current.s ? 1 : 0) - (keysRef.current.w ? 1 : 0); moveDirection.set(horizontalInput, 0, verticalInput).normalize(); const horizontalMovement = moveDirection.multiplyScalar(PLAYER_SPEED * delta); const distanceMoved = new THREE.Vector3(horizontalMovement.x, 0, horizontalMovement.z).length(); if (distanceMoved > 0.001) { const rotationAxis = new THREE.Vector3(horizontalMovement.z, 0, -horizontalMovement.x).normalize(); const rotationAngle = distanceMoved / PLAYER_RADIUS; player.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)); } player.position.add(horizontalMovement); }
                    
                    playerVelocityRef.current.y -= 9.8 * delta; player.position.y += playerVelocityRef.current.y * delta;
                    
                    if ((keysRef.current.c || keysRef.current.shift) && !isGrounded && upgrades.groundPound && !isGroundPoundingRef.current) { isGroundPoundingRef.current = true; playerVelocityRef.current.y = -25; }

                    if (keysRef.current.space && !spacePressedSinceGrounded.current && !isGroundPoundingRef.current) { let jumped = false; if (isGrounded) { playerVelocityRef.current.y = JUMP_FORCE; jumpCountRef.current = 1; jumped = true; } else if (jumpCountRef.current === 1 && upgrades.doubleJump) { playerVelocityRef.current.y = JUMP_FORCE; jumpCountRef.current = 2; jumped = true; } else if (jumpCountRef.current === 2 && upgrades.tripleJump) { playerVelocityRef.current.y = JUMP_FORCE; jumpCountRef.current = 3; jumped = true; } if (jumped) { playSound('jump', 0.5, 1.0); spacePressedSinceGrounded.current = true; } }
                    if(!keysRef.current.space) spacePressedSinceGrounded.current = false;

                    let damageDetectedThisFrame = false;
                    apples.forEach((a) => { if (a.visible && player.position.distanceTo(a.position) < 1.2) { a.visible = false; setScore(s => (s < levelData.numApples ? s + 1 : s)); playSound('collectApple', 0.5, 1.5); } });
                    for (let i = hearts3D.length - 1; i >= 0; i--) { const h = hearts3D[i]; if (player.position.distanceTo(h.position) < 1.2) { scene.remove(h); initialItemY.delete(h); hearts3D.splice(i, 1); setLives(l => Math.min(l + 1, upgrades.maxLives)); playSound('collectHeart'); } }
                    
                    for (let i = dangers.length - 1; i >= 0; i--) { const d = dangers[i]; if (d.userData.isDying) continue; if (player.position.distanceTo(d.position) < 1.0) { if (playerVelocityRef.current.y < -0.1 && (player.position.y - PLAYER_RADIUS > d.position.y - 0.2) && !isGroundPoundingRef.current) { playSound('enemyStomp'); d.userData.isDying = true; d.userData.deathTimer = 0.5; playerVelocityRef.current.y = JUMP_FORCE * 0.8; } else if (invulnerabilityTimerRef.current <= 0) { damageDetectedThisFrame = true; } } }

                    if (invulnerabilityTimerRef.current <= 0) {
                        stompers.forEach(s => { const box = new THREE.Box3().setFromObject(s); if (box.containsPoint(player.position)) damageDetectedThisFrame = true; });
                        ghosts.forEach(g => { if (player.position.distanceTo(g.position) < 1.0) damageDetectedThisFrame = true; });
                        spikeBlocks.forEach(s => { if (player.position.distanceTo(s.position) < 1.2) damageDetectedThisFrame = true; });
                        ramBots.forEach(r => { if(r.userData.state === 'charging' && player.position.distanceTo(r.position) < 1.2) damageDetectedThisFrame = true; });
                        projectiles.forEach(p => { if (player.position.distanceTo(p.position) < PLAYER_RADIUS + 0.2) { damageDetectedThisFrame = true; p.userData.shouldBeRemoved = true; } });
                        bossAttacks.forEach(attack => { if (attack instanceof THREE.Mesh) { const attackPos = attack.position; if (attack.userData.isBossAttack && attack.userData.isShockwave) { const dist = player.position.distanceTo(new THREE.Vector3(attackPos.x, player.position.y, attackPos.z)); const currentRadius = attack.scale.x; const waveThickness = 1.5; if (Math.abs(dist - currentRadius) < waveThickness / 2 + PLAYER_RADIUS) { damageDetectedThisFrame = true; } } else if (attack.userData.isBossAttack && player.position.distanceTo(attackPos) < 1) { damageDetectedThisFrame = true; bossAttacks.delete(attack); scene.remove(attack); } } });
                        lasers.forEach(l => { const beam = l.getObjectByName('laserBeam'); if (beam instanceof THREE.Mesh && beam.visible) { const BEAM_RADIUS = (beam.geometry as THREE.CylinderGeometry).parameters.radiusTop; const BEAM_HEIGHT = (beam.geometry as THREE.CylinderGeometry).parameters.height; const p1Local = new THREE.Vector3(0, 0, -BEAM_HEIGHT / 2); const p2Local = new THREE.Vector3(0, 0, BEAM_HEIGHT / 2); beam.updateWorldMatrix(true, false); const p1World = p1Local.clone().applyMatrix4(beam.matrixWorld); const p2World = p2Local.clone().applyMatrix4(beam.matrixWorld); const segmentVector = new THREE.Vector3().subVectors(p2World, p1World); const playerToP1 = new THREE.Vector3().subVectors(player.position, p1World); const segmentLengthSq = segmentVector.lengthSq(); let t = 0; if (segmentLengthSq > 0) { t = Math.max(0, Math.min(1, playerToP1.dot(segmentVector) / segmentLengthSq)); } const closestPointOnSegment = p1World.clone().add(segmentVector.multiplyScalar(t)); if (player.position.distanceToSquared(closestPointOnSegment) < (PLAYER_RADIUS + BEAM_RADIUS) ** 2) { damageDetectedThisFrame = true; } } });
                        
                        if (bossRef.current) {
                            const boss = bossRef.current;
                            const bossState = boss.userData.state;
                            if (bossState !== 'vulnerable' && bossState !== 'dying' && bossState !== 'intro' && bossState !== 'hit') {
                                const collisionDistance = PLAYER_RADIUS + (2.5 * 1.5);
                                if (player.position.distanceTo(boss.position) < collisionDistance) {
                                    damageDetectedThisFrame = true;
                                }
                            }
                        }

                        if (player.position.y < DEATH_Y_LEVEL) damageDetectedThisFrame = true;
                    }
                    
                    if (damageDetectedThisFrame) loseLife();
                    if (checkpoint && !checkpointReached && player.position.distanceTo(checkpoint.position) < 2.5) { checkpointReached = true; playSound('checkpoint'); checkpointPositionRef.current.copy(checkpoint.position).add(new THREE.Vector3(0, 1.5, 0)); collectedApplesAtCheckpointRef.current.clear(); apples.forEach(apple => { if (!apple.visible) collectedApplesAtCheckpointRef.current.add(apple.userData.id); }); ((checkpoint.getObjectByName('flagCloth') as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(0x4ade80); (checkpoint.getObjectByName('checkmark') as THREE.Mesh).visible = true; }
                    if (endTunnel?.visible && !isCompletingLevelRef.current && player.position.distanceTo(endTunnel.position) < 2.5) {
                        if (!isBossLevelRef.current && scoreRef.current < levelData.numApples) { /* Do nothing */ }
                        else { playSound('levelComplete'); isCompletingLevelRef.current = true; setGameState('levelComplete'); setTimeout(() => handleSessionEndCallback('levelComplete'), 2000); }
                    }
                }
                
                if (isBossLevelRef.current) { updateBoss(delta, elapsedTime); }
                const bossInstance = Math.floor(level / 10);
                bossAttacks.forEach(attack => { 
                    if (attack instanceof THREE.Mesh) { 
                        if (attack.userData.isShockwave) { 
                            const expansionSpeed = 8 + bossInstance * 1.5; 
                            const waveLifetime = 0.8; 
                            const age = elapsedTime - attack.userData.creationTime; 
                            if (age > waveLifetime) { 
                                bossAttacks.delete(attack); 
                                scene.remove(attack); 
                            } else { 
                                const currentRadius = age * expansionSpeed; 
                                attack.scale.set(currentRadius, 1, currentRadius); 
                                const material = attack.material as THREE.MeshStandardMaterial; 
                                if (material.opacity) { 
                                    material.opacity = 1.0 - (age / waveLifetime); 
                                } 
                            } 
                        } else { 
                            attack.position.add(attack.userData.velocity.clone().multiplyScalar(delta)); 
                            if(elapsedTime - attack.userData.creationTime > 5) { 
                                bossAttacks.delete(attack); 
                                scene.remove(attack); 
                            } 
                        } 
                    } 
                });

                for (let i = dangers.length - 1; i >= 0; i--) { const d = dangers[i]; if (d.userData.isDying) { d.userData.deathTimer -= delta; const s = Math.max(0, d.userData.deathTimer / 0.5); d.scale.set(s, s, s); if (d.userData.deathTimer <= 0) { scene.remove(d); dangers.splice(i, 1); } } else { d.rotation.y += 0.5 * delta; if (d.userData.initialPosition) { const { initialPosition, patrolAxis, patrolDistance, patrolSpeed } = d.userData; (d.position as any)[patrolAxis] = initialPosition[patrolAxis] + Math.sin(elapsedTime * patrolSpeed) * patrolDistance; } } }
                stompers.forEach(s => { const { floorY, speed } = s.userData; s.position.y = floorY + 10 + Math.sin(elapsedTime * speed) * 8; });
                ghosts.forEach(g => { const dist = player.position.distanceTo(g.position); if (!g.userData.isChasing && dist < g.userData.activationRadius) g.userData.isChasing = true; if (g.userData.isChasing) { const direction = player.position.clone().sub(g.position).normalize(); g.position.add(direction.multiplyScalar(g.userData.chaseSpeed * delta)); } g.position.y = g.userData.initialY + Math.sin(elapsedTime * 2) * 0.5; });
                movingPlatforms.forEach(p => { const { initialPosition, moveAxis, moveRange, moveSpeed } = p.userData; const newPos = p.position.clone(); newPos[moveAxis] = initialPosition[moveAxis] + Math.sin(elapsedTime * moveSpeed) * moveRange; p.position.copy(newPos); p.userData.velocity.copy(p.position).sub(p.userData.lastPosition).divideScalar(delta); p.userData.lastPosition.copy(p.position); });
                shrinkingPlatforms.forEach(p => { if (p.userData.isShrinking) { const progress = Math.min((elapsedTime - p.userData.shrinkStartTime) / p.userData.shrinkDuration, 1.0); p.scale.set(1 - progress, 1, 1 - progress); if (progress >= 1.0) p.visible = false; } });
                lasers.forEach(l => { const { type, speed, initialPosition, range } = l.userData; if (type === 'rotating') l.rotation.y = elapsedTime * speed; else l.position.x = initialPosition.x + Math.sin(elapsedTime * speed) * range; });
                spikeBlocks.forEach(s => { if (s.userData.initialPosition) { const { initialPosition, patrolAxis, patrolDistance, patrolSpeed } = s.userData; (s.position as any)[patrolAxis] = initialPosition[patrolAxis] + Math.sin(elapsedTime * patrolSpeed) * patrolDistance; } });
                ramBots.forEach(r => { r.userData.stateTimer -= delta; const light = r.getObjectByName('statusLight'); if (light && light instanceof THREE.Mesh) { const mat = light.material as THREE.MeshStandardMaterial; switch(r.userData.state){ case 'idle': mat.emissive.setHex(0x34d399); break; case 'aiming': mat.emissive.setHex(0xfbbf24); break; case 'charging': mat.emissive.setHex(0xef4444); break; case 'cooldown': mat.emissive.setHex(0x60a5fa); break; } }
                    switch(r.userData.state){ case 'idle': if(player.position.distanceTo(r.position) < 20) { r.userData.state = 'aiming'; r.userData.stateTimer = 0.7; } break; case 'aiming': r.lookAt(player.position); if(r.userData.stateTimer <= 0){ playSound('ramBotCharge'); r.userData.state = 'charging'; r.userData.stateTimer = 2.0; const chargeDir = new THREE.Vector3(); r.getWorldDirection(chargeDir); r.userData.chargeVector = chargeDir.multiplyScalar(r.userData.chargeSpeed); } break; case 'charging': r.position.add(r.userData.chargeVector.clone().multiplyScalar(delta)); if(r.userData.stateTimer <= 0 || r.position.x < r.userData.platformBounds.minX || r.position.x > r.userData.platformBounds.maxX || r.position.z < r.userData.platformBounds.minZ || r.position.z > r.userData.platformBounds.maxZ) { r.userData.state = 'cooldown'; r.userData.stateTimer = 3.0;} break; case 'cooldown': if(r.userData.stateTimer <= 0) { r.userData.state = 'idle'; } break; } });
                sentinelEyes.forEach(s => { const cone = s.getObjectByName('viewCone') as THREE.Mesh; const coneMat = cone.material as THREE.MeshBasicMaterial; s.userData.stateTimer -= delta; switch(s.userData.state) { case 'scan': s.rotation.y += 0.5 * delta; const viewDirection = new THREE.Vector3(); s.getWorldDirection(viewDirection); const toPlayer = player.position.clone().sub(s.position).normalize(); const angle = viewDirection.angleTo(toPlayer); const detectionAngle = Math.atan(5 / 15); if(angle < detectionAngle && player.position.distanceTo(s.position) < s.userData.range) { s.userData.state = 'locked'; s.userData.stateTimer = 5.0; } coneMat.opacity = 0.2; break; case 'locked': s.lookAt(player.position); coneMat.opacity = 0.4 + Math.sin(elapsedTime * 20) * 0.1; if (elapsedTime > s.userData.lastFired + s.userData.fireRate) { s.userData.lastFired = elapsedTime; playSound('laserFire'); const projectile = createProjectile(); projectile.position.copy(s.position); const direction = player.position.clone().sub(projectile.position).normalize(); projectile.userData = { velocity: direction.multiplyScalar(15), lifetime: 5.0, shouldBeRemoved: false }; scene.add(projectile); projectiles.push(projectile); } if(s.userData.stateTimer <= 0) { s.userData.state = 'scan'; } break; } });
                for (let i = projectiles.length - 1; i >= 0; i--) { const p = projectiles[i]; p.userData.lifetime -= delta; p.position.add(p.userData.velocity.clone().multiplyScalar(delta)); if (p.userData.lifetime <= 0 || p.userData.shouldBeRemoved) { scene.remove(p); projectiles.splice(i, 1); } }
                hearts3D.forEach(h => { h.rotation.y += 1 * delta; const initialY = initialItemY.get(h) ?? h.position.y; h.position.y = initialY + Math.sin(elapsedTime * 2 + h.id) * 0.2; });
                if (endTunnel) { endTunnel.rotation.x += 1 * delta; endTunnel.rotation.y += 0.5 * delta; const allApplesCollected = scoreRef.current === levelData.numApples && levelData.numApples > 0; const material = endTunnel.material as THREE.MeshStandardMaterial; if (!isBossLevelRef.current && allApplesCollected) material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 1.5 + Math.sin(elapsedTime * 5) * 0.5, 0.1); else material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.5, 0.1); }
                
                const baseCameraOffset = new THREE.Vector3(0, 6, 10);
                const cameraOffset = isBossLevelRef.current ? baseCameraOffset.clone().multiplyScalar(1.5) : baseCameraOffset;
                camera.position.lerp(player.position.clone().add(cameraOffset), 0.08);

                if (isBossLevelRef.current && bossRef.current) {
                    const lookAtPosition = bossRef.current.position.clone();
                    lookAtPosition.y = Math.max(lookAtPosition.y - 2, 0);
                    camera.lookAt(lookAtPosition);
                } else {
                    camera.lookAt(player.position);
                }
                renderer.render(scene, camera);
            };
            
            animate();

            return () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
                if (currentMount && renderer.domElement) currentMount.removeChild(renderer.domElement);
                scene.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose(); } });
                renderer.dispose();
            };
        };

        const cleanup = init();
        return () => { cleanup.then(cleaner => cleaner()); };
    }, [levelData, characterId, JUMP_FORCE, PLAYER_SPEED, upgrades.doubleJump, upgrades.tripleJump, upgrades.maxLives, setLives, handleSessionEndCallback, isMobile, joystickVector, t, upgrades.groundPound]);

    const renderOverlay = () => {
        if (gameState === 'gameOver') return <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white"><h2 className="text-4xl sm:text-6xl font-bold">{t('gameOver')}</h2></div>;
        if (gameState === 'levelComplete') return <div className="absolute inset-0 bg-blue-900 bg-opacity-70 flex flex-col justify-center items-center text-white"><h2 className="text-4xl sm:text-6xl font-bold">{t('levelComplete', {level: level})}</h2></div>;
        return null;
    }

    return (
        <div className="relative w-full h-full">
            <div ref={mountRef} className="w-full h-full" />
            {isLoading && (<div className="absolute inset-0 bg-gray-900 flex justify-center items-center z-10"><h2 className="text-4xl text-white font-bold animate-pulse">{t('loading')}</h2></div>)}
            {!isLoading && (
                 <>
                    {bossHealth !== null && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/2 max-w-lg bg-gray-900 bg-opacity-70 rounded-full h-6 border-2 border-white z-10">
                            <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${(bossHealth.current / bossHealth.max) * 100}%` }}></div>
                            <span className="absolute inset-0 text-white font-bold flex items-center justify-center text-sm" style={{ textShadow: '1px 1px 2px black' }}>{t('boss.skullKing')}</span>
                        </div>
                    )}
                    <div className="absolute top-0 left-0 w-full p-2 sm:p-4 md:p-6 flex justify-between items-start text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                        <div className="flex flex-col items-start gap-2 pointer-events-none"><h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-black bg-opacity-50 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">{t('lives')}: {lives}</h2></div>
                        <div className="text-center">
                            <div className="pointer-events-none">
                                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold">
                                    {isBossLevelRef.current ? t('boss.title', { num: level / 10 }) : (levelData?.theme.nameKey ? t(levelData.theme.nameKey) : '...')}
                                </h1>
                                <p className="mt-1 sm:mt-2 text-base sm:text-lg">{t('levelLabel')}: {level}</p>
                            </div>
                             <button onClick={handlePause} className="mt-2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-lg shadow-md hover:bg-yellow-600 transition-colors pointer-events-auto">
                                {t('pause')}
                            </button>
                        </div>
                        {!isBossLevelRef.current && <div className="text-right pointer-events-none"><h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-black bg-opacity-50 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">{t('apples')}: {score} / {numApples}</h2></div>}
                    </div>
                    {isMobile && <MobileControls keysRef={keysRef} joystickVector={joystickVector} t={t} />}
                 </>
            )}
            {isPaused && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white z-20">
                    <h2 className="text-4xl sm:text-6xl font-bold mb-8" style={{ textShadow: '3px 3px 0px #1e3a8a' }}>{t('pauseTitle')}</h2>
                    <div className="flex flex-col gap-4 w-64">
                        <button onClick={handleResume} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            {t('resume')}
                        </button>
                        <button onClick={handleGiveUp} className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            {t('giveUp')}
                        </button>
                    </div>
                </div>
            )}
            {renderOverlay()}
        </div>
    );
};