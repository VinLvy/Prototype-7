import supabase from './supabase';

export interface AIAnalysisResponse {
  summary: string;
  stats_increase: {
    STR: number;
    INT: number;
    CHA: number;
    CRE: number;
    WIS: number;
    WEA: number;
  };
  xp_gained: number;
}

export const analyzeAction = async (userStory: string): Promise<AIAnalysisResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'analyzeAction', payload: userStory }
    });

    if (error) {
      let detail = error.message;
      if (error.context && typeof error.context.json === 'function') {
        try {
          const errBody = await error.context.json();
          if (errBody && errBody.error) detail += ` - ${errBody.error}`;
        } catch {
          // ignore
        }
      }
      throw new Error(`Edge Function error: ${detail}`);
    }

    if (!data) {
      throw new Error("No response received from Gemini via Edge Function.");
    }

    return data as AIAnalysisResponse;
  } catch (error) {
    console.error("Error analyzing action via Edge Function:", error);
    throw error;
  }
};

export interface OriginStoryAnalysis {
  summary: string;
  initial_stats: {
    STR: number;
    INT: number;
    CHA: number;
    CRE: number;
    WIS: number;
    WEA: number;
  };
  recommended_class: string;
}

export const analyzeOriginStory = async (story: string): Promise<OriginStoryAnalysis> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'analyzeOriginStory', payload: story }
    });

    if (error) {
      let detail = error.message;
      if (error.context && typeof error.context.json === 'function') {
        try {
          const errBody = await error.context.json();
          if (errBody && errBody.error) detail += ` - ${errBody.error}`;
        } catch {
          // ignore
        }
      }
      throw new Error(`Edge Function error: ${detail}`);
    }

    if (!data) {
      throw new Error("No response received from Gemini via Edge Function.");
    }

    return data as OriginStoryAnalysis;
  } catch (error) {
    console.error("Error analyzing origin story via Edge Function:", error);
    throw error;
  }
};
