import { useState, useEffect } from 'react';
import HexagonChart from '../components/HexagonChart';
import LevelUpCelebration from '../components/LevelUpCelebration';
import { analyzeAction } from '../lib/gemini';
import { saveActivityLog, updateUserStats, getUserStats, updateUserXP, getUserProfile, allocateSkillPoint, type UserStats } from '../lib/db';
import { playLevelUpSound } from '../lib/audio';
import supabase from '../lib/supabase';

// Helper to format DB stats for the chart
const formatStatsForChart = (stats: UserStats | null) => {
    // Default values if stats are missing
    const s = stats || {
        strength: 10,
        intelligence: 10,
        charisma: 10,
        creativity: 10,
        wisdom: 10,
        wealth: 10
    };

    return [
        { subject: 'STR', A: s.strength, fullMark: 100 },
        { subject: 'INT', A: s.intelligence, fullMark: 100 },
        { subject: 'CHA', A: s.charisma, fullMark: 100 },
        { subject: 'CRE', A: s.creativity, fullMark: 100 },
        { subject: 'WIS', A: s.wisdom, fullMark: 100 },
        { subject: 'WEA', A: s.wealth, fullMark: 100 },
    ];
};

export default function Dashboard() {
    const [data, setData] = useState(formatStatsForChart(null));
    const [prompt, setPrompt] = useState('');
    const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Gamification State
    const [level, setLevel] = useState(1);
    const [currentExp, setCurrentExp] = useState(0);
    const [skillPoints, setSkillPoints] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    // Fetch initial stats and user ID
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Fetch Stats
                const stats = await getUserStats(user.id);
                if (stats) {
                    setData(formatStatsForChart(stats));
                }

                // Fetch Profile (Level/XP)
                const profile = await getUserProfile(user.id);
                if (profile) {
                    setLevel(profile.level);
                    setCurrentExp(profile.current_exp);
                    setSkillPoints(profile.skill_points || 0);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleGenerate = async () => {
        if (!prompt) return;
        if (!userId) {
            alert("You must be logged in to save progress.");
            return;
        }

        setLoading(true);
        setGeminiResponse(null);
        try {
            // 1. Analyze with AI
            const result = await analyzeAction(prompt);
            setGeminiResponse(JSON.stringify(result, null, 2));

            // 2. Save Log to DB
            await saveActivityLog(userId, prompt, result);

            // 3. Update User Stats in DB
            await updateUserStats(userId, result.stats_increase);

            // 4. Update XP & Level
            const xpResult = await updateUserXP(userId, result.xp_gained);

            setLevel(xpResult.newLevel);
            setCurrentExp(xpResult.currentExp);

            setSkillPoints(xpResult.skillPoints);

            if (xpResult.levelUp) {
                setShowCelebration(true);
                playLevelUpSound();
            }

            // 5. Update Chart Data
            const updatedStats = await getUserStats(userId);
            if (updatedStats) {
                setData(formatStatsForChart(updatedStats));
            }

            // Clear the prompt
            setPrompt('');

        } catch (error) {
            console.error(error);
            setGeminiResponse("Error calling Gemini or parsing response.");
        } finally {
            setLoading(false);
        }
    };

    const handleIncreaseStat = async (statKey: string) => {
        if (!userId || skillPoints <= 0) return;

        try {
            const result = await allocateSkillPoint(userId, statKey);
            if (result.success) {
                setSkillPoints(result.remainingPoints);
                const updatedStats = await getUserStats(userId);
                setData(formatStatsForChart(updatedStats));
            }
        } catch (error) {
            console.error("Allocation failed", error);
            alert("Failed to allocate point.");
        }
    };

    // Calculate progress percentage
    const xpNeeded = level * 100;
    const progressPercent = Math.min(100, Math.max(0, (currentExp / xpNeeded) * 100));

    return (
        <div className="text-white p-6 md:p-10 relative">
            <LevelUpCelebration show={showCelebration} onClose={() => setShowCelebration(false)} />

            <header className="mb-8 flex justify-between items-end backdrop-blur-sm bg-slate-900/30 p-4 rounded-xl border border-white/5">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-sm">ReLife Dashboard</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Welcome back, Traveler.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400 font-bold mb-1">Level {level}</p>
                    {skillPoints > 0 && <p className="text-xs text-yellow-400 font-bold mb-1 animate-pulse">Skill Points: {skillPoints}</p>}
                    <div className="w-56 h-5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 relative group shadow-inner">
                        <div
                            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 h-full transition-all duration-700 ease-out animate-gradient-x"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                        <p className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                            {currentExp} / {xpNeeded} XP
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Stats Section */}
                <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl transition-all hover:shadow-2xl hover:bg-slate-900/50">
                    <h2 className="text-xl font-semibold mb-4">Current Stats</h2>
                    <HexagonChart
                        data={data}
                        skillPoints={skillPoints}
                        onIncreaseStat={handleIncreaseStat}
                    />
                </div>

                {/* Journal / AI Section */}
                <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl transition-all hover:shadow-2xl hover:bg-slate-900/50">
                    <h2 className="text-xl font-semibold mb-4">Daily Journal</h2>
                    <textarea
                        className="w-full h-40 bg-slate-950/50 backdrop-blur-sm p-4 rounded-xl text-white mb-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-500 resize-none"
                        placeholder="What did you achieve today?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Submit to AI'}
                    </button>

                    {geminiResponse && (
                        <div className="mt-6 p-6 bg-slate-950/60 rounded-xl border border-white/10 shadow-inner">
                            <h3 className="font-bold mb-3 text-purple-300 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                AI Analysis:
                            </h3>
                            <pre className="text-sm whitespace-pre-wrap overflow-auto">{geminiResponse}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

