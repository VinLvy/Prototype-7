import { useState, useEffect } from 'react';
import HexagonChart from '../components/HexagonChart';
import LevelUpCelebration from '../components/LevelUpCelebration';
import { analyzeAction, type AIAnalysisResponse } from '../lib/gemini';
import { saveActivityLog, updateUserStats, getUserStats, updateUserXP, getUserProfile, allocateSkillPoint, type UserStats } from '../lib/db';
import { playLevelUpSound } from '../lib/audio';
import supabase from '../lib/supabase';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

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
        { subject: 'STR', A: s.strength, fullMark: 100, fullName: 'Strength' },
        { subject: 'INT', A: s.intelligence, fullMark: 100, fullName: 'Intelligence' },
        { subject: 'CHA', A: s.charisma, fullMark: 100, fullName: 'Charisma' },
        { subject: 'CRE', A: s.creativity, fullMark: 100, fullName: 'Creativity' },
        { subject: 'WIS', A: s.wisdom, fullMark: 100, fullName: 'Wisdom' },
        { subject: 'WEA', A: s.wealth, fullMark: 100, fullName: 'Wealth' },
    ];
};

export default function Dashboard() {
    const [data, setData] = useState(formatStatsForChart(null));
    const [prompt, setPrompt] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Gamification State
    const [level, setLevel] = useState(1);
    const [currentExp, setCurrentExp] = useState(0);
    const [skillPoints, setSkillPoints] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

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
            showNotification("You must be logged in to save progress.");
            return;
        }

        setLoading(true);
        setAnalysisResult(null);
        try {
            // 1. Analyze with AI
            const result = await analyzeAction(prompt);
            setAnalysisResult(result);

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
            showNotification("Error calling AI or parsing response.");
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
            showNotification("Failed to allocate point.");
        }
    };

    // Calculate progress percentage
    const xpNeeded = level * 100;
    const progressPercent = Math.min(100, Math.max(0, (currentExp / xpNeeded) * 100));

    return (
        <div className="text-white p-6 md:p-10 relative">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
            />
            <LevelUpCelebration show={showCelebration} onClose={() => setShowCelebration(false)} />

            <header className="mb-8 flex justify-between items-end backdrop-blur-sm bg-slate-900/30 p-4 rounded-xl border border-white/5">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-sm">ReLife Dashboard</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Getting Things Done.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-red-500 font-bold mb-1">Level {level}</p>
                    {skillPoints > 0 && <p className="text-xs text-yellow-400 font-bold mb-1 animate-pulse">Skill Points: {skillPoints}</p>}
                    <div className="w-56 h-5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 relative group shadow-inner">
                        <div
                            className="bg-gradient-to-r from-purple-600 via-red-600 to-purple-600 h-full transition-all duration-700 ease-out animate-gradient-x"
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
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full shadow-lg shadow-purple-900/20 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-purple-500/40"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Submit to AI'}
                    </button>

                    {analysisResult && (
                        <div className="mt-6 p-6 bg-slate-900/60 rounded-2xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-fade-in-up">
                            <h3 className="font-bold mb-4 text-purple-300 flex items-center gap-2 text-lg border-b border-purple-500/20 pb-2">
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                The Verdict
                            </h3>
                            
                            <p className="text-slate-200 italic mb-6 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
                                "{analysisResult.summary}"
                            </p>
                            
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex-1">
                                    <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3">Stat Changes</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(analysisResult.stats_increase).map(([stat, value]) => (
                                            value !== 0 && (
                                                <div key={stat} className="flex justify-between items-center text-sm">
                                                    <span className="font-medium text-slate-300">{stat}</span>
                                                    <span className={`font-bold ${value > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {value > 0 ? '+' : ''}{value}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    {Object.values(analysisResult.stats_increase).every(v => v === 0) && (
                                        <p className="text-sm text-slate-500 italic">No stats changed.</p>
                                    )}
                                </div>
                                
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 flex-1 flex flex-col justify-center items-center text-center">
                                    <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Experience Gained</h4>
                                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 drop-shadow-md">
                                        +{analysisResult.xp_gained} XP
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

