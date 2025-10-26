import { useCallback } from 'react';
import { translations } from '../config/translations';
import { Language } from '../types';

export const useTranslation = (language: Language) => {
    return useCallback((key: string, options?: { [key: string]: string | number }) => {
        let translation = key.split('.').reduce((acc, part) => acc && acc[part], translations[language] as any) as string | undefined;
        if (typeof translation !== 'string') return key;

        if (options) {
            Object.keys(options).forEach(optKey => {
                translation = (translation as string).replace(`{${optKey}}`, String(options[optKey]));
            });
        }
        return translation;
    }, [language]);
};
