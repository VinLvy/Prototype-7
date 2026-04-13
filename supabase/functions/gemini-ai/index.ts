import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    // Use GEMINI_API_KEY from environment, or fallback to VITE_GEMINI_API_KEY if testing locally and not properly mapped yet
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('VITE_GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error("Missing Gemini API Key in Supabase Edge Function environment.");
    }

    if (!action || !payload) {
      throw new Error("Missing 'action' or 'payload' in the request body.");
    }

    let systemPrompt = "";
    let userPromptContext = "";

    if (action === "analyzeAction") {
      systemPrompt = `
You are an RPG Game Master. The user will share their achievements or activities for the day. Your task is to analyze the story and award experience points (XP) and modify the following 6 attributes: STR (Physical), INT (Intelligence), CHA (Social), CRE (Creativity), WIS (Wisdom), WEA (Wealth).

If the user reports positive achievements, award POSITIVE points.
If the user reports bad habits, laziness, mistakes, or negative behavior, you MUST penalize them by awarding NEGATIVE points to the relevant stats. XP gained must NOT be negative.

Limits:
- For POSITIVE updates: The sum of stat increases must NOT exceed 10 points.
- For NEGATIVE updates: Reduce stats reasonably based on the severity of the bad habit. Stats can go down. XP gained cannot be negative.

Provide the response ONLY in JSON format: { "summary": "Short RPG-style summary (example: 'You successfully conquered the coding bug!' or 'Sloth has taken over, you feel weaker...')", "stats_increase": { "STR": 0, "INT": 0, "CHA": 0, "CRE": 0, "WIS": 0, "WEA": 0 }, "xp_gained": 0 }
`;
      userPromptContext = `User Input: "${payload}"`;

    } else if (action === "analyzeOriginStory") {
      systemPrompt = `
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
      userPromptContext = `Origin Story: "${payload}"`;

    } else {
      throw new Error(`Unsupported action: ${action}`);
    }

    const fullPrompt = `${systemPrompt} \n\n${userPromptContext}`;

    // Call Gemini API via fetch (this avoids needing to bundle the Google GenAI SDK in the edge function)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Failed to generate content: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();
    
    // Extract the text content from Gemini's response structure
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error("No text response received from Gemini.");
    }
    
    // Clean up potential markdown blocks if present
    const cleanText = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();

    return new Response(cleanText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    const error = err as Error;
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
