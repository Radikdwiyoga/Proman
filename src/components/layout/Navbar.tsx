import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Bot, 
  ChevronDown, 
  X, 
  Sun, 
  Moon, 
  FolderKanban,
  Building2,
  Crown,
  Layers,
  Menu,
  Clock,
  Bell,
  HelpCircle
} from 'lucide-react';
import { TechLogo } from '../common/TechLogo';
import { UserAvatar } from '../common/UserAvatar';

function getOperationalTime(tzString?: string): { time: string; date: string; label: string } {
  let iana = 'Asia/Jakarta';
  let label = 'WIB';

  if (tzString) {
    if (tzString.includes('Makassar') || tzString.includes('WITA') || tzString.includes('UTC+8') || tzString.includes('GMT+8')) {
      iana = 'Asia/Makassar';
      label = 'WITA';
    } else if (tzString.includes('Jayapura') || tzString.includes('WIT') || tzString.includes('UTC+9') || tzString.includes('GMT+9')) {
      iana = 'Asia/Jayapura';
      label = 'WIT';
    } else if (tzString.includes('UTC') || tzString.includes('GMT+0')) {
      iana = 'UTC';
      label = 'UTC';
    } else if (tzString.includes('Jakarta') || tzString.includes('WIB') || tzString.includes('UTC+7') || tzString.includes('GMT+7')) {
      iana = 'Asia/Jakarta';
      label = 'WIB';
    } else {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tzString });
        iana = tzString;
        label = tzString.split('/').pop() || tzString;
      } catch {
        iana = 'Asia/Jakarta';
        label = 'WIB';
      }
    }
  }

  const now = new Date();
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: iana,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const date = new Intl.DateTimeFormat('id-ID', {
    timeZone: iana,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now);

  return { time, date, label };
}

export const Navbar: React.FC = () => {
  const {
    systemSettings,
    currentUser,
    filters,
    setFilters,
    setIsCreateModalOpen,
    setIsAIBreakdownModalOpen,
    setIsCopilotOpen,
    isCopilotOpen,
    setIsMobileSidebarOpen,
  } = useProject();

  const { theme, toggleTheme } = useTheme();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => getOperationalTime(systemSettings?.timezone));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getOperationalTime(systemSettings?.timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [systemSettings?.timezone]);

  return (
    <div className="flex flex-col z-20 shrink-0 select-none">
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-white/8 bg-white/70 dark:bg-canvas/60 backdrop-blur-md text-slate-800 dark:text-readable transition-colors">
        
        {/* Left: Mobile Drawer Trigger & "Welcome, [Name]" matching Reference */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Hamburger Drawer Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition cursor-pointer"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* User Welcome Header (Exact obantor style) */}
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium leading-none">
              Welcome,
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser.name}
              </span>
              {currentUser.personaType === 'Super Admin' && (
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Center: Search Bar Pill (Exact reference "Q Search here..") */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search here.."
              className="w-full pl-10 pr-9 py-2 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Mobile Search, Copilot, Time, Bell, Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`p-2 rounded-full border md:hidden transition cursor-pointer ${
              isMobileSearchOpen
                ? 'bg-[#2563EB] text-white border-blue-500'
                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Cari Tugas"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* AI Copilot Toggle Button */}
          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`relative p-2 sm:px-3 sm:py-2 rounded-full border transition shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              isCopilotOpen 
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
            title="Buka ProMan AI Copilot Assistant"
          >
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline text-xs font-semibold">Copilot</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          </button>

          {/* Live Operational Time Display */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs text-slate-700 dark:text-slate-300 select-none"
            title={`Zona Waktu: ${systemSettings?.timezone || 'Asia/Jakarta'} • ${currentTime.date}`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-white tracking-tight text-xs">
              {currentTime.time}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold">
              {currentTime.label}
            </span>
          </div>

          {/* Notification Bell (Matching Reference Icon) */}
          <button
            onClick={() => setIsAIBreakdownModalOpen(true)}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-2xs transition cursor-pointer relative"
            title="AI Breakdown & Intelligence Tools"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer"
            title={`Beralih ke mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

        </div>
      </header>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-2.5 border-b border-slate-200/60 dark:border-white/8 bg-white/95 dark:bg-canvas/90 backdrop-blur-md animate-fade-in">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search here.."
              className="w-full pl-10 pr-9 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-readable placeholder-slate-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
