// app/api/generate-code/route.ts
import { Anthropic } from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Define the components directory
const COMPONENTS_DIR = path.join(process.cwd(), "src/components");

// Constants for token pricing
const INPUT_COST_PER_1K_TOKENS = 0.003; // $0.003 per 1K input tokens
const OUTPUT_COST_PER_1K_TOKENS = 0.015; // $0.015 per 1K output tokens

// Utility functions
function calculateTokenUsage(usage: any) {
  if (!usage) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
    };
  }

  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  const totalTokens = inputTokens + outputTokens;

  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K_TOKENS;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K_TOKENS;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    inputCost,
    outputCost,
    totalCost,
  };
}

async function extractComponentMetadata(componentName: string) {
  try {
    const docPath = path.join(
      COMPONENTS_DIR,
      `${componentName.toLowerCase()}.md`
    );

    try {
      await fs.access(docPath);
    } catch {
      return { title: componentName, description: "Component not found" };
    }

    const docsContent = await fs.readFile(docPath, "utf-8");
    const lines = docsContent.split("\n");

    // Check if file starts with frontmatter
    if (lines[0].trim() !== "---") {
      return { title: componentName, description: "No description available" };
    }

    // Extract only title and description
    const metadata = {
      title: componentName,
      description: "No description available",
    };

    // Read until the closing frontmatter delimiter
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === "---") break;

      if (line.startsWith("title:")) {
        metadata.title = line.split(":")[1].trim();
      } else if (line.startsWith("description:")) {
        metadata.description = line.split(":")[1].trim();
      }
    }

    return metadata;
  } catch (error: any) {
    console.error(
      `Error reading metadata for ${componentName}: ${error.message}`
    );
    return { title: componentName, description: "Error reading metadata" };
  }
}

async function getAvailableComponents() {
  try {
    const files = await fs.readdir(COMPONENTS_DIR);
    const componentFiles = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(".md", ""));

    return componentFiles;
  } catch (error: any) {
    console.error(`Error reading components directory: ${error.message}`);
    return [];
  }
}

async function getAllComponentsMetadata() {
  const components = await getAvailableComponents();
  const metadata: Record<string, any> = {};

  await Promise.all(
    components.map(async (component) => {
      const meta = await extractComponentMetadata(component);
      if (meta) {
        metadata[component] = meta;
      }
    })
  );

  return JSON.stringify(metadata, null, 2);
}

async function getComponentDocs(componentName: string) {
  try {
    const docPath = path.join(
      COMPONENTS_DIR,
      `${componentName.toLowerCase()}.md`
    );

    try {
      await fs.access(docPath);
    } catch {
      return `Documentation not found for component: ${componentName}`;
    }

    const docsContent = await fs.readFile(docPath, "utf-8");
    return (
      docsContent || `Empty documentation file for component: ${componentName}`
    );
  } catch (error: any) {
    return `Error retrieving documentation for ${componentName}: ${error.message}`;
  }
}

async function getComponentsDocsBatch(input: { componentNames: string[] }) {
  const { componentNames } = input;
  const docsObject: Record<string, string> = {};

  console.log(
    `✅ Getting documentation for components: ${componentNames.join(", ")}`
  );

  await Promise.all(
    componentNames.map(async (componentName) => {
      docsObject[componentName] = await getComponentDocs(componentName);
    })
  );

  return JSON.stringify(docsObject, null, 2);
}

// Tool definitions
const getAllComponentsMetadataTool = {
  name: "get_all_components_metadata",
  description:
    "Gets metadata (title and description) for all components. Use this FIRST to decide which components are relevant.",
  input_schema: {
    type: "object",
    properties: {},
    required: [],
  },
};

const selectComponentsTool = {
  name: "select_components",
  description:
    "After reading component metadata, use this to select which components you need for the task. This helps track which components to read fully.",
  input_schema: {
    type: "object",
    properties: {
      selectedComponents: {
        type: "array",
        items: { type: "string" },
        description: "Array of component names that are relevant for the task",
      },
    },
    required: ["selectedComponents"],
  },
};

const getComponentsDocsBatchTool = {
  name: "get_components_docs_batch",
  description:
    "Gets full documentation for multiple components at once. PREFERRED way to get docs for the components you selected.",
  input_schema: {
    type: "object",
    properties: {
      componentNames: {
        type: "array",
        items: { type: "string" },
        description: "Array of component names to retrieve documentation for",
      },
    },
    required: ["componentNames"],
  },
};

const tools = [
  getAllComponentsMetadataTool,
  selectComponentsTool,
  getComponentsDocsBatchTool,
];

const systemPrompt = `You are a React and React Native expert specializing in the provided design system.
      
      STRICT WORKFLOW (follow in order):
      1. Use the get_all_components_metadata tool to see titles and descriptions
      2. Use the select_components tool to explicitly select which components you need
      3. Use the get_components_docs_batch tool ONLY for the components you selected
      4. Generate the React component code
      
      REQUIREMENTS:
      - Use ONLY components from the documented design system
      - NO HTML tags like <div>, <button>, <input>, etc.
      - NO external component libraries
      - NO StyleSheet or styles objects - use ONLY Tailwind CSS classes
      - All components accept Tailwind CSS classes via the className prop
      - Images should be ONLY from unsplash.com - NO local images
      - Components should be imported individually from their respective files, not grouped together in a single import statement.
      - Output ONLY the complete React component code, no explanations
      - All generated screens or components should be SCROLLABLE. Use ScrollView or a similar component from the design system to ensure content is properly scrollable.
      - All generated screens or components should be responsive and mobile-friendly (with some horizontal margin and padding).
      - PREFER to use HStack and VStack components over Box components whenever possible
      
      OPTIMIZATION:
      - Select the minimum number of components needed
      - Base selection on metadata relevance to the task
      - Only read full documentation for selected components
      
      CRITICAL: You MUST generate COMPLETE and RUNNABLE code. Do not truncate or abbreviate any part of the implementation. If the component is large, focus on generating a complete, working version rather than including every possible feature.
      
      IMPORTANT: When generating code, do not truncate or skip any parts. Generate the complete implementation. If the code is long, generate it entirely rather than using placeholders or comments like "// rest of the code" or "...".`;

// Tool functions
const functions = {
  get_all_components_metadata: getAllComponentsMetadata,
  select_components: (input: { selectedComponents: string[] }) => {
    console.log(
      `✅ Selected components: ${input.selectedComponents.join(", ")}`
    );
    return `You have selected: ${input.selectedComponents.join(
      ", "
    )}. Now proceed to get full documentation for ALL these components at once using get_components_docs_batch.`;
  },
  get_components_docs_batch: getComponentsDocsBatch,
};

// State management for the API
interface ConversationState {
  messages: any[];
  toolUseBlocks: any[];
  response: any;
  count: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCalls: number;
}

async function getResponse(state: ConversationState) {
  state.totalCalls++;
  const response = await anthropic.beta.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 8192,
    messages: state.messages,
    system: systemPrompt,
    tools: tools,
    betas: ["token-efficient-tools-2025-02-19"],
  });

  // Track token usage
  if (response.usage) {
    state.totalInputTokens += response.usage.input_tokens;
    state.totalOutputTokens += response.usage.output_tokens;
  }

  return response;
}

async function processToolUseBlocks(
  state: ConversationState,
  toolUseBlocks: any[]
): Promise<void> {
  for (const toolUseBlock of toolUseBlocks) {
    if (functions[toolUseBlock.name]) {
      console.log(`\nClaude is using the ${toolUseBlock.name} tool...`);

      // Call the function
      const toolOutput = await functions[toolUseBlock.name](toolUseBlock.input);

      // Add tool output to messages
      state.messages.push({
        role: "assistant",
        content: [...state.response.content],
      });

      state.messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseBlock.id,
            content: toolOutput,
          },
        ],
      });

      state.response = await getResponse(state);
      state.count++;

      const newToolUseBlocks = state.response.content.filter(
        (content: any) => content.type === "tool_use"
      );

      if (newToolUseBlocks.length > 0) {
        await processToolUseBlocks(state, newToolUseBlocks);
      }
    } else {
      console.error(`Unknown tool: ${toolUseBlock.name}`);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    // Initialize state
    const state: ConversationState = {
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
      toolUseBlocks: [],
      response: null,
      count: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCalls: 0,
    };

    // Get the list of available components
    const availableComponents = await getAvailableComponents();

    if (availableComponents.length === 0) {
      return NextResponse.json(
        {
          error: `No markdown documentation files found in ${COMPONENTS_DIR}`,
        },
        { status: 500 }
      );
    }

    console.log(
      `Found ${availableComponents.length} component documentation files`
    );

    // First call to Claude
    state.response = await getResponse(state);
    state.count++;

    // Process any tool use blocks
    state.toolUseBlocks = state.response.content.filter(
      (content: any) => content.type === "tool_use"
    );

    if (state.toolUseBlocks.length > 0) {
      await processToolUseBlocks(state, state.toolUseBlocks);
    }

    // Extract the final code
    const codeContent = state.response.content
      .filter((content: any) => content.type === "text")
      .map((content: any) => content.text)
      .join("");

    // Calculate total token usage
    const tokenUsage = {
      inputTokens: state.totalInputTokens,
      outputTokens: state.totalOutputTokens,
      totalTokens: state.totalInputTokens + state.totalOutputTokens,
      apiCalls: state.totalCalls,
      estimatedCost: calculateTokenUsage({
        input_tokens: state.totalInputTokens,
        output_tokens: state.totalOutputTokens,
      }).totalCost,
    };

    const match = codeContent.match(/```jsx\s*([\s\S]*?)\s*```/);
    const codeOnly = match ? match[1].trim() : "";

    return NextResponse.json({
      code: codeOnly,
      tokenUsage,
      availableComponents,
      success: true,
    });
  } catch (error: any) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      {
        error: "Failed to generate code",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
