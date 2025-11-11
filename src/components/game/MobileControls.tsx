import React, { useRef, useEffect, useCallback } from 'react';
import { Upgrades } from '../../types';

interface MobileControlsProps {
    keysRef: React.MutableRefObject<any>;
    joystickVector: React.MutableRefObject<{ x: number, y: number }>;
    t: (key: string) => string;
    upgrades: Upgrades;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ keysRef, joystickVector, t, upgrades }) => {
    const joystickRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const joystick = joystickRef.current;
        const knob = knobRef.current;
        if (!joystick || !knob) return;
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const touchX = touch.clientX - centerX;
        const touchY = touch.clientY - centerY;
        const angle = Math.atan2(touchY, touchX);
        const maxDist = rect.width / 2 - knob.clientWidth / 2;
        const distance = Math.min(Math.sqrt(touchX * touchX + touchY * touchY), maxDist);
        knob.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        const deadzone = 10;
        if (distance > deadzone) {
            joystickVector.current.x = (Math.cos(angle) * distance) / maxDist;
            // O jogador reportou que o movimento vertical estava invertido.
            // Empurrar para cima no joystick deve resultar em um valor Y negativo para mover para frente.
            // O código original `-(Math.sin(angle) * distance) / maxDist` causava a inversão.
            // Empurrar para cima resulta em um touchY negativo, que dá um sin(angle) negativo.
            // -(-ve) = +ve, que era o movimento para trás.
            // Esta é a lógica corrigida:
            joystickVector.current.y = (Math.sin(angle) * distance) / maxDist;
        } else {
            joystickVector.current.x = 0;
            joystickVector.current.y = 0;
        }
    }, [joystickVector]);
    
    const handleTouchEnd = useCallback((e: TouchEvent) => {
        e.preventDefault();
        const knob = knobRef.current;
        if(knob) knob.style.transform = 'translate(0px, 0px)';
        joystickVector.current.x = 0;
        joystickVector.current.y = 0;
    }, [joystickVector]);
    
    const handleJumpPress = (e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); keysRef.current.space = true; };
    const handleJumpRelease = (e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); keysRef.current.space = false; };

    const handlePoundPress = (e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); keysRef.current.c = true; };
    const handlePoundRelease = (e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); keysRef.current.c = false; };

    useEffect(() => {
        const joystick = joystickRef.current;
        if (!joystick) return;
        const touchOptions = { passive: false };
        joystick.addEventListener('touchmove', handleTouchMove, touchOptions);
        joystick.addEventListener('touchend', handleTouchEnd, touchOptions);
        joystick.addEventListener('touchstart', handleTouchMove, touchOptions);
        return () => {
            joystick.removeEventListener('touchmove', handleTouchMove);
            joystick.removeEventListener('touchend', handleTouchEnd);
            joystick.removeEventListener('touchstart', handleTouchMove);
        };
    }, [handleTouchMove, handleTouchEnd]);

    return (
        <>
            <div ref={joystickRef} className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 w-32 h-32 sm:w-40 sm:h-40 bg-black bg-opacity-30 rounded-full flex items-center justify-center select-none">
                <div ref={knobRef} className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-30 rounded-full transition-transform"></div>
            </div>
             {upgrades.groundPound && (
                <div className="absolute bottom-40 right-5 sm:bottom-48 sm:right-8 w-20 h-20 sm:w-24 sm:h-24 bg-red-600 bg-opacity-50 rounded-full flex items-center justify-center select-none" onTouchStart={handlePoundPress} onTouchEnd={handlePoundRelease} onMouseDown={handlePoundPress} onMouseUp={handlePoundRelease} onMouseLeave={handlePoundRelease}>
                    <span className="text-white text-3xl font-bold pointer-events-none">⇓</span>
                </div>
            )}
            <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 w-24 h-24 sm:w-28 sm:h-28 bg-blue-500 bg-opacity-50 rounded-full flex items-center justify-center select-none" onTouchStart={handleJumpPress} onTouchEnd={handleJumpRelease} onMouseDown={handleJumpPress} onMouseUp={handleJumpRelease} onMouseLeave={handlePoundRelease}>
                <span className="text-white text-5xl font-bold pointer-events-none">↑</span>
            </div>
        </>
    );
};