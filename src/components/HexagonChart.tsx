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

const CustomTick = ({ payload, x, y, skillPoints, onIncreaseStat }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={4}
                textAnchor="middle"
                fill="#22d3ee"
                fontSize={12}
                fontWeight="bold"
            >
                {payload.value}
            </text>
            {skillPoints && skillPoints > 0 && onIncreaseStat && (
                <g
                    onClick={() => onIncreaseStat(payload.value)}
                    style={{ cursor: 'pointer' }}
                    transform="translate(0, -15)"
                >
                    <circle r={8} fill="#10b981" stroke="#fff" strokeWidth={1} />
                    <text
                        x={0}
                        y={0}
                        dy={3}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
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
        <div style={{ width: '100%', height: 500, position: 'relative' }}>
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
                    <PolarGrid stroke="#374151" strokeDasharray="3 3" />
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
