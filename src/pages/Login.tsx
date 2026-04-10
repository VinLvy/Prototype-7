import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

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

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/dashboard');
            }
        };
        checkSession();
    }, [navigate]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            console.error("Google login error:", error);
            showNotification(error.message);
        }
        // No setLoading(false) here because it redirects away or opens a popup
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Login error:", error);

            // Map Supabase errors to Indonesian messages
            if (error.message.includes('Invalid login credentials')) {
                showNotification('Email or password is wrong. Please try again.');
            } else if (error.message.includes('Email not confirmed')) {
                showNotification('Email not confirmed. Please check your inbox.');
            } else {
                showNotification(error.message);
            }
        } else {
            navigate('/dashboard');
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
                {/* Decorative gradient glow */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />

                <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-center relative z-10">ReLife RPG</h1>
                <p className="mb-6 text-slate-300 text-center relative z-10">Welcome back, hero.</p>
                <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <div className="flex flex-col items-end w-full">
                        <input
                            className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all w-full"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <Link to="/forgot-password" className="text-sm text-purple-300 hover:text-purple-200 hover:underline mt-2">
                            Forgot Password?
                        </Link>
                    </div>
                    <button
                        className="bg-gradient-to-r from-purple-600 to-pink-600 p-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all mt-2 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Login'}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-3 bg-white text-slate-900 p-3.5 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Sign in with Google
                    </button>
                </form>
                <p className="mt-6 text-sm text-slate-400 text-center relative z-10">
                    Don't have an account? <Link to="/signup" className="text-purple-300 hover:text-purple-200 hover:underline font-medium">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
