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
    listeners.forEach(l => {
        try {
            // Use setTimeout to make notifications non-blocking
            setTimeout(l, 0);
        } catch (e) {
            console.error("Error in data change listener:", e);
        }
    });
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
    console.log(`Updating profile for user ${userId}...`, updates);
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
    console.log("Profile updated successfully.");
    notifyUserDataChange();
};

export const updateUserStats = async (userId: string, statsIncrease: { [key: string]: number }) => {
    const currentStats = await getUserStats(userId);

    if (!currentStats) {
        throw new Error("User stats not found");
    }

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

    const { error } = await supabase
        .from('user_stats')
        .update(newStats)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }

    notifyUserDataChange();
    return newStats;
};

// Returns { levelUp: boolean, newLevel: number, currentExp: number, skillPoints: number }
export const updateUserXP = async (userId: string, xpGained: number) => {
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
    skill_points = skill_points || 0;

    if (xpGained > 0) {
        current_exp += xpGained;
    }
    const xpNeeded = level * 100;
    let levelUp = false;

    if (current_exp >= xpNeeded) {
        level += 1;
        current_exp -= xpNeeded;
        skill_points += 1;
        levelUp = true;
    }

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

    const { error: finalError } = await supabase
        .from('users')
        .update({
            skill_points: user.skill_points - 1
        })
        .eq('id', userId);

    if (finalError) throw finalError;

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

export const saveInitialStats = async (userId: string, stats: { [key: string]: number }) => {
    // 1. Ensure user record exists in public.users first
    // This is a safety measure in case the auth trigger failed
    const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

    if (userFetchError || !userData) {
        console.log("User record missing in public.users, creating it now...");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    username: user.user_metadata?.full_name || 'Adventurer',
                    avatar_url: user.user_metadata?.avatar_url || null
                });
            if (insertError) {
                console.error("Failed to create missing user record:", insertError);
                // Continue anyway, upsert might still work or error out properly
            }
        }
    }

    // 2. Map keys to DB columns
    const mapKeyToColumn: { [key: string]: string } = {
        'STR': 'strength',
        'INT': 'intelligence',
        'CHA': 'charisma',
        'CRE': 'creativity',
        'WIS': 'wisdom',
        'WEA': 'wealth'
    };

    const newStats: any = {};
    for (const [key, value] of Object.entries(stats)) {
        const column = mapKeyToColumn[key];
        if (column) {
            newStats[column] = value;
        }
    }

    // 3. Upsert stats
    console.log(`Saving initial stats for user ${userId}...`);
    const { error } = await supabase
        .from('user_stats')
        .upsert({ user_id: userId, ...newStats });

    if (error) {
        console.error("Error saving initial stats:", error);
        throw error;
    }
    console.log("Initial stats saved successfully.");
};

export const completeOnboarding = async (userId: string, characterClass: string) => {
    // 1. Update character class in profile first (database)
    if (characterClass) {
        console.log(`Setting character class to ${characterClass}...`);
        await updateUserProfile(userId, { character_class: characterClass });
    }

    // 2. Update user metadata (auth)
    // We do this last because it triggers a re-render in ProtectedRoute
    console.log("Updating auth metadata: onboarding_complete = true");
    const { error: metaError } = await supabase.auth.updateUser({
        data: { onboarding_complete: true }
    });

    if (metaError) {
        console.error("Error updating user metadata:", metaError);
        throw metaError;
    }
    console.log("Auth metadata updated successfully.");
};

export const resetAccountProgress = async (userId: string) => {
    // 1. Reset user profile
    const { error: userError } = await supabase
        .from('users')
        .update({
            level: 1,
            current_exp: 0,
            skill_points: 0,
            title: null,
            character_class: null
        })
        .eq('id', userId);

    if (userError) {
        console.error("Error resetting user profile:", userError);
        throw userError;
    }

    // 2. Reset user stats
    const { error: statsError } = await supabase
        .from('user_stats')
        .update({
            strength: 0,
            intelligence: 0,
            charisma: 0,
            creativity: 0,
            wisdom: 0,
            wealth: 0
        })
        .eq('user_id', userId);

    if (statsError) {
        console.error("Error resetting user stats:", statsError);
        throw statsError;
    }

    // 3. Clear activity logs
    const { error: logsError } = await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', userId);

    if (logsError) {
        console.error("Error clearing activity logs:", logsError);
        throw logsError;
    }

    // 4. Reset onboarding metadata
    const { error: authError } = await supabase.auth.updateUser({
        data: { onboarding_complete: false }
    });

    if (authError) {
        console.error("Error resetting auth metadata:", authError);
        throw authError;
    }

    // 5. Force session refresh to sync local metadata
    await supabase.auth.refreshSession();

    notifyUserDataChange();
};
