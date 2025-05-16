import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Set a test value
    await kv.set("test-key", "Hello from Vercel KV!");

    // Get the value back
    const value = await kv.get("test-key");

    return NextResponse.json({
      success: true,
      value: value,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}

// just a test to see if the kv is working
// url: http://localhost:3000/api/test-kv
