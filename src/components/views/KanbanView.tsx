import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { TaskCard } from '../tasks/TaskCard';
import { TaskStatus, TaskPriority } from '../../types';
import { 
  Filter, 
  Sparkles, 
  X, 
  FolderKanban, 
  Users, 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal,
  PenSquare
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const KanbanView: React.FC = () => {
  const {
    filteredTasks,
    setIsCreateModalOpen,
    openCreateTaskModal,
    setIsAIBreakdownModalOpen,
    users,
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    filters,
    setFilters,
    resetFilters,
    moveTaskStatus,
  } = useProject();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const columns: { id: TaskStatus; label: string; dotColor: string }[] = [
    { id: 'todo', label: 'To Do List', dotColor: 'bg-[#EF4444]' },
    { id: 'in_progress', label: 'In Progress', dotColor: 'bg-[#F59E0B]' },
    { id: 'review', label: 'In Review', dotColor: 'bg-[#8B5CF6]' },
    { id: 'done', label: 'Done', dotColor: 'bg-[#10B981]' },
    { id: 'backlog', label: 'Backlog', dotColor: 'bg-[#94A3B8]' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, status);
      setDraggedTaskId(null);
    }
  };

  const hasActiveFilters = Boolean(filters.searchQuery || filters.assigneeId || filters.priority || filters.status || filters.tag);

  // Dynamic Date Display matching "April / Today is Saturday, April 6th, 2024"
  const now = new Date();
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now);
  const todaySubtitle = `Hari ini adalah ${new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(now)}`;

  // Active Project Assignees for team cluster
  const activeProjectUsers = users.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 space-y-4 text-slate-800 dark:text-readable">
      
      {/* Subheader Toolbar matching Reference Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-white/5 shrink-0">
        
        {/* Left: Month Title & Date Subtitle */}
        <div className="flex flex-col text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
            {monthName}
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
            {todaySubtitle}
          </span>
        </div>

        {/* Center: Board Switcher & Team Avatars Cluster */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Board Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Board -</span>
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Members Overlapping Cluster */}
          <div className="hidden sm:flex items-center -space-x-2 overflow-hidden pl-1">
            {activeProjectUsers.map((u, i) => (
              <div key={u.id} className="ring-2 ring-white dark:ring-slate-900 rounded-full" title={u.name}>
                <UserAvatar src={u.avatar} name={u.name} size="xs" />
              </div>
            ))}
            {users.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                +{users.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Right: Filters, AI Breakdown, Create Task Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterBarOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition shadow-2xs cursor-pointer ${
              isFilterBarOpen || hasActiveFilters
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* AI Breakdown Button */}
          <button
            onClick={() => setIsAIBreakdownModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition active:scale-95 cursor-pointer"
            title="AI Sub-tugas Breakdown"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI Plan</span>
          </button>

          {/* Create Task Button (Exact obantor reference button) */}
          <button
            onClick={() => openCreateTaskModal('todo')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Create task</span>
          </button>
        </div>

      </div>

      {/* Expandable Filter Toolbar (When Filters clicked or active) */}
      {isFilterBarOpen && (
        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-wrap items-center gap-3 animate-fade-in shrink-0">
          {/* Assignee Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.assigneeId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value || null }))}
              className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Anggota Tim</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: (e.target.value as TaskPriority) || null }))}
              className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Prioritas</option>
              <option value="urgent">Urgent / Mendesak</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition"
            >
              <X className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}

          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono ml-auto">
            {filteredTasks.length} tugas ditemukan
          </span>
        </div>
      )}

      {/* Kanban Board Columns Container:
          - Mobile: flex-col, overflow-y-auto (scrolls up & down naturally)
          - Desktop (md+): flex-row, overflow-x-auto, rounded column boxes
      */}
      <div 
        className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto pb-6 md:pb-2 md:items-stretch"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isCollapsed = Boolean(collapsedColumns[col.id]);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col w-full md:w-auto md:h-full md:min-w-[280px] lg:min-w-[300px] lg:flex-1 shrink-0 rounded-[24px] bg-[#F2F4F3]/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 p-3.5 transition shadow-2xs"
            >
              {/* Column Header: Dot + Label */}
              <div 
                onClick={() => toggleColumnCollapse(col.id)}
                className="flex items-center justify-between pb-2 shrink-0 cursor-pointer md:cursor-default select-none"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {col.label}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    ({colTasks.length})
                  </span>
                </div>

                {/* Mobile Accordion Toggle */}
                <div className="md:hidden flex items-center gap-1 text-slate-400">
                  <span className="text-[10px]">
                    {isCollapsed ? 'Buka' : 'Tutup'}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {/* Sub-header Quick Add "+" Pill Button (Exact obantor style) */}
              <div className={`${isCollapsed ? 'hidden md:block' : 'block'} pb-3 shrink-0`}>
                <button
                  type="button"
                  onClick={() => openCreateTaskModal(col.id)}
                  className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-2xs text-xs font-bold transition flex items-center justify-center cursor-pointer hover:border-slate-300"
                  title={`Tambah tugas ke ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List Column Area */}
              <div 
                className={`${isCollapsed ? 'hidden md:block' : 'block'} space-y-3 md:flex-1 md:overflow-y-auto min-h-[40px] md:min-h-[120px] pr-0.5`}
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing transition-transform active:scale-[0.98]"
                  >
                    <TaskCard task={task} />
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="py-8 rounded-[18px] border border-dashed border-slate-300/80 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                    Tidak ada tugas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
