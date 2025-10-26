import { useState, useEffect } from 'react';
import { Upgrades, CharacterId, Language, View } from '../types';
import { BASE_MAX_LIVES } from '../config/constants';

export const useGameState = () => {
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

    useEffect(() => {
        try {
            const savedLang = localStorage.getItem('appleAdventure3DLang');
            if (savedLang && ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh', 'hi', 'ar'].includes(savedLang)) {
                setLanguage(savedLang as Language);
            } else {
                setView('langSelect');
            }
            const savedData = localStorage.getItem('appleAdventure3DData');
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
            console.error("Failed to load game data:", error);
            setLives(upgrades.maxLives);
        }
    }, []);


    useEffect(() => {
        try {
            const dataToSave = JSON.stringify({ upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate });
            localStorage.setItem('appleAdventure3DData', dataToSave);
        } catch (error) { console.error("Failed to save game data:", error); }
    }, [upgradePoints, diamonds, currentLevel, characterId, upgrades, unlockedCharacters, dailyRewardStreak, lastLoginDate]);
    
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
        lastLoginDate, setLastLoginDate
    };
};