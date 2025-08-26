import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyAP587I4VdpcjSVwWE0xkyYf0EneCjCTFI";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },  
  ],
});

async function run(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return (
      "⚠️ Notice: The request failed. Possible causes:\n\n" +
      "- Invalid API key\n" +
      "- Rate limit exceeded\n" +
      "- CORS issue or incorrect deployment\n\n" +
      "Check your console or network logs for more details. 😊"
    );
  }
}

export default run;
