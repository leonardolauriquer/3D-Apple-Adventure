import React from 'react';
import { Language } from '../../types';
import { playSound } from '../../utils/audio';

interface LanguageSelectorProps {
    t: (key: string) => string;
    onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ t, onSelectLanguage }) => {
    const handleSelect = (lang: Language) => {
        playSound('menuClick');
        onSelectLanguage(lang);
    };

    const languages: { code: Language, name: string, flag: string }[] = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇧🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col justify-center items-center p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">{t('selectLang')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {languages.map(({ code, name, flag }) => (
                    <button 
                        key={code} 
                        onClick={() => handleSelect(code)} 
                        className="text-lg sm:text-xl font-bold bg-blue-600 hover:bg-blue-700 p-3 sm:p-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        <span>{name}</span>
                        <span>{flag}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};