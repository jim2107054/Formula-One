import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerationOptions {
  topic: string;
  type: "theory" | "lab";
  format?: "notes" | "slides" | "summary";
  language?: string; // For lab code generation
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Generate learning materials
export async function generateLearningMaterial(options: GenerationOptions): Promise<string> {
  const { topic, type, format = "notes", language = "python" } = options;

  let systemPrompt = "";
  let userPrompt = "";

  if (type === "theory") {
    systemPrompt = `You are an expert educational content creator. Generate high-quality learning materials that are:
- Well-structured and organized
- Clear and easy to understand
- Academically accurate
- Include relevant examples`;

    switch (format) {
      case "notes":
        userPrompt = `Create comprehensive study notes on the topic: "${topic}". Include:
1. Introduction and overview
2. Key concepts and definitions
3. Detailed explanations
4. Examples and illustrations
5. Summary and key takeaways`;
        break;
      case "slides":
        userPrompt = `Create presentation slide content on the topic: "${topic}". Format as:
---
**Slide 1: Title**
[Content]

**Slide 2: Overview**
[Content]

...and so on. Include approximately 8-12 slides.`;
        break;
      case "summary":
        userPrompt = `Create a concise summary of the topic: "${topic}". Include key points, important concepts, and main takeaways.`;
        break;
    }
  } else {
    systemPrompt = `You are an expert programming instructor. Generate code that is:
- Syntactically correct
- Well-commented
- Following best practices
- Educational and easy to understand`;

    userPrompt = `Create a ${language} code example/tutorial for the topic: "${topic}". Include:
1. Code with detailed comments
2. Explanation of how it works
3. Example usage
4. Common pitfalls to avoid`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "Unable to generate content.";
}

// Chat with AI assistant
export async function chatWithAssistant(
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  const systemMessage = `You are an intelligent learning assistant for a university course platform. You help students:
- Search and find course materials
- Understand complex topics
- Generate study materials
- Answer questions about course content

${context ? `Course Context:\n${context}` : ""}

Be helpful, accurate, and educational in your responses. If asked about specific course materials, refer to the context provided.`;

  const chatMessages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";
}

// Validate generated code
export async function validateCode(code: string, language: string): Promise<{
  valid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a code validation expert. Analyze the following ${language} code for:
1. Syntax errors
2. Logic issues
3. Best practice violations
4. Security concerns

Respond in JSON format:
{
  "valid": boolean,
  "issues": ["list of issues found"],
  "suggestions": ["list of improvement suggestions"]
}`,
      },
      { role: "user", content: code },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  try {
    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return { valid: true, issues: [], suggestions: [] };
  }
}

// Simple search function (can be enhanced with embeddings later)
export async function semanticSearch(
  query: string,
  documents: { id: string; content: string; title: string }[]
): Promise<{ id: string; title: string; relevance: number }[]> {
  // Simple keyword-based relevance scoring
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const results = documents.map((doc) => {
    const contentLower = doc.content.toLowerCase();
    const titleLower = doc.title.toLowerCase();
    
    let relevance = 0;
    queryWords.forEach((word) => {
      if (titleLower.includes(word)) relevance += 2;
      if (contentLower.includes(word)) relevance += 1;
    });
    
    return {
      id: doc.id,
      title: doc.title,
      relevance,
    };
  });

  return results
    .filter((r) => r.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
}

export default openai;
