import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (confirm("Are you SURE you want to delete your account? This action cannot be undone.")) {
            // Note: Supabase client-side deletion usually requires specific RLS or admin rights, 
            // or a server-side function. For now, we will just sign out and show an alert 
            // as a placeholder for the actual deletion logic, to be safe.
            alert("Account deletion request received. (Placeholder logic)");
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    return (
        <div className="p-8 text-white min-h-full">
            <h1 className="text-3xl font-bold mb-6 text-purple-400">Settings</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 max-w-2xl">
                <h2 className="text-xl font-bold mb-4 text-red-400">Danger Zone</h2>
                <p className="text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}
