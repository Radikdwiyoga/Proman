import React from 'react';
import { Task, TaskStatus } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  AlertTriangle, 
  ArrowRight,
  MoreHorizontal,
  Flag,
  CheckCircle2
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface TaskCardProps {
  task: Task;
}

const getTagBadgeStyle = (tag: string, index: number) => {
  const lower = tag.toLowerCase();
  if (lower.includes('data')) return 'bg-[#3B82F6] text-white';
  if (lower.includes('analysis') || lower.includes('analisis')) return 'bg-[#A855F7] text-white';
  if (lower.includes('web') || lower.includes('frontend') || lower.includes('ui')) return 'bg-[#F87171] text-white';
  if (lower.includes('ux') || lower.includes('design') || lower.includes('desain')) return 'bg-[#8B5CF6] text-white';
  if (lower.includes('illustrat') || lower.includes('asset') || lower.includes('grafis')) return 'bg-[#F97316] text-white';
  if (lower.includes('backend') || lower.includes('api') || lower.includes('infra')) return 'bg-[#06B6D4] text-white';
  if (lower.includes('sec') || lower.includes('keamanan') || lower.includes('auth')) return 'bg-[#EC4899] text-white';

  const palette = [
    'bg-[#3B82F6] text-white',
    'bg-[#A855F7] text-white',
    'bg-[#F87171] text-white',
    'bg-[#F97316] text-white',
    'bg-[#10B981] text-white',
    'bg-[#6366F1] text-white',
  ];
  return palette[index % palette.length];
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { setSelectedTaskId, users, moveTaskStatus } = useProject();

  const primaryAssignee = users.find(u => u.id === task.assigneeIds[0]);

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const subtasksTotal = task.subtasks.length;
  const subtaskProgress = subtasksTotal > 0 ? Math.round((completedSubtasks / subtasksTotal) * 100) : 0;

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case 'backlog': return 'todo';
      case 'todo': return 'in_progress';
      case 'in_progress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
    }
  };

  const nextStatus = getNextStatus(task.status);

  // Format date nicely (e.g. "April 6" or "15 Okt")
  const formatCardDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', { month: 'short', day: 'numeric' }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={() => setSelectedTaskId(task.id)}
      className="group relative rounded-[20px] bg-white dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 p-4 transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3"
    >
      {/* Top Row: Colorful Tag Chips & Action Dots (Matching Reference) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.tags.length > 0 ? (
            task.tags.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx} 
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-2xs tracking-wide ${getTagBadgeStyle(tag, idx)}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              General
            </span>
          )}

          {/* Priority Pill if Urgent or High */}
          {(task.priority === 'urgent' || task.priority === 'high') && (
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            }`}>
              {task.priority}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* AI Predictive Risk Icon */}
          {task.aiRisk && task.aiRisk.riskLevel === 'high' && (
            <div 
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-[9.5px] font-bold"
              title={`Peringatan Risiko: ${task.aiRisk.reason}`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>Delay ~{task.aiRisk.predictedDelayDays}h</span>
            </div>
          )}

          <button 
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTaskId(task.id);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Title & Description */}
      <div className="space-y-1">
        <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Progress Bar / Checklist (Exact Reference Style: "Project Progress 42%") */}
      {subtasksTotal > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Project Progress</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-[11px]">{subtaskProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                subtaskProgress === 100 
                  ? 'bg-emerald-500' 
                  : subtaskProgress >= 50 
                  ? 'bg-emerald-500' 
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info: Assignee Avatar, Due Date Flag, Comments Count */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
        {/* Left: Assignee Avatar with fail-safe fallback */}
        <div className="flex items-center gap-2">
          {primaryAssignee ? (
            <UserAvatar 
              src={primaryAssignee.avatar} 
              name={primaryAssignee.name} 
              size="xs" 
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
              ?
            </div>
          )}
        </div>

        {/* Right: Due Date & Comments Counter */}
        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-400 font-medium">
          {task.dueDate && (
            <div className="flex items-center gap-1" title={`Jatuh tempo: ${task.dueDate}`}>
              <Flag className="w-3 h-3 text-slate-400" />
              <span>{formatCardDate(task.dueDate)}</span>
            </div>
          )}

          {task.commentsCount > 0 && (
            <div className="flex items-center gap-1" title={`${task.commentsCount} komentar`}>
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>{task.commentsCount}</span>
            </div>
          )}

          {nextStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveTaskStatus(task.id, nextStatus);
              }}
              className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 transition"
              title={`Pindahkan ke ${nextStatus.toUpperCase()}`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
