import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useTranslation } from './hooks/useTranslation';
import { Language } from './types';
import { calculateLevelReward } from './utils/gameplay';
import { setMuted, preloadAllSounds, playMusic, stopMusic } from './utils/audio';
import { MainMenu } from './components/ui/MainMenu';
import { MenuBackground } from './components/ui/MenuBackground';
import { LanguageSelector } from './components/ui/LanguageSelector';
import { Wiki } from './components/ui/Wiki';
import { DiamondShop } from './components/ui/DiamondShop';
import { DailyReward } from './components/ui/DailyReward';
import { LevelCompleteScreen } from './components/ui/LevelCompleteScreen';
import { Game } from './components/game/Game';

const App: React.FC = () => {
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
        lastLoginDate, setLastLoginDate
    } = useGameState();

    const [isMuted, setIsMuted] = useState(false);
    const [soundsLoaded, setSoundsLoaded] = useState(false);
    const [userInteracted, setUserInteracted] = useState(false);
    const [dailyRewardInfo, setDailyRewardInfo] = useState<{ day: number, amount: number, type: 'points' | 'diamonds' } | null>(null);
    const joystickVector = useRef({ x: 0, y: 0 });
    const t = useTranslation(language);
    
    useEffect(() => {
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
            // A recompensa agora é sempre 20 pontos
            const reward = { type: 'points', amount: 20 }; 
            setDailyRewardInfo({ day: newStreak, amount: reward.amount, type: reward.type as 'points' | 'diamonds' });
        }
    }, [soundsLoaded]); // Depende de soundsLoaded para garantir que seja executado após a hidratação do estado inicial.

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
            setUserInteracted(true);
            window.removeEventListener('click', unlockAudio); window.removeEventListener('touchstart', unlockAudio); window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('click', unlockAudio); window.addEventListener('touchstart', unlockAudio); window.addEventListener('keydown', unlockAudio);
        return () => {
            window.removeEventListener('click', unlockAudio); window.removeEventListener('touchstart', unlockAudio); window.removeEventListener('keydown', unlockAudio);
        };
    }, []);


    useEffect(() => {
        preloadAllSounds().then(() => setSoundsLoaded(true));
    }, []);

    useEffect(() => {
        if (!soundsLoaded || !userInteracted || dailyRewardInfo) return;
        
        if (view === 'game') {
            stopMusic('menu');
        } else {
            // Qualquer visualização que NÃO seja o jogo deve tocar a música do menu.
            // Isso inclui 'menu', 'levelCompleteScreen', 'wiki', 'diamondShop'.
            // A limpeza do componente Game cuidará de parar a música do jogo.
            playMusic('menu', 0.7, true);
        }

    }, [view, soundsLoaded, userInteracted, dailyRewardInfo]);

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
            setCurrentLevel(prev => prev + 1);
            setView('levelCompleteScreen');
        } else { setCurrentLevel(1); setView('menu'); }
    }, [currentLevel, setCurrentLevel, setUpgradePoints, setView]);

    const handleSelectLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('appleAdventure3DLang', lang);
        setView('menu');
    };

    if (!soundsLoaded) {
        return (
            <div className="w-full h-full bg-gray-900 flex justify-center items-center">
                <h1 className="text-4xl text-white font-bold animate-pulse">{t('loadingSounds')}</h1>
            </div>
        );
    }
    
    if (dailyRewardInfo && view !== 'langSelect') {
         return <DailyReward t={t} day={dailyRewardInfo.day} rewardAmount={dailyRewardInfo.amount} rewardType={dailyRewardInfo.type} onClaim={handleClaimReward} />;
    }

    const renderContent = () => {
        switch (view) {
            case 'langSelect': return <LanguageSelector t={t} onSelectLanguage={handleSelectLanguage} />;
            case 'wiki': return <Wiki t={t} onClose={() => { setView('menu'); }} />;
            case 'diamondShop': return <DiamondShop t={t} setDiamonds={setDiamonds} onClose={() => { setView('menu'); }} />;
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
                            isMuted={isMuted} onToggleMute={handleToggleMute} />
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