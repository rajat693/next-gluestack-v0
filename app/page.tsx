"use client";
import React, { useState } from "react";

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  apiCalls: number;
  estimatedCost: number;
}

interface ApiResponse {
  code: string;
  tokenUsage: TokenUsage;
  availableComponents: string[];
  success: boolean;
}

const CodeGenerator = () => {
  const [query, setQuery] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    // Reset previous state
    setIsLoading(true);
    setError("");
    setGeneratedCode("");
    setTokenUsage(null);
    setIsCopied(false);

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setGeneratedCode(data.code);
      setTokenUsage(data.tokenUsage);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);

      // Reset the icon back to "Copy Code" after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Code Generation Tool
        </h1>

        <div className="flex mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your code generation prompt"
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !query.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {generatedCode && (
          <div className="space-y-6">
            {/* Generated Code Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-700">
                  Generated Code:
                </h2>
                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded transition ${
                    isCopied
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {isCopied ? "Copied" : "Copy Code"}
                </button>
              </div>
              <pre className="bg-white p-4 border border-gray-200 rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto text-sm font-mono text-black">
                {generatedCode}
              </pre>
            </div>

            {/* Token Usage Section */}
            {tokenUsage && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Token Usage & Cost
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">API Calls</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {tokenUsage.apiCalls}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">Input Tokens</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {tokenUsage.inputTokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">Output Tokens</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {tokenUsage.outputTokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">Total Tokens</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {tokenUsage.totalTokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${tokenUsage.estimatedCost.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;
