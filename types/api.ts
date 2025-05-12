// types/api.ts
export interface GenerateCodeRequest {
  query: string;
}

export interface GenerateCodeResponse {
  code: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    apiCalls: number;
    estimatedCost: number;
  };
  availableComponents: string[];
  success: boolean;
}

export interface ComponentMetadata {
  title: string;
  description: string;
}

export interface ToolInput {
  selectedComponents?: string[];
  componentNames?: string[];
}

export interface TokenUsageInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}
