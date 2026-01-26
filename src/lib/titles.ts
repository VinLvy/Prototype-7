
export interface TitleTier {
    name: string;
    minStat: number; // The generic threshold (e.g. if any stat or total stats reach this) - let's assume Max Stat for now
    color: string;
    textColor: string; // Tailwind class
    borderColor: string;    // Tailwind class
    bgGradient: string; // Tailwind class
}

export const TITLES: TitleTier[] = [
    {
        name: 'Novice',
        minStat: 0,
        color: '#9ca3af', // gray-400
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500',
        bgGradient: 'from-gray-800 to-gray-900',
    },
    {
        name: 'Apprentice',
        minStat: 10,
        color: '#22c55e', // green-500
        textColor: 'text-green-400',
        borderColor: 'border-green-500',
        bgGradient: 'from-green-900 to-green-950',
    },
    {
        name: 'Adept',
        minStat: 15,
        color: '#3b82f6', // blue-500
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500',
        bgGradient: 'from-blue-900 to-blue-950',
    },
    {
        name: 'Expert',
        minStat: 30,
        color: '#a855f7', // purple-500
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500',
        bgGradient: 'from-purple-900 to-purple-950',
    },
    {
        name: 'Master',
        minStat: 50,
        color: '#eab308', // yellow-500
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500',
        bgGradient: 'from-yellow-900 to-yellow-950',
    },
    {
        name: 'Legend',
        minStat: 80,
        color: '#f97316', // orange-500
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500',
        bgGradient: 'from-orange-900 to-orange-950',
    },
    {
        name: 'Mythic',
        minStat: 100,
        color: '#ef4444', // red-500
        textColor: 'text-red-500 font-bold',
        borderColor: 'border-red-500',
        bgGradient: 'from-red-900 via-red-950 to-black',
    }
];

export const getTitleForStats = (stats: { [key: string]: number }): TitleTier => {
    // Determine title based on the HIGHEST single stat
    // Filter out non-numeric values (like ids or timestamps that might be in the object)
    const statValues = Object.values(stats).filter(val => typeof val === 'number');
    const maxStat = Math.max(...statValues, 0); // Default to 0 if empty

    // Find the highest tier where minStat <= maxStat
    let currentTier = TITLES[0];
    for (const tier of TITLES) {
        if (maxStat >= tier.minStat) {
            currentTier = tier;
        } else {
            break; // Since TITLES are ordered by minStat
        }
    }
    return currentTier;
};

export const getTitleConfig = (titleName: string | undefined): TitleTier => {
    return TITLES.find(t => t.name === titleName) || TITLES[0];
};
