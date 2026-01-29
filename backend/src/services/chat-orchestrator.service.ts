import { ChatSessionModel, IChatSession } from "../models/chat-session.model";
import { ContentModel } from "../models/content.model";
import { v4 as uuidv4 } from "uuid";

export interface SendMessageResult {
  message: any;
  session: IChatSession;
  searchResults?: any[];
  generatedContent?: string;
  actionTaken?: string;
}

const AI_BACKEND_URL =
  process.env.AI_BACKEND_URL || "http://localhost:8001/api/v1";

class ChatOrchestratorService {
  /**
   * Search content from MongoDB database
   */
  async searchDatabaseContent(query: string, category?: string): Promise<any[]> {
    const searchRegex = new RegExp(query.split(" ").join("|"), "i");
    
    const filter: any = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { "metadata.topic": searchRegex },
        { "metadata.tags": searchRegex }
      ]
    };
    
    if (category) {
      filter.category = category;
    }
    
    const results = await ContentModel.find(filter)
      .limit(5)
      .select("title description category metadata");
    
    return results.map(r => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      category: r.category,
      topic: r.metadata?.topic,
      week: r.metadata?.week,
      type: r.metadata?.contentType,
      source: `Week ${r.metadata?.week || "N/A"} - ${r.category === "theory" ? "Theory" : "Lab"} Materials`
    }));
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
  ): Promise<SendMessageResult> {
    let session = await ChatSessionModel.findOne({ _id: sessionId });

    if (!session) {
      throw new Error("Session not found");
    }

    // 1. Add User Message
    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    // 2. Search database for relevant content
    let searchResults: any[] = [];
    let actionTaken = "conversation";
    let generatedContent: string | undefined;
    
    // Check if this is a search request
    const lowerContent = content.toLowerCase();
    const isSearchRequest = lowerContent.includes("search") || 
                           lowerContent.includes("find") || 
                           lowerContent.includes("show me");
    const isGenerationRequest = lowerContent.includes("generate") || 
                                lowerContent.includes("create") ||
                                lowerContent.includes("make");
    
    if (isSearchRequest) {
      // Extract search query
      const searchQuery = content.replace(/search|find|show me|for|about|materials?|content/gi, "").trim();
      searchResults = await this.searchDatabaseContent(searchQuery);
      actionTaken = "search";
    }

    // 3. Call AI Backend for response
    let aiResponseContent = "I'm sorry, I couldn't connect to the AI service.";
    try {
      const response = await fetch(`${AI_BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          messages: session.messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          })),
          session_id: sessionId,
          enable_search: true,
          enable_generation: isGenerationRequest
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiResponseContent = data.response;
        
        // Merge AI search results with database results
        if (data.search_results && data.search_results.length > 0) {
          actionTaken = data.action_taken || "search";
        }
        
        if (data.generated_content) {
          generatedContent = data.generated_content;
          actionTaken = "generation";
        }
        
        if (data.action_taken) {
          actionTaken = data.action_taken;
        }
      }
    } catch (e) {
      console.error("AI Backend Call Failed", e);
      
      // Fallback: provide database results if AI fails
      if (searchResults.length > 0) {
        aiResponseContent = `📚 **Search Results from Course Materials**\n\n`;
        aiResponseContent += `I found ${searchResults.length} relevant materials in the database:\n\n`;
        searchResults.forEach((r, i) => {
          aiResponseContent += `**${i + 1}. ${r.title}** (${r.type || r.category})\n`;
          aiResponseContent += `   ${r.description?.substring(0, 100) || ""}...\n`;
          aiResponseContent += `   📍 ${r.source}\n\n`;
        });
      }
    }

    // 4. Add AI Message
    const aiMessage = {
      id: uuidv4(),
      role: "assistant" as const,
      content: aiResponseContent,
      timestamp: new Date(),
    };
    session.messages.push(aiMessage);

    // Update title logic
    if (session.messages.length <= 2) {
      session.title =
        content.substring(0, 30) + (content.length > 30 ? "..." : "");
    }

    await session.save();

    return {
      message: aiMessage,
      session,
      searchResults: searchResults.length > 0 ? searchResults : undefined,
      generatedContent,
      actionTaken
    };
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: string): Promise<IChatSession[]> {
    return ChatSessionModel.find({ userId }).sort({ updatedAt: -1 });
  }

  /**
   * Get specific chat session
   */
  async getSession(
    sessionId: string,
    userId: string,
  ): Promise<IChatSession | null> {
    try {
      return await ChatSessionModel.findOne({ _id: sessionId });
    } catch {
      return null;
    }
  }

  /**
   * Create new chat session
   */
  async createSession(userId: string, title?: string): Promise<IChatSession> {
    const session = new ChatSessionModel({
      userId,
      title: title || "New Chat",
      messages: [],
    });
    return session.save();
  }

  /**
   * Delete chat session
   */
  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const result = await ChatSessionModel.deleteOne({ _id: sessionId });
      return result.deletedCount === 1;
    } catch {
      return false;
    }
  }
}

export const chatOrchestratorService = new ChatOrchestratorService();
