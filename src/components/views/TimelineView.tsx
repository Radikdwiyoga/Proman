import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Calendar, 
  AlertTriangle, 
  FolderKanban, 
  Users, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ChevronLeft
} from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export const TimelineView: React.FC = () => {
  const { 
    filteredTasks, 
    setSelectedTaskId, 
    users, 
    projects, 
    currentProjectId, 
    setCurrentProjectId,
    filters,
    setFilters
  } = useProject();

  const [zoomLevel, setZoomLevel] = useState<'days' | 'weeks'>('days');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToToday = () => {
    if (!scrollContainerRef.current) return;
    const todayIndex = 13; // timelineStartDate is 13 days before today
    const colWidth = zoomLevel === 'days' ? 46 : 160;
    const offset = zoomLevel === 'days' ? todayIndex * colWidth : (todayIndex / 7) * colWidth;
    const targetScroll = Math.max(0, offset - 120);
    scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  const scrollHorizontally = (delta: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToToday();
    }, 150);
    return () => clearTimeout(timer);
  }, [zoomLevel]);

  // Base Timeline Configuration — always relative to today
  const timelineStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13); // Start 2 weeks before today
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Generate Daily Columns (35 Days)
  const daysCount = 35;
  const daysColumns = useMemo(() => {
    return Array.from({ length: daysCount }, (_, i) => {
      const d = new Date(timelineStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      return {
        date: d,
        dateStr,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
        isToday,
        isWeekend
      };
    });
  }, [timelineStartDate]);

  // Generate Weekly Columns (6 Weeks)
  const weeksCount = 6;
  const weeksColumns = useMemo(() => {
    return Array.from({ length: weeksCount }, (_, i) => {
      const startD = new Date(timelineStartDate);
      startD.setDate(startD.getDate() + (i * 7));
      const endD = new Date(startD);
      endD.setDate(endD.getDate() + 6);

      const label = `Mgg ${i + 1}`;
      const sublabel = `${startD.getDate()} ${startD.toLocaleDateString('id-ID', { month: 'short' })} - ${endD.getDate()} ${endD.toLocaleDateString('id-ID', { month: 'short' })}`;
      return {
        weekIndex: i,
        startDate: startD,
        endDate: endD,
        label,
        sublabel
      };
    });
  }, [timelineStartDate]);

  // Helpers to calculate position
  const getDaysDiff = (from: Date, targetStr: string) => {
    const target = new Date(targetStr || todayStr);
    const diffTime = target.getTime() - from.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const dayCellWidth = 46;
  const weekCellWidth = 160;

  const statusColors: Record<TaskStatus, { bg: string; border: string; text: string; badge: string }> = {
    backlog: { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-white', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    todo: { bg: 'bg-sky-600', border: 'border-sky-400', text: 'text-white', badge: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' },
    in_progress: { bg: 'bg-amber-600', border: 'border-amber-400', text: 'text-white', badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
    review: { bg: 'bg-violet-600', border: 'border-violet-400', text: 'text-white', badge: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300' },
    done: { bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-white', badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
  };

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

  const totalGridWidth = zoomLevel === 'days' ? daysCount * dayCellWidth : weeksCount * weekCellWidth;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 space-y-4 text-slate-800 dark:text-readable">
      {/* Header Controls & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 pb-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-signal" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-readable">
              Timeline Proyek &amp; Gantt Chart
            </h2>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs font-semibold shadow-xs">
            <FolderKanban className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Project (Global Board)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{p.name}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 dark:text-muted font-mono hidden xl:inline">
            Rentang: 15 Ags 2026 – 20 Sep 2026
          </span>
        </div>

        {/* View Mode & Zoom Toggle Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Scroll Navigation */}
          <div className="flex items-center gap-1 bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 p-1 rounded-lg shadow-xs">
            <button
              onClick={() => scrollHorizontally(-220)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-elevated/60 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Geser Kiri (Sebelumnya)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToToday}
              className="px-2.5 py-1 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition cursor-pointer"
              title="Lompat ke Hari Ini"
            >
              Hari Ini
            </button>
            <button
              onClick={() => scrollHorizontally(220)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-elevated/60 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Geser Kanan (Berikutnya)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 p-1 shadow-xs">
            <button
              onClick={() => setZoomLevel('days')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                zoomLevel === 'days'
                  ? 'bg-signal text-canvas shadow-sm elevated-tray'
                  : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable'
              }`}
            >
              <span>Harian</span>
            </button>
            <button
              onClick={() => setZoomLevel('weeks')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                zoomLevel === 'weeks'
                  ? 'bg-signal text-canvas shadow-sm elevated-tray'
                  : 'text-slate-600 dark:text-muted hover:text-slate-900 dark:hover:text-readable'
              }`}
            >
              <span>Mingguan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto rounded-lg bg-white dark:bg-surface/70 backdrop-blur border border-slate-200 dark:border-white/8 shadow-sm relative flex flex-col elevated-tray"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
        }}
      >
        <div className="min-w-max flex flex-col flex-1">
          {/* Synchronized Timeline Header Grid */}
          <div className="flex border-b border-slate-200 dark:border-white/8 sticky top-0 bg-slate-50 dark:bg-canvas/60 z-30 shrink-0">
            {/* Left Sticky Column Header */}
            <div className="w-44 sm:w-64 md:w-80 lg:w-96 p-2.5 sm:p-3.5 font-bold text-xs text-slate-600 dark:text-muted border-r border-slate-200 dark:border-white/8 shrink-0 sticky left-0 bg-slate-50 dark:bg-canvas/60 z-40 flex items-center justify-between">
              <span className="truncate">Tugas &amp; PIC</span>
              <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                {filteredTasks.length}
              </span>
            </div>

            {/* Right Timeline Date Columns Header */}
            <div className="flex" style={{ width: `${totalGridWidth}px` }}>
              {zoomLevel === 'days' ? (
                daysColumns.map((col, i) => (
                  <div
                    key={i}
                    style={{ width: `${dayCellWidth}px` }}
                    className={`py-2 border-r border-slate-200/80 dark:border-white/6 text-center shrink-0 flex flex-col justify-center ${
                      col.isToday
                        ? 'bg-blue-100/80 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-extrabold border-blue-400 dark:border-blue-500/40'
                        : col.isWeekend
                        ? 'bg-slate-100/50 dark:bg-white/2 text-slate-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-mono leading-tight">{col.dayNum}</div>
                    <div className="text-[9px] uppercase tracking-tighter text-slate-400 mt-0.5">
                      {col.dayName}
                    </div>
                  </div>
                ))
              ) : (
                weeksColumns.map((col, i) => (
                  <div
                    key={i}
                    style={{ width: `${weekCellWidth}px` }}
                    className="py-2 px-2 border-r border-slate-200/80 dark:border-white/6 text-center shrink-0 flex flex-col justify-center bg-slate-50/80 dark:bg-canvas/40"
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {col.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {col.sublabel}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Task Rows Body */}
          <div className="flex-1 divide-y divide-slate-100 dark:divide-white/6">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Tidak ada tugas yang cocok dengan filter aktif.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const primaryAssignee = userMap.get((task.assigneeIds || [])[0]);
                const project = projectMap.get(task.projectId);
                const completedSubtasks = (task.subtasks || []).filter(st => st.completed).length;
                const totalSubtasks = (task.subtasks || []).length;
                const progress = totalSubtasks > 0 
                  ? Math.round((completedSubtasks / totalSubtasks) * 100) 
                  : task.status === 'done' ? 100 : 35;

                // Position calculation
                const startDaysOffset = getDaysDiff(timelineStartDate, task.startDate || '2026-08-27');
                const durationDays = Math.max(1, getDaysDiff(new Date(task.startDate || '2026-08-27'), task.dueDate || '2026-09-03') + 1);

                let barLeft = 0;
                let barWidth = 0;

                if (zoomLevel === 'days') {
                  barLeft = Math.max(0, startDaysOffset * dayCellWidth);
                  barWidth = Math.max(dayCellWidth, durationDays * dayCellWidth);
                } else {
                  barLeft = Math.max(0, (startDaysOffset / 7) * weekCellWidth);
                  barWidth = Math.max(48, (durationDays / 7) * weekCellWidth);
                }

                const styleConfig = statusColors[task.status] || statusColors.todo;

                return (
                  <div
                    key={task.id}
                    className="flex items-center hover:bg-slate-50 dark:hover:bg-white/4 transition group cursor-pointer"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    {/* Left Sticky Task Info Column */}
                    <div className="w-44 sm:w-64 md:w-80 lg:w-96 p-2.5 sm:p-3 border-r border-slate-200 dark:border-white/8 shrink-0 sticky left-0 bg-white dark:bg-surface group-hover:bg-slate-50 dark:group-hover:bg-white/6 transition z-20 flex items-center justify-between gap-1.5 sm:gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-bold font-mono uppercase ${styleConfig.badge}`}>
                            {task.status}
                          </span>
                          {project && (
                            <span className="text-[8px] sm:text-[9px] text-slate-400 truncate max-w-[70px] sm:max-w-[120px] hidden xs:inline">
                              {project.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span className="truncate">{task.startDate?.slice(5)} → {task.dueDate?.slice(5)}</span>
                          {totalSubtasks > 0 && (
                            <span className="text-slate-500 dark:text-slate-400 font-sans hidden sm:inline">
                              ({completedSubtasks}/{totalSubtasks})
                            </span>
                          )}
                        </div>
                      </div>

                      {primaryAssignee && (
                        <div className="flex items-center gap-1 shrink-0" title={`PIC: ${primaryAssignee.name}`}>
                          <UserAvatar
                            src={primaryAssignee.avatar}
                            name={primaryAssignee.name}
                            size="xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right Timeline Canvas Row */}
                    <div className="relative h-14 flex items-center shrink-0" style={{ width: `${totalGridWidth}px` }}>
                      {/* Background Column Grid Lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {zoomLevel === 'days' ? (
                          daysColumns.map((col, i) => (
                            <div
                              key={i}
                              style={{ width: `${dayCellWidth}px` }}
                              className={`h-full border-r border-slate-100 dark:border-white/5 shrink-0 ${
                                col.isToday
                                  ? 'bg-blue-500/5 dark:bg-blue-500/10'
                                  : col.isWeekend
                                  ? 'bg-slate-50/60 dark:bg-white/2'
                                  : ''
                              }`}
                            />
                          ))
                        ) : (
                          weeksColumns.map((_, i) => (
                            <div
                              key={i}
                              style={{ width: `${weekCellWidth}px` }}
                              className="h-full border-r border-slate-100 dark:border-slate-800/40 shrink-0"
                            />
                          ))
                        )}
                      </div>

                      {/* Interactive Gantt Task Bar */}
                      <div
                        style={{ left: `${barLeft}px`, width: `${barWidth}px` }}
                        className={`absolute h-8 rounded-xl border shadow-md flex items-center justify-between px-3 text-xs font-semibold transition-all duration-150 group-hover:scale-[1.01] group-hover:shadow-lg ${styleConfig.bg} ${styleConfig.border} ${styleConfig.text}`}
                        title={`${task.title} (${task.startDate} s/d ${task.dueDate})`}
                      >
                        {/* Progress Shading Fill */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l-lg pointer-events-none transition-all"
                          style={{ width: `${progress}%` }}
                        />

                        {/* Bar Content */}
                        <span className="truncate text-xs font-bold relative z-10 drop-shadow-xs">
                          {task.title}
                        </span>

                        {/* Priority / AI Risk Indicator */}
                        <div className="flex items-center gap-1.5 relative z-10 shrink-0 ml-1.5">
                          {task.aiRisk && task.aiRisk.riskScore >= 60 && task.status !== 'done' && (
                            <div 
                              className="flex items-center gap-0.5 text-[9px] bg-rose-950/90 text-rose-200 border border-rose-400/60 px-1.5 py-0.5 rounded-md font-bold shadow-xs animate-pulse"
                              title={`AI Risk: ${task.aiRisk.reason}`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-300" />
                              <span>+{task.aiRisk.predictedDelayDays}d</span>
                            </div>
                          )}

                          <span className="text-[10px] opacity-90 font-mono font-bold hidden sm:inline">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
