import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({}) // Picks up GEMINI_API_KEY or GOOGLE_API_KEY from env

export async function enhanceReportDescription(
    originalDescription: string,
    reportType: string,
    location: string
): Promise<string> {
    try {
        const prompt = `You are an emergency response analyst helping to improve citizen incident reports.

Original Report:
Type: ${reportType}
Location: ${location}
Description: ${originalDescription}

Task: Enhance this description to be more professional, clear, and actionable while preserving all original details. 
- Keep it concise (2-3 sentences max)
- Use professional emergency response language
- Maintain factual accuracy
- Include severity indicators if mentioned
- Make it easy for first responders to understand quickly
- Simply return new description without any additional information
- Do not add any additional information not present in the original description
Enhanced Description:`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const enhancedDescription = result.text?.trim() || '';

        if (!enhancedDescription || enhancedDescription.length < 20) {
            console.warn('Gemini enhancement failed or too short, using original description');
            return originalDescription;
        }

        return enhancedDescription;
    } catch (error) {
        console.error('Error enhancing description with Gemini:', error);
        // Return original description if Gemini fails
        return originalDescription;
    }
}
