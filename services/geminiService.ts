
import { GoogleGenAI, Type } from "@google/genai";

export async function generateProductDescription(productName: string, category: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Escreva uma descrição profissional e persuasiva de venda para o produto "${productName}" na categoria "${category}" para uma loja de informática e segurança chamada Infotronic. Seja direto e destaque benefícios técnicos.`,
  });
  return response.text || "Descrição indisponível no momento.";
}
