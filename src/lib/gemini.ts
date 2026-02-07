import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from environment variables
export const geminiClient = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

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
    const systemPrompt = `
You are an RPG Game Master. The user will share their achievements or activities for the day. Your task is to analyze the story and award experience points (XP) and modify the following 6 attributes: STR (Physical), INT (Intelligence), CHA (Social), CRE (Creativity), WIS (Wisdom), WEA (Wealth).

If the user reports positive achievements, award POSITIVE points.
If the user reports bad habits, laziness, mistakes, or negative behavior, you MUST penalize them by awarding NEGATIVE points to the relevant stats. XP gained must NOT be negative.

Limits:
- For POSITIVE updates: The sum of stat increases must NOT exceed 10 points.
- For NEGATIVE updates: Reduce stats reasonably based on the severity of the bad habit. Stats can go down. XP gained cannot be negative.

Provide the response ONLY in JSON format: { "summary": "Short RPG-style summary (example: 'You successfully conquered the coding bug!' or 'Sloth has taken over, you feel weaker...')", "stats_increase": { "STR": 0, "INT": 0, "CHA": 0, "CRE": 0, "WIS": 0, "WEA": 0 }, "xp_gained": 0 }
`;

    const fullPrompt = `${systemPrompt} \n\nUser Input: "${userStory}"`;

    const response = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    // Validating the response structure based on the provided docs
    const text = response.text;

    // Clean up if the model still adds markdown despite mimeType (sometimes happens)
    const cleanText = text?.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!cleanText) {
      throw new Error("No response text received from Gemini.");
    }

    const data: AIAnalysisResponse = JSON.parse(cleanText);
    return data;
  } catch (error) {
    console.error("Error analyzing action with Gemini:", error);
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
    const systemPrompt = `
You are an RPG Game Master. A new player is joining the world and telling you their "Origin Story" (who they were before).
Your task is to analyze their story and assign INITIAL STATS (0-100) for these 6 attributes: STR, INT, CHA, CRE, WIS, WEA.

- The average human is around 10-20.
- Exceptionally skilled people might be 30-50.
- Legends might be 60+.
- Be fair but generous where their story justifies it.
- Also recommend a starting "Character Class" that fits their story (e.g., "Scholar", "Rogue", "Merchant", "Warrior", "Artist").

Provide the response ONLY in JSON format:
{
  "summary": "A brief, immersive comment on their past.",
  "initial_stats": { "STR": 10, "INT": 10, "CHA": 10, "CRE": 10, "WIS": 10, "WEA": 10 },
  "recommended_class": "Class Name"
}
`;

    const fullPrompt = `${systemPrompt} \n\nOrigin Story: "${story}"`;

    const response = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    const cleanText = text?.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!cleanText) throw new Error("No response from Gemini");

    return JSON.parse(cleanText) as OriginStoryAnalysis;
  } catch (error) {
    console.error("Error analyzing origin story:", error);
    throw error;
  }
};
