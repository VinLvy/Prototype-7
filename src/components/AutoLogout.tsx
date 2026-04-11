import React, { useEffect, useCallback, useRef } from 'react';
import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AutoLogoutProps {
    children: React.ReactNode;
}

const AutoLogout: React.FC<AutoLogoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Default 15 minutes in milliseconds
    const DEFAULT_TIMEOUT = 15 * 60 * 1000;

    const handleLogout = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('User inactive, logging out...');
            await supabase.auth.signOut();
            navigate('/login');
        }
    }, [navigate]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Get custom timeout from local storage if exists, else use default
        const savedTimeout = localStorage.getItem('session_timeout');
        const timeoutDuration = savedTimeout ? parseInt(savedTimeout, 10) * 60 * 1000 : DEFAULT_TIMEOUT;

        // Only set timer if timeoutDuration > 0
        if (timeoutDuration > 0) {
            timeoutRef.current = setTimeout(handleLogout, timeoutDuration);
        }
    }, [handleLogout, DEFAULT_TIMEOUT]);

    useEffect(() => {
        // Events that reset the timer
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Initialize listener
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initial timer start
        resetTimer();

        return () => {
            // Cleanup
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resetTimer]);

    return <>{children}</>;
};

export default AutoLogout;
