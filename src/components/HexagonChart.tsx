import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

interface HexagonChartProps {
    data: {
        subject: string;
        A: number;
        fullMark: number;
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
