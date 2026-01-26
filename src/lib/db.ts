import supabase from './supabase';
import { getTitleForStats } from './titles';

export interface UserStats {
    user_id: string;
    strength: number;
    intelligence: number;
    charisma: number;
    creativity: number;
    wisdom: number;
    wealth: number;
    updated_at: string;
}

// Simple Event Bus for User Data Updates
type DataChangeListener = () => void;
const listeners: DataChangeListener[] = [];

export const onUserDataChange = (listener: DataChangeListener) => {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
};

const notifyUserDataChange = () => {
    listeners.forEach(l => l());
};

export const saveActivityLog = async (userId: string, description: string, aiAnalysis: any) => {
    const { error } = await supabase
        .from('activity_logs')
        .insert({
            user_id: userId,
            description,
            ai_analysis: aiAnalysis
        });

    if (error) {
        console.error('Error saving activity log:', error);
        throw error;
    }
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }

    return data;
};

export interface UserProfile {
    id: string;
    level: number;
    current_exp: number;
    skill_points: number;
    username?: string;
    title?: string;
    character_class?: string;
    avatar_url?: string;
    // ... any other fields
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
    notifyUserDataChange();
};

export const updateUserStats = async (userId: string, statsIncrease: { [key: string]: number }) => {
    // 1. Get current stats
    const currentStats = await getUserStats(userId);

    if (!currentStats) {
        throw new Error("User stats not found");
    }

    // 2. Calculate new stats
    // Mapping from AI response keys (e.g., 'STR') to Database columns (e.g., 'strength')
    // AI Keys: STR, INT, CHA, CRE, WIS, WEA
    // DB Columns: strength, intelligence, charisma, creativity, wisdom, wealth

    const mapKeyToColumn: { [key: string]: string } = {
        'STR': 'strength',
        'INT': 'intelligence',
        'CHA': 'charisma',
        'CRE': 'creativity',
        'WIS': 'wisdom',
        'WEA': 'wealth'
    };

    const newStats: any = {};

    for (const [key, increase] of Object.entries(statsIncrease)) {
        const column = mapKeyToColumn[key];
        if (column) {
            // @ts-ignore
            newStats[column] = Math.max(0, (currentStats[column] || 0) + (increase || 0));
        }
    }

    // 3. Update database
    const { error } = await supabase
        .from('user_stats')
        .update(newStats)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }

    // 4. Update Title based on new total stats
    const finalStats = { ...currentStats, ...newStats };
    const titleConfig = getTitleForStats(finalStats as unknown as Record<string, number>); // Cast to suit the flexible key type

    // Update title in users table
    await supabase
        .from('users')
        .update({ title: titleConfig.name })
        .eq('id', userId);

    // however, since it updates global state (stats + title), we SHOULD notify.
    notifyUserDataChange();
    return newStats;
};

// Returns { levelUp: boolean, newLevel: number, currentExp: number, skillPoints: number }
export const updateUserXP = async (userId: string, xpGained: number) => {
    // 1. Get current User data
    const { data: user, error } = await supabase
        .from('users')
        .select('level, current_exp, skill_points')
        .eq('id', userId)
        .single();

    if (error || !user) {
        console.error('Error fetching user for XP update:', error);
        return { levelUp: false, newLevel: 1, currentExp: 0, skillPoints: 0 };
    }

    let { level, current_exp, skill_points } = user;
    // Default to 0 if null/undefined
    skill_points = skill_points || 0;

    // Ensure XP never decreases
    if (xpGained > 0) {
        current_exp += xpGained;
    }

    // Simple Level Up Formula: 100 XP per level
    const xpNeeded = level * 100;
    let levelUp = false;

    if (current_exp >= xpNeeded) {
        level += 1;
        current_exp -= xpNeeded;
        skill_points += 1; // Award 1 skill point
        levelUp = true;
    }

    // 2. Update DB
    const { error: updateError } = await supabase
        .from('users')
        .update({ level, current_exp, skill_points })
        .eq('id', userId);

    if (updateError) {
        console.error('Error updating user XP:', updateError);
    }

    notifyUserDataChange();
    return { levelUp, newLevel: level, currentExp: current_exp, skillPoints: skill_points };
};

export const allocateSkillPoint = async (userId: string, statKey: string) => {
    // 1. Validate Skill Points
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('skill_points')
        .eq('id', userId)
        .single();

    if (userError || !user) throw new Error("Could not fetch user profile");

    if (!user.skill_points || user.skill_points <= 0) {
        throw new Error("No skill points available");
    }

    // 2. Update Stats
    // Map 'STR' -> 'strength'
    const mapKeyToColumn: { [key: string]: string } = {
        'STR': 'strength',
        'INT': 'intelligence',
        'CHA': 'charisma',
        'CRE': 'creativity',
        'WIS': 'wisdom',
        'WEA': 'wealth'
    };
    const column = mapKeyToColumn[statKey];
    if (!column) throw new Error("Invalid stat key");

    const currentStats = await getUserStats(userId);
    if (!currentStats) throw new Error("User stats not found");

    // @ts-ignore
    const newValue = (currentStats[column] || 0) + 1;

    // Perform updates (optimistic: if one fails, we might have issue, but usually ok)
    // Update Stats
    const { error: statsError } = await supabase
        .from('user_stats')
        .update({ [column]: newValue })
        .eq('user_id', userId);

    if (statsError) throw statsError;

    // Update Title
    const newStats = { ...currentStats, [column]: newValue };
    const titleConfig = getTitleForStats(newStats as unknown as Record<string, number>);

    await supabase
        .from('users')
        .update({
            skill_points: user.skill_points - 1,
            title: titleConfig.name
        })
        .eq('id', userId);

    notifyUserDataChange();
    return { success: true, remainingPoints: user.skill_points - 1 };
};

export const getActivityLogs = async (userId: string) => {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }
    return data;
};
