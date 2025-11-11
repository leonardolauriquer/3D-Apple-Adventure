

import { useState, useEffect, useCallback } from 'react';
import { Upgrades, CharacterId, Language, View } from '../types';
import { BASE_MAX_LIVES } from '../config/constants';
import { User } from 'firebase/auth';
import { db, firebaseEnabled } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';


export const useGameState = (user: User | null, isOffline: boolean) => {
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
        return null; // Don't save if not logged in and not in offline mode
    }, [user, isOffline]);

    // Load data from localStorage when user logs in or enters offline mode
    useEffect(() => {
        const key = getSaveKey();
        if (!key) return;

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
                setUpgradePoints(upgradePoints || 0); setCurrentLevel(currentLevel || 1);
                setCharacterId(characterId || 'default'); setUpgrades(loadedUpgrades);
                setDiamonds(diamonds || 0); setLives(loadedUpgrades.maxLives); 
                setUnlockedCharacters(unlockedCharacters || ['default']);
                setDailyRewardStreak(dailyRewardStreak || 0);
                setLastLoginDate(lastLoginDate || null);
            } else {
                 setUpgradePoints(0); setLives(upgrades.maxLives); setDiamonds(0);
                 setDailyRewardStreak(0); setLastLoginDate(null);
            }
        } catch (error) {
            console.error("Failed to load game data from local storage:", error);
            setLives(upgrades.maxLives);
        }

        // Fetch highest level from Firestore
        const fetchHighestLevel = async () => {
            if (!user || !firebaseEnabled || !db) {
                setHighestLevel(currentLevel); // Use local currentLevel as fallback in offline
                return;
            }
            const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
            const docSnap = await getDoc(leaderboardDocRef);
            if (docSnap.exists()) {
                setHighestLevel(docSnap.data().highestLevel || 1);
            } else {
                setHighestLevel(1);
            }
        };
        fetchHighestLevel();

    }, [user, getSaveKey, isOffline]);


    // Save data to localStorage whenever it changes
    useEffect(() => {
        const key = getSaveKey();
        if (!key) return;
        try {
            const dataToSave = JSON.stringify({ upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate });
            localStorage.setItem(key, dataToSave);
        } catch (error) { console.error("Failed to save game data to local storage:", error); }
    }, [upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate, getSaveKey]);
    
    // Sync highest level to Firestore
    useEffect(() => {
        const syncHighestLevel = async () => {
            if (!user || highestLevel <= 1 || !firebaseEnabled || !db) return;
            try {
                const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
                 await setDoc(leaderboardDocRef, {
                    playerName: user.displayName,
                    photoURL: user.photoURL,
                    highestLevel: highestLevel,
                    lastUpdated: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Failed to update leaderboard:", error);
            }
        };

        syncHighestLevel();
    }, [highestLevel, user]);

     useEffect(() => {
        setLives(l => Math.min(l, upgrades.maxLives));
    }, [upgrades.maxLives]);

    return {
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
    };
};
