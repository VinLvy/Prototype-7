import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import supabase from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function ProtectedRoute() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Onboarding Logic
    const isOnboarding = location.pathname === '/origin';
    const hasCompletedOnboarding = session.user.user_metadata?.onboarding_complete;

    if (!hasCompletedOnboarding && !isOnboarding) {
        return <Navigate to="/origin" replace />;
    }

    if (hasCompletedOnboarding && isOnboarding) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
