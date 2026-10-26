import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Calendar, 
  AlertTriangle, 
  FolderKanban, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Layers,
  Sparkles,
  User as UserIcon,
  CornerDownRight,
  ExternalLink,
  CheckCircle2,
  ListTodo,
  Filter,
  Printer
} from 'lucide-react';
import { Task, Subtask, TaskStatus, TaskPriority, User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

// Fixed synchronized row height in pixels
const ROW_HEIGHT = 52;

// WBS Color Palettes — matching the reference image themes
interface WbsPalette {
  name: string;
  parentBg: string;
  parentBorder: string;
  parentFill: string;
  parentText: string;
  childBg: string;
  childBorder: string;
  childFill: string;
  childBarBg: string;
  lineColor: string;
  badge: string;
  dotBg: string;
}

const WBS_PALETTES: WbsPalette[] = [
  {
    name: 'amber',
    parentBg: 'bg-amber-500 hover:bg-amber-400',
    parentBorder: 'border-amber-400',
    parentFill: '#f59e0b',
    parentText: 'text-slate-950 font-bold',
    childBg: 'bg-amber-100 dark:bg-amber-950/40',
    childBorder: 'border-amber-300 dark:border-amber-600/70',
    childFill: 'bg-amber-500',
    childBarBg: 'bg-amber-200/90 dark:bg-amber-500/35 border-amber-400/90 dark:border-amber-400/60 text-amber-950 dark:text-amber-200',
    lineColor: '#f59e0b',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
    dotBg: 'bg-amber-500'
  },
  {
    name: 'emerald',
    parentBg: 'bg-emerald-500 hover:bg-emerald-400',
    parentBorder: 'border-emerald-400',
    parentFill: '#10b981',
    parentText: 'text-slate-950 font-bold',
    childBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    childBorder: 'border-emerald-300 dark:border-emerald-600/70',
    childFill: 'bg-emerald-500',
    childBarBg: 'bg-emerald-200/90 dark:bg-emerald-500/35 border-emerald-400/90 dark:border-emerald-400/60 text-emerald-950 dark:text-emerald-200',
    lineColor: '#10b981',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
    dotBg: 'bg-emerald-500'
  },
  {
    name: 'orange',
    parentBg: 'bg-orange-500 hover:bg-orange-400',
    parentBorder: 'border-orange-400',
    parentFill: '#f97316',
    parentText: 'text-white font-bold',
    childBg: 'bg-orange-100 dark:bg-orange-950/40',
    childBorder: 'border-orange-300 dark:border-orange-600/70',
    childFill: 'bg-orange-500',
    childBarBg: 'bg-orange-200/90 dark:bg-orange-500/35 border-orange-400/90 dark:border-orange-400/60 text-orange-950 dark:text-orange-200',
    lineColor: '#f97316',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-700/60',
    dotBg: 'bg-orange-500'
  },
  {
    name: 'cyan',
    parentBg: 'bg-cyan-500 hover:bg-cyan-400',
    parentBorder: 'border-cyan-400',
    parentFill: '#06b6d4',
    parentText: 'text-slate-950 font-bold',
    childBg: 'bg-cyan-100 dark:bg-cyan-950/40',
    childBorder: 'border-cyan-300 dark:border-cyan-600/70',
    childFill: 'bg-cyan-500',
    childBarBg: 'bg-cyan-200/90 dark:bg-cyan-500/35 border-cyan-400/90 dark:border-cyan-400/60 text-cyan-950 dark:text-cyan-200',
    lineColor: '#06b6d4',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60',
    dotBg: 'bg-cyan-500'
  },
  {
    name: 'rose',
    parentBg: 'bg-rose-500 hover:bg-rose-400',
    parentBorder: 'border-rose-400',
    parentFill: '#f43f5e',
    parentText: 'text-white font-bold',
    childBg: 'bg-rose-100 dark:bg-rose-950/40',
    childBorder: 'border-rose-300 dark:border-rose-600/70',
    childFill: 'bg-rose-500',
    childBarBg: 'bg-rose-200/90 dark:bg-rose-500/35 border-rose-400/90 dark:border-rose-400/60 text-rose-950 dark:text-rose-200',
    lineColor: '#f43f5e',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    dotBg: 'bg-rose-500'
  },
  {
    name: 'violet',
    parentBg: 'bg-violet-500 hover:bg-violet-400',
    parentBorder: 'border-violet-400',
    parentFill: '#8b5cf6',
    parentText: 'text-white font-bold',
    childBg: 'bg-violet-100 dark:bg-violet-950/40',
    childBorder: 'border-violet-300 dark:border-violet-600/70',
    childFill: 'bg-violet-500',
    childBarBg: 'bg-violet-200/90 dark:bg-violet-500/35 border-violet-400/90 dark:border-violet-400/60 text-violet-950 dark:text-violet-200',
    lineColor: '#8b5cf6',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border-violet-300 dark:border-violet-700/60',
    dotBg: 'bg-violet-500'
  },
];

// Helper to format date strings YYYY-MM-DD
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  if (!s) return new Date();
  const parts = s.split('-').map(Number);
  return new Date(parts[0] || 2026, (parts[1] || 1) - 1, parts[2] || 1);
}

function addDays(d: Date, n: number): Date {
  const res = new Date(d);
  res.setDate(res.getDate() + n);
  return res;
}

function daysDiff(from: Date, to: Date): number {
  const f = new Date(from);
  f.setHours(0, 0, 0, 0);
  const t = new Date(to);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - f.getTime()) / (1000 * 60 * 60 * 24));
}

// Flat Visible Row interface used by both left and right synchronized panels
interface VisibleRow {
  id: string; // unique row id (parent task id or unique child row id)
  type: 'parent' | 'child';
  taskId: string; // original Task ID
  subtaskId?: string; // subtask ID if child
  title: string;
  startDate: string;
  dueDate: string;
  durationDays: number;
  progress: number;
  assignee?: User;
  status: TaskStatus;
  priority?: TaskPriority;
  palette: WbsPalette;
  isExpanded?: boolean;
  subtaskCount?: number;
  hasChildren?: boolean;
  parentRowId?: string; // Links back to parent task ID
  childOrderIndex?: number; // 0, 1, 2... within the parent
  aiRisk?: Task['aiRisk'];
  // Calculated horizontal bar metrics (relative to calendar grid origin)
  barLeft: number;
  barWidth: number;
  barRight: number;
  centerY: number;
  rowIndex: number;
}

export const TimelineView: React.FC = () => {
  const { 
    tasks, 
    setSelectedTaskId, 
    users, 
    projects, 
    currentProjectId, 
    setCurrentProjectId 
  } = useProject();

  const { language } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState<'days' | 'weeks'>('days');
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // New Filters per User Request:
  // 1) Filter per Orang (Assignee / PIC)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  // 2) Filter per Tugas (Specific Parent Task)
  const [selectedTaskIdFilter, setSelectedTaskIdFilter] = useState<string>('all');
  // 3) Sembunyikan Tugas yang Selesai (Hide Completed - default true)
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Single Project Mode Enforcement:
  // Must require exactly 1 specific project. If 'all' or invalid, pick first active project.
  useEffect(() => {
    if ((!currentProjectId || currentProjectId === 'all') && projects.length > 0) {
      const firstActive = projects.find(p => p.status === 'active') || projects[0];
      if (firstActive) {
        setCurrentProjectId(firstActive.id);
      }
    }
  }, [currentProjectId, projects, setCurrentProjectId]);

  // Reset Task & Assignee Filter when changing active project
  useEffect(() => {
    setSelectedTaskIdFilter('all');
    setSelectedAssigneeId('all');
  }, [currentProjectId]);

  const activeProject = useMemo(() => {
    return projects.find(p => p.id === currentProjectId) || projects[0];
  }, [projects, currentProjectId]);

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  // All unfiltered tasks of the active project
  const allProjectTasks = useMemo(() => {
    if (!activeProject) return [];
    return tasks.filter(t => t.projectId === activeProject.id);
  }, [tasks, activeProject]);

  // Assignees involved in this project (for the Assignee Filter dropdown)
  const projectAssignees = useMemo(() => {
    const ids = new Set<string>();
    allProjectTasks.forEach(t => {
      (t.assigneeIds || []).forEach(id => ids.add(id));
      (t.subtasks || []).forEach(st => {
        if (st.assigneeId) ids.add(st.assigneeId);
      });
    });
    return users.filter(u => ids.has(u.id));
  }, [allProjectTasks, users]);

  // Parent tasks in this project (for the Task Filter dropdown)
  // Adjusted by selected PIC (assignee) & hideCompleted setting
  const parentTasksList = useMemo(() => {
    let list = allProjectTasks.filter(t => !t.parentId);

    if (hideCompleted) {
      list = list.filter(t => t.status !== 'done');
    }

    if (selectedAssigneeId !== 'all') {
      list = list.filter(t => {
        const isAssignedParent = (t.assigneeIds || []).includes(selectedAssigneeId);
        const isAssignedSubtask = (t.subtasks || []).some(st => st.assigneeId === selectedAssigneeId);
        return isAssignedParent || isAssignedSubtask;
      });
    }

    return list;
  }, [allProjectTasks, selectedAssigneeId, hideCompleted]);

  // When changing PIC / Assignee, reset task filter to 'all' so that PIC's full task list is visible
  useEffect(() => {
    setSelectedTaskIdFilter('all');
  }, [selectedAssigneeId]);

  // If the currently selected task is no longer in parentTasksList, reset to 'all'
  useEffect(() => {
    if (selectedTaskIdFilter !== 'all') {
      const exists = parentTasksList.some(t => t.id === selectedTaskIdFilter);
      if (!exists) {
        setSelectedTaskIdFilter('all');
      }
    }
  }, [parentTasksList, selectedTaskIdFilter]);

  // Filter tasks based on:
  // 1. hideCompleted: exclude tasks with status === 'done'
  // 2. selectedTaskIdFilter: match specific task
  // 3. selectedAssigneeId: match assignee on parent or subtasks
  const projectTasks = useMemo(() => {
    if (!activeProject) return [];
    let filtered = allProjectTasks;

    // Filter out completed tasks if hideCompleted is true
    if (hideCompleted) {
      filtered = filtered.filter(t => t.status !== 'done');
    }

    // Filter by specific task
    if (selectedTaskIdFilter !== 'all') {
      filtered = filtered.filter(t => t.id === selectedTaskIdFilter || t.parentId === selectedTaskIdFilter);
    }

    // Filter by assignee
    if (selectedAssigneeId !== 'all') {
      filtered = filtered.filter(t => {
        const isAssignedParent = (t.assigneeIds || []).includes(selectedAssigneeId);
        const isAssignedSubtask = (t.subtasks || []).some(st => st.assigneeId === selectedAssigneeId);
        return isAssignedParent || isAssignedSubtask;
      });
    }

    return filtered;
  }, [allProjectTasks, hideCompleted, selectedTaskIdFilter, selectedAssigneeId]);

  // Today string reference
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const todayDate = useMemo(() => new Date(), []);

  // Determine global timeline date boundaries based on project tasks
  const { timelineStartDate, totalDaysSpan } = useMemo(() => {
    let minD = new Date(todayDate);
    minD.setDate(minD.getDate() - 7);
    let maxD = new Date(todayDate);
    maxD.setDate(maxD.getDate() + 28);

    if (projectTasks.length > 0) {
      projectTasks.forEach(t => {
        if (t.startDate) {
          const s = parseDate(t.startDate);
          if (s < minD) minD = s;
        }
        if (t.dueDate) {
          const d = parseDate(t.dueDate);
          if (d > maxD) maxD = d;
        }
      });
    }

    // Add padding to ensure smooth scroll viewport & room for dependencies
    const startPadded = new Date(minD);
    startPadded.setDate(startPadded.getDate() - 5);
    startPadded.setHours(0, 0, 0, 0);

    const endPadded = new Date(maxD);
    endPadded.setDate(endPadded.getDate() + 14);
    endPadded.setHours(0, 0, 0, 0);

    const totalDays = Math.max(35, daysDiff(startPadded, endPadded) + 1);

    return {
      timelineStartDate: startPadded,
      totalDaysSpan: totalDays
    };
  }, [projectTasks, todayDate]);

  // Cell Width settings
  const dayCellWidth = 44;
  const weekCellWidth = 148;

  // Calendar Columns Generation (Days & Weeks)
  const daysColumns = useMemo(() => {
    return Array.from({ length: totalDaysSpan }, (_, i) => {
      const d = addDays(timelineStartDate, i);
      const dateStr = formatDate(d);
      const isToday = dateStr === todayStr;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      return {
        date: d,
        dateStr,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { weekday: 'short' }),
        monthName: d.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { month: 'short' }),
        year: d.getFullYear(),
        isToday,
        isWeekend
      };
    });
  }, [totalDaysSpan, timelineStartDate, todayStr, language]);

  // Group columns into Month Headers (Tier 1 header)
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number; width: number }[] = [];
    if (daysColumns.length === 0) return groups;

    let currentMonth = daysColumns[0].monthName + ' ' + daysColumns[0].year;
    let count = 0;

    daysColumns.forEach((col, idx) => {
      const mLabel = col.monthName + ' ' + col.year;
      if (mLabel === currentMonth) {
        count++;
      } else {
        groups.push({
          label: currentMonth,
          count,
          width: count * dayCellWidth
        });
        currentMonth = mLabel;
        count = 1;
      }
      if (idx === daysColumns.length - 1) {
        groups.push({
          label: currentMonth,
          count,
          width: count * dayCellWidth
        });
      }
    });

    return groups;
  }, [daysColumns]);

  // Weekly columns
  const weeksCount = useMemo(() => Math.ceil(totalDaysSpan / 7), [totalDaysSpan]);
  const weeksColumns = useMemo(() => {
    return Array.from({ length: weeksCount }, (_, i) => {
      const startD = addDays(timelineStartDate, i * 7);
      const endD = addDays(startD, 6);
      const label = language === 'en' ? `W${i + 1}` : `Mgg ${i + 1}`;
      const sublabel = `${startD.getDate()} ${startD.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { month: 'short' })}`;
      return {
        weekIndex: i,
        startDate: startD,
        endDate: endD,
        label,
        sublabel
      };
    });
  }, [weeksCount, timelineStartDate, language]);

  const totalGridWidth = useMemo(() => {
    return zoomLevel === 'days' ? totalDaysSpan * dayCellWidth : weeksCount * weekCellWidth;
  }, [zoomLevel, totalDaysSpan, weeksCount]);

  // Helper to calculate X pixel coordinates
  const calculateBarMetrics = (startDateStr: string, dueDateStr: string) => {
    const startOffset = Math.max(0, daysDiff(timelineStartDate, parseDate(startDateStr || todayStr)));
    const duration = Math.max(1, daysDiff(parseDate(startDateStr || todayStr), parseDate(dueDateStr || todayStr)) + 1);

    let barLeft = 0;
    let barWidth = 0;

    if (zoomLevel === 'days') {
      barLeft = startOffset * dayCellWidth;
      barWidth = Math.max(dayCellWidth, duration * dayCellWidth);
    } else {
      barLeft = (startOffset / 7) * weekCellWidth;
      barWidth = Math.max(36, (duration / 7) * weekCellWidth);
    }

    return {
      barLeft,
      barWidth,
      barRight: barLeft + barWidth,
      durationDays: duration
    };
  };

  // 2. Build WBS Hierarchy & Flattened Visible Rows (Parent & Sub-tasks)
  // Each task is its own self-contained parent with its own sub-tasks
  const visibleRows = useMemo(() => {
    const rows: VisibleRow[] = [];
    if (!projectTasks || projectTasks.length === 0) return rows;

    // Identify parent tasks (tasks without parentId)
    const parents = projectTasks.filter(t => !t.parentId);
    const childrenByParent = new Map<string, Task[]>();

    projectTasks.forEach(t => {
      if (t.parentId) {
        const list = childrenByParent.get(t.parentId) || [];
        list.push(t);
        childrenByParent.set(t.parentId, list);
      }
    });

    let currentRowIndex = 0;

    parents.forEach((parentTask, pIdx) => {
      const palette = WBS_PALETTES[pIdx % WBS_PALETTES.length];
      const isCollapsed = !!collapsedMap[parentTask.id];

      // Determine sub-tasks for THIS specific task
      const explicitChildren = childrenByParent.get(parentTask.id) || [];
      const checklistSubtasks = parentTask.subtasks || [];
      const hasChildren = explicitChildren.length > 0 || checklistSubtasks.length > 0;
      const totalSubtaskCount = explicitChildren.length > 0 ? explicitChildren.length : checklistSubtasks.length;

      // Calculate Parent start & due date span
      let pStart = parentTask.startDate || todayStr;
      let pDue = parentTask.dueDate || todayStr;

      // Compute progress
      const completedCount = checklistSubtasks.filter(st => st.completed).length;
      const parentProgress = parentTask.status === 'done' 
        ? 100 
        : totalSubtaskCount > 0 
          ? Math.round((completedCount / totalSubtaskCount) * 100) 
          : parentTask.status === 'in_progress' ? 50 : 25;

      const pMetrics = calculateBarMetrics(pStart, pDue);
      const primaryAssignee = userMap.get((parentTask.assigneeIds || [])[0]);

      const parentRowIndex = currentRowIndex++;
      const parentCenterY = parentRowIndex * ROW_HEIGHT + (ROW_HEIGHT / 2);

      // Push Parent Row
      rows.push({
        id: parentTask.id,
        type: 'parent',
        taskId: parentTask.id,
        title: parentTask.title,
        startDate: pStart,
        dueDate: pDue,
        durationDays: pMetrics.durationDays,
        progress: parentProgress,
        assignee: primaryAssignee,
        status: parentTask.status,
        priority: parentTask.priority,
        palette,
        isExpanded: !isCollapsed,
        subtaskCount: totalSubtaskCount,
        hasChildren,
        aiRisk: parentTask.aiRisk,
        barLeft: pMetrics.barLeft,
        barWidth: pMetrics.barWidth,
        barRight: pMetrics.barRight,
        centerY: parentCenterY,
        rowIndex: parentRowIndex
      });

      // If not collapsed, generate and push Sub-task Rows STRICTLY under THIS parent
      if (!isCollapsed && hasChildren) {
        if (explicitChildren.length > 0) {
          const explicitChildrenToProcess = explicitChildren.filter(childTask => {
            if (selectedAssigneeId === 'all') return true;
            if ((childTask.assigneeIds || []).length > 0) return (childTask.assigneeIds || []).includes(selectedAssigneeId);
            return (parentTask.assigneeIds || []).includes(selectedAssigneeId);
          });

          explicitChildrenToProcess.forEach((childTask, cIdx) => {
            const cStart = childTask.startDate || pStart;
            const cDue = childTask.dueDate || pDue;
            const cMetrics = calculateBarMetrics(cStart, cDue);
            const cAssignee = userMap.get((childTask.assigneeIds || [])[0]) || primaryAssignee;
            const cProgress = childTask.status === 'done' ? 100 : childTask.status === 'in_progress' ? 50 : 20;

            const childRowIndex = currentRowIndex++;
            const childCenterY = childRowIndex * ROW_HEIGHT + (ROW_HEIGHT / 2);

            rows.push({
              id: `${parentTask.id}__child__${childTask.id}`,
              type: 'child',
              taskId: parentTask.id,
              subtaskId: childTask.id,
              title: childTask.title,
              startDate: cStart,
              dueDate: cDue,
              durationDays: cMetrics.durationDays,
              progress: cProgress,
              assignee: cAssignee,
              status: childTask.status,
              priority: childTask.priority,
              palette,
              parentRowId: parentTask.id,
              childOrderIndex: cIdx,
              barLeft: cMetrics.barLeft,
              barWidth: cMetrics.barWidth,
              barRight: cMetrics.barRight,
              centerY: childCenterY,
              rowIndex: childRowIndex
            });
          });
        } else if (checklistSubtasks.length > 0) {
          // Derive sequential dates within parent range for checklist subtasks
          const parentStartDate = parseDate(pStart);
          const parentTotalDays = Math.max(checklistSubtasks.length, daysDiff(parentStartDate, parseDate(pDue)) + 1);

          const subtasksToProcess = checklistSubtasks.filter(subtask => {
            if (selectedAssigneeId === 'all') return true;
            if (subtask.assigneeId) return subtask.assigneeId === selectedAssigneeId;
            return (parentTask.assigneeIds || []).includes(selectedAssigneeId);
          });

          subtasksToProcess.forEach((subtask, sIdx) => {
            const n = checklistSubtasks.length;
            const sOffset = Math.floor((sIdx * parentTotalDays) / n);
            const sDuration = Math.max(1, Math.floor(((sIdx + 1) * parentTotalDays) / n) - sOffset);
            const sStartD = addDays(parentStartDate, sOffset);
            const sDueD = addDays(sStartD, sDuration - 1);
            const sStartStr = subtask.startDate || formatDate(sStartD);
            const sDueStr = subtask.dueDate || formatDate(sDueD);

            const sMetrics = calculateBarMetrics(sStartStr, sDueStr);
            const sAssignee = subtask.assigneeId ? userMap.get(subtask.assigneeId) : primaryAssignee;
            const sProgress = subtask.completed ? 100 : (subtask.progress !== undefined ? subtask.progress : (parentTask.status === 'in_progress' ? 40 : 0));

            const childRowIndex = currentRowIndex++;
            const childCenterY = childRowIndex * ROW_HEIGHT + (ROW_HEIGHT / 2);

            rows.push({
              id: `${parentTask.id}__sub__${subtask.id || sIdx}`,
              type: 'child',
              taskId: parentTask.id,
              subtaskId: subtask.id,
              title: subtask.title,
              startDate: sStartStr,
              dueDate: sDueStr,
              durationDays: sMetrics.durationDays,
              progress: sProgress,
              assignee: sAssignee,
              status: subtask.completed ? 'done' : parentTask.status,
              palette,
              parentRowId: parentTask.id,
              childOrderIndex: sIdx,
              barLeft: sMetrics.barLeft,
              barWidth: sMetrics.barWidth,
              barRight: sMetrics.barRight,
              centerY: childCenterY,
              rowIndex: childRowIndex
            });
          });
        }
      }
    });

    return rows;
  }, [projectTasks, collapsedMap, todayStr, timelineStartDate, zoomLevel, userMap]);

  // 3. Compute SVG Dependency Connector Lines
  // CRITICAL: Relasi flow HANYA terjadi di dalam masing-masing tugas (Parent ➔ Subtask 1 ➔ Subtask 2 ...).
  // TIDAK ADA garis yang menghubungkan antar tugas berbeda!
  const dependencyLines = useMemo(() => {
    const lines: {
      key: string;
      d: string;
      color: string;
    }[] = [];

    // Group visible child rows by their parentRowId
    const childrenByParent = new Map<string, VisibleRow[]>();
    const parentRows: VisibleRow[] = [];

    visibleRows.forEach((row) => {
      if (row.type === 'parent') {
        parentRows.push(row);
      } else if (row.type === 'child' && row.parentRowId) {
        const list = childrenByParent.get(row.parentRowId) || [];
        list.push(row);
        childrenByParent.set(row.parentRowId, list);
      }
    });

    // For EACH individual parent task, draw its self-contained flow
    parentRows.forEach((parent) => {
      const children = childrenByParent.get(parent.id) || [];
      if (children.length === 0) return; // No sub-tasks or collapsed

      const groupColor = parent.palette.lineColor;

      // 1) Line from Parent bar to its first child (c0)
      const c0 = children[0];
      const yParent = parent.centerY;
      const yC0 = c0.centerY;
      const xParent = parent.barLeft;
      const xC0 = c0.barLeft;

      // Orthogonal bracket line: steps left from parent start, drops vertically, enters first child
      const stemX = Math.max(6, Math.min(xParent, xC0) - 12);
      const p2cPath = `M ${xParent} ${yParent} H ${stemX} V ${yC0} H ${xC0}`;

      lines.push({
        key: `p2c-${parent.id}-${c0.id}`,
        d: p2cPath,
        color: groupColor
      });

      // 2) Sequential Finish-to-Start lines STRICTLY between sub-tasks of THIS parent task
      for (let i = 0; i < children.length - 1; i++) {
        const currentChild = children[i];
        const nextChild = children[i + 1];

        const xCurrentEnd = currentChild.barRight;
        const yCurrent = currentChild.centerY;
        const xNextStart = nextChild.barLeft;
        const yNext = nextChild.centerY;

        let path = '';
        if (xNextStart >= xCurrentEnd) {
          // Standard Finish-to-Start staircase
          const midX = Math.round((xCurrentEnd + xNextStart) / 2);
          path = `M ${xCurrentEnd} ${yCurrent} H ${midX} V ${yNext} H ${xNextStart}`;
        } else {
          // Parallel or overlapping dates within the same task: clean loop
          const stepRight = xCurrentEnd + 8;
          const yMid = yCurrent + (ROW_HEIGHT / 2);
          const stepLeft = xNextStart - 10;
          path = `M ${xCurrentEnd} ${yCurrent} H ${stepRight} V ${yMid} H ${stepLeft} V ${yNext} H ${xNextStart}`;
        }

        lines.push({
          key: `fs-${currentChild.id}-${nextChild.id}`,
          d: path,
          color: groupColor
        });
      }
      // Note: The last subtask has NO outgoing line. It never connects to another parent task!
    });

    return lines;
  }, [visibleRows]);

  // 4. Auto-Scroll & Focus on Click
  const handleFocusTask = (row: VisibleRow) => {
    setHighlightedId(row.id);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const leftColEl = container.querySelector('.sticky-wbs-column') as HTMLElement;
      const leftWidth = leftColEl ? leftColEl.offsetWidth : 280;
      const viewportWidth = container.clientWidth - leftWidth;

      // Center the bar in the calendar viewport
      const barCenter = row.barLeft + (row.barWidth / 2);
      const targetScrollLeft = Math.max(0, barCenter - (viewportWidth / 2));

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }

    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedId(null);
    }, 2800);
  };

  // Scroll to Today
  const scrollToToday = () => {
    if (!scrollContainerRef.current) return;
    const todayOffsetDays = daysDiff(timelineStartDate, todayDate);
    const offsetPx = zoomLevel === 'days' 
      ? todayOffsetDays * dayCellWidth 
      : (todayOffsetDays / 7) * weekCellWidth;

    const container = scrollContainerRef.current;
    const leftColEl = container.querySelector('.sticky-wbs-column') as HTMLElement;
    const leftWidth = leftColEl ? leftColEl.offsetWidth : 280;
    const viewportWidth = container.clientWidth - leftWidth;

    const targetScroll = Math.max(0, offsetPx - (viewportWidth / 2));
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  const scrollHorizontally = (delta: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Toggle Collapse / Expand
  const toggleCollapse = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedMap(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  const expandAll = () => setCollapsedMap({});
  const collapseAll = () => {
    const allParents: Record<string, boolean> = {};
    projectTasks.filter(t => !t.parentId).forEach(p => {
      allParents[p.id] = true;
    });
    setCollapsedMap(allParents);
  };

  // Initial scroll to today or first task on mount/zoom
  useEffect(() => {
    const timer = setTimeout(() => {
      if (visibleRows.length > 0) {
        handleFocusTask(visibleRows[0]);
      } else {
        scrollToToday();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [zoomLevel, currentProjectId]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const totalParents = useMemo(() => projectTasks.filter(t => !t.parentId).length, [projectTasks]);
  const totalSubtasksCount = useMemo(() => {
    return projectTasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
  }, [projectTasks]);

  return (
    <div className="timeline-view-root flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 space-y-3 sm:space-y-4 text-slate-800 dark:text-readable print:p-0 print:space-y-2 print:overflow-visible print:h-auto">
      {/* Top Header Bar & Single Project Filter Controls (Hidden in print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 shrink-0 pb-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Timeline &amp; Gantt Chart WBS
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {totalParents} {language === 'en' ? 'Main Tasks' : 'Tugas Utama'} • {totalSubtasksCount} {language === 'en' ? 'Sub-tasks' : 'Sub-tugas WBS'}
              </p>
            </div>
          </div>

          {/* 1. Single Project Mode Select */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
            <FolderKanban className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Project' : 'Proyek'}
              </span>
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-4"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Filter per Orang (Assignee / PIC) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
            <UserIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Person / PIC' : 'PIC / Orang'}
              </span>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-3"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {language === 'en' ? 'All People' : 'Semua Orang'}
                </option>
                {projectAssignees.map(u => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Filter per Tugas (Hanya tugas milik PIC terpilih) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
            <ListTodo className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'en' ? 'Task' : 'Tugas'}
              </span>
              <select
                value={selectedTaskIdFilter}
                onChange={(e) => setSelectedTaskIdFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-3 max-w-[120px] sm:max-w-[180px] truncate"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {language === 'en' ? 'All Tasks' : 'Semua Tugas'}
                </option>
                {parentTasksList.map(t => (
                  <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Sembunyikan Tugas yang Selesai Toggle */}
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition shadow-xs cursor-pointer ${
              hideCompleted
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/50'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={hideCompleted ? 'Selesai disembunyikan (Klik untuk tampilkan semua)' : 'Semua ditampilkan (Klik untuk sembunyikan selesai)'}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${hideCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
            <span>{language === 'en' ? 'Hide Done' : 'Sembunyikan Selesai'}</span>
            {hideCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>

          {/* Quick Collapse / Expand All Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-lg shadow-xs text-xs">
            <button
              onClick={expandAll}
              className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
              title="Expand semua sub-tugas"
            >
              Expand
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={collapseAll}
              className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
              title="Collapse semua sub-tugas"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* View Mode, Zoom & Print Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Scroll Navigation */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-lg shadow-xs">
            <button
              onClick={() => scrollHorizontally(-220)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Geser Kiri (Sebelumnya)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToToday}
              className="px-2.5 py-1 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition cursor-pointer"
              title="Lompat ke Hari Ini"
            >
              {language === 'en' ? 'Today' : 'Hari Ini'}
            </button>
            <button
              onClick={() => scrollHorizontally(220)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Geser Kanan (Berikutnya)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Toggle */}
          <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 shadow-xs">
            <button
              onClick={() => setZoomLevel('days')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                zoomLevel === 'days'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Daily' : 'Harian'}
            </button>
            <button
              onClick={() => setZoomLevel('weeks')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                zoomLevel === 'weeks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'en' ? 'Weekly' : 'Mingguan'}
            </button>
          </div>

          {/* 5. Print PDF Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title={language === 'en' ? 'Print or export Timeline & Gantt Chart to PDF' : 'Cetak atau ekspor Timeline & Gantt Chart ke PDF'}
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'en' ? 'Print PDF' : 'Cetak PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Header Banner (Only visible during print / PDF export) */}
      <div className="hidden print:flex flex-col gap-2 pb-3 mb-2 border-b-2 border-slate-300 bg-white text-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base">
              P
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">ProMan Enterprise Workspace</h1>
              <p className="text-[11px] font-semibold text-slate-500">Timeline &amp; Gantt Chart WBS Report</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-600">
            <div>
              <span className="text-slate-400 font-medium">{language === 'en' ? 'Printed on: ' : 'Dicetak pada: '}</span>
              <span className="font-bold text-slate-800">
                {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="font-mono text-slate-500">
              {new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Project' : 'Proyek'}
            </span>
            <span className="font-extrabold text-slate-900 truncate block">{activeProject?.name || '-'}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'PIC / Assignee' : 'PIC / Penanggung Jawab'}
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {selectedAssigneeId === 'all' 
                ? (language === 'en' ? 'All People' : 'Semua Orang') 
                : (users.find(u => u.id === selectedAssigneeId)?.name || selectedAssigneeId)}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Task Scope' : 'Cakupan Tugas'}
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {selectedTaskIdFilter === 'all' 
                ? (language === 'en' ? 'All Tasks' : 'Semua Tugas') 
                : (allProjectTasks.find(t => t.id === selectedTaskIdFilter)?.title || selectedTaskIdFilter)}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Summary' : 'Ringkasan'}
            </span>
            <span className="font-bold text-slate-900">
              {totalParents} {language === 'en' ? 'Tasks' : 'Tugas'} • {totalSubtasksCount} {language === 'en' ? 'Sub-tasks' : 'Sub-tugas'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas Container */}
      <div 
        ref={scrollContainerRef}
        className="timeline-canvas-container flex-1 overflow-x-auto overflow-y-auto rounded-xl bg-white dark:bg-slate-950 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col print:overflow-visible print:border print:border-slate-300 print:shadow-none print:h-auto print:max-h-none"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
        }}
      >
        <div className="min-w-max flex flex-col flex-1">
          {/* Synchronized Two-Tier Header Grid */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-900 z-30 shrink-0">
            {/* Left Sticky Column Header */}
            <div className="sticky-wbs-column w-60 sm:w-72 md:w-80 lg:w-96 p-3 font-bold text-xs text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shrink-0 sticky left-0 bg-slate-50 dark:bg-slate-900 z-40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="uppercase tracking-wider font-extrabold text-[11px]">
                  {language === 'en' ? 'WBS Task & PIC' : 'Tugas & PIC'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                {visibleRows.length} baris
              </span>
            </div>

            {/* Right Date Columns Header (Two Tiers) */}
            <div className="flex flex-col shrink-0" style={{ width: `${totalGridWidth}px` }}>
              {/* Tier 1: Month Groups */}
              {zoomLevel === 'days' ? (
                <>
                  <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/60">
                    {monthGroups.map((mg, i) => (
                      <div
                        key={i}
                        style={{ width: `${mg.width}px` }}
                        className="py-1 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 truncate text-left font-mono"
                      >
                        {mg.label}
                      </div>
                    ))}
                  </div>

                  {/* Tier 2: Days */}
                  <div className="flex">
                    {daysColumns.map((col, i) => (
                      <div
                        key={i}
                        style={{ width: `${dayCellWidth}px` }}
                        className={`py-1.5 border-r border-slate-200/70 dark:border-slate-800/60 text-center shrink-0 flex flex-col justify-center ${
                          col.isToday
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 font-extrabold border-blue-400/60'
                            : col.isWeekend
                            ? 'bg-slate-100/40 dark:bg-white/[0.02] text-slate-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] font-mono font-bold leading-none">{col.dayNum}</span>
                        <span className="text-[9px] uppercase tracking-tighter text-slate-400 dark:text-slate-500 mt-0.5">
                          {col.dayName}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Weekly Mode */
                <div className="flex">
                  {weeksColumns.map((col, i) => (
                    <div
                      key={i}
                      style={{ width: `${weekCellWidth}px` }}
                      className="py-2.5 px-3 border-r border-slate-200/80 dark:border-slate-800 text-center shrink-0 flex flex-col justify-center bg-slate-50/80 dark:bg-slate-900/40"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {col.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {col.sublabel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Synchronized Two-Column Body: Left WBS Panel + Right Timeline Grid */}
          <div className="flex flex-1 relative">
            {visibleRows.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs w-full">
                {language === 'en' ? 'No tasks found for this project.' : 'Belum ada tugas atau fase pada project ini.'}
              </div>
            ) : (
              <>
                {/* 1. LEFT STICKY WBS COLUMN (Tugas & PIC) */}
                <div className="sticky-wbs-column w-60 sm:w-72 md:w-80 lg:w-96 shrink-0 sticky left-0 z-20 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80">
                  {visibleRows.map((row) => {
                    const isParent = row.type === 'parent';
                    const isHighlighted = highlightedId === row.id;
                    const isHovered = hoveredId === row.id;

                    return (
                      <div
                        key={row.id}
                        style={{ height: `${ROW_HEIGHT}px` }}
                        onClick={() => handleFocusTask(row)}
                        onMouseEnter={() => setHoveredId(row.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`px-3 flex items-center justify-between gap-2 cursor-pointer transition select-none ${
                          isHighlighted 
                            ? 'bg-blue-100 dark:bg-blue-950/80 border-l-4 border-l-blue-500' 
                            : isHovered
                              ? 'bg-slate-100/80 dark:bg-slate-800/80'
                              : isParent 
                                ? 'bg-slate-50/90 dark:bg-slate-900/90' 
                                : 'bg-white dark:bg-slate-950'
                        }`}
                      >
                        {/* Task Info & Hierarchy indentation */}
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          {isParent ? (
                            // Parent Collapse / Expand button
                            <button
                              onClick={(e) => toggleCollapse(row.id, e)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition shrink-0"
                              title={row.isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {row.isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                              )}
                            </button>
                          ) : (
                            // Sub-task Indentation Tree Branch Icon
                            <div className="w-5 flex justify-end shrink-0 pl-1">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                            </div>
                          )}

                          {/* Title & Metadata */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isParent && (
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${row.palette.dotBg}`} />
                              )}
                              <h4 className={`truncate ${
                                isParent 
                                  ? 'text-xs font-extrabold text-slate-900 dark:text-white' 
                                  : 'text-[11px] font-medium text-slate-700 dark:text-slate-300'
                              }`}>
                                {row.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono mt-0.5">
                              <span className="truncate">
                                {row.startDate.slice(5)} → {row.dueDate.slice(5)}
                              </span>
                              {isParent && row.subtaskCount !== undefined && row.subtaskCount > 0 && (
                                <span className="text-slate-500 font-sans">
                                  ({row.subtaskCount} sub)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* PIC Avatar / Name & Quick Action */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {row.assignee ? (
                            <div className="flex items-center gap-1" title={`PIC: ${row.assignee.name}`}>
                              <UserAvatar
                                src={row.assignee.avatar}
                                name={row.assignee.name}
                                size="xs"
                              />
                              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[65px] hidden sm:inline">
                                {row.assignee.name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400" title="Unassigned">
                              <UserIcon className="w-3 h-3" />
                            </div>
                          )}

                          {/* Quick View Task Modal Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskId(row.taskId);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition"
                            title="Buka Detail Tugas"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. RIGHT TIMELINE CANVAS OF ALL ROWS (Synchronized) */}
                <div 
                  className="relative shrink-0 divide-y divide-slate-100 dark:divide-slate-800/60"
                  style={{ width: `${totalGridWidth}px` }}
                >
                  {/* SVG Dependency Lines strictly within each task */}
                  <svg
                    className="absolute inset-0 pointer-events-none z-15"
                    width={totalGridWidth}
                    height={visibleRows.length * ROW_HEIGHT}
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      {WBS_PALETTES.map((pal) => (
                        <marker
                          key={pal.name}
                          id={`arrow-${pal.name}`}
                          viewBox="0 0 6 6"
                          refX="5"
                          refY="3"
                          markerWidth="5"
                          markerHeight="5"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 0.5 L 5 3 L 0 5.5 z" fill={pal.lineColor} />
                        </marker>
                      ))}
                    </defs>

                    {dependencyLines.map((line) => {
                      const palette = WBS_PALETTES.find(p => p.lineColor === line.color) || WBS_PALETTES[0];
                      return (
                        <path
                          key={line.key}
                          d={line.d}
                          fill="none"
                          stroke={line.color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-85 transition-all duration-300"
                          markerEnd={`url(#arrow-${palette.name})`}
                        />
                      );
                    })}
                  </svg>

                  {/* Timeline Rows */}
                  {visibleRows.map((row) => {
                    const isParent = row.type === 'parent';
                    const isHighlighted = highlightedId === row.id;
                    const isHovered = hoveredId === row.id;

                    return (
                      <div
                        key={row.id}
                        style={{ height: `${ROW_HEIGHT}px` }}
                        onClick={() => handleFocusTask(row)}
                        onMouseEnter={() => setHoveredId(row.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`relative flex items-center shrink-0 transition select-none cursor-pointer ${
                          isHighlighted
                            ? 'bg-blue-500/10 dark:bg-blue-500/15'
                            : isHovered
                              ? 'bg-slate-50 dark:bg-slate-900/60'
                              : isParent
                                ? 'bg-slate-50/40 dark:bg-slate-900/30'
                                : ''
                        }`}
                      >
                        {/* Background column lines */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {zoomLevel === 'days' ? (
                            daysColumns.map((col, i) => (
                              <div
                                key={i}
                                style={{ width: `${dayCellWidth}px` }}
                                className={`h-full border-r border-slate-100 dark:border-slate-800/40 shrink-0 ${
                                  col.isToday
                                    ? 'bg-blue-500/5 dark:bg-blue-500/10'
                                    : col.isWeekend
                                    ? 'bg-slate-50/50 dark:bg-white/[0.015]'
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

                        {/* Interactive Gantt Bar (Parent = Thick Summary Bar, Child = Sub-task Bar) */}
                        <div
                          style={{
                            left: `${row.barLeft}px`,
                            width: `${row.barWidth}px`,
                          }}
                          className={`absolute rounded-full border flex items-center justify-between px-2.5 text-xs font-semibold transition-all duration-200 ${
                            isParent 
                              ? `h-8 ${row.palette.parentBg} ${row.palette.parentBorder} ${row.palette.parentText} shadow-md` 
                              : `h-6 ${row.palette.childBarBg} shadow-xs`
                          } ${
                            isHighlighted
                              ? 'ring-4 ring-offset-2 ring-blue-500 shadow-xl scale-[1.02] z-30 animate-pulse'
                              : 'hover:scale-[1.01] hover:shadow-lg'
                          }`}
                          title={`${row.title} (${row.startDate} s/d ${row.dueDate}) - ${row.progress}%`}
                        >
                          {/* Progress Fill Indicator */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 rounded-l-full pointer-events-none transition-all ${
                              isParent ? 'bg-black/15 dark:bg-white/20' : row.palette.childFill + ' opacity-30'
                            }`}
                            style={{ width: `${row.progress}%` }}
                          />

                          {/* Bar Label (PIC name on parent bar as in reference image) */}
                          <div className="flex items-center gap-1.5 truncate relative z-10">
                            {isParent ? (
                              <span className="truncate text-xs font-extrabold drop-shadow-xs">
                                {row.assignee ? row.assignee.name : row.title}
                              </span>
                            ) : (
                              <span className="truncate text-[11px] font-bold">
                                {row.title}
                              </span>
                            )}
                          </div>

                          {/* Percentage and AI Risk pill */}
                          <div className="flex items-center gap-1.5 relative z-10 shrink-0 ml-1">
                            {row.aiRisk && row.aiRisk.riskScore >= 60 && row.status !== 'done' && (
                              <div 
                                className="flex items-center gap-0.5 text-[9px] bg-rose-950/90 text-rose-200 border border-rose-400 px-1 py-0.2 rounded font-bold"
                                title={`AI Risk: ${row.aiRisk.reason}`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-300" />
                                <span>+{row.aiRisk.predictedDelayDays}d</span>
                              </div>
                            )}

                            <span className="text-[10px] font-mono font-bold opacity-90">
                              {row.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
