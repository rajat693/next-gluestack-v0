"use client";
import dynamic from "next/dynamic";

// Disable SSR for react-live
const DesignSystemLiveEditor = dynamic(() => import("@/pages/DsEditing"), {
  ssr: false,
});

export default function TestDesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <DesignSystemLiveEditor />
    </div>
  );
}
