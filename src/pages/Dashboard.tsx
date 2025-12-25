import { useState, useEffect } from 'react';
import HexagonChart from '../components/HexagonChart';
import { analyzeAction } from '../lib/gemini';
import { saveActivityLog, updateUserStats, getUserStats, type UserStats } from '../lib/db';
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

    // Fetch initial stats and user ID
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const stats = await getUserStats(user.id);
                if (stats) {
                    setData(formatStatsForChart(stats));
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

            // 4. Update Local State (Refetch or Calculate locally)
            // For simplicity and accuracy, let's just refetch or optimistically update.
            // Let's refetch to be sure we match DB state.
            const updatedStats = await getUserStats(userId);
            if (updatedStats) {
                setData(formatStatsForChart(updatedStats));
            }

        } catch (error) {
            console.error(error);
            setGeminiResponse("Error calling Gemini or parsing response.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-purple-400">ReLife RPG Dashboard</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Level 1</p>
                    <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Stats Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Current Stats</h2>
                    <HexagonChart data={data} />
                </div>

                {/* Journal / AI Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Daily Journal</h2>
                    <textarea
                        className="w-full h-32 bg-gray-700 p-3 rounded text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="What did you achieve today?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        className="bg-purple-600 px-6 py-2 rounded font-bold hover:bg-purple-500 transition w-full"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Submit to AI'}
                    </button>

                    {geminiResponse && (
                        <div className="mt-4 p-4 bg-gray-700 rounded border border-gray-600">
                            <h3 className="font-bold mb-2 text-purple-300">AI Analysis:</h3>
                            <pre className="text-sm whitespace-pre-wrap overflow-auto">{geminiResponse}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
