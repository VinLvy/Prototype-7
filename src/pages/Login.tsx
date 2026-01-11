import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/dashboard');
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6 text-purple-400">ReLife RPG Login</h1>
            <p className="mb-4 text-gray-400">Welcome back, hero.</p>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
                <input
                    className="p-3 rounded bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="p-3 rounded bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    className="bg-purple-600 p-3 rounded font-bold hover:bg-purple-500 transition-colors mt-2"
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-400">
                Don't have an account? <Link to="/signup" className="text-purple-400 hover:underline">Sign Up</Link>
            </p>
        </div>
    );
}
