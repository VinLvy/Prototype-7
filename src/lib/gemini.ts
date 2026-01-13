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
If the user reports bad habits, laziness, mistakes, or negative behavior, you MUST penalize them by awarding NEGATIVE points to the relevant stats and/or XP.

Limits:
- For POSITIVE updates: The sum of stat increases must NOT exceed 10 points.
- For NEGATIVE updates: Reduce stats reasonably based on the severity of the bad habit. Stats can go down. Current EXP cannot go down.

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
