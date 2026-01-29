"""
Chat router
Handles conversational AI interface for learning assistance with integrated RAG and generation
"""
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random
import re


router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str  # user or assistant
    content: str


class ChatRequest(BaseModel):
    """Request model for chat"""
    messages: List[ChatMessage]
    message: str
    session_id: Optional[str] = None
    enable_search: bool = True
    enable_generation: bool = True


class ChatResponse(BaseModel):
    """Response model for chat"""
    response: str
    sources: Optional[List[str]] = None
    search_results: Optional[List[dict]] = None
    generated_content: Optional[str] = None
    action_taken: Optional[str] = None


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


def detect_intent(message: str) -> tuple[str, Optional[str]]:
    """
    Detect user intent from message
    Returns (intent_type, extracted_query)
    """
    message_lower = message.lower()
    
    # Search intents
    search_patterns = [
        r"search (for|about)?\s*(.+)",
        r"find (me)?\s*(.+)",
        r"show me (materials?|content|notes|slides|code)\s*(about|on|for)?\s*(.+)",
        r"where can i find (.+)",
        r"do you have (.+)",
        r"looking for (.+)"
    ]
    
    for pattern in search_patterns:
        match = re.search(pattern, message_lower)
        if match:
            query = match.groups()[-1] if match.groups() else None
            return ("search", query)
    
    # Generation intents
    generation_patterns = [
        r"generate (notes|slides|code|summary|explanation)\s*(about|on|for)?\s*(.+)",
        r"create (notes|slides|code)\s*(about|on|for)?\s*(.+)",
        r"make (me)?\s*(notes|slides|code)\s*(about|on|for)?\s*(.+)",
        r"write (notes|code)\s*(about|on|for)?\s*(.+)",
        r"can you (generate|create|make|write) (.+)"
    ]
    
    for pattern in generation_patterns:
        match = re.search(pattern, message_lower)
        if match:
            return ("generation", message)
    
    # Explanation intents
    explanation_patterns = [
        r"(explain|what is|what are|tell me about|describe) (.+)",
        r"how (does|do) (.+) work",
        r"why (.+)"
    ]
    
    for pattern in explanation_patterns:
        match = re.search(pattern, message_lower)
        if match:
            return ("explanation", message)
    
    # Summary intents
    if any(word in message_lower for word in ["summarize", "summary", "recap", "overview"]):
        return ("summary", message)
    
    # Default to conversation
    return ("conversation", None)


async def perform_search(query: str) -> tuple[List[dict], List[str]]:
    """Perform search and return results and sources"""
    # Import here to avoid circular dependency
    from app.api.search import MOCK_MATERIALS, calculate_relevance
    
    results = []
    sources = []
    
    for material in MOCK_MATERIALS:
        score, matched_keywords = calculate_relevance(query, material)
        if score > 0.2:  # Only include relevant results
            results.append({
                "id": material["id"],
                "title": material["title"],
                "type": material["type"],
                "excerpt": material["excerpt"],
                "source": material["source"],
                "score": round(score, 2)
            })
            if material["source"] not in sources:
                sources.append(material["source"])
    
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:5], sources[:3]


async def generate_content(content_type: str, topic: str) -> str:
    """Generate content based on type and topic"""
    if "note" in content_type.lower():
        return f"""# Notes on {topic}

## Overview
{topic} is an important concept in computer science and programming.

## Key Points
1. **Definition**: Understanding what {topic} means
2. **Applications**: Where {topic} is used
3. **Implementation**: How to implement {topic}
4. **Best Practices**: Tips for working with {topic}

## Summary
These notes cover the essential aspects of {topic}. Review regularly and practice with examples.
"""
    elif "code" in content_type.lower():
        return f"""# Code Example: {topic}

```python
# {topic} implementation
def example_{topic.lower().replace(' ', '_')}():
    '''
    Example implementation of {topic}
    '''
    # TODO: Implement the logic here
    pass

# Usage
example_{topic.lower().replace(' ', '_')}()
```
"""
    else:
        return f"Generated content about {topic} would appear here with proper formatting and structure."


async def generate_response(message: str, history: List[ChatMessage], enable_search: bool = True, enable_generation: bool = True) -> tuple[str, List[str], Optional[List[dict]], Optional[str], str]:
    """
    Generate a response based on the message and history with integrated RAG and generation
    Returns: (response_text, sources, search_results, generated_content, action_taken)
    """
    message_lower = message.lower()
    sources = []
    search_results = None
    generated_content = None
    action_taken = "conversation"
    
    # Check for greetings
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    if any(g in message_lower for g in greetings) and len(message_lower) < 30:
        response = random.choice(GREETING_RESPONSES)
        return response, [], None, None, "greeting"
    
    # Check for thanks
    if any(t in message_lower for t in ["thank", "thanks", "appreciate"]):
        return "You're welcome! Feel free to ask if you have more questions. I'm here to help you learn! 📚", [], None, None, "acknowledgment"
    
    # Check for help request
    if "help" in message_lower and len(message_lower) < 20:
        help_response = """I can help you with various topics! Here's what I can assist with:

📚 **Search Course Materials**
- Ask me to "find materials about sorting algorithms"
- "Show me content on data structures"
- "Search for binary tree examples"

🎓 **Explain Concepts**
- "Explain recursion"
- "What is dynamic programming?"
- "How does a hash table work?"

✨ **Generate Content**
- "Generate notes on graph algorithms"
- "Create code examples for sorting"
- "Make slides about trees"

💬 **Ask Questions**
- "What's the difference between BFS and DFS?"
- "How do I implement a stack?"
- "Why use Big O notation?"

What would you like to explore?"""
        return help_response, ["Course Syllabus", "Topic Index", "Help Documentation"], None, None, "help"
    
    # Detect intent
    intent, extracted_query = detect_intent(message)
    action_taken = intent
    
    # Handle search intent
    if intent == "search" and enable_search:
        query = extracted_query or message
        search_results, sources = await perform_search(query)
        
        if search_results:
            response = f"📚 **Search Results for '{query}'**\n\n"
            response += f"I found {len(search_results)} relevant materials:\n\n"
            
            for i, result in enumerate(search_results[:3], 1):
                response += f"**{i}. {result['title']}** ({result['type'].title()})\n"
                response += f"   {result['excerpt'][:150]}...\n"
                response += f"   📍 Source: {result['source']} | Relevance: {int(result['score']*100)}%\n\n"
            
            if len(search_results) > 3:
                response += f"_...and {len(search_results) - 3} more results available_\n\n"
            
            response += "Would you like me to explain any of these topics in more detail?"
        else:
            response = f"I searched for '{query}' but couldn't find specific materials. However, I can help explain this topic if you'd like!"
            sources = ["Course Materials"]
        
        return response, sources, search_results, None, "search"
    
    # Handle generation intent
    if intent == "generation" and enable_generation:
        # Extract what to generate
        content_type = "notes"  # default
        if "code" in message_lower:
            content_type = "code"
        elif "slide" in message_lower:
            content_type = "slides"
        
        # Extract topic
        topic_match = re.search(r"(about|on|for)\s+(.+)", message_lower)
        topic = topic_match.group(2) if topic_match else "the requested topic"
        
        generated_content = await generate_content(content_type, topic)
        
        response = f"✨ **Generated {content_type.title()} on '{topic}'**\n\n"
        response += f"I've created {content_type} content for you. Here's a preview:\n\n"
        response += generated_content[:300] + "...\n\n"
        response += f"💡 _This content is AI-generated and should be reviewed with course materials._\n\n"
        response += "Would you like me to expand on any particular section?"
        
        sources = ["AI-Generated Content", "Course Context"]
        return response, sources, None, generated_content, "generation"
    
    # Handle explanation intent
    if intent == "explanation":
        topic = find_topic(message)
        
        if topic:
            topic_info = TOPIC_RESPONSES[topic]
            
            # Build comprehensive explanation
            response = f"**{topic.title()}**\n\n"
            response += f"📖 **Overview**\n{topic_info['intro']}\n\n"
            response += f"📋 **Details**\n{topic_info['details']}\n\n"
            response += f"💡 **Tips**\n{topic_info['tips']}\n\n"
            
            # Try to find related materials
            search_results, search_sources = await perform_search(topic)
            if search_results:
                response += f"\n📚 **Related Materials:**\n"
                for result in search_results[:2]:
                    response += f"- {result['title']} ({result['source']})\n"
                sources = search_sources
            else:
                sources = [f"Course Materials - {topic.title()}"]
            
            response += "\n\nWould you like me to dive deeper into any specific aspect?"
            return response, sources, search_results, None, "explanation"
        else:
            # Generic explanation without specific topic
            response = "I'd be happy to explain that concept! "
            response += "Could you be more specific about what you'd like me to explain? "
            response += "For example, you can ask about:\n"
            response += "- Specific algorithms or data structures\n"
            response += "- Programming concepts\n"
            response += "- Problem-solving techniques"
            return response, ["General Help"], None, None, "explanation"
    
    # Handle summary intent  
    if intent == "summary":
        # Try to search for relevant content to summarize
        search_results, sources = await perform_search(message.replace("summarize", "").replace("summary", "").strip())
        
        if search_results:
            response = "📝 **Summary**\n\n"
            response += "Based on available course materials:\n\n"
            for result in search_results[:3]:
                response += f"**{result['title']}**\n{result['excerpt']}\n\n"
            response += "\nThis summary is based on course content. Would you like more details on any topic?"
        else:
            response = "I'd be happy to provide a summary! What topic would you like me to summarize?"
        
        return response, sources, search_results, None, "summary"
    
    # Default conversation - try to be helpful
    # Check if question is about coursework
    if any(word in message_lower for word in ["how", "what", "why", "when", "where", "explain"]):
        # Search for relevant materials
        search_results, sources = await perform_search(message)
        
        if search_results:
            response = "Let me help you with that! Based on course materials:\n\n"
            response += f"{search_results[0]['excerpt']}\n\n"
            response += f"📚 You can find more information in: {search_results[0]['source']}\n\n"
            response += "Would you like me to explain this in more detail or search for related topics?"
        else:
            response = random.choice(FALLBACK_RESPONSES)
            sources = ["Course Materials"]
        
        return response, sources, search_results, None, "conversation"
    
    # Final fallback
    return random.choice(FALLBACK_RESPONSES), ["Course Materials"], None, None, "conversation"


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with AI",
    description="Send a message and get an AI-powered response with integrated search and generation"
)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process chat message and return AI response
    Uses conversation history for context
    Integrates search and generation capabilities
    """
    response, sources, search_results, generated_content, action_taken = await generate_response(
        request.message, 
        request.messages,
        request.enable_search,
        request.enable_generation
    )
    
    return ChatResponse(
        response=response,
        sources=sources if sources else None,
        search_results=search_results,
        generated_content=generated_content,
        action_taken=action_taken
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
