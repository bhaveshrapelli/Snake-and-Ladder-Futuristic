
import { GoogleGenAI } from "@google/genai";
import { GameEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameCommentary = async (event: GameEvent, playerName: string): Promise<string> => {
  try {
    const prompt = `
      You are the AI System Voice for "Neon Nexus: 2099", a futuristic version of Snake and Ladders.
      Event: ${event.type}
      Player: ${playerName}
      Details: Moved from ${event.from} to ${event.to}.
      
      Generate a short, cool, immersive, futuristic commentary for this move. 
      Use terms like 'Hyper-loop', 'Quantum Tunneling', 'Neural De-sync', 'Grid stability', 'Protocol'.
      Keep it under 20 words. No emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text || "Status update: Movement sequence completed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The Grid pulses with your arrival.";
  }
};
