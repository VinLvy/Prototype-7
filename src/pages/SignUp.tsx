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
                    />
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all mt-2 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-6 text-sm text-slate-400 text-center relative z-10">
                    Already have an account? <Link to="/login" className="text-cyan-300 hover:text-cyan-200 hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
}
