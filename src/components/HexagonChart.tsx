import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface HexagonChartProps {
    data: {
        subject: string;
        A: number;
        fullMark: number;
        fullName?: string;
    }[];
    skillPoints?: number;
    onIncreaseStat?: (stat: string) => void;
}

const CustomTick = ({ payload, x, y, cx, cy, skillPoints, onIncreaseStat }: any) => {
    // Calculate vector from center to current point
    // We can use simple vector math: (x - cx, y - cy)
    // But since x,y are already calculated, let's just push them out further.
    // Distance from center
    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Add extra spacing (e.g., 25px)
    const offset = 35;
    const newX = x + (dx / distance) * offset;
    const newY = y + (dy / distance) * offset;

    return (
        <g transform={`translate(${newX},${newY})`}>
            <text
                x={0}
                y={0}
                dy={4}
                textAnchor="middle"
                fill="#22d3ee" // Cyan-400
                fontSize={18}
                fontWeight="bold"
                style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
            >
                {payload.value}
            </text>
            {skillPoints && skillPoints > 0 && onIncreaseStat && (
                <g
                    onClick={() => onIncreaseStat(payload.value)}
                    style={{ cursor: 'pointer' }}
                    transform="translate(0, 20)" // Position button below text
                >
                    <circle
                        r={10}
                        fill="#10b981" // Emerald-500
                        stroke="#059669" // Emerald-600
                        strokeWidth={2}
                        style={{ filter: "drop-shadow(0 0 5px rgba(16, 185, 129, 0.6))" }}
                    />
                    <text
                        x={0}
                        y={0}
                        dy={4} // Center physically
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                    >
                        +
                    </text>
                </g>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-950/90 border border-cyan-500/30 p-4 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.15)] min-w-[120px]">
                <p className="text-purple-500 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                    {data.fullName || data.subject}
                </p>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-cyan-400 text-sm">Stat Points</span>
                    <span className="text-blue-500 font-mono font-bold text-base">{data.A}</span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (data.A / 100) * 100)}%` }}
                    />
                </div>
            </div>
        );
    }
    return null;
};

const HexagonChart: React.FC<HexagonChartProps> = ({ data, skillPoints = 0, onIncreaseStat }) => {
    return (
        <div className="rounded-2xl border border-white/5 bg-transparent shadow-none" style={{ width: '100%', height: 500, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <defs>
                        <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#bc13fe" stopOpacity={0.4} />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={(props) => (
                            <CustomTick
                                {...props}
                                skillPoints={skillPoints}
                                onIncreaseStat={onIncreaseStat}
                            />
                        )}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Radar
                        name="Stats"
                        dataKey="A"
                        stroke="#00f2ff"
                        strokeWidth={3}
                        fill="url(#cyberGradient)"
                        fillOpacity={0.6}
                        style={{ filter: "url(#glow)" }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HexagonChart;
