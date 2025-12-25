import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

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
            alert(error.message);
        } else {
            console.log("Sign up successful", data);
            // If "Confirm Email" is disabled, data.session will be present
            if (data.session) {
                navigate('/dashboard');
            } else {
                alert('Sign up successful! Please check your email to confirm your account.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6 text-purple-400">Join ReLife RPG</h1>
            <p className="mb-4 text-gray-400">Create your character</p>
            <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-80">
                <input
                    className="p-3 rounded bg-gray-800 border border-gray-700 text-white focus:border-purple-500 focus:outline-none"
                    type="text"
                    placeholder="Username / Character Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
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
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-400">
                Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
            </p>
        </div>
    );
}
