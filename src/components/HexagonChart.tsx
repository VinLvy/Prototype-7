
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
}

const HexagonChart: React.FC<HexagonChartProps> = ({ data }) => {
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
                        tick={{ fill: '#22d3ee', fontSize: 12, fontWeight: 'bold' }}
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
