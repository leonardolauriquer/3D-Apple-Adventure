import React from 'react';
import { playSound } from '../../utils/audio';

export const Wiki: React.FC<{t: (key: string) => string; onClose: () => void;}> = ({ t, onClose }) => {
    const handleClose = () => {
        playSound('menuClick');
        onClose();
    };
    
    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-4xl h-5/6 bg-gray-800 text-white rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">{t('wikiTitle')}</h2>
                    <button onClick={handleClose} className="text-2xl font-bold text-white hover:text-red-500">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                        <h3 className="text-green-400">{t('wikiGameplayTitle')}</h3><p>{t('wikiGameplayDesc')}</p>
                        <h3 className="text-green-400">{t('wikiUpgradesTitle')}</h3><p>{t('wikiUpgradesDesc')}</p>
                        <h3 className="text-green-400">{t('wikiItemsTitle')}</h3>
                        <ul>
                            <li><strong>{t('wikiApple').split(':')[0]}:</strong> {t('wikiApple').split(':')[1]}</li>
                            <li><strong>{t('wikiHeart').split(':')[0]}:</strong> {t('wikiHeart').split(':')[1]}</li>
                            <li><strong>{t('wikiCheckpoint').split(':')[0]}:</strong> {t('wikiCheckpoint').split(':')[1]}</li>
                        </ul>
                        <h3 className="text-red-400">{t('wikiEnemiesTitle')}</h3>
                        <ul>
                            <li><strong>{t('wikiSkull').split(':')[0]}:</strong> {t('wikiSkull').split(':')[1]}</li>
                            <li><strong>{t('wikiGhost').split(':')[0]}:</strong> {t('wikiGhost').split(':')[1]}</li>
                            <li><strong>{t('wikiStomper').split(':')[0]}:</strong> {t('wikiStomper').split(':')[1]}</li>
                            <li><strong>{t('wikiSpikeBlock').split(':')[0]}:</strong> {t('wikiSpikeBlock').split(':')[1]}</li>
                            <li><strong>{t('wikiRamBot').split(':')[0]}:</strong> {t('wikiRamBot').split(':')[1]}</li>
                            <li><strong>{t('wikiSentinelEye').split(':')[0]}:</strong> {t('wikiSentinelEye').split(':')[1]}</li>
                            <li><strong>{t('wikiBossSkullKing').split(':')[0]}:</strong> {t('wikiBossSkullKing').split(':')[1]}</li>
                        </ul>
                        <h3 className="text-blue-400">{t('wikiHazardsTitle')}</h3>
                         <ul>
                            <li><strong>{t('wikiLaser').split(':')[0]}:</strong> {t('wikiLaser').split(':')[1]}</li>
                            <li><strong>{t('wikiShrinkingPlatform').split(':')[0]}:</strong> {t('wikiShrinkingPlatform').split(':')[1]}</li>
                            <li><strong>{t('wikiJumpPad').split(':')[0]}:</strong> {t('wikiJumpPad').split(':')[1]}</li>
                            <li><strong>{t('wikiBouncePad').split(':')[0]}:</strong> {t('wikiBouncePad').split(':')[1]}</li>
                            <li><strong>{t('wikiMovingPlatform').split(':')[0]}:</strong> {t('wikiMovingPlatform').split(':')[1]}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
