import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from environment variables
// Note: In a production environment, it is recommended to use a backend proxy
// to protect your API key.
export const geminiClient = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});
