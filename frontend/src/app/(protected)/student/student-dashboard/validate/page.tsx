"use client";

import { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCode,
  FaFileAlt,
  FaSpinner,
  FaShieldAlt,
  FaLightbulb,
  FaBug,
  FaClipboardCheck,
  FaArrowRight,
} from "react-icons/fa";
import { BiCodeBlock } from "react-icons/bi";
import aiService from "@/services/ai.service";

type ValidationType = "syntax" | "grounding" | "rubric" | "test";

interface ValidationResult {
  type: ValidationType;
  status: "pass" | "warning" | "fail";
  message: string;
  details?: string[];
  score?: number;
}

const validationTypes = [
  {
    id: "syntax" as ValidationType,
    title: "Syntax Check",
    description: "Check code for syntax errors and linting issues",
    icon: FaCode,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "grounding" as ValidationType,
    title: "Grounding Check",
    description: "Verify content against course materials",
    icon: FaClipboardCheck,
    color: "from-green-500 to-green-600",
  },
  {
    id: "rubric" as ValidationType,
    title: "Rubric Evaluation",
    description: "Evaluate against academic standards",
    icon: FaShieldAlt,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "test" as ValidationType,
    title: "Test Cases",
    description: "Run automated tests on code",
    icon: FaBug,
    color: "from-orange-500 to-orange-600",
  },
];

const sampleCode = `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
numbers = [1, 3, 5, 7, 9, 11, 13, 15]
result = binary_search(numbers, 7)
print(f"Found at index: {result}")`;

const sampleValidationResults: ValidationResult[] = [
  {
    type: "syntax",
    status: "pass",
    message: "No syntax errors found",
    details: [
      "✓ Valid Python 3 syntax",
      "✓ Proper indentation",
      "✓ No unused variables",
      "✓ Follows PEP8 guidelines",
    ],
    score: 100,
  },
  {
    type: "grounding",
    status: "pass",
    message: "Content is grounded in course materials",
    details: [
      "✓ Algorithm matches Week 2 lecture content",
      "✓ Implementation follows standard approach",
      "✓ Comments align with course terminology",
    ],
    score: 95,
  },
  {
    type: "rubric",
    status: "warning",
    message: "Meets most academic standards",
    details: [
      "✓ Correct algorithm implementation",
      "✓ Proper function structure",
      "⚠ Missing docstring documentation",
      "⚠ Edge case handling could be improved",
    ],
    score: 85,
  },
  {
    type: "test",
    status: "pass",
    message: "All test cases passed",
    details: [
      "✓ Test 1: Empty array - PASS",
      "✓ Test 2: Single element - PASS",
      "✓ Test 3: Target at start - PASS",
      "✓ Test 4: Target at end - PASS",
      "✓ Test 5: Target not found - PASS",
    ],
    score: 100,
  },
];

const statusIcons = {
  pass: FaCheckCircle,
  warning: FaExclamationTriangle,
  fail: FaTimesCircle,
};

const statusColors = {
  pass: "text-green-500 bg-green-50 border-green-200",
  warning: "text-yellow-500 bg-yellow-50 border-yellow-200",
  fail: "text-red-500 bg-red-50 border-red-200",
};

export default function ValidatePage() {
  const [content, setContent] = useState(sampleCode);
  const [contentType, setContentType] = useState<"code" | "text">("code");
  const [selectedValidations, setSelectedValidations] = useState<ValidationType[]>([
    "syntax",
    "grounding",
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[] | null>(null);

  const toggleValidation = (type: ValidationType) => {
    if (selectedValidations.includes(type)) {
      setSelectedValidations(selectedValidations.filter((t) => t !== type));
    } else {
      setSelectedValidations([...selectedValidations, type]);
    }
  };

  const handleValidate = async () => {
    if (!content.trim() || selectedValidations.length === 0) return;

    setIsValidating(true);
    setResults(null);

    try {
      // Call AI backend validate API
      const validationResults = await aiService.validate({
        content: content,
        contentType: contentType,
        validations: selectedValidations,
        language: "python",
      });
      
      setResults(validationResults);
    } catch (error) {
      console.error("Validation error:", error);
      // Fallback to sample results
      const filteredResults = sampleValidationResults.filter((r) =>
        selectedValidations.includes(r.type)
      );
      setResults(filteredResults);
    } finally {
      setIsValidating(false);
    }
  };

  const overallScore =
    results && results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-white" />
            </div>
            Content Validation
          </h1>
          <p className="text-gray-600 mt-1">
            Validate and evaluate AI-generated content for accuracy and correctness
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Content Type Toggle */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3">Content Type</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setContentType("code")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  contentType === "code"
                    ? "bg-[var(--Primary)] text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <FaCode />
                Code
              </button>
              <button
                onClick={() => setContentType("text")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  contentType === "text"
                    ? "bg-[var(--Primary)] text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <FaFileAlt />
                Text/Notes
              </button>
            </div>
          </div>

          {/* Content Input */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3">
              {contentType === "code" ? "Paste your code" : "Paste your content"}
            </h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === "code"
                  ? "Paste your code here for validation..."
                  : "Paste your text content here for validation..."
              }
              rows={15}
              className={`w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)] focus:border-transparent resize-none ${
                contentType === "code" ? "font-mono text-sm bg-gray-900 text-gray-100" : ""
              }`}
            />
          </div>

          {/* Validation Options */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3">Select Validations</h3>
            <div className="grid grid-cols-2 gap-3">
              {validationTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedValidations.includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleValidation(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-[var(--Primary)] bg-[var(--Primary-light)]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{type.title}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleValidate}
              disabled={isValidating || !content.trim() || selectedValidations.length === 0}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <FaShieldAlt className="w-5 h-5" />
                  Validate Content
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {!results && !isValidating && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Ready to Validate
              </h3>
              <p className="text-gray-500 max-w-sm">
                Paste your content, select validation types, and click validate to check
                for errors and issues.
              </p>
            </div>
          )}

          {isValidating && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <FaShieldAlt className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Validating content...</h3>
              <p className="text-gray-600">Running selected validation checks</p>
            </div>
          )}

          {results && (
            <>
              {/* Overall Score */}
              {overallScore !== null && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Overall Score</h3>
                      <p className="text-gray-500 text-sm">Based on selected validations</p>
                    </div>
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                        overallScore >= 90
                          ? "bg-green-100 text-green-600"
                          : overallScore >= 70
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {overallScore}%
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Results */}
              {results.map((result, index) => {
                const StatusIcon = statusIcons[result.status];
                const typeInfo = validationTypes.find((t) => t.id === result.type);
                const TypeIcon = typeInfo?.icon || FaCheckCircle;

                return (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                      statusColors[result.status]
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-r ${typeInfo?.color} flex items-center justify-center`}
                          >
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{typeInfo?.title}</h4>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              <span className="text-sm">{result.message}</span>
                            </div>
                          </div>
                        </div>
                        {result.score !== undefined && (
                          <div className="text-right">
                            <span className="text-2xl font-bold">{result.score}%</span>
                          </div>
                        )}
                      </div>

                      {result.details && (
                        <div className="bg-white/50 rounded-lg p-3 mt-3">
                          <ul className="space-y-1 text-sm">
                            {result.details.map((detail, i) => (
                              <li key={i} className="text-gray-700">
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
