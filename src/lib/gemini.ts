import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

export async function writerAi(contents: string = "Explain how AI works in a few words") {
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
        systemInstruction: "You are an assistant designed to help writers improve their work. Respond with only the story, without explanations or additional commentary."
    }
});
  return response.text;
}