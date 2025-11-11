
import { useState, useEffect, useCallback, useRef } from 'react';
import { Upgrades, CharacterId, Language, View } from '../types';
import { BASE_MAX_LIVES } from '../config/constants';
import { User } from 'firebase/auth';
import { db, firebaseEnabled } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';


export const useGameState = (user: User | null, isOffline: boolean) => {
    const [isStateLoaded, setIsStateLoaded] = useState(false);
    const [view, setView] = useState<View>('menu');
    const [upgradePoints, setUpgradePoints] = useState(0);
    const [diamonds, setDiamonds] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [characterId, setCharacterId] = useState<CharacterId>('default');
    const [unlockedCharacters, setUnlockedCharacters] = useState<CharacterId[]>(['default']);
    const [upgrades, setUpgrades] = useState<Upgrades>({ speed: 0, jump: 0, doubleJump: false, tripleJump: false, groundPound: false, maxLives: BASE_MAX_LIVES });
    const [lives, setLives] = useState(BASE_MAX_LIVES);
    const [language, setLanguage] = useState<Language>('en');
    const [dailyRewardStreak, setDailyRewardStreak] = useState(0);
    const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
    const [highestLevel, setHighestLevel] = useState(1);
    
    const getSaveKey = useCallback(() => {
        if (user) {
            return `appleAdventure3DData_${user.uid}`;
        }
        if (isOffline) {
            return 'appleAdventure3DData_offline';
        }
        return null;
    }, [user, isOffline]);

    // Ref para manter o estado salvável mais recente para evitar salvar dados obsoletos de closures.
    const savableStateRef = useRef({
        upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate
    });
    
    useEffect(() => {
        savableStateRef.current = {
            upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate
        };
    }, [upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate]);


    const claimDailyRewardAndUpdateState = useCallback((rewardInfo: { day: number, amount: number, type: 'points' | 'diamonds' }) => {
        const key = getSaveKey();
        if (!key) return;

        const currentState = savableStateRef.current;
        const newPoints = rewardInfo.type === 'points' ? currentState.upgradePoints + rewardInfo.amount : currentState.upgradePoints;
        const newDiamonds = rewardInfo.type === 'diamonds' ? currentState.diamonds + rewardInfo.amount : currentState.diamonds;
        const today = new Date().toISOString().split('T')[0];

        const newStateToSave = {
            ...currentState,
            upgradePoints: newPoints,
            diamonds: newDiamonds,
            dailyRewardStreak: rewardInfo.day,
            lastLoginDate: today,
        };
        
        try {
            // Salva o novo estado de forma síncrona para garantir a persistência.
            localStorage.setItem(key, JSON.stringify(newStateToSave));

            // Em seguida, atualiza o estado do React para refletir a mudança na UI.
            setUpgradePoints(newPoints);
            setDiamonds(newDiamonds);
            setDailyRewardStreak(rewardInfo.day);
            setLastLoginDate(today);

        } catch (error) {
            console.error("Falha ao salvar o estado da recompensa diária:", error);
        }
    }, [getSaveKey]);


    useEffect(() => {
        const loadGameData = async () => {
            setIsStateLoaded(false);
            const key = getSaveKey();
            let loadedCurrentLevel = 1;

            if (!key) {
                // Resetar para o estado padrão se não estiver logado e não estiver offline
                setUpgradePoints(0); setDiamonds(0); setCurrentLevel(1);
                setCharacterId('default'); setUnlockedCharacters(['default']);
                setUpgrades({ speed: 0, jump: 0, doubleJump: false, tripleJump: false, groundPound: false, maxLives: BASE_MAX_LIVES });
                setLives(BASE_MAX_LIVES); setDailyRewardStreak(0); setLastLoginDate(null);
                setHighestLevel(1); setIsStateLoaded(true);
                return;
            }

            try {
                const savedLang = localStorage.getItem('appleAdventure3DLang');
                 if (savedLang && ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh', 'hi', 'ar'].includes(savedLang)) {
                    setLanguage(savedLang as Language);
                }

                const savedData = localStorage.getItem(key);
                if (savedData) {
                    const { upgradePoints, currentLevel, characterId, upgrades, unlockedCharacters, diamonds, dailyRewardStreak, lastLoginDate } = JSON.parse(savedData);
                    const loadedUpgrades = upgrades ? {
                        speed: upgrades.speed || 0, jump: upgrades.jump || 0,
                        doubleJump: upgrades.doubleJump || false, tripleJump: upgrades.tripleJump || false,
                        groundPound: upgrades.groundPound || false,
                        maxLives: upgrades.maxLives || BASE_MAX_LIVES,
                    } : { speed: 0, jump: 0, doubleJump: false, tripleJump: false, groundPound: false, maxLives: BASE_MAX_LIVES };
                    setUpgradePoints(upgradePoints || 0);
                    setCurrentLevel(currentLevel || 1);
                    loadedCurrentLevel = currentLevel || 1;
                    setCharacterId(characterId || 'default');
                    setUpgrades(loadedUpgrades);
                    setDiamonds(diamonds || 0);
                    setLives(loadedUpgrades.maxLives); 
                    setUnlockedCharacters(unlockedCharacters || ['default']);
                    setDailyRewardStreak(dailyRewardStreak || 0);
                    setLastLoginDate(lastLoginDate || null);
                } else {
                     setUpgradePoints(0); setLives(upgrades.maxLives); setDiamonds(0);
                     setDailyRewardStreak(0); setLastLoginDate(null);
                }
            } catch (error) {
                console.error("Falha ao carregar dados do jogo do armazenamento local:", error);
                setLives(upgrades.maxLives);
            }

            // Buscar o nível mais alto do Firestore
            if (!user || !firebaseEnabled || !db) {
                setHighestLevel(loadedCurrentLevel);
            } else {
                try {
                    const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
                    const docSnap = await getDoc(leaderboardDocRef);
                    if (docSnap.exists()) {
                        setHighestLevel(docSnap.data().highestLevel || 1);
                    } else {
                        setHighestLevel(1);
                    }
                } catch (err) {
                     console.error("Falha ao buscar o nível mais alto:", err);
                     setHighestLevel(loadedCurrentLevel);
                }
            }
            
            setIsStateLoaded(true);
        };
        
        loadGameData();
    }, [user, getSaveKey, isOffline]);


    // Este salvamento genérico ainda é necessário para outras ações como comprar upgrades.
    // Pode ser executado redundantemente após a coleta da recompensa diária, mas isso é seguro.
    // A parte importante é que o salvamento da recompensa diária é síncrono e garantido.
    useEffect(() => {
        if (!isStateLoaded) return; // Não salvar até que o estado inicial seja carregado
        const key = getSaveKey();
        if (!key) return;
        try {
            // Usa a ref para garantir que estamos sempre salvando os dados mais recentes
            localStorage.setItem(key, JSON.stringify(savableStateRef.current));
        } catch (error) { console.error("Falha ao salvar dados do jogo no armazenamento local:", error); }
    }, [upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate, getSaveKey, isStateLoaded]);
    
    // Sincronizar o nível mais alto com o Firestore
    useEffect(() => {
        const syncHighestLevel = async () => {
            if (!user || highestLevel <= 1 || !firebaseEnabled || !db || !isStateLoaded) return;
            try {
                const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
                 await setDoc(leaderboardDocRef, {
                    playerName: user.displayName,
                    photoURL: user.photoURL,
                    highestLevel: highestLevel,
                    lastUpdated: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Falha ao atualizar o placar:", error);
            }
        };

        syncHighestLevel();
    }, [highestLevel, user, isStateLoaded]);

     useEffect(() => {
        setLives(l => Math.min(l, upgrades.maxLives));
    }, [upgrades.maxLives]);

    return {
        isStateLoaded,
        view, setView,
        upgradePoints, setUpgradePoints,
        diamonds, setDiamonds,
        currentLevel, setCurrentLevel,
        characterId, setCharacterId,
        unlockedCharacters, setUnlockedCharacters,
        upgrades, setUpgrades,
        lives, setLives,
        language, setLanguage,
        dailyRewardStreak, setDailyRewardStreak,
        lastLoginDate, setLastLoginDate,
        highestLevel, setHighestLevel,
        claimDailyRewardAndUpdateState,
    };
};
