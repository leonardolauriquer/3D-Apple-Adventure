

import React, { useState } from 'react';
import { MenuBackground } from './MenuBackground';
import { playSound } from '../../utils/audio';
import { auth, firebaseEnabled, projectId } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginScreenProps {
    t: (key: string, options?: any) => string;
    onPlayOffline: () => void;
}

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 mr-3">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.021,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ t, onPlayOffline }) => {
    const [loginError, setLoginError] = useState('');
    const [copied, setCopied] = useState(false);
    
    const domain = window.location.hostname;
    const isDevEnvironment = domain.includes('googleusercontent.com');
    const firebaseAuthUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

    const copyDomainToClipboard = () => {
        navigator.clipboard.writeText(domain).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const handleLoginClick = async () => {
        playSound('menuClick');
        if (!firebaseEnabled || !auth) {
            setLoginError(t('firebaseNotConfigured'));
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
             if (error.code === 'auth/unauthorized-domain') {
                setLoginError(t('unauthorizedDomainError'));
            } else {
                console.error("Authentication failed:", error);
                setLoginError(t('genericLoginError', { message: error.message }));
            }
        }
    };
    
    const handlePlayOffline = () => {
        playSound('menuClick');
        onPlayOffline();
    };


    if (isDevEnvironment || !firebaseEnabled) {
        return (
            <div className="w-full h-full relative">
                <MenuBackground />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                        {firebaseEnabled ? (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-3">{t('actionRequired')}</h1>
                                <p className="text-gray-700 mb-6">{t('devEnvInstruction')}</p>

                                <div className="mb-6">
                                    <label className="font-bold text-gray-800 text-lg">{t('yourDevDomain')}</label>
                                    <div className="mt-2 flex items-stretch justify-center bg-gray-200 p-2 rounded-lg gap-2">
                                        <pre className="text-gray-900 font-mono text-sm sm:text-base bg-white px-3 py-2 rounded flex-grow text-left">{domain}</pre>
                                        <button onClick={copyDomainToClipboard} className={`px-4 rounded-md font-semibold text-white transition-colors ${copied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                            {copied ? t('copied') : t('copy')}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8 text-left space-y-3 text-gray-800 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p><strong>1.</strong> {t('step1Copy')}</p>
                                    <p><strong>2.</strong> <a href={firebaseAuthUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">{t('step2OpenFirebase')}</a> {t('step2Paste')}</p>
                                    <p><strong>3.</strong> {t('step3Wait')}</p>
                                </div>
                                
                                {loginError && <p className="text-red-600 font-bold bg-red-100 p-3 rounded-lg mb-6">{loginError}</p>}

                                <button onClick={handleLoginClick} className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 border border-gray-300 rounded-lg shadow-md transition-transform transform hover:scale-105 text-lg">
                                    <GoogleIcon />
                                    <span>{t('authorizedTryLogin')}</span>
                                </button>
                            </>
                        ) : (
                             <>
                                <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-3">Firebase Not Configured</h1>
                                <p className="text-gray-700 mb-6">Online features are disabled. Please update <code>src/config/firebase.ts</code> with your project credentials to enable login and online rankings.</p>
                             </>
                        )}
                         <div className="mt-6 pt-6 border-t border-gray-300">
                            <p className="text-gray-600 mb-3">Or, continue without online features:</p>
                             <button onClick={handlePlayOffline} className="inline-flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 text-lg">
                                 {t('playOffline')}
                             </button>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
         <div className="w-full h-full relative">
            <MenuBackground />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-red-700 mb-4">{t('mainMenuTitle')}</h1>
                    <p className="text-lg text-gray-800 mb-8">{t('loginPrompt')}</p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleLoginClick}
                            className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            <GoogleIcon />
                            <span>{t('loginWithGoogle')}</span>
                        </button>
                         <button
                            onClick={handlePlayOffline}
                            className="inline-flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 border border-gray-300 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            {t('playOffline')}
                        </button>
                    </div>
                     {loginError && <p className="mt-4 text-red-600">{loginError}</p>}
                </div>
            </div>
        </div>
    );
};
