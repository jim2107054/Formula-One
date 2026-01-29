"""
Generate router
Handles AI content generation for notes, slides, code, summaries, and explanations
"""
from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


router = APIRouter(prefix="/generate", tags=["Generate"])


class GenerateType(str, Enum):
    """Types of content to generate"""
    NOTES = "notes"
    SLIDES = "slides"
    CODE = "code"
    SUMMARY = "summary"
    EXPLANATION = "explanation"


class GenerateRequest(BaseModel):
    """Request model for generation"""
    type: GenerateType
    prompt: str
    topic: Optional[str] = None
    language: Optional[str] = "python"


class GenerateResponse(BaseModel):
    """Response model for generation"""
    content: str
    type: str
    sources: Optional[List[str]] = None


@router.post(
    "",
    response_model=GenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Content",
    description="Generate educational content using AI"
)
async def generate_content(request: GenerateRequest) -> GenerateResponse:
    """
    Generate content based on type and prompt
    Returns AI-generated content with optional sources
    """
    content = ""
    sources = []
    
    if request.type == GenerateType.NOTES:
        content = f"""# {request.prompt}

## Overview
{request.prompt} is a fundamental concept in computer science that forms the basis for many algorithms and applications.

## Key Concepts

### 1. Definition
- {request.prompt} refers to the systematic organization of data elements
- It enables efficient access, modification, and storage of information

### 2. Properties
- **Time Complexity**: Varies based on operations (O(1) to O(n))
- **Space Complexity**: Depends on implementation
- **Applications**: Used extensively in software development

### 3. Common Operations
1. **Insertion**: Adding new elements
2. **Deletion**: Removing existing elements
3. **Search**: Finding specific elements
4. **Traversal**: Visiting all elements

## Best Practices
- Choose the right data structure for your use case
- Consider time-space trade-offs
- Implement error handling for edge cases

## Summary
Understanding {request.prompt} is crucial for writing efficient code and solving complex problems effectively.
"""
        sources = ["Course Materials - Week 1", "Reference Textbook Ch. 3", "Online Documentation"]
    
    elif request.type == GenerateType.SLIDES:
        content = f"""# Slide Deck: {request.prompt}

---

## Slide 1: Title
# {request.prompt}
### An Introduction to Key Concepts

---

## Slide 2: Learning Objectives
By the end of this session, you will:
- Understand the fundamentals of {request.prompt}
- Learn implementation strategies
- Apply concepts to real-world problems

---

## Slide 3: What is {request.prompt}?
**Definition**: A systematic approach to organizing and managing data

**Key Points**:
• Foundation of computer science
• Essential for efficient algorithms
• Used in every software application

---

## Slide 4: Core Components
```
┌─────────────────┐
│    Element      │
├─────────────────┤
│  Operations     │
├─────────────────┤
│  Properties     │
└─────────────────┘
```

---

## Slide 5: Examples & Applications
1. **Web Development**: Managing user data
2. **Database Systems**: Query optimization
3. **AI/ML**: Data preprocessing

---

## Slide 6: Summary & Next Steps
✅ Key takeaways from today's session
📚 Recommended readings
💻 Practice exercises
"""
        sources = ["Lecture Notes - Module 2", "Presentation Templates"]
    
    elif request.type == GenerateType.CODE:
        lang = request.language or "python"
        if lang.lower() == "python":
            content = f'''"""
{request.prompt}
Implementation in Python
"""

class Solution:
    """
    Solution class for {request.prompt}
    """
    
    def __init__(self):
        """Initialize the solution"""
        self.data = []
    
    def process(self, input_data):
        """
        Process the input data
        
        Args:
            input_data: The data to process
            
        Returns:
            Processed result
        """
        result = []
        
        for item in input_data:
            # Process each item
            processed = self._helper(item)
            result.append(processed)
        
        return result
    
    def _helper(self, item):
        """Helper method for processing"""
        # Implement processing logic
        return item * 2


def main():
    """Main function to demonstrate usage"""
    solution = Solution()
    
    # Example usage
    test_data = [1, 2, 3, 4, 5]
    result = solution.process(test_data)
    
    print(f"Input: {{test_data}}")
    print(f"Output: {{result}}")


if __name__ == "__main__":
    main()
'''
        else:
            content = f'''// {request.prompt}
// Implementation in {lang}

public class Solution {{
    
    private int[] data;
    
    public Solution() {{
        this.data = new int[0];
    }}
    
    public int[] process(int[] inputData) {{
        int[] result = new int[inputData.length];
        
        for (int i = 0; i < inputData.length; i++) {{
            result[i] = helper(inputData[i]);
        }}
        
        return result;
    }}
    
    private int helper(int item) {{
        return item * 2;
    }}
    
    public static void main(String[] args) {{
        Solution solution = new Solution();
        int[] testData = {{1, 2, 3, 4, 5}};
        int[] result = solution.process(testData);
        
        System.out.println("Result: " + java.util.Arrays.toString(result));
    }}
}}
'''
        sources = ["Code Examples - Lab 3", "Reference Implementation"]
    
    elif request.type == GenerateType.SUMMARY:
        content = f"""## Summary: {request.prompt}

### Quick Overview
{request.prompt} is a core concept that every developer should understand. Here's what you need to know:

### Key Points
1. **Foundation**: Forms the basis for complex algorithms
2. **Efficiency**: Crucial for optimizing performance  
3. **Applications**: Used in databases, web apps, AI systems

### Main Takeaways
- Start with understanding the basic operations
- Practice implementing from scratch
- Analyze time and space complexity
- Apply to real-world problems

### Related Topics
- Algorithm Analysis
- System Design
- Performance Optimization

### Resources
📖 Chapter 3-5 in course textbook
🎥 Video lecture series (Week 2)
💻 Practice problems set A
"""
        sources = ["Course Summary - Module 1", "Study Guide"]
    
    elif request.type == GenerateType.EXPLANATION:
        content = f"""## Explanation: {request.prompt}

### What is it?
{request.prompt} is a concept that addresses how we organize and manipulate data efficiently. Think of it like organizing books in a library - the way you arrange them determines how quickly you can find what you need.

### Why does it matter?
Understanding {request.prompt} is essential because:
- It affects how fast your programs run
- It determines memory usage
- It's asked in nearly every technical interview

### How does it work?
Imagine you have a collection of items. {request.prompt} provides rules for:
1. **Adding items** - Where to put new things
2. **Finding items** - How to locate what you need
3. **Removing items** - How to take things away
4. **Organizing items** - How to keep things in order

### Real-world Analogy
Think of a playlist on your music app:
- Adding a song = Insert operation
- Finding a song = Search operation
- Removing a song = Delete operation
- Shuffling = Reorganization

### Common Misconceptions
❌ "It's only for interviews" - Actually used daily in real code
❌ "One size fits all" - Different problems need different approaches
❌ "It's too complex" - Start simple, build understanding gradually

### Try it Yourself
Start by implementing a basic version, then gradually add features. Practice makes perfect!
"""
        sources = ["Explanation Guide", "Concept Tutorials - Week 1"]
    
    return GenerateResponse(
        content=content,
        type=request.type.value,
        sources=sources
    )
