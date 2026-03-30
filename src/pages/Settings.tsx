import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { resetAccountProgress } from '../lib/db';
import { useState, useEffect } from 'react';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Settings() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Change Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Session Timeout State
    const [sessionTimeout, setSessionTimeout] = useState<string>('15');

    // Notification state
    const [notification, setNotification] = useState<{
        message: string;
        type: NotificationType;
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showNotification = (message: string, type: NotificationType = 'error') => {
        setNotification({
            message,
            type,
            isVisible: true
        });
    };

    // Confirmation Modal States
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isResetModalOpen, setResetModalOpen] = useState(false);

    useEffect(() => {
        const savedTimeout = localStorage.getItem('session_timeout');
        if (savedTimeout) {
            setSessionTimeout(savedTimeout);
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    const handleUpdateTimeout = (e: React.FormEvent) => {
        e.preventDefault();
        const timeoutValue = parseInt(sessionTimeout, 10);
        const cappedTimeout = Math.min(timeoutValue, 15);

        localStorage.setItem('session_timeout', cappedTimeout.toString());
        setSessionTimeout(cappedTimeout.toString());

        showNotification(`Session timeout updated successfully${cappedTimeout < timeoutValue ? ' (capped at 15 minutes)' : ''}!`, 'success');
        // Wait a bit for notification to be visible
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const handleDeleteAccount = async () => {
        setDeleteModalOpen(false);
        showNotification("Account deletion request received. (Placeholder logic)", 'info');
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleResetProgress = async () => {
        if (!userId) return;

        setResetModalOpen(false);
        setLoading(true);
        try {
            await resetAccountProgress(userId);
            // Redirect immediately after success
            navigate('/origin');
        } catch (error) {
            console.error("Failed to reset progress:", error);
            showNotification("Failed to reset progress. Please try again.");
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showNotification("Passwords do not match!");
            return;
        }
        if (newPassword.length < 6) {
            showNotification("Password must be at least 6 characters long.");
            return;
        }

        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error("Error updating password:", error);
            showNotification(`Failed to update password: ${error.message}`);
        } else {
            showNotification("Password updated successfully!", 'success');
            setNewPassword('');
            setConfirmPassword('');
        }
        setPasswordLoading(false);
    };

    return (
        <div className="p-8 text-white min-h-full">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            />
            <h1 className="text-3xl font-bold mb-6 text-purple-400">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Change Password Section */}
                    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-30">
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
                        </div>
                        <h2 className="text-xl font-bold mb-4 text-blue-400 relative z-10">Security</h2>
                        <p className="text-slate-300 mb-6 relative z-10">
                            Update your account password.
                        </p>
                        <form onSubmit={handleUpdatePassword} className="space-y-4 relative z-10">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-400">New Password</label>
                                <input
                                    type="password"
                                    className="p-3 rounded-xl bg-slate-950 border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-400">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="p-3 rounded-xl bg-slate-950 border border-white/10 focus:border-blue-500 focus:outline-none transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50"
                            >
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>

                    {/* Session Timeout Section */}
                    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-30">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl"></div>
                        </div>
                        <h2 className="text-xl font-bold mb-4 text-emerald-400 relative z-10">Session Management</h2>
                        <p className="text-slate-300 mb-6 relative z-10">
                            Automatically log out after a period of inactivity. Set to 0 to disable (Max 15 minutes).
                        </p>
                        <form onSubmit={handleUpdateTimeout} className="space-y-4 relative z-10">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-slate-400">Inactivity Timeout (Minutes, Max 15)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="15"
                                    className="p-3 rounded-xl bg-slate-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-all"
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    placeholder="Default: 15 (Max 15)"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                            >
                                Update Timeout
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
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
                            onClick={() => setResetModalOpen(true)}
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
                            onClick={() => setDeleteModalOpen(true)}
                            className="bg-red-500/80 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-900/20 border border-red-500/50 relative z-10"
                        >
                            Delete Account
                        </button>
                    </div>

                    {/* System Information / Decorative Card */}
                    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 p-4 opacity-30">
                            <div className="w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-4 opacity-30">
                            <div className="w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative z-10 p-5 rounded-full bg-slate-950/50 border border-white/5 mb-5 shadow-inner">
                            <svg className="w-12 h-12 text-purple-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 relative z-10">System Status</h3>
                        <p className="text-slate-400 text-sm relative z-10 mb-6">
                            Your account settings and security preferences are fully synced. Keep your password secure and ensure session timeouts use recommended limits.
                        </p>
                        <div className="w-full bg-slate-950/80 rounded-xl p-4 border border-white/5 relative z-10 flex items-center justify-between">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Health</span>
                            <span className="text-emerald-400 font-mono text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                OPTIMAL
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Account?"
                message="Are you SURE you want to delete your account? This action cannot be undone and all your progress will be lost forever."
                confirmText="Yes, Delete My Account"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDeleteAccount}
                onCancel={() => setDeleteModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={isResetModalOpen}
                title="Reset Progress?"
                message="Are you sure you want to reset your account progress? This will wipe your stats, level, and history, but keep your account credentials. You will be sent back to the Origin Story page."
                confirmText="Yes, Reset Everything"
                cancelText="Cancel"
                type="warning"
                onConfirm={handleResetProgress}
                onCancel={() => setResetModalOpen(false)}
                isLoading={loading}
            />
        </div>
    );
}
