// lib/api-client.ts
export async function generateCode(query: string) {
  try {
    const response = await fetch("/api/generate-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate code");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}
