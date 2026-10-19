import React, { useState } from 'react';
import { useProject, ActiveView } from '../../context/ProjectContext';
import { 
  Kanban, 
  Calendar as CalendarIcon, 
  ListOrdered, 
  GanttChartSquare, 
  AlertTriangle, 
  Users2, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Flame, 
  ChevronRight, 
  ChevronDown,
  Settings, 
  Activity, 
  Crown, 
  FolderKanban,
  X,
  LogOut,
  Key,
  Pin,
  PinOff,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { analyzeProjectRisks } from '../../utils/aiSimulator';
import { UserAvatar } from '../common/UserAvatar';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentProject,
    currentProjectId,
    projects,
    tasks,
    users,
    currentUser,
    filters,
    setFilters,
    setIsSummaryModalOpen,
    isSuperAdmin,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    setIsChangePasswordModalOpen,
    logout,
  } = useProject();

  // Auto-hide / Compact Icon Mode State
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('proman_sidebar_pinned') !== 'false'; // default pinned for modern desktop view
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isExpanded = isPinned || isHovered;

  const togglePin = () => {
    setIsPinned(prev => {
      const next = !prev;
      localStorage.setItem('proman_sidebar_pinned', String(next));
      return next;
    });
  };

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  };

  const riskAnalysis = analyzeProjectRisks(tasks, users);
  const myTasksCount = tasks.filter(t =>
    (currentProjectId === 'all' || t.projectId === currentProject.id) &&
    t.status !== 'done' &&
    (t.assigneeIds || []).includes(currentUser.id)
  ).length;
  const urgentTasksCount = tasks.filter(t =>
    (currentProjectId === 'all' || t.projectId === currentProject.id) &&
    t.status !== 'done' &&
    t.priority === 'urgent'
  ).length;
  const totalActiveTasks = tasks.filter(t =>
    (currentProjectId === 'all' || t.projectId === currentProject.id) &&
    t.status !== 'done'
  ).length;

  // Primary Navigation matching reference (Tasks, Activities, Dashboard, Schedule, List)
  const primaryNavItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'kanban', label: 'Tasks', icon: <Kanban className="w-4 h-4 shrink-0" />, badge: totalActiveTasks },
    { id: 'timeline', label: 'Timeline/Gantt Chart', icon: <GanttChartSquare className="w-4 h-4 shrink-0" /> },
    { id: 'project_management', label: 'Daftar Proyek', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'calendar', label: 'Schedule', icon: <CalendarIcon className="w-4 h-4 shrink-0" /> },
    { id: 'list', label: 'Daftar Tugas', icon: <ListOrdered className="w-4 h-4 shrink-0" /> },
  ];

  const aiIntelligenceItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    { 
      id: 'risk_dashboard', 
      label: 'Predictive Risk', 
      icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
      badge: riskAnalysis.atRiskTasksCount > 0 ? `${riskAnalysis.atRiskTasksCount} Risiko` : undefined,
      badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30'
    },
    { 
      id: 'resource_allocation', 
      label: 'Smart Resource', 
      icon: <Users2 className="w-4 h-4 text-sky-300 shrink-0" />,
      badge: riskAnalysis.overloadedMembersCount > 0 ? `${riskAnalysis.overloadedMembersCount} Overload` : undefined,
      badgeColor: 'bg-rose-400/20 text-rose-200 border-rose-400/30'
    },
  ];

  const renderNavContent = (expanded: boolean) => (
    <div className="flex flex-col h-full justify-between select-none p-3.5">
      {/* Top Header with Brand Logo & Collapse Pin Button */}
      <div className="space-y-4">
        <div className={`flex items-center ${expanded ? 'justify-between' : 'justify-center'} pb-3 border-b border-white/10`}>
          {expanded ? (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center shrink-0">
                <img 
                  src="/proman-icon.png" 
                  alt="ProMan" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                  ProMan
                </span>
                <span className="text-[9px] font-medium text-blue-200/80 tracking-wide uppercase">
                  Enterprise Workspace
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center shrink-0">
              <img 
                src="/proman-icon.png" 
                alt="ProMan" 
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Pin / Unpin Desktop Toggle */}
          <button
            onClick={togglePin}
            className={`p-1.5 rounded-lg transition hidden md:flex items-center justify-center ${
              isPinned 
                ? 'text-blue-200 hover:text-white hover:bg-white/10' 
                : 'text-blue-300/60 hover:text-white hover:bg-white/10'
            }`}
            title={isPinned ? 'Lepas Pin (Auto-Hide Aktif)' : 'Kunci Navigasi (Pin Sidebar)'}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Primary Views Section (Tasks, Activities, Dashboard, Schedule) */}
        <div className="space-y-1">
          {primaryNavItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex items-center ${expanded ? 'justify-between px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1D4ED8] font-bold shadow-md shadow-blue-950/20'
                    : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-[#1D4ED8]' : 'text-blue-200/80 group-hover:text-white transition'}>
                    {item.icon}
                  </span>
                  {expanded && <span className="truncate text-[13px]">{item.label}</span>}
                </div>

                {expanded && item.badge !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive 
                      ? 'bg-blue-100 text-[#1D4ED8] font-mono' 
                      : 'bg-white/15 text-blue-100 font-mono'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {!expanded && item.badge !== undefined && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-sky-300 ring-2 ring-blue-700" />
                )}
              </button>
            );
          })}
        </div>

        {/* AI & Analytics Suite */}
        <div className="pt-2">
          {expanded && (
            <div className="px-3 pb-1.5 text-[10px] font-bold text-blue-200/70 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-300" />
              <span>AI Intelligence</span>
            </div>
          )}

          <div className="space-y-1">
            {aiIntelligenceItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${expanded ? 'justify-between px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-medium transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1D4ED8] font-bold shadow-md shadow-blue-950/20'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? 'text-[#1D4ED8]' : ''}>
                      {item.icon}
                    </span>
                    {expanded && <span className="truncate text-[12.5px]">{item.label}</span>}
                  </div>

                  {expanded && item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                      isActive 
                        ? 'bg-blue-100 text-[#1D4ED8] border-transparent font-mono' 
                        : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Direct Auto-Status Summary Trigger */}
            <button
              onClick={() => {
                setIsSummaryModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              title="Laporan AI (Auto-Status Summary)"
              className={`w-full flex items-center ${expanded ? 'justify-between px-3.5' : 'justify-center px-0'} py-2 rounded-xl text-xs font-medium text-blue-100/80 hover:text-white hover:bg-white/10 transition group cursor-pointer`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-blue-300 shrink-0" />
                {expanded && <span className="text-[12.5px]">Auto Summary</span>}
              </div>
              {expanded && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-blue-100 font-bold border border-white/15 shrink-0">
                  AI Doc
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Administration (Super Admin only) */}
        {isSuperAdmin && (
          <div className="pt-2">
            {expanded && (
              <div className="px-3 pb-1.5 text-[10px] font-bold text-blue-200/70 uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-300" />
                <span>Pengaturan</span>
              </div>
            )}
            <button
              onClick={() => handleNavClick('admin_settings')}
              title="Admin Settings"
              className={`w-full flex items-center ${expanded ? 'justify-between px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-medium transition group cursor-pointer ${
                activeView === 'admin_settings'
                  ? 'bg-white text-[#1D4ED8] font-bold shadow-md shadow-blue-950/20'
                  : 'text-blue-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Settings className={`w-4 h-4 shrink-0 ${activeView === 'admin_settings' ? 'text-[#1D4ED8]' : 'text-amber-300'}`} />
                {expanded && <span className="text-[12.5px]">Settings</span>}
              </div>
              {expanded && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  ADMIN
                </span>
              )}
            </button>
          </div>
        )}

        {/* Quick Filter Shortcuts */}
        {expanded && (
          <div className="pt-2 border-t border-white/10">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-blue-200/70 uppercase tracking-wider">
              Filter Cepat
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, assigneeId: prev.assigneeId === currentUser.id ? null : currentUser.id }));
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                  filters.assigneeId === currentUser.id 
                    ? 'bg-white/20 text-white font-bold' 
                    : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>Tugas Saya</span>
                </div>
                <span className="text-[10px] font-mono">{myTasksCount}</span>
              </button>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, priority: prev.priority === 'urgent' ? null : 'urgent' }));
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                  filters.priority === 'urgent' 
                    ? 'bg-rose-500/30 text-white font-bold border border-rose-400/40' 
                    : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Prioritas Urgent</span>
                </div>
                <span className="text-[10px] font-mono">{urgentTasksCount}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Card at Bottom (Exact obantor style in reference) */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        {expanded ? (
          <div className="relative">
            <div 
              onClick={() => setIsProfileMenuOpen(prev => !prev)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <UserAvatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10.5px] text-blue-200/80 truncate font-normal">
                    {currentUser.email || `${currentUser.personaType}`}
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-blue-200 shrink-0 transition-transform ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
            </div>

            {/* Profile Dropdown Actions (Pop-up opens UPWARD above the profile card) */}
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileMenuOpen(false);
                  }} 
                />
                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 p-1.5 rounded-2xl bg-[#1E3A8A] dark:bg-[#0F172A] border border-blue-400/30 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 z-30">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsMobileSidebarOpen(false);
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-100 hover:text-white hover:bg-white/10 transition"
                  >
                    <Key className="w-4 h-4 text-blue-300" />
                    <span>Ganti Password</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsMobileSidebarOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UserAvatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              title="Ganti Password"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Aside in Royal Blue Theme */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col justify-between shrink-0 h-full select-none bg-linear-to-b from-[#1D4ED8] via-[#1E40AF] to-[#1E3A8A] dark:from-[#0F172A] dark:to-[#0B1120] text-white border-r border-blue-900/30 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 ${
          isExpanded ? 'w-64 shadow-xl' : 'w-18'
        }`}
      >
        {renderNavContent(isExpanded)}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
          />
          <div className="relative w-72 max-w-[85vw] bg-linear-to-b from-[#1D4ED8] via-[#1E40AF] to-[#1E3A8A] dark:from-[#0F172A] dark:to-[#0B1120] text-white flex flex-col justify-between h-full shadow-2xl z-10 animate-slide-right">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/proman-icon.png" alt="ProMan" className="w-7 h-7 object-contain bg-white rounded-lg p-1" />
                <span className="font-extrabold text-sm text-white">ProMan</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
