import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuestionType, QuizConfig, Difficulty } from "../types";

// Helper to sanitize JSON string if needed (though responseSchema handles most)
const cleanJson = (text: string) => {
  const match = text.match(/```json([\s\S]*?)```/);
  return match ? match[1] : text;
};

export const generateQuizQuestions = async (config: QuizConfig): Promise<{ title: string; questions: Question[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Schema definition for strict JSON output
  const questionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A short, catchy title for the quiz based on the content.",
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: Object.values(QuestionType) },
            questionText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of options for multiple choice or true/false. Empty for others.",
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Detailed explanation of why the answer is correct." },
            category: { type: Type.STRING, description: "Topic tag (e.g., 'History', 'Math', 'Grammar') for analysis." },
          },
          required: ["id", "type", "questionText", "correctAnswer", "explanation", "category"],
        },
      },
    },
    required: ["title", "questions"],
  };

  let prompt = `Generate a ${config.difficulty} difficulty quiz with ${config.questionCount} questions.
  The questions should be a mix of the following types: ${config.questionTypes.join(', ')}.
  
  Content Source:
  `;

  let tools: any[] = [];
  
  if (config.sourceType === 'url') {
    // Enable Google Search for URL grounding
    tools = [{ googleSearch: {} }];
    prompt += `Analyze the content from this URL: ${config.sourceText} to generate the quiz. Ensure questions are relevant to the page content.`;
  } else {
    // Text or File content (File content is passed as text here after frontend extraction)
    prompt += `"${config.sourceText.substring(0, 30000)}..." \n\n(Note: Content truncated if too long).`;
  }

  try {
    const response = await ai.models.generateContent({
      model: config.sourceType === 'url' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash', // Use Pro for Search tool, Flash for text
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        tools: tools,
        systemInstruction: "You are an expert educator. Create engaging, accurate quiz questions. For Multiple Choice, provide 4 options. For True/False, provide 2 options (True, False). Ensure the 'correctAnswer' exactly matches one of the options.",
      },
    });

    if (!response.text) {
      throw new Error("No response from AI.");
    }

    const result = JSON.parse(response.text);
    return {
      title: result.title || "Generated Quiz",
      questions: result.questions,
    };

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz. Please try again or check the content source.");
  }
};
