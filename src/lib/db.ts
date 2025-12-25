import supabase from './supabase';

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
            newStats[column] = (currentStats[column] || 0) + (increase || 0);
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

    return newStats;
};
