import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { getActivityLogs } from '../lib/db';

export default function History() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                <div className="space-y-6">
                    {logs.map((log) => (
                        <div key={log.id} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 transition-all hover:bg-slate-900/60">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-sm text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-lg font-semibold mb-3 text-white">Input:</p>
                            <p className="bg-slate-950/50 p-4 rounded-xl text-slate-300 mb-6 border border-white/5">{log.description}</p>

                            {log.ai_analysis && (
                                <>
                                    <p className="text-lg font-semibold mb-3 text-purple-300 border-b border-white/10 pb-2 inline-block">AI Analysis</p>
                                    <pre className="text-xs bg-slate-950/80 p-4 rounded-xl text-emerald-400 overflow-auto whitespace-pre-wrap font-mono border border-white/10 shadow-inner">
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
