import React from 'react';
import { calculateLevelReward } from '../../utils/gameplay';
import { playSound } from '../../utils/audio';

interface LevelCompleteScreenProps {
    t: (key: string, options?: any) => string;
    currentLevel: number;
    onNextLevel: () => void;
    onBackToMenu: () => void;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({t, currentLevel, onNextLevel, onBackToMenu}) => {
    const lastLevelReward = calculateLevelReward(currentLevel - 1);
    
    const handleNextLevelClick = () => {
        playSound('menuClick');
        onNextLevel();
    };

    const handleBackToMenuClick = () => {
        playSound('menuClick');
        onBackToMenu();
    };

    return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col justify-center items-center p-8">
            <h1 className="text-4xl sm:text-6xl font-bold text-green-400 mb-8" style={{ textShadow: '3px 3px 0px #15803d' }}>{t('levelCompleteTitle', {level: currentLevel - 1})}</h1>
            <p className="text-xl sm:text-2xl mb-12">{t('youGained')} <span className="font-bold text-purple-400">{lastLevelReward}</span> {t('upgradePoints')}!</p>
            <div className="flex flex-col md:flex-row gap-6">
                <button onClick={handleNextLevelClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 text-xl sm:py-4 sm:px-12 sm:text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    {t('nextLevelBtn')}
                </button>
                <button onClick={handleBackToMenuClick} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 text-xl sm:py-4 sm:px-12 sm:text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    {t('backToMenuBtn')}
                </button>
            </div>
        </div>
    );
};