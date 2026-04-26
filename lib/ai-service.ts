import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      // In development/build, we might not have the key, so we return a dummy or throw
      // but let's just use it and handle errors at call time.
      return new GoogleGenAI({ apiKey: "dummy" });
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getWorkoutRecommendation(yesterdayPerformance: string, goal: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: `Yesterday's Performance: ${yesterdayPerformance}. Goal: ${goal}. Suggest a short, 1-sentence intense workout recommendation for today.` }] }],
      config: {
        maxOutputTokens: 100,
      }
    });

    return response.text?.trim() || "Push your limits today!";
  } catch (error) {
    console.error("AI Recommendation failed:", error);
    return "Push your limits today!";
  }
}

export async function chatWithCoach(messages: { role: string, text: string }[], userProfile: any) {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })).slice(0, -1),
    });

    const result = await chat.sendMessage({
      message: messages[messages.length - 1].text
    });
    
    return result.text || "Stay focused. Keep grinding.";
  } catch (error) {
    console.error("AI Chat failed:", error);
    return "Stay focused. Keep grinding.";
  }
}
