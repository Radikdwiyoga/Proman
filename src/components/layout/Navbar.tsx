import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Plus, 
  Search, 
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
  HelpCircle,
  Globe2,
  CheckCheck,
  Trash2,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
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
    setIsMobileSidebarOpen,
    userNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setSelectedTaskId,
  } = useProject();

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(() => getOperationalTime(systemSettings?.timezone));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getOperationalTime(systemSettings?.timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [systemSettings?.timezone]);

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <div className="no-print flex flex-col z-20 shrink-0 select-none">
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-white/8 bg-white/70 dark:bg-canvas/60 backdrop-blur-md text-slate-800 dark:text-readable transition-colors">
        
        {/* Left: Mobile Drawer Trigger & "Welcome, [Name]" matching Reference */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Hamburger Drawer Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition cursor-pointer"
            title={t('nav.openNav')}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* User Welcome Header (Exact obantor style) */}
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium leading-none">
              {t('navbar.welcome')}
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
              placeholder={t('common.searchPlaceholder')}
              className="w-full pl-10 pr-9 py-2 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Mobile Search, Time, Language, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`p-2 rounded-full border md:hidden transition cursor-pointer ${
              isMobileSearchOpen
                ? 'bg-brand-blue-accent text-white border-blue-500'
                : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title={t('navbar.searchTasks')}
          >
            <Search className="w-4 h-4" />
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

          {/* Language Switcher Pill Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer"
            title={t('navbar.languageToggle')}
          >
            <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              {language === 'id' ? 'ID' : 'EN'}
            </span>
          </button>

          {/* Notification Bell Button & Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 rounded-full border transition cursor-pointer ${
                isNotificationOpen || unreadNotificationsCount > 0
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs'
              }`}
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[460px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Popover Header */}
                <div className="p-3.5 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Notifikasi</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                        {unreadNotificationsCount} baru
                      </span>
                    )}
                  </div>

                  {userNotifications.length > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Tandai semua dibaca</span>
                    </button>
                  )}
                </div>

                {/* Popover List */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {userNotifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Belum ada notifikasi</p>
                      <p className="text-[11px] text-slate-400 max-w-[240px]">
                        Anda akan mendapat notifikasi ketika anggota tim me-mention akun Anda (@) di komentar tugas.
                      </p>
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.isRead) {
                            markNotificationAsRead(notif.id);
                          }
                          setSelectedTaskId(notif.taskId);
                          setIsNotificationOpen(false);
                        }}
                        className={`group p-3 sm:p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          !notif.isRead 
                            ? 'bg-blue-50/40 dark:bg-blue-950/20' 
                            : 'bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="relative shrink-0 mt-0.5">
                          <UserAvatar 
                            user={{ id: notif.actorId, name: notif.actorName, avatar: notif.actorAvatar }} 
                            size="md" 
                          />
                          {!notif.isRead && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                            <strong className="font-semibold text-slate-900 dark:text-white">{notif.actorName}</strong>{' '}
                            {notif.type === 'mention' ? 'me-mention Anda di tugas' : 'memberikan komentar di'}{' '}
                            <span className="font-semibold text-blue-600 dark:text-blue-400 truncate inline-block max-w-[150px] align-bottom">
                              "{notif.taskTitle}"
                            </span>
                          </p>

                          <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 rounded-lg p-1.5 px-2 line-clamp-2 italic">
                            "{notif.content}"
                          </div>

                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {notif.createdAt}
                            </span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5 font-medium hover:underline">
                              <span>Lihat tugas</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 hover:opacity-100 transition shrink-0 cursor-pointer"
                          title="Hapus notifikasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer"
            title={`${t('navbar.toggleTheme')} (${theme === 'dark' ? t('navbar.lightMode') : t('navbar.darkMode')})`}
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
