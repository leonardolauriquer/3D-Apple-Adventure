

import React, { useState } from 'react';
import { Upgrades, CharacterId } from '../../types';
import { charactersData, UPGRADE_COST_BASE, UPGRADE_COST_MULTIPLIER, MAX_STAT_UPGRADE_LEVEL, MAX_LIVES_UPGRADE_LEVEL, BASE_MAX_LIVES, DOUBLE_JUMP_COST, TRIPLE_JUMP_COST, GROUND_POUND_COST, LEVEL_SKIP_COST, DIAMOND_TO_POINTS_RATIO } from '../../config/constants';
import { playSound } from '../../utils/audio';
import { User } from 'firebase/auth';
import { firebaseEnabled } from '../../config/firebase';

interface MainMenuProps {
    upgradePoints: number; diamonds: number; upgrades: Upgrades;
    characterId: CharacterId; unlockedCharacters: CharacterId[];
    currentLevel: number;
    setUpgradePoints: React.Dispatch<React.SetStateAction<number>>;
    setDiamonds: React.Dispatch<React.SetStateAction<number>>;
    setUpgrades: React.Dispatch<React.SetStateAction<Upgrades>>;
    setCharacterId: React.Dispatch<React.SetStateAction<CharacterId>>;
    setUnlockedCharacters: React.Dispatch<React.SetStateAction<CharacterId[]>>;
    setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
    onStartGame: () => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
    onShowWiki: () => void;
    onShowDiamondShop: () => void;
    onShowRanking: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
    user: User | null;
    isOfflineMode: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ upgradePoints, diamonds, upgrades, characterId, unlockedCharacters, currentLevel, setUpgradePoints, setDiamonds, setUpgrades, setCharacterId, setUnlockedCharacters, setCurrentLevel, onStartGame, t, onShowWiki, onShowDiamondShop, isMuted, onToggleMute, onShowRanking, user, isOfflineMode }) => {
    const [diamondConversionAmount, setDiamondConversionAmount] = useState('');
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);

    const getUpgradeCost = (level: number) => Math.floor(UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, level));

    const handleStatUpgrade = (type: 'speed' | 'jump') => {
        const cost = getUpgradeCost(upgrades[type]);
        if (upgradePoints >= cost && upgrades[type] < MAX_STAT_UPGRADE_LEVEL) {
            playSound('purchase');
            setUpgradePoints(p => p - cost);
            setUpgrades(u => ({ ...u, [type]: u[type] + 1 }));
        }
    };
    
    const handleMaxLivesUpgrade = () => {
        const cost = getUpgradeCost(upgrades.maxLives - BASE_MAX_LIVES);
        if (upgradePoints >= cost && upgrades.maxLives < MAX_LIVES_UPGRADE_LEVEL) {
            playSound('purchase');
            setUpgradePoints(p => p - cost);
            setUpgrades(u => ({ ...u, maxLives: u.maxLives + 1 }));
        }
    };

    const handleBuyOneTimeUpgrade = (type: 'doubleJump' | 'tripleJump' | 'groundPound') => {
        const costMap = { doubleJump: DOUBLE_JUMP_COST, tripleJump: TRIPLE_JUMP_COST, groundPound: GROUND_POUND_COST };
        const cost = costMap[type];
        if (upgradePoints >= cost && !upgrades[type]) {
            playSound('purchase');
            setUpgradePoints(p => p - cost);
            setUpgrades(u => ({ ...u, [type]: true }));
        }
    };

    const handleBuyCharacter = (char: typeof charactersData[0]) => {
        if (upgradePoints >= char.price) {
            playSound('purchase');
            setUpgradePoints(p => p - char.price);
            setUnlockedCharacters(unlocked => [...unlocked, char.id]);
        }
    };
    
    const handleLevelSkip = () => {
        if (upgradePoints >= LEVEL_SKIP_COST) {
            playSound('purchase');
            setUpgradePoints(p => p - LEVEL_SKIP_COST);
            setCurrentLevel(c => c + 10);
        }
    };

    const handleDiamondConversion = () => {
        const amount = parseInt(diamondConversionAmount, 10);
        if (isNaN(amount) || amount <= 0) return;
        if (diamonds >= amount) {
            playSound('purchase');
            setDiamonds(d => d - amount);
            setUpgradePoints(p => p + amount * DIAMOND_TO_POINTS_RATIO);
            setDiamondConversionAmount('');
        } else {
            alert(t('notEnoughDiamonds'));
        }
    };

    const conversionAmountNum = parseInt(diamondConversionAmount, 10) || 0;
    const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (<svg className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>);

    const MuteIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
    );
    const UnmuteIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l2 2" />
        </svg>
    );

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 font-sans">
             <div className="absolute top-4 right-4 z-20">
                <button onClick={() => { playSound('menuClick'); onToggleMute(); }} title={isMuted ? "Unmute" : "Mute"} className="p-2 rounded-full bg-white/50 hover:bg-gray-200/70 text-gray-800 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    {isMuted ? <UnmuteIcon /> : <MuteIcon />}
                </button>
            </div>
            
             <div className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[95vh]">
                 <div className="w-full mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-red-700 mb-2">{t('mainMenuTitle')}</h1>
                    {user && (
                        <div className="flex items-center justify-center gap-2 mb-2 text-gray-700">
                             <span className="text-lg">{t('welcome')}, <span className="font-bold">{user.displayName}</span>!</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-lg sm:text-xl mb-2 text-gray-700">
                        <p>{t('upgradePoints')}: <span className="font-bold text-purple-600">{upgradePoints}</span></p>
                        <p>{t('diamonds')}: <span className="font-bold text-cyan-600">{diamonds} 💎</span></p>
                    </div>
                    <p className="text-lg sm:text-xl mb-6 text-gray-700">{t('nextLevel')}: <span className="font-bold text-green-600">{currentLevel}</span></p>
                    
                    <div className="flex flex-col gap-4 mt-6">
                        <button onClick={() => { playSound('menuClick'); onStartGame(); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105">{t('startGame')}</button>
                        {firebaseEnabled && !isOfflineMode && user && (
                            <button onClick={() => { playSound('menuClick'); onShowRanking(); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105">{t('ranking.title')}</button>
                        )}
                        <button onClick={() => { playSound('menuClick'); onShowDiamondShop(); }} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 text-xl rounded-lg shadow-lg transition-transform transform hover:scale-105">{t('getDiamonds')}</button>
                    </div>
                    
                    <div className="w-full flex flex-col gap-4 mt-8">
                        {/* Upgrades Section */}
                        <button onClick={() => { playSound('menuClick'); setIsUpgradesOpen(!isUpgradesOpen); }} className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg w-full flex justify-between items-center text-xl font-bold text-gray-800 transition-colors">
                            <span>{t('upgradesTitle')}</span><ChevronIcon isOpen={isUpgradesOpen} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isUpgradesOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-gray-50/70 p-4 sm:p-6 rounded-b-xl shadow-inner">
                                <div className="mb-6 p-4 bg-gray-200/80 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 flex-wrap">
                                    <h3 className="text-lg sm:text-xl font-semibold text-cyan-800">{t('convertDiamondsTitle')}</h3>
                                    <input type="number" value={diamondConversionAmount} onChange={e => setDiamondConversionAmount(e.target.value)} placeholder={t('enterAmount')} min="0" className="bg-white border border-gray-300 text-gray-900 p-2 rounded w-24 sm:w-32 text-center" />
                                    <span className="text-lg">💎</span>
                                    <button onClick={handleDiamondConversion} disabled={conversionAmountNum <= 0 || diamonds < conversionAmountNum} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 sm:px-6 rounded">{t('convert')}</button>
                                    <p className="text-base sm:text-lg text-purple-600 font-bold">{t('youWillGet', {points: (conversionAmountNum * DIAMOND_TO_POINTS_RATIO)})}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-gray-800">
                                    <div><p className="text-base sm:text-lg">{t('speed')} ({t('level')} {upgrades.speed} / {MAX_STAT_UPGRADE_LEVEL})</p><button onClick={() => handleStatUpgrade('speed')} disabled={upgradePoints < getUpgradeCost(upgrades.speed) || upgrades.speed >= MAX_STAT_UPGRADE_LEVEL} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm sm:text-base">{t('upgradeFor')} {getUpgradeCost(upgrades.speed)} {t('points')}</button></div>
                                    <div><p className="text-base sm:text-lg">{t('jump')} ({t('level')} {upgrades.jump} / {MAX_STAT_UPGRADE_LEVEL})</p><button onClick={() => handleStatUpgrade('jump')} disabled={upgradePoints < getUpgradeCost(upgrades.jump) || upgrades.jump >= MAX_STAT_UPGRADE_LEVEL} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm sm:text-base">{t('upgradeFor')} {getUpgradeCost(upgrades.jump)} {t('points')}</button></div>
                                    <div><p className="text-base sm:text-lg">{t('maxLives')} ({upgrades.maxLives} / {MAX_LIVES_UPGRADE_LEVEL})</p><button onClick={handleMaxLivesUpgrade} disabled={upgradePoints < getUpgradeCost(upgrades.maxLives - BASE_MAX_LIVES) || upgrades.maxLives >= MAX_LIVES_UPGRADE_LEVEL} className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm sm:text-base">{t('upgradeFor')} {getUpgradeCost(upgrades.maxLives - BASE_MAX_LIVES)} {t('points')}</button></div>
                                     <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        {!upgrades.doubleJump ? (<button onClick={() => handleBuyOneTimeUpgrade('doubleJump')} disabled={upgradePoints < DOUBLE_JUMP_COST} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">{t('buyDoubleJump')} ({DOUBLE_JUMP_COST} {t('points')})</button>) : <div className="flex items-center justify-center p-2 bg-green-100 text-green-800 font-semibold rounded">{t('doubleJumpOwned')}</div>}
                                        {upgrades.doubleJump && !upgrades.tripleJump ? (<button onClick={() => handleBuyOneTimeUpgrade('tripleJump')} disabled={upgradePoints < TRIPLE_JUMP_COST} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">{t('buyTripleJump')} ({TRIPLE_JUMP_COST} {t('points')})</button>) : upgrades.tripleJump ? <div className="flex items-center justify-center p-2 bg-green-100 text-green-800 font-semibold rounded">{t('tripleJumpOwned')}</div> : (upgrades.doubleJump && <div className="opacity-0 flex items-center justify-center p-2 rounded">...</div>)}
                                        <button onClick={handleLevelSkip} disabled={upgradePoints < LEVEL_SKIP_COST} className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">{t('skipLevels')} ({LEVEL_SKIP_COST} {t('points')})</button>
                                    </div>
                                    <div className="md:col-span-3 mt-4">
                                        {!upgrades.groundPound ? (
                                            <button onClick={() => handleBuyOneTimeUpgrade('groundPound')} disabled={upgradePoints < GROUND_POUND_COST} className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">{t('buyGroundPound')} ({GROUND_POUND_COST} {t('points')})</button>
                                        ) : (
                                            <div className="flex items-center justify-center p-2 bg-green-100 text-green-800 font-semibold rounded">{t('groundPoundOwned')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Character Shop Section */}
                        <button onClick={() => { playSound('menuClick'); setIsShopOpen(!isShopOpen); }} className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg w-full flex justify-between items-center text-xl font-bold text-gray-800 transition-colors">
                            <span>{t('charShopTitle')}</span><ChevronIcon isOpen={isShopOpen} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isShopOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-gray-50/70 p-4 sm:p-6 rounded-b-xl shadow-inner">
                                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 text-gray-800">
                                    {charactersData.map(char => {
                                        const isUnlocked = unlockedCharacters.includes(char.id);
                                        const isSelected = characterId === char.id;
                                        return (
                                            <div key={char.id} className={`p-2 sm:p-3 border-4 rounded-lg text-center transition-all ${isSelected ? 'border-yellow-400 bg-yellow-100' : 'border-transparent bg-white/30'}`}>
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mb-2">
                                                   {char.textureUrl ? <img src={char.textureUrl} alt={t(char.nameKey)} className={`w-full h-full object-cover ${!isUnlocked ? 'grayscale' : ''}`} /> : <div className={`w-full h-full bg-red-500 ${!isUnlocked ? 'grayscale' : ''}`}></div>}
                                                </div>
                                                <p className="font-semibold text-xs sm:text-sm">{t(char.nameKey)}</p>
                                                {isUnlocked ? (<button onClick={() => { playSound('menuClick'); setCharacterId(char.id); }} disabled={isSelected} className="w-full mt-2 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-1 px-2 rounded">{isSelected ? t('selected') : t('select')}</button>) : (<button onClick={() => handleBuyCharacter(char)} disabled={upgradePoints < char.price} className="w-full mt-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-1 px-2 rounded">{char.price} {t('points')}</button>)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 w-full">
                        <button onClick={() => { playSound('menuClick'); onShowWiki(); }} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105">Wiki</button>
                    </div>

                    {isOfflineMode && (
                        <div className="mt-4 p-2 bg-orange-100 border border-orange-300 text-orange-800 rounded-lg text-center text-sm">
                            <p>{t('offlineModeNotice')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
