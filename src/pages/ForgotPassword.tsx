import { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
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
        setNotification({ message, type, isVisible: true });
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            console.error("Reset password error:", error);
            showNotification(error.message);
        } else {
            showNotification('Password reset link sent! Check your email.', 'success');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-4">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            />
            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative overflow-hidden group">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />

                <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-center relative z-10">Forgot Password</h1>
                <p className="mb-6 text-slate-300 text-center relative z-10">Enter your email to receive a reset link.</p>

                <form onSubmit={handleResetPassword} className="flex flex-col gap-4 relative z-10">
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button
                        className="bg-gradient-to-r from-purple-600 to-pink-600 p-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all mt-2 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>
                <p className="mt-6 text-sm text-slate-400 text-center relative z-10">
                    Remember your password? <Link to="/login" className="text-purple-300 hover:text-purple-200 hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
}
