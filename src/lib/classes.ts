import type { UserStats } from './db';
import { Sword, Wand, Music, Hammer, Scroll, Coins, User } from 'lucide-react';

export interface CharacterClass {
    id: string;
    name: string;
    description: string;
    requirement: (stats: UserStats) => boolean;
    uiRequirement: string;
    icon: any;
    color: string;
    borderColor: string;
    bgGradient: string;
}

export const CLASSES: CharacterClass[] = [
    {
        id: 'novice',
        name: 'Novice',
        description: 'The beginning of every journey.',
        requirement: () => true, // Always unlocked
        uiRequirement: 'None',
        icon: User,
        color: 'text-gray-400',
        borderColor: 'border-gray-500',
        bgGradient: 'from-gray-800 to-gray-900',
    },
    {
        id: 'warrior',
        name: 'Warrior',
        description: 'A master of combat and physical prowess.',
        requirement: (stats) => stats.strength >= 50,
        uiRequirement: 'Strength 50+',
        icon: Sword,
        color: 'text-red-400',
        borderColor: 'border-red-500',
        bgGradient: 'from-red-900 to-red-950',
    },
    {
        id: 'mage',
        name: 'Mage',
        description: 'A scholar of arcane arts and intelligence.',
        requirement: (stats) => stats.intelligence >= 50,
        uiRequirement: 'Intelligence 50+',
        icon: Wand,
        color: 'text-blue-400',
        borderColor: 'border-blue-500',
        bgGradient: 'from-blue-900 to-blue-950',
    },
    {
        id: 'bard',
        name: 'Bard',
        description: 'A charmer who weaves magic through words and music.',
        requirement: (stats) => stats.charisma >= 50,
        uiRequirement: 'Charisma 50+',
        icon: Music,
        color: 'text-pink-400',
        borderColor: 'border-pink-500',
        bgGradient: 'from-pink-900 to-pink-950',
    },
    {
        id: 'artificer',
        name: 'Artificer',
        description: 'An inventor who creates wonders from imagination.',
        requirement: (stats) => stats.creativity >= 50,
        uiRequirement: 'Creativity 50+',
        icon: Hammer,
        color: 'text-orange-400',
        borderColor: 'border-orange-500',
        bgGradient: 'from-orange-900 to-orange-950',
    },
    {
        id: 'cleric',
        name: 'Cleric',
        description: 'A wise guardian who heals and protects.',
        requirement: (stats) => stats.wisdom >= 50,
        uiRequirement: 'Wisdom 50+',
        icon: Scroll,
        color: 'text-green-400',
        borderColor: 'border-green-500',
        bgGradient: 'from-green-900 to-green-950',
    },
    {
        id: 'merchant',
        name: 'Merchant',
        description: 'A shrewd negotiator who understands the value of everything.',
        requirement: (stats) => stats.wealth >= 50, // Assuming wealth is a stat like the others
        uiRequirement: 'Wealth 50+',
        icon: Coins,
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500',
        bgGradient: 'from-yellow-900 to-yellow-950',
    }
];

export const getClassConfig = (classId: string | undefined): CharacterClass => {
    return CLASSES.find(c => c.id === classId) || CLASSES[0];
};
