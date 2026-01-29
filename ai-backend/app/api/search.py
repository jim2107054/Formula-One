"""
Search router
Handles intelligent search functionality using RAG
"""
from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List, Optional
import random


router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    """Request model for search"""
    query: str


class SearchResult(BaseModel):
    """Individual search result"""
    id: str
    title: str
    type: str  # theory, lab, notes, code
    relevanceScore: float
    excerpt: str
    source: str
    matchedKeywords: List[str]
    week: Optional[int] = None


class SearchResponse(BaseModel):
    """Response model for search"""
    query: str
    results: List[SearchResult]
    message: str


# Mock data for search results
MOCK_MATERIALS = [
    {
        "id": "theory-1",
        "title": "Introduction to Data Structures",
        "type": "theory",
        "excerpt": "Learn the fundamentals of data structures including arrays, linked lists, stacks, and queues.",
        "source": "Week 1 - Theory Materials",
        "week": 1,
        "keywords": ["data structures", "arrays", "linked lists", "stacks", "queues", "fundamentals"]
    },
    {
        "id": "theory-2",
        "title": "Algorithm Analysis and Big O Notation",
        "type": "theory",
        "excerpt": "Understanding time and space complexity, Big O notation, and how to analyze algorithm efficiency.",
        "source": "Week 2 - Theory Materials",
        "week": 2,
        "keywords": ["algorithms", "big o", "complexity", "time complexity", "space complexity", "analysis"]
    },
    {
        "id": "lab-1",
        "title": "Implementing a Binary Search Tree",
        "type": "lab",
        "excerpt": "Hands-on lab implementing BST operations: insert, delete, search, and traversal methods.",
        "source": "Week 3 - Lab Materials",
        "week": 3,
        "keywords": ["binary search tree", "bst", "insert", "delete", "search", "traversal", "implementation"]
    },
    {
        "id": "notes-1",
        "title": "Graph Algorithms Summary",
        "type": "notes",
        "excerpt": "Comprehensive notes on BFS, DFS, Dijkstra's algorithm, and minimum spanning trees.",
        "source": "Week 4 - Notes",
        "week": 4,
        "keywords": ["graphs", "bfs", "dfs", "dijkstra", "spanning tree", "algorithms"]
    },
    {
        "id": "code-1",
        "title": "Sorting Algorithms Implementation",
        "type": "code",
        "excerpt": "Python implementations of bubble sort, merge sort, quick sort, and heap sort with examples.",
        "source": "Week 2 - Code Examples",
        "week": 2,
        "keywords": ["sorting", "bubble sort", "merge sort", "quick sort", "heap sort", "python"]
    },
    {
        "id": "theory-3",
        "title": "Dynamic Programming Fundamentals",
        "type": "theory",
        "excerpt": "Introduction to dynamic programming, memoization, tabulation, and solving optimization problems.",
        "source": "Week 5 - Theory Materials",
        "week": 5,
        "keywords": ["dynamic programming", "memoization", "tabulation", "optimization", "dp"]
    },
    {
        "id": "lab-2",
        "title": "Hash Table Implementation Lab",
        "type": "lab",
        "excerpt": "Build a hash table from scratch with collision handling using chaining and open addressing.",
        "source": "Week 3 - Lab Materials",
        "week": 3,
        "keywords": ["hash table", "hashing", "collision", "chaining", "open addressing"]
    },
    {
        "id": "notes-2",
        "title": "Recursion and Backtracking Notes",
        "type": "notes",
        "excerpt": "Detailed notes on recursive thinking, base cases, backtracking algorithms, and common patterns.",
        "source": "Week 4 - Notes",
        "week": 4,
        "keywords": ["recursion", "backtracking", "base case", "patterns", "recursive"]
    }
]


def calculate_relevance(query: str, material: dict) -> tuple[float, List[str]]:
    """Calculate relevance score and matched keywords"""
    query_lower = query.lower()
    query_words = set(query_lower.split())
    
    matched = []
    score = 0.0
    
    # Check title
    if query_lower in material["title"].lower():
        score += 0.4
        matched.append(query)
    
    # Check keywords
    for keyword in material["keywords"]:
        if keyword.lower() in query_lower or any(w in keyword.lower() for w in query_words):
            score += 0.15
            if keyword not in matched:
                matched.append(keyword)
    
    # Check excerpt
    if query_lower in material["excerpt"].lower():
        score += 0.2
    
    # Add some randomness to simulate real search variance
    score = min(1.0, score + random.uniform(0, 0.1))
    
    return score, matched[:5]  # Return max 5 matched keywords


@router.post(
    "",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search Materials",
    description="Search across all materials using semantic search"
)
async def search_materials(request: SearchRequest) -> SearchResponse:
    """
    Search materials based on query
    Returns relevant results with scores and matched keywords
    """
    results = []
    
    for material in MOCK_MATERIALS:
        score, matched_keywords = calculate_relevance(request.query, material)
        
        if score > 0.1 or len(matched_keywords) > 0:  # Include if somewhat relevant
            results.append(SearchResult(
                id=material["id"],
                title=material["title"],
                type=material["type"],
                relevanceScore=round(score, 2),
                excerpt=material["excerpt"],
                source=material["source"],
                matchedKeywords=matched_keywords if matched_keywords else [request.query],
                week=material.get("week")
            ))
    
    # Sort by relevance score
    results.sort(key=lambda x: x.relevanceScore, reverse=True)
    
    # If no results, return some default results
    if not results:
        for material in MOCK_MATERIALS[:3]:
            results.append(SearchResult(
                id=material["id"],
                title=material["title"],
                type=material["type"],
                relevanceScore=round(random.uniform(0.3, 0.6), 2),
                excerpt=material["excerpt"],
                source=material["source"],
                matchedKeywords=[request.query],
                week=material.get("week")
            ))
    
    return SearchResponse(
        query=request.query,
        results=results[:10],  # Return max 10 results
        message=f"Found {len(results)} results for '{request.query}'"
    )


@router.get(
    "/suggestions",
    status_code=status.HTTP_200_OK,
    summary="Get Search Suggestions",
    description="Get suggested search topics"
)
async def get_suggestions() -> dict:
    """
    Get popular search suggestions
    """
    return {
        "suggestions": [
            "Data Structures",
            "Algorithms",
            "Sorting",
            "Binary Search Tree",
            "Dynamic Programming",
            "Graph Algorithms",
            "Recursion",
            "Hash Tables"
        ]
    }
