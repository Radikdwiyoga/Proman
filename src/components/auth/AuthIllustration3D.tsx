import React from 'react';

export const AuthIllustration3D: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[460px] flex items-center justify-center overflow-hidden select-none">
      {/* Background Soft Glows & Ambient Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main 3D Composition Stage */}
      <div className="relative w-[320px] sm:w-[350px] h-[320px] sm:h-[350px]">

        {/* 1. Floating 3D Angled Ruler (Top Left) */}
        <div className="absolute top-4 left-0 -rotate-12 transition-transform duration-700 hover:rotate-0 hover:scale-105">
          <svg width="74" height="74" viewBox="0 0 74 74" fill="none" className="drop-shadow-[0_12px_20px_rgba(30,58,138,0.35)]">
            <path
              d="M10 64V14C10 11.7909 11.7909 10 14 10H64C64 10 64 24 50 24H24V50C24 64 10 64 10 64Z"
              fill="url(#ruler_grad)"
            />
            {/* Ruler Ticks */}
            <line x1="16" y1="18" x2="22" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="24" x2="20" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="30" x2="22" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="36" x2="20" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="42" x2="22" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="16" x2="28" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="16" x2="36" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="44" y1="16" x2="44" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="ruler_grad" x1="10" y1="10" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 2. Floating 3D Pastel Peach Sphere (Top Left) */}
        <div className="absolute top-8 left-20 transition-transform duration-1000 animate-pulse">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FECDD3] via-[#FDA4AF] to-[#E11D48] shadow-[0_8px_16px_rgba(225,29,72,0.35)]" />
        </div>

        {/* 3. Floating 3D Lilac Cone (Top Center) */}
        <div className="absolute -top-2 left-36 transition-transform duration-700 hover:-translate-y-2">
          <svg width="44" height="60" viewBox="0 0 44 60" fill="none" className="drop-shadow-[0_12px_18px_rgba(147,51,234,0.35)]">
            <path d="M22 2L42 50C42 55.5 33 58 22 58C11 58 2 55.5 2 50L22 2Z" fill="url(#cone_grad)" />
            <ellipse cx="22" cy="50" rx="20" ry="7" fill="#A855F7" opacity="0.6" />
            <defs>
              <linearGradient id="cone_grad" x1="2" y1="2" x2="42" y2="58" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E9D5FF" />
                <stop offset="0.4" stopColor="#C084FC" />
                <stop offset="1" stopColor="#9333EA" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 4. Floating 3D Pill Bars (Top Right) */}
        <div className="absolute top-6 right-2 flex flex-col gap-2 transition-transform duration-700 hover:translate-x-1">
          <div className="w-18 h-5 rounded-full bg-gradient-to-r from-white via-slate-50 to-blue-100 shadow-[0_6px_14px_rgba(30,58,138,0.25)] border-b border-blue-200/50" />
          <div className="w-22 h-5 rounded-full bg-gradient-to-r from-white via-slate-50 to-blue-100 shadow-[0_6px_14px_rgba(30,58,138,0.25)] border-b border-blue-200/50" />
          <div className="w-16 h-5 rounded-full bg-gradient-to-r from-white via-slate-50 to-blue-100 shadow-[0_6px_14px_rgba(30,58,138,0.25)] border-b border-blue-200/50" />
        </div>

        {/* 5. Floating 3D Lavender Orb (Middle Right) */}
        <div className="absolute top-36 right-0 transition-transform duration-1000 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E9D5FF] via-[#C084FC] to-[#7E22CE] shadow-[0_10px_20px_rgba(126,34,206,0.35)]" />
        </div>

        {/* 6. Main 3D Interactive Tablet Device (Center) */}
        <div className="absolute top-16 left-8 w-[210px] h-[160px] rounded-3xl bg-gradient-to-br from-[#BAE6FD] via-[#7DD3FC] to-[#38BDF8] p-3 shadow-[0_24px_38px_rgba(14,116,144,0.35),0_4px_12px_rgba(255,255,255,0.6)_inset] border-2 border-white/60 transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
          {/* Inner Tablet Display */}
          <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] p-3 relative overflow-hidden shadow-inner flex flex-col justify-between">
            {/* Grid texture inside tablet */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:10px_10px]" />

            {/* Top Widget Card */}
            <div className="relative z-10 w-full h-18 rounded-xl bg-gradient-to-b from-blue-400/80 to-blue-600/90 p-2.5 flex items-center gap-3 border border-white/20 shadow-md">
              {/* 3D Sphere Button */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 shadow-[0_4px_10px_rgba(0,0,0,0.25),0_2px_4px_rgba(255,255,255,0.9)_inset] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="w-14 h-2.5 rounded-full bg-white/80" />
                <div className="w-20 h-2 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex items-center justify-between px-1">
              <div className="w-14 h-4 rounded-full bg-purple-300/80 shadow-xs" />
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-md bg-white/40" />
                <div className="w-3.5 h-3.5 rounded-md bg-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Red Connecting Node Frame (Around Tablet) */}
        <div className="absolute top-14 left-6 pointer-events-none">
          <svg width="230" height="180" viewBox="0 0 230 180" fill="none">
            {/* Red Dashed / Solid Vector Paths */}
            <rect
              x="12"
              y="12"
              width="200"
              height="150"
              rx="18"
              stroke="#EF4444"
              strokeWidth="3.5"
              strokeDasharray="8 6"
              className="opacity-90"
            />
            {/* Connecting Nodes (Red 3D Beads) */}
            <circle cx="12" cy="12" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="112" cy="12" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="212" cy="12" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="212" cy="87" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="212" cy="162" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="112" cy="162" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="12" cy="162" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <circle cx="12" cy="87" r="7" fill="url(#node_grad)" filter="drop-shadow(0 3px 6px rgba(220,38,38,0.5))" />
            <defs>
              <linearGradient id="node_grad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#F87171" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 8. 3D Peach Thumbs-Up Hand (Middle-Right of Tablet) */}
        <div className="absolute top-28 right-8 z-20 transition-transform duration-500 hover:scale-110 hover:rotate-3">
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="drop-shadow-[0_16px_24px_rgba(239,68,68,0.3)]">
            <path
              d="M26 24V14C26 9 32 8 34 14L37 24H52C56 24 58 27 57 31L53 47C52 50 49 52 45 52H26M26 24H16C13.7909 24 12 25.7909 12 28V48C12 50.2091 13.7909 52 16 52H26M26 24V52"
              stroke="#FDA4AF"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26 24V14C26 9 32 8 34 14L37 24H52C56 24 58 27 57 31L53 47C52 50 49 52 45 52H26M26 24H16C13.7909 24 12 25.7909 12 28V48C12 50.2091 13.7909 52 16 52H26M26 24V52"
              stroke="url(#hand_grad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="hand_grad" x1="12" y1="8" x2="57" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FECDD3" />
                <stop offset="0.5" stopColor="#FDA4AF" />
                <stop offset="1" stopColor="#FB7185" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 9. Floating 3D Curved Cylinder (Bottom Left) */}
        <div className="absolute bottom-16 left-2 transition-transform duration-700 hover:rotate-6">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" className="drop-shadow-[0_8px_14px_rgba(244,63,94,0.3)]">
            <path
              d="M8 8C8 8 26 8 26 24C26 36 12 36 12 36"
              stroke="#FDA4AF"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 10. Floating 3D Blue Blocks & Wand (Bottom Right) */}
        <div className="absolute bottom-14 right-6 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-300 to-blue-600 shadow-md" />
          <div className="w-16 h-3 rounded-full bg-gradient-to-r from-[#FECDD3] via-[#FDA4AF] to-[#FB7185] shadow-sm" />
        </div>

        {/* 11. Floating 3D White Cursor Arrow (Front Center) */}
        <div className="absolute bottom-8 left-28 z-30 transition-transform duration-300 hover:scale-115">
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="drop-shadow-[0_14px_22px_rgba(0,0,0,0.35)]">
            <path
              d="M14 6L38 28H24L20 48L14 6Z"
              fill="#FFFFFF"
              stroke="#F1F5F9"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

      </div>
    </div>
  );
};

