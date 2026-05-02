import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import supabase from '../lib/supabase';
import { analyzeOriginStory, type OriginStoryAnalysis } from '../lib/gemini';
import { saveInitialStats, completeOnboarding, saveActivityLog } from '../lib/db';
import HexagonChart from '../components/HexagonChart';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

export default function OriginStory() {
    const navigate = useNavigate();
    const [story, setStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OriginStoryAnalysis | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

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
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    const handleAnalyze = async () => {
        if (!story.trim()) return;
        setLoading(true);
        try {
            const analysis = await analyzeOriginStory(story);
            setResult(analysis);
        } catch (err) {
            const error = err as Error;
            console.error("Analysis failed:", error);
            
            // Check for potential API key restriction errors or CORS which manifest closely like this in browser environments
            let errorMsg = "Failed to analyze story. Please try again.";
            if (error?.message) {
                if (error.message.includes('403') || error.message.includes('API key') || error.message.includes('fetch')) {
                    errorMsg = "API Connection Error: If this is on Vercel, please ensure your Vercel domain is added to your Gemini API Key restrictions, or disable restrictions. Also verify VITE_GEMINI_API_KEY is deployed on Vercel.";
                } else {
                    errorMsg = `Analysis Error: ${error.message}`;
                }
            }
            showNotification(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!userId) {
            console.error("No userId found in state!");
            showNotification("User session missing. Please try logging in again.");
            return;
        }
        if (!result) {
            console.error("No analysis result found!");
            return;
        }

        setLoading(true);
        try {
            console.log("Saving initial stats...");
            // 1. Save stats
            await saveInitialStats(userId, result.initial_stats);
            console.log("Stats saved.");

            console.log("Saving story to history...");
            // Save prompt history
            await saveActivityLog(userId, story, result);
            console.log("History saved.");

            console.log("Completing onboarding...");
            // 2. Complete onboarding (metadata update + character class update)
            await completeOnboarding(userId, result.recommended_class);
            console.log("Onboarding completed.");

            // Final safety refresh
            await supabase.auth.refreshSession();
            console.log("Session refreshed.");

            console.log("Redirecting to dashboard...");
            // 3. Redirect
            navigate('/dashboard', { replace: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Critical error saving profile:", error);
            // Show more specific error if possible
            const msg = error?.message || "Unknown error";
            showNotification(`Failed to save your profile: ${msg}. Please try again. Check console for details.`);
        } finally {
            console.log("handleConfirm finished.");
            setLoading(false);
        }
    };

    // Prepare Chart Data
    const chartData = result ? [
        { subject: 'STR', A: result.initial_stats.STR, fullMark: 100, fullName: 'Strength' },
        { subject: 'INT', A: result.initial_stats.INT, fullMark: 100, fullName: 'Intelligence' },
        { subject: 'CHA', A: result.initial_stats.CHA, fullMark: 100, fullName: 'Charisma' },
        { subject: 'CRE', A: result.initial_stats.CRE, fullMark: 100, fullName: 'Creativity' },
        { subject: 'WIS', A: result.initial_stats.WIS, fullMark: 100, fullName: 'Wisdom' },
        { subject: 'WEA', A: result.initial_stats.WEA, fullMark: 100, fullName: 'Wealth' },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            />
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-purple-900/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[150%] h-[150%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Logout / Back to Login Button */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800 border border-white/10 rounded-full text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-wide">Back to Login</span>
                </button>
            </div>

            <div className="z-10 w-full max-w-4xl mt-16 md:mt-0">
                {!result ? (
                    // INPUT STAGE
                    <div className="bg-slate-900/50 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl transition-all duration-500">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 text-center">
                            Who were you?
                        </h1>
                        <p className="text-slate-300 text-center mb-8 text-md">
                            Every hero has an origin. Tell us about your past life, your skills, your triumphs, and your failures.
                            The AI will determine your starting stats based on your story.
                        </p>

                        <textarea
                            className="w-full h-48 bg-slate-950/60 border border-white/10 rounded-2xl p-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                            placeholder="I was a scholar in a grand library, obsessed with ancient runes..."
                            value={story}
                            onChange={(e) => setStory(e.target.value)}
                            disabled={loading}
                        />

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !story.trim()}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analying Fate...
                                    </span>
                                ) : (
                                    "Reveal My Destiny"
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    // RESULT STAGE
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="text-cyan-400">Your Stats</span>
                                <div className="h-px bg-white/10 flex-grow"></div>
                            </h2>
                            <div className="h-[400px]">
                                <HexagonChart data={chartData} />
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-center">
                            <h2 className="text-2xl font-bold text-white mb-4">The Verdict</h2>
                            <div className="mb-6 p-6 bg-slate-950/60 rounded-2xl border border-white/5">
                                <p className="text-lg text-slate-300 italic">"{result.summary}"</p>
                            </div>

                            <div className="mb-8">
                                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2">Recommended Class</p>
                                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                                    {result.recommended_class}
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                {loading ? "Saving Profile..." : "Begin My Journey"}
                            </button>
                            <button
                                onClick={() => setResult(null)}
                                className="mt-4 w-full text-slate-400 hover:text-white transition-colors"
                            >
                                Retry Story
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
