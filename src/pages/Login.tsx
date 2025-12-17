import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase  from '../lib/supabase';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
            alert(error.message);
        } else {
            alert('Check your email for the login link!');
        }
        setLoading(false);
    };

    // Quick bypass for prototype if needed, but sticking to plan
    const handleSkip = () => {
        navigate('/dashboard');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">ReLife RPG Login</h1>
            <p className="mb-4">Sign in via Magic Link</p>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
                <input
                    className="p-2 rounded bg-gray-800 border border-gray-700"
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    className="bg-purple-600 p-2 rounded hover:bg-purple-500"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Send Magic Link'}
                </button>
            </form>
            <button onClick={handleSkip} className="mt-4 text-sm text-gray-400 underline">
                Skip (Prototype Only)
            </button>
        </div>
    );
}
