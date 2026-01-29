"use client";

import { useState } from "react";
import {
  FaRobot,
  FaBook,
  FaFileAlt,
  FaCode,
  FaCopy,
  FaDownload,
  FaCheckCircle,
  FaLightbulb,
  FaSpinner,
  FaMagic,
} from "react-icons/fa";
import { BiSolidSlideshow } from "react-icons/bi";
import aiService from "@/services/ai.service";

type GenerationType = "notes" | "slides" | "code" | "summary" | "explanation";

const generationTypes = [
  {
    id: "notes" as GenerationType,
    title: "Reading Notes",
    description: "Generate structured study notes from a topic",
    icon: FaFileAlt,
    color: "from-blue-500 to-blue-600",
    placeholder: "e.g., Explain the concept of gradient descent in machine learning",
  },
  {
    id: "slides" as GenerationType,
    title: "Slide Content",
    description: "Create presentation slide outlines",
    icon: BiSolidSlideshow,
    color: "from-purple-500 to-purple-600",
    placeholder: "e.g., Create slides about Neural Network architectures",
  },
  {
    id: "code" as GenerationType,
    title: "Code Examples",
    description: "Generate code snippets with explanations",
    icon: FaCode,
    color: "from-green-500 to-green-600",
    placeholder: "e.g., Python code for binary search tree implementation",
  },
  {
    id: "summary" as GenerationType,
    title: "Topic Summary",
    description: "Summarize complex topics concisely",
    icon: FaBook,
    color: "from-orange-500 to-orange-600",
    placeholder: "e.g., Summarize the key concepts of convolutional neural networks",
  },
  {
    id: "explanation" as GenerationType,
    title: "Detailed Explanation",
    description: "Get in-depth explanations of concepts",
    icon: FaLightbulb,
    color: "from-pink-500 to-pink-600",
    placeholder: "e.g., Explain how backpropagation works step by step",
  },
];

const sampleGeneratedNotes = `# Gradient Descent in Machine Learning

## Overview
Gradient descent is an optimization algorithm used to minimize the cost function in machine learning models. It iteratively adjusts parameters to find the optimal values.

## Key Concepts

### 1. Cost Function
- Measures the error between predicted and actual values
- Goal: Minimize this function
- Example: Mean Squared Error (MSE)

### 2. Learning Rate (α)
- Controls the step size in each iteration
- Too large: May overshoot the minimum
- Too small: Slow convergence

### 3. Gradient
- Partial derivatives of the cost function
- Points in the direction of steepest ascent
- We move in the opposite direction (descent)

## Types of Gradient Descent

1. **Batch Gradient Descent**
   - Uses entire dataset for each update
   - Stable but slow for large datasets

2. **Stochastic Gradient Descent (SGD)**
   - Uses one sample per update
   - Faster but noisier

3. **Mini-batch Gradient Descent**
   - Uses small batches of samples
   - Balance between batch and SGD

## Formula
\`\`\`
θ = θ - α * ∇J(θ)
\`\`\`

Where:
- θ = parameters
- α = learning rate
- ∇J(θ) = gradient of cost function
`;

const sampleGeneratedCode = `"""
Binary Search Tree Implementation in Python
A complete implementation with insertion, search, and traversal methods.
"""

class Node:
    """A node in the binary search tree."""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


class BinarySearchTree:
    """Binary Search Tree with common operations."""
    
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        """Insert a new value into the BST."""
        if not self.root:
            self.root = Node(value)
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        """Helper method for recursive insertion."""
        if value < node.value:
            if node.left is None:
                node.left = Node(value)
            else:
                self._insert_recursive(node.left, value)
        else:
            if node.right is None:
                node.right = Node(value)
            else:
                self._insert_recursive(node.right, value)
    
    def search(self, value):
        """Search for a value in the BST."""
        return self._search_recursive(self.root, value)
    
    def _search_recursive(self, node, value):
        """Helper method for recursive search."""
        if node is None or node.value == value:
            return node
        if value < node.value:
            return self._search_recursive(node.left, value)
        return self._search_recursive(node.right, value)
    
    def inorder_traversal(self):
        """Return values in sorted order."""
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        """Helper method for inorder traversal."""
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)


# Example Usage
if __name__ == "__main__":
    bst = BinarySearchTree()
    values = [50, 30, 70, 20, 40, 60, 80]
    
    for val in values:
        bst.insert(val)
    
    print("Inorder traversal:", bst.inorder_traversal())
    # Output: [20, 30, 40, 50, 60, 70, 80]
    
    print("Search 40:", bst.search(40) is not None)  # True
    print("Search 100:", bst.search(100) is not None)  # False
`;

export default function GeneratePage() {
  const [selectedType, setSelectedType] = useState<GenerationType>("notes");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [, setSources] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedTypeInfo = generationTypes.find((t) => t.id === selectedType);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedContent(null);
    setSources([]);

    try {
      // Call AI backend generate API
      const response = await aiService.generate({
        type: selectedType,
        prompt: prompt,
        topic: prompt,
        language: "python",
      });
      
      setGeneratedContent(response.content);
      setSources(response.sources || []);
    } catch (error) {
      console.error("Generation error:", error);
      // Fallback to sample content
      if (selectedType === "code") {
        setGeneratedContent(sampleGeneratedCode);
      } else {
        setGeneratedContent(sampleGeneratedNotes);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <FaRobot className="text-white" />
            </div>
            AI Content Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Generate learning materials, code, and explanations using AI
          </p>
        </div>
      </div>

      {/* Generation Type Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4">What would you like to generate?</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {generationTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-[var(--Primary)] bg-[var(--Primary-light)]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-2`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className={`font-medium text-sm ${isSelected ? "text-[var(--Primary)]" : ""}`}>
                  {type.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-2">Describe what you want to generate</h2>
        <p className="text-sm text-gray-500 mb-4">{selectedTypeInfo?.description}</p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={selectedTypeInfo?.placeholder}
          rows={4}
          className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)] focus:border-transparent resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            <FaLightbulb className="inline w-4 h-4 mr-1 text-yellow-500" />
            Tip: Be specific about the topic and what aspects you want to focus on
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaMagic className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Generated {selectedTypeInfo?.title}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <>
                    <FaCheckCircle className="text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy />
                    Copy
                  </>
                )}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--Primary)] text-white rounded-lg hover:bg-[var(--Primary-dark)] transition-colors">
                <FaDownload />
                Download
              </button>
            </div>
          </div>
          <div className="p-6">
            {selectedType === "code" ? (
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                <code>{generatedContent}</code>
              </pre>
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-6 rounded-lg">
                  {generatedContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generation in Progress */}
      {isGenerating && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaRobot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Generating content...</h3>
          <p className="text-gray-600">
            AI is creating your {selectedTypeInfo?.title.toLowerCase()}. This may take a moment.
          </p>
        </div>
      )}
    </div>
  );
}
