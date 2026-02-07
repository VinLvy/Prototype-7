import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import supabase from '../lib/supabase';
import { getUserProfile } from '../lib/db';
import type { Session } from '@supabase/supabase-js';

export default function ProtectedRoute() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const checkUserStatus = async (session: Session | null) => {
            if (session && !session.user.user_metadata?.onboarding_complete) {
                // Check if user has "Legacy Progress"
                // A user is "Legacy" if they have Level > 1 OR XP > 0 OR Skill Points > 0
                // If they are Level 1, 0 XP, 0 SP -> They are effectively "New" (or reset), so we send them to Origin.
                const profile = await getUserProfile(session.user.id);

                const isLegacy = profile && (
                    (profile.level && profile.level > 1) ||
                    (profile.current_exp && profile.current_exp > 0) ||
                    (profile.skill_points && profile.skill_points > 0)
                );

                if (isLegacy) {
                    // Update metadata for future
                    await supabase.auth.updateUser({
                        data: { onboarding_complete: true }
                    });
                    // Update local session to reflect this immediately
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
