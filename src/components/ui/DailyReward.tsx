import React from 'react';
import { playSound } from '../../utils/audio';

interface DailyRewardProps {
    t: (key: string, options?: any) => string;
    day: number;
    rewardAmount: number;
    rewardType: 'points' | 'diamonds';
    onClaim: () => void;
}

export const DailyReward: React.FC<DailyRewardProps> = ({ t, day, rewardAmount, rewardType, onClaim }) => {
    const handleClaim = () => {
        playSound('checkpoint');
        onClaim();
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-md bg-gradient-to-br from-yellow-700 via-yellow-500 to-yellow-700 text-white rounded-2xl shadow-2xl flex flex-col items-center p-8 border-4 border-yellow-300">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" style={{ textShadow: '2px 2px 0px #fde047' }}>{t('dailyRewardTitle')}</h2>
                <p className="text-xl font-semibold bg-gray-900 bg-opacity-50 px-4 py-1 rounded-full mb-6">{t('day', { day })}</p>
                <div className="w-32 h-32 bg-yellow-300 rounded-full flex items-center justify-center mb-6 border-4 border-yellow-100">
                    <span className="text-5xl">🎁</span>
                </div>
                <p className="text-lg text-gray-800 font-medium mb-2">{t('youReceived')}</p>
                <p className="text-4xl font-bold text-gray-900 mb-8">
                    {rewardAmount} {rewardType === 'diamonds' ? '💎' : t('points')}
                </p>
                <button 
                    onClick={handleClaim} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    {t('claimReward')}
                </button>
                 <p className="text-sm text-gray-800 mt-4 italic">{t('comeBackTomorrow')}</p>
            </div>
        </div>
    );
};