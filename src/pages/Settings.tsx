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

            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 max-w-2xl relative overflow-hidden">
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
    );
}
