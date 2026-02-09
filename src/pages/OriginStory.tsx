import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { analyzeOriginStory, type OriginStoryAnalysis } from '../lib/gemini';
import { saveInitialStats, completeOnboarding } from '../lib/db';
import HexagonChart from '../components/HexagonChart';

export default function OriginStory() {
    const navigate = useNavigate();
    const [story, setStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OriginStoryAnalysis | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    const handleAnalyze = async () => {
        if (!story.trim()) return;
        setLoading(true);
        try {
            const analysis = await analyzeOriginStory(story);
            setResult(analysis);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Failed to analyze story. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!userId) {
            alert("User session missing. Please try logging in again.");
            return;
        }
        if (!result) return;

        setLoading(true);
        try {
            console.log("Starting profile save...");

            // Run save operations in parallel with a timeout
            const saveParams = {
                stats: result.initial_stats,
                class: result.recommended_class
            };

            const saveOperation = Promise.all([
                saveInitialStats(userId, saveParams.stats),
                completeOnboarding(userId, saveParams.class)
            ]);

            // Add 15s timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 15000)
            );

            await Promise.race([saveOperation, timeoutPromise]);

            console.log("Profile saved successfully. Redirecting to dashboard...");

            // 3. Redirect
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Failed to save profile:", error);
            // Show more specific error if possible
            const msg = error?.message || "Unknown error";
            alert(`Failed to save your profile: ${msg}. Please try again.`);
        } finally {
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
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-purple-900/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[150%] h-[150%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
            </div>

            <div className="z-10 w-full max-w-4xl">
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
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
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
