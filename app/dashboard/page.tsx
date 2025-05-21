"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { scope } from "@/lib/scope";
import SignOutButton from "@/components/auth/SignOutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Add this import

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

// Interfaces
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
  id?: string;
  query: string;
  code: string;
  createdAt?: string;
}

// Add new interface for user data
interface UserData {
  id: string;
  email: string;
  name: string;
  image: string;
  createdAt: string;
  queriesCountLeft: number;
  isPaid: boolean;
}

// Helper components
const ToggleSwitch = ({
  showPreview,
  setShowPreview,
}: {
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
}) => (
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

const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default function CodeGenerator() {
  const { data: session } = useSession();
  const router = useRouter(); // Add router for redirecting

  // User input states
  const [query, setQuery] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(true); // Default to true to show the split view
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // New state for user data including queriesCountLeft
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // History states
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<HTMLDivElement>(null);

  // Fetch user's query history and user data on load
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserQueries();
      fetchUserData();
    }
  }, [session]);

  // API functions
  const fetchUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const response = await fetch("/api/get-user-data");
      const data = await response.json();

      if (data.success && data.userData) {
        setUserData(data.userData);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const fetchUserQueries = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/get-queries");
      const data = await response.json();

      if (data.success) {
        if (data.queries?.length > 0) {
          // Reverse the order of queries - oldest first, newest last
          const reversedQueries = [...data.queries].reverse();
          setQueryHistory(reversedQueries);
          setHasGenerated(true); // Ensure we show the split view
        } else {
          // Only set hasGenerated to false if we've confirmed there are no queries
          setHasGenerated(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch query history:", error);
      // Keep hasGenerated as true in case of error to show the split view
    } finally {
      setIsLoadingHistory(false);
      setInitialLoadComplete(true);
    }
  };

  const saveQuery = async (queryText: string, codeResult: string) => {
    try {
      const response = await fetch("/api/save-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryText,
          code: codeResult,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to save query:", data.error);
      }
      return data;
    } catch (error) {
      console.error("Error saving query:", error);
      return null;
    }
  };

  // Code processing functions
  const prepareCodeForLivePreview = (code: string): string => {
    try {
      // Remove imports
      let cleanedCode = code.replace(
        /import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*/g,
        ""
      );

      // Remove export statements
      cleanedCode = cleanedCode.replace(/export\s+default\s+/g, "");
      cleanedCode = cleanedCode.replace(/export\s+/g, "");
      cleanedCode = cleanedCode.trim();

      // If code already has render, return as is
      if (cleanedCode.includes("render(")) {
        return cleanedCode;
      }

      // Look for React component
      const componentRegex =
        /(?:const|function|let)\s+([A-Z][a-zA-Z0-9]*)\s*[=(:]/;
      const match = cleanedCode.match(componentRegex);

      if (match) {
        return `${cleanedCode}\n\nrender(<${match[1]} />);`;
      }

      // If it's JSX without a component wrapper
      if (cleanedCode.trim().startsWith("<")) {
        return `render(${cleanedCode});`;
      }

      // Default case - wrap in render
      return `render(${cleanedCode});`;
    } catch (error) {
      console.error("Error preparing code:", error);
      return code;
    }
  };

  // Event handlers
  const handleGenerate = async () => {
    if (!query.trim()) return;

    // Save current query and clear input
    const currentQuery = query;
    setQuery("");

    // Add to history with empty code (newest at bottom)
    const tempQuery = { query: currentQuery, code: "" };
    setQueryHistory((prev) => {
      const newHistory = [...prev, tempQuery];
      const newIndex = newHistory.length - 1;

      // Update selected index after state update
      setTimeout(() => setSelectedIndex(newIndex), 0);
      return newHistory;
    });

    // Reset states
    setIsLoading(true);
    setError("");
    setGeneratedCode("");
    setIsCopied(false);
    setHasGenerated(true);
    setShowPreview(false);

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setGeneratedCode(data.code);

      // Update history with code
      setQueryHistory((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex >= 0) {
          const updated = [...prev];
          updated[lastIndex] = { ...updated[lastIndex], code: data.code };
          return updated;
        }
        return prev;
      });

      // Save to database
      await saveQuery(currentQuery, data.code);

      // Update queries count left in frontend state for ALL users
      // Changed from only updating non-premium users
      if (userData) {
        setUserData({
          ...userData,
          queriesCountLeft: Math.max(0, userData.queriesCountLeft - 1),
        });
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      // Remove failed query from history
      setQueryHistory((prev) => prev.slice(0, -1));
      setSelectedIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Fallback for older browsers
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
          setTimeout(() => setIsCopied(false), 2000);
        } catch (copyError) {
          console.error("Failed to copy text:", copyError);
          setError("Failed to copy code to clipboard");
        }

        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      setError("Failed to copy code to clipboard");
    }
  };

  const handleQueryClick = (index: number) => {
    setSelectedIndex(index);
    setGeneratedCode(queryHistory[index].code);
    setShowPreview(queryHistory[index].code !== "");
  };

  // Utility functions
  const getCodePreview = (code: string) => {
    const lines = code.split("\n");
    return lines.slice(0, 2).join("\n");
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  // Scroll to the latest query when added
  useEffect(() => {
    if (lastQueryRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        lastQueryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [queryHistory.length]);

  // Loading state
  if (!initialLoadComplete || isLoadingUserData) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Code Generation Tool
                </h1>
                {session?.user?.email && (
                  <span className="text-sm text-gray-500">
                    ({session.user.email})
                  </span>
                )}
              </div>
              <SignOutButton />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Loading your history..." />
        </div>
      </div>
    );
  }

  // Welcome screen for new users
  if (!hasGenerated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Code Generation Tool
                </h1>
                {session?.user?.email && (
                  <span className="text-sm text-gray-500">
                    ({session.user.email})
                  </span>
                )}
                {userData && userData.isPaid && (
                  <span className="ml-4 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    Premium User
                  </span>
                )}
                {userData && (
                  <span className="ml-4 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Queries left:{" "}
                    <span className="font-bold">
                      {userData.queriesCountLeft}
                    </span>
                  </span>
                )}
              </div>
              <SignOutButton />
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Welcome to Code Generator
            </h1>

            {isLoadingHistory ? (
              <div className="flex justify-center my-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isLoading &&
                      query.trim()
                    ) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder="Enter your code generation prompt"
                  className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={userData && userData.queriesCountLeft <= 0}
                />
                <button
                  onClick={handleGenerate}
                  disabled={
                    isLoading ||
                    !query.trim() ||
                    (userData && userData.queriesCountLeft <= 0)
                  }
                  className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            )}

            {userData && userData.queriesCountLeft <= 0 && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 flex justify-between items-center">
                <span>
                  {userData.isPaid
                    ? "You have used all your premium queries."
                    : "You have used all your free queries."}
                </span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => router.push("/payment")}
                >
                  {userData.isPaid ? "Add More Queries" : "Upgrade Now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main split layout view
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Code Generation Tool
              </h1>
              {session?.user?.email && (
                <span className="text-sm text-gray-500">
                  ({session.user.email})
                </span>
              )}
              {userData && userData.isPaid && (
                <span className="ml-4 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Premium User
                </span>
              )}
              {userData && (
                <span className="ml-4 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Queries left:{" "}
                  <span className="font-bold">{userData.queriesCountLeft}</span>
                </span>
              )}
            </div>
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
              <h2 className="text-lg font-bold text-gray-100 mb-4 bg-blue-600 px-4 py-2 rounded-md">
                User Inputs
              </h2>
            </div>
            <div
              className="flex-grow overflow-y-auto px-6 pb-4"
              ref={scrollContainerRef}
            >
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner text="Loading queries..." />
                </div>
              ) : queryHistory.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-gray-500 text-sm">No query history yet</p>
                </div>
              ) : (
                queryHistory.map((item, index) => (
                  <div
                    key={index}
                    className="mb-4 bg-white p-4 rounded-lg shadow-sm"
                    ref={
                      index === queryHistory.length - 1 ? lastQueryRef : null
                    }
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm text-gray-500">
                        Query {index + 1}:
                      </div>
                      {item.createdAt && (
                        <div className="text-xs text-gray-400">
                          {formatDate(item.createdAt)}
                        </div>
                      )}
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
                ))
              )}
            </div>
          </div>

          {/* Input section at bottom */}
          <div className="p-6 border-t border-gray-200 bg-gray-100">
            {userData && userData.queriesCountLeft <= 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                <span>
                  {userData.isPaid
                    ? "You have used all your premium queries."
                    : "You have used all your free queries."}
                </span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => router.push("/payment")}
                >
                  {userData.isPaid ? "Add More Queries" : "Upgrade Now"}
                </button>
              </div>
            ) : (
              <div className="flex mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isLoading &&
                      query.trim() &&
                      !(userData && userData.queriesCountLeft <= 0)
                    ) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder="Enter your code generation prompt"
                  className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  disabled={userData && userData.queriesCountLeft <= 0}
                />
                <button
                  onClick={handleGenerate}
                  disabled={
                    isLoading ||
                    !query.trim() ||
                    (userData && userData.queriesCountLeft <= 0)
                  }
                  className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            )}

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
                {generatedCode && !isLoading && (
                  <ToggleSwitch
                    showPreview={showPreview}
                    setShowPreview={setShowPreview}
                  />
                )}
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
                        <LoadingSpinner />
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
                <LoadingSpinner text="Generating code..." />
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
