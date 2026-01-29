import api from "@/util/api";

export interface AIQuizGenerationRequest {
  topic: string;
  context?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  questionCount?: number;
  matchingCount?: number;
  language?: string;
  includeExplanations?: boolean;
  questionPlan?: Array<{
    answer_type: string;
    count: number;
  }>;
  temperature?: number;
}

export interface QuizAnswer {
  label?: string;
  is_correct?: boolean;
  explanation?: string;
  left?: string;
  right?: string;
}

export interface GeneratedQuestion {
  question: string;
  answer_type: string;
  answers: QuizAnswer[];
}

export interface AIQuizGenerationResponse {
  success: boolean;
  data: {
    topic: string;
    difficulty: string;
    language: string;
    questionPlan: Array<{
      answer_type: string;
      count: number;
    }>;
    metadata: {
      model: string;
      generatedAt: string;
      totalQuestions: number;
    };
    questions: GeneratedQuestion[];
  };
}

class QuizService {
  async generateQuizWithAI(
    payload: AIQuizGenerationRequest
  ): Promise<AIQuizGenerationResponse> {
    const response = await api.post<AIQuizGenerationResponse>(
      "/quiz/ai-generate",
      payload
    );
    return response.data;
  }
}

const quizService = new QuizService();
export default quizService;
