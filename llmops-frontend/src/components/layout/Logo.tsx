import React from 'react';

export default function ModelArenaLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* The SVG Logo Icon */}
      <svg 
        className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Hexagon (Dark Grey/Black Theme) */}
        <path 
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="2" 
          fill="#111111"
        />
        
        {/* Inner 'M' / Upward Trend Line */}
        <path 
          d="M12 26V16L20 22L28 12V24" 
          stroke="url(#monochromeGradient)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Top Data Node (Crisp White) */}
        <circle cx="28" cy="12" r="3.5" fill="#FFFFFF"/>
        
        {/* Grayscale/Metallic Gradient Definition */}
        <defs>
          <linearGradient id="monochromeGradient" x1="12" y1="26" x2="28" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6B7280" /> {/* Dark Slate Grey */}
            <stop offset="0.5" stopColor="#D1D5DB" /> {/* Light Grey */}
            <stop offset="1" stopColor="#FFFFFF" /> {/* Pure White */}
          </linearGradient>
        </defs>
      </svg>

      {/* The Stylized Text - White and Grey */}
      <span className="text-xl font-black tracking-tight flex items-center">
        <span className="text-white">Model</span>
        <span className="text-gray-400">Arena</span>
      </span>
    </div>
  );
}