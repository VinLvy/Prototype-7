import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { getActivityLogs } from '../lib/db';

export default function History() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await getActivityLogs(user.id);
                setLogs(data || []);
            }
            setLoading(false);
        };

        fetchLogs();
    }, []);

    return (
        <div className="p-8 text-white min-h-full">
            <h1 className="text-3xl font-bold mb-6 text-purple-400">Activity History</h1>

            {loading ? (
                <p className="text-gray-400">Loading history...</p>
            ) : logs.length === 0 ? (
                <p className="text-gray-400">No activity recorded yet.</p>
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => (
                        <div key={log.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-lg font-semibold mb-2 text-white">Input:</p>
                            <p className="bg-gray-700 p-3 rounded text-gray-300 mb-4">{log.description}</p>

                            {log.ai_analysis && (
                                <>
                                    <p className="text-lg font-semibold mb-2 text-purple-300">AI Analysis:</p>
                                    <pre className="text-xs bg-gray-900 p-3 rounded text-green-400 overflow-auto whitespace-pre-wrap font-mono border border-gray-600">
                                        {JSON.stringify(log.ai_analysis, null, 2)}
                                    </pre>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
