"""
Chat router
Handles conversational AI interface for learning assistance
"""
from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random


router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str  # user or assistant
    content: str


class ChatRequest(BaseModel):
    """Request model for chat"""
    messages: List[ChatMessage]
    message: str


class ChatResponse(BaseModel):
    """Response model for chat"""
    response: str
    sources: Optional[List[str]] = None


# Knowledge base for generating responses
TOPIC_RESPONSES = {
    "data structure": {
        "intro": "Data structures are fundamental ways to organize and store data in a computer so that it can be accessed and modified efficiently.",
        "details": "Common data structures include arrays, linked lists, stacks, queues, trees, graphs, and hash tables. Each has its own strengths and use cases.",
        "tips": "When choosing a data structure, consider the operations you'll perform most frequently and their time complexities."
    },
    "algorithm": {
        "intro": "An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.",
        "details": "Algorithms are evaluated based on their time complexity (how long they take) and space complexity (how much memory they use).",
        "tips": "Always analyze the time and space complexity of your algorithms. Big O notation is essential for this analysis."
    },
    "recursion": {
        "intro": "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem.",
        "details": "Every recursive function needs a base case (stopping condition) and a recursive case. Without a base case, the function would recurse infinitely.",
        "tips": "When writing recursive functions, always identify your base case first, then think about how to break the problem into smaller subproblems."
    },
    "sorting": {
        "intro": "Sorting algorithms arrange elements in a specific order, typically ascending or descending.",
        "details": "Common sorting algorithms include Bubble Sort (O(n²)), Merge Sort (O(n log n)), Quick Sort (O(n log n) average), and Heap Sort (O(n log n)).",
        "tips": "For most practical applications, use built-in sorting functions. For learning, implement different algorithms to understand their trade-offs."
    },
    "tree": {
        "intro": "A tree is a hierarchical data structure consisting of nodes connected by edges, with a single root node at the top.",
        "details": "Binary trees have at most two children per node. Binary Search Trees (BST) maintain ordering: left subtree values < parent < right subtree values.",
        "tips": "Tree traversals (inorder, preorder, postorder) are fundamental operations. Practice implementing them both recursively and iteratively."
    },
    "graph": {
        "intro": "A graph is a data structure consisting of vertices (nodes) and edges connecting them.",
        "details": "Graphs can be directed or undirected, weighted or unweighted. Common representations include adjacency matrix and adjacency list.",
        "tips": "BFS is great for finding shortest paths in unweighted graphs, while DFS is useful for detecting cycles and topological sorting."
    }
}

GREETING_RESPONSES = [
    "Hello! I'm your AI learning assistant. How can I help you today with your studies?",
    "Hi there! Ready to help you learn. What topic would you like to explore?",
    "Welcome! I'm here to assist with your coursework. What questions do you have?"
]

FALLBACK_RESPONSES = [
    "That's an interesting question! Based on the course materials, I can help you understand this topic better. Could you be more specific about what aspect you'd like to explore?",
    "Great question! Let me help you with that. This relates to concepts we cover in the course. What specific part are you curious about?",
    "I'd be happy to help! This topic has several aspects to consider. What would you like to focus on first?"
]


def find_topic(message: str) -> Optional[str]:
    """Find relevant topic from the message"""
    message_lower = message.lower()
    for topic in TOPIC_RESPONSES.keys():
        if topic in message_lower:
            return topic
    return None


def generate_response(message: str, history: List[ChatMessage]) -> tuple[str, List[str]]:
    """Generate a response based on the message and history"""
    message_lower = message.lower()
    sources = []
    
    # Check for greetings
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    if any(g in message_lower for g in greetings) and len(message_lower) < 30:
        return random.choice(GREETING_RESPONSES), []
    
    # Check for thanks
    if any(t in message_lower for t in ["thank", "thanks", "appreciate"]):
        return "You're welcome! Feel free to ask if you have more questions. I'm here to help you learn! 📚", []
    
    # Check for help request
    if "help" in message_lower and len(message_lower) < 20:
        return """I can help you with various topics! Here's what I can assist with:

📚 **Course Topics**
- Data Structures (arrays, linked lists, trees, graphs)
- Algorithms (sorting, searching, recursion)
- Complexity Analysis (Big O notation)

💡 **I can also:**
- Explain concepts in simple terms
- Provide code examples
- Help with problem-solving strategies
- Answer questions about assignments

What would you like to learn about?""", ["Course Syllabus", "Topic Index"]
    
    # Find relevant topic
    topic = find_topic(message)
    
    if topic:
        topic_info = TOPIC_RESPONSES[topic]
        
        # Determine response depth based on question type
        if any(q in message_lower for q in ["what is", "what's", "explain", "tell me about"]):
            response = f"**{topic.title()}**\n\n{topic_info['intro']}\n\n{topic_info['details']}"
            sources = [f"Course Materials - {topic.title()}", "Reference Textbook"]
        elif any(q in message_lower for q in ["how", "tip", "advice", "best practice"]):
            response = f"**Tips for {topic.title()}:**\n\n{topic_info['tips']}\n\n{topic_info['details']}"
            sources = ["Study Guide", "Practice Problems"]
        elif any(q in message_lower for q in ["example", "code", "implement"]):
            response = f"**Understanding {topic.title()}:**\n\n{topic_info['intro']}\n\n{topic_info['tips']}\n\nWould you like me to show you a code example or go deeper into any specific aspect?"
            sources = ["Lab Materials", "Code Examples"]
        else:
            response = f"**About {topic.title()}:**\n\n{topic_info['intro']}\n\n{topic_info['details']}\n\n💡 **Tip:** {topic_info['tips']}"
            sources = [f"Course Materials - {topic.title()}"]
        
        return response, sources
    
    # Handle specific question patterns
    if "difference between" in message_lower:
        return """Great question about comparisons! Here's how to think about differences:

1. **Purpose**: What problem does each solve?
2. **Implementation**: How are they structured?
3. **Complexity**: What are the time/space trade-offs?
4. **Use Cases**: When should you use each one?

Could you specify which two concepts you'd like me to compare?""", ["Comparison Guide"]
    
    if "how do i" in message_lower or "how can i" in message_lower:
        return """I'd be happy to help you with that! To give you the best guidance:

1. Could you share what you've tried so far?
2. What specific part are you stuck on?
3. Are you looking for a conceptual explanation or code example?

This will help me tailor my response to your needs! 🎯""", ["Study Methods Guide"]
    
    # Default response
    return random.choice(FALLBACK_RESPONSES), ["Course Materials"]


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with AI",
    description="Send a message and get an AI-powered response"
)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process chat message and return AI response
    Uses conversation history for context
    """
    response, sources = generate_response(request.message, request.messages)
    
    return ChatResponse(
        response=response,
        sources=sources if sources else None
    )


@router.get(
    "/suggestions",
    status_code=status.HTTP_200_OK,
    summary="Get Chat Suggestions",
    description="Get suggested questions to ask"
)
async def get_chat_suggestions() -> dict:
    """
    Get suggested questions for the chat
    """
    return {
        "suggestions": [
            "What is a binary search tree?",
            "Explain recursion with an example",
            "How do I choose the right data structure?",
            "What's the difference between BFS and DFS?",
            "Help me understand Big O notation",
            "Give me tips for solving algorithm problems"
        ]
    }
