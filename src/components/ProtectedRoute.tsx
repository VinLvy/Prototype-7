import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import supabase from '../lib/supabase';
import { getUserStats } from '../lib/db';
import type { Session } from '@supabase/supabase-js';

export default function ProtectedRoute() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const checkUserStatus = async (session: Session | null) => {
            if (session && !session.user.user_metadata?.onboarding_complete) {
                // Check if user has stats (legacy user)
                const stats = await getUserStats(session.user.id);
                if (stats) {
                    // Update metadata for future
                    await supabase.auth.updateUser({
                        data: { onboarding_complete: true }
                    });
                    // Update local session
                    session.user.user_metadata = {
                        ...session.user.user_metadata,
                        onboarding_complete: true
                    };
                }
            }
            return session;
        };

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const updatedSession = await checkUserStatus(session);
            if (mounted) {
                setSession(updatedSession);
                setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // We need to verify status on login as well
            if (session) {
                await checkUserStatus(session);
            }
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
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
