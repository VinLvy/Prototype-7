import { useState } from 'react';
import HexagonChart from '../components/HexagonChart';
import { analyzeAction } from '../lib/gemini';

// Dummy data for the chart
const initialData = [
    { subject: 'STR', A: 40, fullMark: 100 },
    { subject: 'INT', A: 60, fullMark: 100 },
    { subject: 'CHA', A: 30, fullMark: 100 },
    { subject: 'CRE', A: 70, fullMark: 100 },
    { subject: 'WIS', A: 50, fullMark: 100 },
    { subject: 'WEA', A: 20, fullMark: 100 },
];

export default function Dashboard() {
    const [data] = useState(initialData);
    const [prompt, setPrompt] = useState('');
    const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setGeminiResponse(null);
        try {
            const result = await analyzeAction(prompt);
            setGeminiResponse(JSON.stringify(result, null, 2));
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
