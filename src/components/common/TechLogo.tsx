import React from 'react';

interface TechLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  hideTextOnMobile?: boolean;
  className?: string;
}

export const TechLogo: React.FC<TechLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  hideTextOnMobile = false,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const imageSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group shrink-0 ${className}`}>
      {/* Animated Futuristic Circuit Logo Container */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Elegant Ambient Glowing Backlight (Blue to Emerald gradient) */}
        <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-blue-600/40 via-cyan-500/30 to-emerald-500/40 blur-md animate-pulse -z-10 group-hover:blur-lg transition-all duration-500" />

        {/* Outer Tech Glass Frame with High-Tech Border */}
        <div className="w-full h-full rounded-2xl bg-white/95 dark:bg-slate-950/90 border border-blue-500/30 dark:border-blue-400/40 p-1 flex items-center justify-center shadow-lg shadow-blue-500/10 backdrop-blur-md relative overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:border-teal-400 group-hover:shadow-teal-500/25">
          {/* Subtle Circuit Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] bg-size-[6px_6px] opacity-20 pointer-events-none" />

          {/* Shimmer Light Sweep Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 dark:via-cyan-300/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          {/* New ProMan PM Monogram Logo */}
          <img 
            src="/proman-icon.png" 
            alt="ProMan Logo" 
            className={`${imageSizes[size]} object-contain drop-shadow-[0_2px_8px_rgba(2,132,199,0.3)] transition-transform duration-500 group-hover:scale-110`}
          />

          {/* Active Status Corner Node Pip */}
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
        </div>
      </div>

      {/* Brand & Division Typography */}
      <div className={`flex flex-col text-left justify-center ${hideTextOnMobile ? 'hidden sm:flex' : ''}`}>
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight leading-tight ${textSizes[size]}`}>
            <span className="bg-linear-to-r from-blue-600 to-cyan-500 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">Pro</span>
            <span className="bg-linear-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">Man</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="hidden sm:block text-[9.5px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase -mt-0.5 leading-tight truncate max-w-52.5 sm:max-w-70">
            Enterprise Project Management
          </span>
        )}
      </div>
    </div>
  );
};

