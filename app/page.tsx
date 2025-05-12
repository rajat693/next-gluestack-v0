"use client";
import React, { useState, useEffect, useRef } from "react";

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

interface QueryHistory {
  query: string;
  code: string;
}

const CodeGenerator = () => {
  const [query, setQuery] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest query when a new one is added
  useEffect(() => {
    if (lastQueryRef.current && scrollContainerRef.current) {
      lastQueryRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [queryHistory.length]);

  const handleGenerate = async () => {
    // Clear the input box immediately
    const currentQuery = query;
    setQuery("");

    // Immediately add the query to history with empty code
    const tempIndex = queryHistory.length;
    const tempQuery = { query: currentQuery, code: "" };
    setQueryHistory([...queryHistory, tempQuery]);
    setSelectedIndex(tempIndex);

    // Reset previous state
    setIsLoading(true);
    setError("");
    setGeneratedCode("");
    setIsCopied(false);
    setHasGenerated(true);

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: currentQuery }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setGeneratedCode(data.code);

      // Update the query history with the actual code
      setQueryHistory((prev) => {
        const updated = [...prev];
        updated[tempIndex] = { query: currentQuery, code: data.code };
        return updated;
      });

      // console.log("data.tokenUsage", data.tokenUsage);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      // Remove the query from history if there was an error
      setQueryHistory((prev) => prev.slice(0, -1));
      setSelectedIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      try {
        // Check if clipboard API is available
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(generatedCode);
          setIsCopied(true);

          // Reset the text back to "Copy Code" after 2 seconds
          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement("textarea");
          textArea.value = generatedCode;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand("copy");
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          } catch (copyError) {
            console.error("Failed to copy text: ", copyError);
            setError("Failed to copy code to clipboard");
          }

          document.body.removeChild(textArea);
        }
      } catch (error) {
        console.error("Failed to copy: ", error);
        setError("Failed to copy code to clipboard");
      }
    }
  };

  // Handle clicking on a query history item
  const handleQueryClick = (index: number) => {
    setSelectedIndex(index);
    setGeneratedCode(queryHistory[index].code);
  };

  // Initial layout - centered
  if (!hasGenerated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
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
        </div>
      </div>
    );
  }

  // Function to get first two lines of code
  const getCodePreview = (code: string) => {
    const lines = code.split("\n");
    return lines.slice(0, 2).join("\n");
  };

  // Split layout - after generation
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left side - Query history at top, input box at bottom */}
      <div className="w-1/2 flex flex-col h-screen">
        {/* Query history section */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold text-gray-800 mb-4 bg-blue-600 text-white px-4 py-2 rounded-md">
              User Inputs
            </h2>
          </div>
          <div
            className="flex-grow overflow-y-auto px-6 pb-4"
            ref={scrollContainerRef}
          >
            {queryHistory.map((item, index) => (
              <div
                key={index}
                className="mb-4 bg-white p-4 rounded-lg shadow-sm"
                ref={index === queryHistory.length - 1 ? lastQueryRef : null}
              >
                <div className="text-sm text-gray-500 mb-1">
                  Query {index + 1}:
                </div>
                <div className="font-medium text-gray-800 mb-2">
                  {item.query}
                </div>
                <div
                  className={`bg-gray-50 p-2 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
                    selectedIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleQueryClick(index)}
                >
                  {item.code ? (
                    <pre className="text-xs font-mono text-gray-700 overflow-hidden">
                      {getCodePreview(item.code)}
                      {item.code.split("\n").length > 2 && (
                        <span className="text-gray-400">...</span>
                      )}
                    </pre>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600 text-sm font-medium">
                        Generating
                      </span>
                      <span className="flex space-x-1">
                        <span
                          className="animate-bounce text-gray-700 text-xl font-bold"
                          style={{ animationDelay: "0ms" }}
                        >
                          •
                        </span>
                        <span
                          className="animate-bounce text-gray-700 text-xl font-bold"
                          style={{ animationDelay: "150ms" }}
                        >
                          •
                        </span>
                        <span
                          className="animate-bounce text-gray-700 text-xl font-bold"
                          style={{ animationDelay: "300ms" }}
                        >
                          •
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input section at bottom */}
        <div className="p-6 border-t border-gray-200 bg-gray-100">
          <div className="flex mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your code generation prompt"
              className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Generated code */}
      <div className="w-1/2 bg-white border-l border-gray-300 flex flex-col h-screen">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              {isLoading && selectedIndex === queryHistory.length - 1
                ? "Generating codebase..."
                : "Generated Code"}
              {selectedIndex !== -1 && !isLoading && (
                <span className="text-sm text-gray-500 ml-2">
                  (Query {selectedIndex + 1})
                </span>
              )}
            </h2>
            <button
              onClick={handleCopyCode}
              disabled={!generatedCode || isLoading}
              className={`px-4 py-2 rounded transition ${
                isCopied
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
              }`}
            >
              {isCopied ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>

        <div className="flex-grow px-6 pb-6 overflow-hidden">
          {generatedCode ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg h-full p-4 overflow-y-auto">
              <pre className="text-sm font-mono text-black whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          ) : isLoading && selectedIndex === queryHistory.length - 1 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating code...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">
                Your generated code will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
