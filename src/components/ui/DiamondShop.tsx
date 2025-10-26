import React from 'react';
import { playSound } from '../../utils/audio';

export const DiamondShop: React.FC<{t: (key: string) => string; onClose: () => void; setDiamonds: React.Dispatch<React.SetStateAction<number>>}> = ({ t, onClose, setDiamonds }) => {
    const purchase = (amount: number) => {
        playSound('purchase');
        setDiamonds(d => d + amount);
    };

    const handleClose = () => {
        playSound('menuClick');
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-2xl bg-gray-800 text-white rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">{t('diamondShopTitle')}</h2>
                    <button onClick={handleClose} className="text-2xl font-bold text-white hover:text-red-500">&times;</button>
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-4 sm:gap-6">
                    <div className="p-4 sm:p-6 bg-gray-700 rounded-lg flex items-center justify-between">
                        <span className="text-2xl sm:text-3xl font-bold">1,000 💎</span>
                        <button onClick={() => purchase(1000)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-4 text-base sm:py-3 sm:px-6 sm:text-lg rounded-lg">{t('buyFor')} $1.00</button>
                    </div>
                    <div className="p-4 sm:p-6 bg-gray-700 rounded-lg flex items-center justify-between">
                        <span className="text-2xl sm:text-3xl font-bold">6,000 💎</span>
                        <button onClick={() => purchase(6000)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-4 text-base sm:py-3 sm:px-6 sm:text-lg rounded-lg">{t('buyFor')} $5.00</button>
                    </div>
                    <div className="relative p-4 sm:p-6 bg-cyan-900 border-2 border-cyan-400 rounded-lg flex items-center justify-between">
                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-sm font-bold px-3 py-1 rounded-full">{t('bestValue')}</div>
                        <span className="text-2xl sm:text-3xl font-bold">15,000 💎</span>
                        <button onClick={() => purchase(15000)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-4 text-base sm:py-3 sm:px-6 sm:text-lg rounded-lg">{t('buyFor')} $10.00</button>
                    </div>
                    <p className="text-center text-md text-green-300 mt-4 sm:mt-6 italic">❤️ {t('donationInfo')} ❤️</p>
                </div>
            </div>
        </div>
    );
};