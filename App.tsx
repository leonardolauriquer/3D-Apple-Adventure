
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useGameState } from './src/hooks/useGameState';
import { useTranslation } from './src/hooks/useTranslation';
import { Language } from './src/types';
import { calculateLevelReward } from './src/utils/gameplay';
import { setMuted, preloadAllSounds, playMusic, stopMusic } from './src/utils/audio';
import { MainMenu } from './src/components/ui/MainMenu';
import { MenuBackground } from './src/components/ui/MenuBackground';
import { LanguageSelector } from './src/components/ui/LanguageSelector';
import { Wiki } from './src/components/ui/Wiki';
import { DiamondShop } from './src/components/ui/DiamondShop';
import { DailyReward } from './src/components/ui/DailyReward';
import { LevelCompleteScreen } from './src/components/ui/LevelCompleteScreen';
import { Game } from './src/components/game/Game';
import { Ranking } from './src/components/ui/Ranking';
import { LoginScreen } from './src/components/ui/LoginScreen';
import { auth, firebaseEnabled } from './src/config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const {
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
        highestLevel, setHighestLevel
    } = useGameState(user, isOfflineMode);

    const [isMuted, setIsMuted] = useState(false);
    const [soundsLoaded, setSoundsLoaded] = useState(false);
    const [userInteracted, setUserInteracted] = useState(false);
    const [dailyRewardInfo, setDailyRewardInfo] = useState<{ day: number, amount: number, type: 'points' | 'diamonds' } | null>(null);
    const joystickVector = useRef({ x: 0, y: 0 });
    const t = useTranslation(language);
    
    useEffect(() => {
        if (!firebaseEnabled || !auth) {
            setIsAuthLoading(false);
            setUser(null);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
            if (currentUser) {
                const savedLang = localStorage.getItem('appleAdventure3DLang');
                 if (!savedLang) {
                    setView('langSelect');
                } else {
                    setView('menu');
                }
            }
        });
        return () => unsubscribe();
    }, [setView]);

    useEffect(() => {
        if (!user) return; // Only check daily reward if user is logged in
        const today = new Date().toISOString().split('T')[0];
        if (lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            let newStreak = 1;
            if (lastLoginDate === yesterdayStr) {
                newStreak = dailyRewardStreak + 1;
            }
            setDailyRewardStreak(newStreak);
            const reward = { type: 'points', amount: 20 }; 
            setDailyRewardInfo({ day: newStreak, amount: reward.amount, type: reward.type as 'points' | 'diamonds' });
        }
    }, [user, soundsLoaded, dailyRewardStreak, lastLoginDate, setDailyRewardStreak, setLastLoginDate]);

    const handleClaimReward = () => {
        if (!dailyRewardInfo) return;
        if (dailyRewardInfo.type === 'points') {
            setUpgradePoints(p => p + dailyRewardInfo.amount);
        } else {
            setDiamonds(d => d + dailyRewardInfo.amount);
        }
        setLastLoginDate(new Date().toISOString().split('T')[0]);
        setDailyRewardInfo(null);
    };

    useEffect(() => {
        const unlockAudio = () => {
            if (!userInteracted) {
                 setUserInteracted(true);
                 window.removeEventListener('click', unlockAudio); window.removeEventListener('touchstart', unlockAudio); window.removeEventListener('keydown', unlockAudio);
            }
        };
        window.addEventListener('click', unlockAudio); window.addEventListener('touchstart', unlockAudio); window.addEventListener('keydown', unlockAudio);
        return () => {
            window.removeEventListener('click', unlockAudio); window.removeEventListener('touchstart', unlockAudio); window.removeEventListener('keydown', unlockAudio);
        };
    }, [userInteracted]);


    useEffect(() => {
        preloadAllSounds().then(() => setSoundsLoaded(true));
    }, []);

    useEffect(() => {
        if (!soundsLoaded || !userInteracted || dailyRewardInfo || (!user && !isOfflineMode)) return;
        
        if (view === 'game') {
            stopMusic('menu');
        } else {
            playMusic('menu', 0.7, true);
        }

    }, [view, soundsLoaded, userInteracted, dailyRewardInfo, user, isOfflineMode]);

    const handleToggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMutedState = !prev;
            setMuted(newMutedState);
            return newMutedState;
        });
    }, []);

    const handleStartGame = useCallback(() => {
        setLives(upgrades.maxLives);
        setView('game');
    }, [upgrades.maxLives, setView, setLives]);

    const handleSessionEnd = useCallback((status: 'gameOver' | 'levelComplete') => {
        if (status === 'levelComplete') {
            const reward = calculateLevelReward(currentLevel);
            setUpgradePoints(prev => prev + reward);
            const newHighest = Math.max(highestLevel, currentLevel + 1);
            if (newHighest > highestLevel) {
                 setHighestLevel(newHighest);
            }
            setCurrentLevel(prev => prev + 1);
            setView('levelCompleteScreen');
        } else { setCurrentLevel(1); setView('menu'); }
    }, [currentLevel, setCurrentLevel, setUpgradePoints, setView, setHighestLevel, highestLevel]);

    const handleSelectLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('appleAdventure3DLang', lang);
        setView('menu');
    };

    if (!soundsLoaded || isAuthLoading) {
        return (
            <div className="w-full h-full bg-gray-900 flex justify-center items-center">
                <h1 className="text-4xl text-white font-bold animate-pulse">{t(isAuthLoading ? 'loading' : 'loadingSounds')}</h1>
            </div>
        );
    }

    if (!firebaseEnabled && !isOfflineMode) {
        return <LoginScreen t={t} onPlayOffline={() => setIsOfflineMode(true)} />;
    }

    if (!user && !isOfflineMode) {
        return <LoginScreen t={t} onPlayOffline={() => setIsOfflineMode(true)} />;
    }
    
    if (dailyRewardInfo && view !== 'langSelect') {
         return <DailyReward t={t} day={dailyRewardInfo.day} rewardAmount={dailyRewardInfo.amount} rewardType={dailyRewardInfo.type} onClaim={handleClaimReward} />;
    }

    const renderContent = () => {
        switch (view) {
            case 'langSelect': return <LanguageSelector t={t} onSelectLanguage={handleSelectLanguage} />;
            case 'wiki': return <Wiki t={t} onClose={() => { setView('menu'); }} />;
            case 'diamondShop': return <DiamondShop t={t} setDiamonds={setDiamonds} onClose={() => { setView('menu'); }} />;
            case 'ranking': return <Ranking t={t} onClose={() => setView('menu')} user={user} />;
            case 'menu':
                return (
                    <div className="w-full h-full relative">
                        <MenuBackground />
                        <MainMenu 
                            upgradePoints={upgradePoints} diamonds={diamonds} upgrades={upgrades} characterId={characterId} 
                            unlockedCharacters={unlockedCharacters} currentLevel={currentLevel} setUpgradePoints={setUpgradePoints} 
                            setDiamonds={setDiamonds} setUpgrades={setUpgrades} setCharacterId={setCharacterId} 
                            setUnlockedCharacters={setUnlockedCharacters} setCurrentLevel={setCurrentLevel} onStartGame={handleStartGame} 
                            t={t} onShowWiki={() => setView('wiki')} onShowDiamondShop={() => setView('diamondShop')}
                            isMuted={isMuted} onToggleMute={handleToggleMute}
                            onShowRanking={() => setView('ranking')} user={user}
                            isOfflineMode={isOfflineMode}
                            />
                    </div>
                );
            case 'levelCompleteScreen':
                return <LevelCompleteScreen t={t} currentLevel={currentLevel} onNextLevel={() => { setView('game'); }} onBackToMenu={() => { setView('menu'); }} />;
            case 'game':
                return <Game characterId={characterId} upgrades={upgrades} onSessionEnd={handleSessionEnd} initialLevel={currentLevel} lives={lives} setLives={setLives} joystickVector={joystickVector} t={t} />;
            default: return <div>Error: Unknown view</div>;
        }
    };
    
    return (
        <div className="w-full h-full">
            {renderContent()}
        </div>
    );
};

export default App;
