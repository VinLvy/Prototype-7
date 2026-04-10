import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
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

    const handleGoogleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            console.error("Google sign up error:", error);
            showNotification(error.message);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: username,
                },
            },
        });

        if (error) {
            console.error("Sign up error:", error);

            // Map Supabase errors to Indonesian messages
            if (error.message.includes('User already registered')) {
                showNotification('Email has already been registered. Please use another email or login.');
            } else if (error.message.includes('Password should be at least')) {
                showNotification('Password is too short. Minimum 6 characters.');
            } else if (error.message.includes('Invalid format')) {
                showNotification('Invalid email format.');
            } else {
                showNotification(error.message);
            }
        } else {
            console.log("Sign up successful", data);
            showNotification('Account created successfully! Please login.', 'success');
            // Wait a bit for the user to see the success message
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-500" />

                <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-center relative z-10">Join ReLife RPG</h1>
                <p className="mb-6 text-slate-300 text-center relative z-10">Create your character</p>
                <form onSubmit={handleSignUp} className="flex flex-col gap-4 relative z-10">
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        type="text"
                        placeholder="Username / Character Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <button
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all mt-2 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">or</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignUp}
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
                        Sign up with Google
                    </button>
                </form>
                <p className="mt-6 text-sm text-slate-400 text-center relative z-10">
                    Already have an account? <Link to="/login" className="text-cyan-300 hover:text-cyan-200 hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
}
