"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { scope } from "@/lib/scope";
import SignOutButton from "@/components/auth/SignOutButton";

// Dynamically import React Live components to avoid SSR issues
const LiveProvider = dynamic(
  () => import("react-live").then((mod) => mod.LiveProvider),
  { ssr: false }
);
const LiveError = dynamic(
  () => import("react-live").then((mod) => mod.LiveError),
  { ssr: false }
);
const LivePreview = dynamic(
  () => import("react-live").then((mod) => mod.LivePreview),
  { ssr: false }
);

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
  error?: string;
}

interface QueryHistory {
  query: string;
  code: string;
}

export default function CodeGenerator() {
  const [query, setQuery] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showPreview, setShowPreview] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<HTMLDivElement>(null);

  // Function to prepare code for React Live
  const prepareCodeForLivePreview = (code: string): string => {
    try {
      // Step 1: Remove all imports (including multi-line imports)
      let cleanedCode = code.replace(
        /import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*/g,
        ""
      );

      // Step 2: Remove export statements
      cleanedCode = cleanedCode.replace(/export\s+default\s+/g, "");
      cleanedCode = cleanedCode.replace(/export\s+/g, "");

      // Step 3: Clean up empty lines
      cleanedCode = cleanedCode.trim();

      // Step 4: If code already has render, return as is
      if (cleanedCode.includes("render(")) {
        return cleanedCode;
      }

      // Step 5: Look for React component (starts with capital letter)
      // This regex specifically looks for components that start with capital letters
      const componentRegex =
        /(?:const|function|let)\s+([A-Z][a-zA-Z0-9]*)\s*[=(:]/;
      const match = cleanedCode.match(componentRegex);

      if (match) {
        const componentName = match[1];
        const finalCode = `${cleanedCode}\n\nrender(<${componentName} />);`;
        console.log("Generated code (with component):", finalCode);
        return finalCode;
      }

      // Step 6: If it's JSX without a component wrapper
      if (cleanedCode.trim().startsWith("<")) {
        const finalCode = `render(${cleanedCode});`;
        console.log("Generated code (direct JSX):", finalCode);
        return finalCode;
      }

      // Step 7: Default case - wrap in render
      const finalCode = `render(${cleanedCode});`;
      console.log("Generated code (default):", finalCode);
      return finalCode;
    } catch (error) {
      console.error("Error preparing code:", error);
      return code;
    }
  };

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
    setShowPreview(false); // Start with code view while generating

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

      // Don't automatically switch to preview mode - let user do it manually

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
    // Show preview when clicking on a completed query
    setShowPreview(queryHistory[index].code !== "");
  };

  // Function to get first two lines of code
  const getCodePreview = (code: string) => {
    const lines = code.split("\n");
    return lines.slice(0, 2).join("\n");
  };

  // Toggle switch component
  const ToggleSwitch = () => (
    <div className="flex items-center space-x-3">
      <span
        className={`text-sm font-medium ${
          !showPreview ? "text-gray-900" : "text-gray-500"
        }`}
      >
        Code
      </span>
      <button
        onClick={() => setShowPreview(!showPreview)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          showPreview ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            showPreview ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${
          showPreview ? "text-gray-900" : "text-gray-500"
        }`}
      >
        Preview
      </span>
    </div>
  );

  // Scroll to the latest query when a new one is added
  useEffect(() => {
    if (lastQueryRef.current && scrollContainerRef.current) {
      lastQueryRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [queryHistory.length]);

  if (!hasGenerated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header with Sign Out button */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-gray-900">
                Code Generation Tool
              </h1>
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Welcome to Code Generator
            </h1>
            <div className="flex mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
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
      </div>
    );
  }

  // Split layout - after generation
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header spanning full width */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Code Generation Tool
            </h1>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content area with split layout */}
      <div className="flex-1 flex">
        {/* Left side - Query history at top, input box at bottom */}
        <div className="w-1/2 flex flex-col h-[calc(100vh-4rem)]">
          {/* Query history section */}
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-lg font-bold text-gray-800 mb-4 bg-blue-600 px-4 py-2 rounded-md text-white">
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
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

        {/* Right side - Generated code or preview */}
        <div className="w-1/2 bg-white border-l border-gray-300 flex flex-col h-[calc(100vh-4rem)]">
          <div className="p-6 pb-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {isLoading && selectedIndex === queryHistory.length - 1
                  ? "Generating codebase..."
                  : showPreview
                  ? "Live Preview"
                  : "Generated Code"}
                {selectedIndex !== -1 && !isLoading && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Query {selectedIndex + 1})
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-4">
                {generatedCode && !isLoading && <ToggleSwitch />}
                {generatedCode && !isLoading && !showPreview && (
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
                )}
              </div>
            </div>
          </div>

          <div className="flex-grow px-6 pb-6 overflow-hidden">
            {generatedCode ? (
              showPreview ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg h-full overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
                    }
                  >
                    <LiveProvider
                      code={prepareCodeForLivePreview(generatedCode)}
                      scope={scope}
                      noInline
                      theme={{
                        plain: {
                          backgroundColor: "#ffffff",
                        },
                        styles: [],
                      }}
                    >
                      <div className="h-full p-4 overflow-y-auto bg-white">
                        <LivePreview />
                        <LiveError className="text-red-600 text-sm mb-4" />
                      </div>
                    </LiveProvider>
                  </Suspense>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg h-full p-4 overflow-y-auto">
                  <pre className="text-sm font-mono text-black whitespace-pre-wrap">
                    {generatedCode}
                  </pre>
                </div>
              )
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
    </div>
  );
}
