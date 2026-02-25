import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { resetAccountProgress } from '../lib/db';
import { useState, useEffect } from 'react';

export default function Settings() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    const handleDeleteAccount = async () => {
        if (confirm("Are you SURE you want to delete your account? This action cannot be undone.")) {
            alert("Account deletion request received. (Placeholder logic)");
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    const handleResetProgress = async () => {
        if (!userId) return;

        if (confirm("Are you sure you want to reset your account progress? This will wipe your stats, level, and history, but keep your account. You will be sent back to the Origin Story page.")) {
            setLoading(true);
            try {
                await resetAccountProgress(userId);
                alert("Progress reset successfully. Restarting your journey...");
                navigate('/origin-story');
            } catch (error) {
                console.error("Failed to reset progress:", error);
                alert("Failed to reset progress. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-8 text-white min-h-full">
            <h1 className="text-3xl font-bold mb-6 text-purple-400">Settings</h1>

            <div className="space-y-6 max-w-2xl">
                {/* Reset Progress Section */}
                <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-30">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full blur-2xl"></div>
                    </div>
                    <h2 className="text-xl font-bold mb-4 text-amber-400 relative z-10">Reset Progress</h2>
                    <p className="text-slate-300 mb-6 relative z-10">
                        Want to start over? This will reset all your stats, level, and history. You'll keep your account credentials.
                    </p>
                    <button
                        onClick={handleResetProgress}
                        disabled={loading}
                        className="bg-amber-600/80 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-900/20 border border-amber-500/50 relative z-10 disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Account Progress"}
                    </button>
                </div>

                {/* Danger Zone Section */}
                <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full blur-2xl"></div>
                    </div>
                    <h2 className="text-xl font-bold mb-4 text-red-400 relative z-10">Danger Zone</h2>
                    <p className="text-slate-300 mb-6 relative z-10">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="bg-red-500/80 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-900/20 border border-red-500/50 relative z-10"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
