import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getFinancialAdvice = async (transactions: Transaction[], totalBalance: number): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Please configure your API Key to get AI insights.";

  try {
    // Simplify data for the prompt to save tokens and focus context
    const summary = transactions.map(t => 
      `${t.date.split('T')[0]}: ${t.title} - $${t.amount} (${t.type} - ${t.category})`
    ).join('\n');

    const prompt = `
      You are a friendly and strict financial advisor for an app called SpendWise.
      Current Balance: $${totalBalance}
      Recent Transactions:
      ${summary}

      Analyze the spending habits briefly.
      1. Give 1 specific compliment.
      2. Give 1 specific warning or area of improvement.
      3. Suggest a quick tip to save money based on these categories.
      
      Keep the tone modern, encouraging, and concise (max 100 words). Format with bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't analyze your data right now. Please try again later.";
  }
};

export const generateAvatar = async (prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};