import React from "react";
import FloatingAssistantOverlay from "../components/FloatingAssistantOverlay";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Real-Time Meet Home</h1>
      <FloatingAssistantOverlay />
      {/* Audio capture logic will be added here */}
    </div>
  );
};

export default HomePage; 