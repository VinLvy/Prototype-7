import type { UserStats } from './db';
import { User, Sparkles, Star, Medal, Crown, Trophy, Zap } from 'lucide-react';

export interface Title {
    id: string;
    name: string;
    description: string;
    requirement: (stats: UserStats) => boolean;
    uiRequirement: string;
    icon: any;
    color: string;
    textColor: string;
    borderColor: string;
    bgGradient: string;
}

const getMaxStat = (stats: UserStats): number => {
    const relevantStats = [
        stats.strength,
        stats.intelligence,
        stats.charisma,
        stats.creativity,
        stats.wisdom,
        stats.wealth
    ];
    // Filter out potential undefined/nulls and get max
    return Math.max(...relevantStats.map(v => Number(v) || 0), 0);
};

export const TITLES: Title[] = [
    {
        id: 'novice',
        name: 'Novice',
        description: 'A beginner starting their journey.',
        requirement: () => true,
        uiRequirement: 'None',
        icon: User,
        color: '#9ca3af',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500',
        bgGradient: 'from-gray-800 to-gray-900',
    },
    {
        id: 'apprentice',
        name: 'Apprentice',
        description: 'Showing promise and potential.',
        requirement: (stats) => getMaxStat(stats) >= 10,
        uiRequirement: 'Any Stat 10+',
        icon: Sparkles,
        color: '#22c55e',
        textColor: 'text-green-400',
        borderColor: 'border-green-500',
        bgGradient: 'from-green-900 to-green-950',
    },
    {
        id: 'adept',
        name: 'Adept',
        description: 'Developing competence in their field.',
        requirement: (stats) => getMaxStat(stats) >= 15,
        uiRequirement: 'Any Stat 15+',
        icon: Star,
        color: '#3b82f6',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500',
        bgGradient: 'from-blue-900 to-blue-950',
    },
    {
        id: 'expert',
        name: 'Expert',
        description: 'Highly skilled and knowledgeable.',
        requirement: (stats) => getMaxStat(stats) >= 30,
        uiRequirement: 'Any Stat 30+',
        icon: Medal,
        color: '#a855f7',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500',
        bgGradient: 'from-purple-900 to-purple-950',
    },
    {
        id: 'master',
        name: 'Master',
        description: 'A recognized authority in their domain.',
        requirement: (stats) => getMaxStat(stats) >= 50,
        uiRequirement: 'Any Stat 50+',
        icon: Crown,
        color: '#eab308',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500',
        bgGradient: 'from-yellow-900 to-yellow-950',
    },
    {
        id: 'legend',
        name: 'Legend',
        description: 'Their achievements are told in stories.',
        requirement: (stats) => getMaxStat(stats) >= 80,
        uiRequirement: 'Any Stat 80+',
        icon: Trophy,
        color: '#f97316',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500',
        bgGradient: 'from-orange-900 to-orange-950',
    },
    {
        id: 'mythic',
        name: 'Mythic',
        description: 'A living god among mortals.',
        requirement: (stats) => getMaxStat(stats) >= 100,
        uiRequirement: 'Any Stat 100+',
        icon: Zap,
        color: '#ef4444',
        textColor: 'text-red-500 font-bold',
        borderColor: 'border-red-500',
        bgGradient: 'from-red-900 via-red-950 to-black',
    }
];

export const getTitleConfig = (titleIdOrName: string | undefined): Title => {
    if (!titleIdOrName) return TITLES[0];

    // Support lookup by ID first, then by Name (backward compatibility)
    return TITLES.find(t => t.id === titleIdOrName) ||
        TITLES.find(t => t.name === titleIdOrName) ||
        TITLES[0];
};
