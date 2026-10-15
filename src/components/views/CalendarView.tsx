import React, { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  X, 
  Plus, 
  Check, 
  Users, 
  Filter as FilterIcon, 
  CheckSquare, 
  FolderKanban,
  Flag,
  ChevronDown
} from 'lucide-react';
import { Task } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

type CalendarMode = 'daily' | 'weekly' | 'monthly';

export const CalendarView: React.FC = () => {
  const { 
    filteredTasks, 
    setSelectedTaskId, 
    openCreateTaskModal,
    moveTaskStatus,
    users,
    projects,
    currentProjectId,
    setCurrentProjectId
  } = useProject();

  const [mode, setMode] = useState<CalendarMode>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
  // Filter states on the left panel
  const [filterType, setFilterType] = useState({
    all: true,
    urgentOnly: false,
    meetingsOnly: true,
    completed: false
  });

  // Selected date detail modal for month view
  const [selectedDateDetail, setSelectedDateDetail] = useState<{
    dateStr: string;
    formattedDateDisplay: string;
    tasks: Task[];
  } | null>(null);

  // Mini calendar month navigation state
  const [miniCalMonth, setMiniCalMonth] = useState<number>(() => selectedDate.getMonth());
  const [miniCalYear, setMiniCalYear] = useState<number>(() => selectedDate.getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeekShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayLabelsId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Calculate days for mini calendar
  const miniDaysInMonth = new Date(miniCalYear, miniCalMonth + 1, 0).getDate();
  const miniFirstDayIndex = new Date(miniCalYear, miniCalMonth, 1).getDay();

  const handleMiniPrev = () => {
    if (miniCalMonth === 0) {
      setMiniCalMonth(11);
      setMiniCalYear(y => y - 1);
    } else {
      setMiniCalMonth(m => m - 1);
    }
  };

  const handleMiniNext = () => {
    if (miniCalMonth === 11) {
      setMiniCalMonth(0);
      setMiniCalYear(y => y + 1);
    } else {
      setMiniCalMonth(m => m + 1);
    }
  };

  // Helper to get week days starting Monday (Matching reference: Monday 16, Tuesday 17, etc.)
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    // Monday is index 1, Sunday is 0
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current);
    monday.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Navigate Week / Day
  const handlePrevPeriod = () => {
    const d = new Date(selectedDate);
    if (mode === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else if (mode === 'daily') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d);
    setMiniCalMonth(d.getMonth());
    setMiniCalYear(d.getFullYear());
  };

  const handleNextPeriod = () => {
    const d = new Date(selectedDate);
    if (mode === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (mode === 'daily') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d);
    setMiniCalMonth(d.getMonth());
    setMiniCalYear(d.getFullYear());
  };

  // Format date helper: YYYY-MM-DD
  const toDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Tasks filtered by left panel checkboxes
  const displayedTasks = useMemo(() => {
    return filteredTasks.filter(t => {
      if (filterType.urgentOnly && t.priority !== 'urgent') return false;
      if (!filterType.completed && t.status === 'done') return false;
      return true;
    });
  }, [filteredTasks, filterType]);

  // Nearest reminder task for the dark teal widget card
  const upcomingTask = useMemo(() => {
    const active = displayedTasks.filter(t => t.status !== 'done');
    if (active.length === 0) return null;
    return active.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];
  }, [displayedTasks]);

  // Time grid rows: 09 AM to 05 PM
  const timeSlots = [
    { label: '09 AM', hour: 9 },
    { label: '10 AM', hour: 10 },
    { label: '11 AM', hour: 11 },
    { label: '12 PM', hour: 12 },
    { label: '01 PM', hour: 13 },
    { label: '02 PM', hour: 14 },
    { label: '03 PM', hour: 15 },
    { label: '04 PM', hour: 16 },
    { label: '05 PM', hour: 17 },
  ];

  // Palette generator for event cards matching reference pastel look
  const getEventCardStyle = (index: number) => {
    const styles = [
      {
        bg: 'bg-[#FCE7F3] dark:bg-pink-950/40 border-l-[4px] border-[#EC4899]',
        text: 'text-[#9D174D] dark:text-pink-200',
        subtext: 'text-[#BE185D] dark:text-pink-300',
      },
      {
        bg: 'bg-[#F3E8FF] dark:bg-purple-950/40 border-l-[4px] border-[#A855F7]',
        text: 'text-[#6B21A8] dark:text-purple-200',
        subtext: 'text-[#7E22CE] dark:text-purple-300',
      },
      {
        bg: 'bg-[#FEF3C7] dark:bg-amber-950/40 border-l-[4px] border-[#F59E0B]',
        text: 'text-[#92400E] dark:text-amber-200',
        subtext: 'text-[#B45309] dark:text-amber-300',
      },
      {
        bg: 'bg-[#E0F2FE] dark:bg-sky-950/40 border-l-[4px] border-[#0284C7]',
        text: 'text-[#075985] dark:text-sky-200',
        subtext: 'text-[#0369A1] dark:text-sky-300',
      },
      {
        bg: 'bg-[#E6F4EA] dark:bg-emerald-950/40 border-l-[4px] border-[#10B981]',
        text: 'text-[#065F46] dark:text-emerald-200',
        subtext: 'text-[#047857] dark:text-emerald-300',
      },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden p-3.5 sm:p-5 gap-5 text-slate-800 dark:text-readable">
      
      {/* ========================================================
          LEFT COLUMN: Mini Calendar, Meeting Reminder, Filters
          ======================================================== */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
        
        {/* 1. Mini Month Calendar Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {/* Month & Nav Chevrons */}
          <div className="flex items-center justify-between pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {monthNames[miniCalMonth]} {miniCalYear}
            </h3>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleMiniPrev}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleMiniNext}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Initials (S M T W T F S) */}
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 pb-2">
            {daysOfWeekShort.map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-7 text-center text-xs gap-y-1">
            {Array.from({ length: miniFirstDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} className="p-1 text-slate-300 dark:text-slate-700" />
            ))}

            {Array.from({ length: miniDaysInMonth }).map((_, i) => {
              const dNum = i + 1;
              const isSelected = 
                dNum === selectedDate.getDate() &&
                miniCalMonth === selectedDate.getMonth() &&
                miniCalYear === selectedDate.getFullYear();

              const isToday = 
                dNum === new Date().getDate() &&
                miniCalMonth === new Date().getMonth() &&
                miniCalYear === new Date().getFullYear();

              return (
                <button
                  key={dNum}
                  onClick={() => {
                    const newD = new Date(miniCalYear, miniCalMonth, dNum);
                    setSelectedDate(newD);
                  }}
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : isToday
                      ? 'border border-blue-500 text-blue-600 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {dNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Meeting Reminder Card (Royal Blue Card matching Login Theme) */}
        {upcomingTask ? (
          <div 
            onClick={() => setSelectedTaskId(upcomingTask.id)}
            className="p-4 rounded-3xl bg-linear-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] text-white shadow-md shadow-blue-500/15 relative overflow-hidden transition hover:shadow-lg cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-blue-200/90 tracking-wide">
                Meeting reminder
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider text-white">
                {upcomingTask.priority}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {upcomingTask.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-blue-100/90">
                <Clock className="w-3.5 h-3.5 text-blue-200" />
                <span>09:00 - 10:30 WIB • {upcomingTask.dueDate}</span>
              </div>
            </div>

            {/* Attendees Avatar Cluster & Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center -space-x-1.5">
                {users.slice(0, 4).map((u) => (
                  <div key={u.id} className="ring-2 ring-[#2563EB] rounded-full">
                    <UserAvatar src={u.avatar} name={u.name} size="xs" />
                  </div>
                ))}
                {users.length > 4 && (
                  <span className="text-[10px] font-bold text-white pl-2">
                    +{users.length - 4}
                  </span>
                )}
              </div>

              {/* Quick Action Checkmark Button */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTaskStatus(upcomingTask.id, 'done');
                  }}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
                  title="Tandai Selesai"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-linear-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] text-white shadow-md shadow-blue-500/15 space-y-2">
            <span className="text-[11px] text-blue-200/90">Meeting reminder</span>
            <p className="text-xs text-blue-100">Semua tugas dan jadwal terdekat telah selesai dikerjakan.</p>
          </div>
        )}

        {/* 3. Filters Checkbox Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Filters</span>
            <FilterIcon className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterType.meetingsOnly}
                onChange={(e) => setFilterType(prev => ({ ...prev, meetingsOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-[#2563EB]"
              />
              <span className="font-medium">Meetings &amp; Sesi Tim</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterType.urgentOnly}
                onChange={(e) => setFilterType(prev => ({ ...prev, urgentOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-[#2563EB]"
              />
              <span className="font-medium">Prioritas Urgent Saja</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterType.completed}
                onChange={(e) => setFilterType(prev => ({ ...prev, completed: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-[#2563EB]"
              />
              <span className="font-medium">Tampilkan Tugas Selesai</span>
            </label>
          </div>
        </div>

        {/* 4. Project Selector Dropdown */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">Scope Project</span>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <FolderKanban className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Project (Global)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{p.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* ========================================================
          RIGHT COLUMN: Main Schedule View (Weekly Time Grid)
          ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
        
        {/* Top Schedule Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          
          {/* Navigation Date Header: "< June, 18 2025 >" */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPeriod}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {monthNames[selectedDate.getMonth()]}, {selectedDate.getDate()} {selectedDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextPeriod}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mode View Switcher Pills (Daily, Weekly, Monthly) */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs">
            <button
              onClick={() => setMode('daily')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                mode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setMode('weekly')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                mode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setMode('monthly')}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                mode === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Create Event Button (Royal Blue Pill Button matching Login Page) */}
          <button
            onClick={() => openCreateTaskModal('todo')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-linear-to-r from-[#4D96FF] to-[#2563EB] hover:from-[#3B82F6] hover:to-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Mode = Weekly (Matching Reference Layout) */}
        {mode === 'weekly' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {/* Days Header Row */}
            <div className="grid grid-cols-8 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 sticky top-0 z-10 shrink-0">
              {/* Top Left Timezone Cell */}
              <div className="p-3 text-center flex flex-col items-center justify-center border-r border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold font-mono text-slate-400">GMT+07</span>
                <span className="text-[9px] text-blue-600 font-bold">WIB</span>
              </div>

              {/* 7 Days Columns */}
              {weekDays.map((d, idx) => {
                const isSelected = toDateString(d) === toDateString(selectedDate);
                const isToday = toDateString(d) === toDateString(new Date());

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(d)}
                    className={`p-2.5 text-center transition cursor-pointer flex flex-col items-center justify-center border-r border-slate-200/60 dark:border-slate-800 ${
                      isSelected 
                        ? 'bg-blue-500/10 dark:bg-blue-500/20' 
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {dayLabels[d.getDay()]}
                    </span>
                    <span className={`text-base font-extrabold ${
                      isSelected 
                        ? 'text-[#2563EB] dark:text-blue-400' 
                        : isToday 
                        ? 'text-blue-600' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Body */}
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {timeSlots.map((slot, sIdx) => (
                <div key={slot.hour} className="grid grid-cols-8 min-h-23.75 relative">
                  
                  {/* Left Hour Label */}
                  <div className="p-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 border-r border-slate-200/60 dark:border-slate-800 flex items-start justify-center">
                    {slot.label}
                  </div>

                  {/* 7 Day Slot Cells */}
                  {weekDays.map((d, dIdx) => {
                    const dateStr = toDateString(d);
                    
                    // Filter tasks scheduled on this day
                    const dayTasks = displayedTasks.filter(t => 
                      dateStr >= t.startDate && dateStr <= t.dueDate
                    );

                    // Distribute tasks across hours deterministically
                    const hourTasks = dayTasks.filter((t, tIdx) => {
                      const hashHour = 9 + (t.title.length + tIdx * 2) % 8;
                      return hashHour === slot.hour;
                    });

                    return (
                      <div
                        key={dIdx}
                        className="p-1.5 border-r border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition flex flex-col gap-1.5 overflow-hidden"
                      >
                        {hourTasks.map((t, tIdx) => {
                          const style = getEventCardStyle(t.id.charCodeAt(t.id.length - 1) + tIdx);
                          const primaryAssignee = users.find(u => u.id === t.assigneeIds[0]);

                          return (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTaskId(t.id)}
                              className={`p-2.5 rounded-2xl ${style.bg} transition-all hover:scale-[1.02] shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between space-y-1.5`}
                            >
                              <div className="space-y-0.5">
                                <h5 className={`text-[11.5px] font-bold ${style.text} leading-tight line-clamp-2`}>
                                  {t.title}
                                </h5>
                                <div className={`flex items-center gap-1 text-[10px] ${style.subtext}`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{slot.label} - {slot.hour + 1}:00</span>
                                </div>
                              </div>

                              {/* Assignee Avatar Stack */}
                              <div className="flex items-center justify-between pt-0.5">
                                <div className="flex items-center -space-x-1">
                                  {primaryAssignee && (
                                    <UserAvatar src={primaryAssignee.avatar} name={primaryAssignee.name} size="xs" />
                                  )}
                                  {t.assigneeIds.length > 1 && (
                                    <span className={`text-[9px] font-bold ${style.subtext} pl-1`}>
                                      +{t.assigneeIds.length - 1}
                                    </span>
                                  )}
                                </div>

                                {t.aiRisk && t.aiRisk.riskLevel === 'high' && (
                                  <span title={t.aiRisk.reason}>
                                    <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode = Daily View */}
        {mode === 'daily' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-auto p-4 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Jadwal Harian: {dayLabelsId[selectedDate.getDay()]}, {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {displayedTasks.filter(t => toDateString(selectedDate) >= t.startDate && toDateString(selectedDate) <= t.dueDate).length} Tugas &amp; Pertemuan terjadwal
                </p>
              </div>
              <button
                onClick={() => openCreateTaskModal('todo')}
                className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs"
              >
                + Tambah Jadwal Hari Ini
              </button>
            </div>

            <div className="space-y-3">
              {displayedTasks.filter(t => toDateString(selectedDate) >= t.startDate && toDateString(selectedDate) <= t.dueDate).map((t, idx) => {
                const style = getEventCardStyle(idx);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className={`p-4 rounded-2xl ${style.bg} border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition hover:shadow-md`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${style.text} bg-white/60 dark:bg-slate-900/60`}>
                          {t.priority}
                        </span>
                        <span className={`text-xs ${style.subtext}`}>
                          {t.startDate} → {t.dueDate}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold ${style.text}`}>{t.title}</h4>
                      {t.description && <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{t.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {users.slice(0, 3).map(u => (
                        <UserAvatar key={u.id} src={u.avatar} name={u.name} size="sm" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode = Monthly View (Preserving Full Month Grid with Date Click Pop-up) */}
        {mode === 'monthly' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center text-xs font-bold text-slate-500 py-2.5">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 overflow-auto">
              {Array.from({ length: miniFirstDayIndex }).map((_, i) => (
                <div key={`m-empty-${i}`} className="bg-slate-50/30 dark:bg-slate-950/20 p-2 min-h-21.25" />
              ))}

              {Array.from({ length: miniDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedDate = `${miniCalYear}-${String(miniCalMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayTasks = displayedTasks.filter(t => formattedDate >= t.startDate && formattedDate <= t.dueDate);
                const isToday = dayNum === new Date().getDate() && miniCalMonth === new Date().getMonth() && miniCalYear === new Date().getFullYear();

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      setSelectedDateDetail({
                        dateStr: formattedDate,
                        formattedDateDisplay: new Date(miniCalYear, miniCalMonth, dayNum).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }),
                        tasks: dayTasks
                      });
                    }}
                    className={`p-2 min-h-21.25 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer select-none ${
                      isToday ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-[#2563EB] text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {dayNum}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dayTasks.length} tugas
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 my-1 overflow-y-auto max-h-14">
                      {dayTasks.slice(0, 2).map((t, idx) => {
                        const style = getEventCardStyle(idx);
                        return (
                          <div
                            key={t.id}
                            className={`p-1 rounded-md text-[9.5px] truncate font-semibold ${style.bg} ${style.text}`}
                          >
                            {t.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold block">
                          +{dayTasks.length - 2} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Date Detail Pop-up Modal (When clicked in Monthly mode) */}
      {selectedDateDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-slate-800 dark:text-slate-100"
          onClick={() => setSelectedDateDetail(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
                    {selectedDateDetail.formattedDateDisplay}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedDateDetail.tasks.length} Tugas pada tanggal ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDateDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {selectedDateDetail.tasks.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Tidak ada tugas yang dijadwalkan pada tanggal ini.
                </div>
              ) : (
                selectedDateDetail.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedDateDetail(null);
                      setSelectedTaskId(task.id);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-blue-500/50 transition cursor-pointer space-y-2 shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {task.startDate} → {task.dueDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">
                      {task.title}
                    </h4>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
