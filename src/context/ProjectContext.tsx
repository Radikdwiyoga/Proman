import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Task, 
  Subtask,
  Project, 
  User, 
  Comment, 
  ActivityLog, 
  TaskStatus, 
  TaskPriority, 
  ExecutiveSummary, 
  SystemSettings,
  AppNotification
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_TASKS, 
  INITIAL_COMMENTS, 
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import { calculateUserWorkloads, generateExecutiveSummary } from '../utils/aiSimulator';
import { 
  seedDatabaseIfEmpty,
  subscribeToProjects,
  subscribeToTasks,
  subscribeToUsers,
  subscribeToComments,
  subscribeToActivityLogs,
  subscribeToSystemSettings,
  createProjectInDb,
  updateProjectInDb,
  deleteProjectInDb,
  createTaskInDb,
  updateTaskInDb,
  deleteTaskInDb,
  createUserInDb,
  updateUserInDb,
  addCommentToDb,
  addActivityLogInDb,
  updateSystemSettingsInDb,
  subscribeToNotifications,
  addNotificationToDb,
  markNotificationAsReadInDb,
  markAllNotificationsAsReadInDb,
  deleteNotificationFromDb
} from '../services/firestoreService';
import {
  createAuthAccount,
  getUserProfileFromDb,
  logoutFromFirebase,
  subscribeToAuthChanges,
} from '../services/authService';
import { generateLiveExecutiveSummary } from '../services/geminiService';
import { 
  sendTaskCreatedNotification, 
  sendTaskUpdatedNotification, 
  sendTaskStatusNotification, 
  sendCommentNotification
} from '../services/telegramService';

export type ActiveView = 
  | 'kanban' 
  | 'timeline' 
  | 'calendar' 
  | 'list' 
  | 'project_management'
  | 'risk_dashboard' 
  | 'resource_allocation' 
  | 'admin_settings';

interface FilterState {
  searchQuery: string;
  assigneeId: string | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
  tag: string | null;
}

interface ProjectContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  isSuperAdmin: boolean;
  isPM: boolean;

  // System Settings & Company
  systemSettings: SystemSettings;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => void;

  // Projects CRUD
  projects: Project[];
  currentProject: Project;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  createProject: (projectData: Omit<Project, 'id' | 'healthScore'>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Users CRUD
  users: User[];
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  createUser: (userData: Omit<User, 'id' | 'allocatedHours'> & { password: string }) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => Promise<void>;
  
  // Tasks & Details
  tasks: Task[];
  filteredTasks: Task[];
  selectedTask: Task | null;
  setSelectedTaskId: (id: string | null) => void;
  
  // Comments & Logs
  comments: Comment[];
  activityLogs: ActivityLog[];
  
  // View & Filters
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  
  // Task Actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string, category?: string, startDate?: string, dueDate?: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, content: string, explicitMentionedUserIds?: string[]) => void;

  // In-App Notifications & Mentions
  notifications: AppNotification[];
  userNotifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notificationId: string) => void;

  // AI Triggers & Modals State
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  createModalInitialStatus: TaskStatus;
  setCreateModalInitialStatus: (status: TaskStatus) => void;
  openCreateTaskModal: (status?: TaskStatus) => void;
  isSummaryModalOpen: boolean;
  setIsSummaryModalOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  
  // AI Operations
  applyRiskMitigation: (taskId: string, actionType: string, targetAssigneeId?: string, bufferDays?: number) => void;
  executiveSummary: ExecutiveSummary;
  refreshExecutiveSummary: () => void;
  
  // Toast Notifications
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('user-admin');

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>('all');
  const [rawUsers, setRawUsers] = useState<User[]>(INITIAL_USERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  
  const [activeView, setActiveView] = useState<ActiveView>('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createModalInitialStatus, setCreateModalInitialStatus] = useState<TaskStatus>('todo');

  const openCreateTaskModal = (initialStatus?: TaskStatus) => {
    if (initialStatus) {
      setCreateModalInitialStatus(initialStatus);
    } else {
      setCreateModalInitialStatus('todo');
    }
    setIsCreateModalOpen(true);
  };

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Pantau status autentikasi Firebase (selalu aktif, termasuk saat restore sesi)
  //
  // Auth listener harus jalan sejak app mount supaya sesi yang masih tersimpan
  // di localStorage langsung di-restore tanpa perlu login ulang.
  //
  // Sesi TIDAK langsung dipercaya begitu saja. `onAuthStateChanged` bisa memunculkan
  // user dari cache local tanpa contacts server, jadi user yang sudah dinonaktifkan
  // (documen /users-nya dihapus atau statusnya 'rejected') bisa lolos hanya
  // karena masih punya sesi tersimpan. Karena itu profil selalu diverifikasi ke
  // Firestore, dan kalau tidak valid sesinya langsung di-putuskan.
  useEffect(() => {
    return subscribeToAuthChanges(async (fbUser) => {
      if (!fbUser) {
        setIsAuthenticated(false);
        return;
      }

      const profile = await getUserProfileFromDb(fbUser.uid);

      if (!profile) {
        // Akun ada di Auth tapi sudah tidak aktif di aplikasi.
        await logoutFromFirebase().catch(() => {});
        setCurrentUserId(fbUser.uid);
        setIsAuthenticated(false);
        showToast('Akun ini telah dinonaktifkan. Silakan hubungi Super Admin.', 'warning');
        return;
      }

      if (profile.status === 'pending' || profile.status === 'rejected') {
        await logoutFromFirebase().catch(() => {});
        setCurrentUserId(fbUser.uid);
        setIsAuthenticated(false);
        showToast(
          profile.status === 'pending'
            ? 'Akun Anda masih menunggu persetujuan Super Admin.'
            : 'Akun ini telah dinonaktifkan. Silakan hubungi Super Admin.',
          'warning'
        );
        return;
      }

      setCurrentUserId(fbUser.uid);
      setIsAuthenticated(true);
    });
  }, []);

  // 2. Seeder & Real-Time Sync — HANYA setelah terautentikasi
  //
  // Firestore rules menolak semua akses anonim, jadi subscription dan seeding
  // harus ditunda sampai ada sesi login. Jika tidak, onSnapshot akan
  // langsung error PERMISSION_DENIED dan data tidak pernah ter-load.
  useEffect(() => {
    if (!isAuthenticated) return;

    // Seed butuh hak Super Admin, jadi hanya dicoba setelah user doc tersedia.
    seedDatabaseIfEmpty();

    const unsubProjects = subscribeToProjects((loadedProjects) => {
      setProjects(loadedProjects);
    });

    const unsubTasks = subscribeToTasks((loadedTasks) => {
      setTasks(loadedTasks);
    });

    const unsubUsers = subscribeToUsers((loadedUsers) => {
      setRawUsers(loadedUsers);
    });

    const unsubComments = subscribeToComments((loadedComments) => {
      setComments(loadedComments);
    });

    const unsubLogs = subscribeToActivityLogs((loadedLogs) => {
      setActivityLogs(loadedLogs);
    });

    const unsubSettings = subscribeToSystemSettings((loadedSettings) => {
      setSystemSettings(loadedSettings);
    });

    const unsubNotifs = subscribeToNotifications((loadedNotifs) => {
      setNotifications(loadedNotifs);
    });

    return () => {
      unsubProjects();
      unsubTasks();
      unsubUsers();
      unsubComments();
      unsubLogs();
      unsubSettings();
      unsubNotifs();
    };
  }, [isAuthenticated]);

  const login = (user: User) => {
    setCurrentUserId(user.id);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      if (currentUserId) {
        const activeUser = rawUsers.find(u => u.id === currentUserId || u.email === currentUserId);
        if (activeUser?.email && localStorage.getItem('proman_remember_session') !== 'false') {
          localStorage.setItem('proman_remembered_email', activeUser.email);
        }
      }
      await logoutFromFirebase();
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari sesi.', 'info');
  };

  // ── Inactivity Session Timeout (10 menit) ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const TIMEOUT_MS = 10 * 60 * 1000; // 10 menit
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        showToast('Sesi berakhir karena tidak ada aktivitas selama 10 menit.', 'warning');
      }, TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start timer immediately

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    updateSystemSettingsInDb(newSettings);
  };

  const users = useMemo(() => {
    return calculateUserWorkloads(rawUsers, tasks);
  }, [rawUsers, tasks]);

  const currentProject: Project = useMemo(() => {
    if (currentProjectId === 'all') {
      return {
        id: 'all',
        name: 'Semua Project (Global Board)',
        description: 'Tampilan seluruh tiket dan inisiatif dari semua proyek enterprise',
        icon: '🌐',
        color: '#f97316',
        folder: 'Enterprise',
        domain: 'all',
        status: 'active',
        startDate: '2026-08-01',
        targetEndDate: '2027-12-31',
        healthScore: 92,
        memberIds: [],
      };
    }
    return projects.find(p => p.id === currentProjectId) || projects[0] || INITIAL_PROJECTS[0];
  }, [projects, currentProjectId]);

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId || u.email === currentUserId) || users[0] || INITIAL_USERS[0];
  }, [users, currentUserId]);

  const isSuperAdmin = currentUser.personaType === 'Super Admin';
  const isPM = false;

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    assigneeId: null,
    priority: null,
    status: null,
    tag: null,
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      assigneeId: null,
      priority: null,
      status: null,
      tag: null,
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (currentProjectId !== 'all' && t.projectId !== currentProjectId) return false;
      
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesTag = (t.tags || []).some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      if (filters.assigneeId && !(t.assigneeIds || []).includes(filters.assigneeId)) {
        return false;
      }

      if (filters.priority && t.priority !== filters.priority) {
        return false;
      }

      if (filters.status && t.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [tasks, currentProjectId, filters]);

  // CRUD Operations
  const createProject = (projectData: Omit<Project, 'id' | 'healthScore'>) => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      healthScore: 90,
    };
    setProjects(prev => [newProj, ...prev]);
    createProjectInDb(newProj);
    setCurrentProjectId(newProj.id);
    showToast(`Project "${newProj.name}" berhasil dibuat!`, 'success');
    return newProj;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    updateProjectInDb(projectId, updates);
    showToast('Data project berhasil diperbarui!', 'success');
  };

  const deleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      showToast('Minimal harus ada 1 project dalam sistem!', 'warning');
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== projectId));
    deleteProjectInDb(projectId);
    if (currentProjectId === projectId) {
      setCurrentProjectId('all');
    }
    showToast('Project berhasil dihapus!', 'info');
  };

  const createUser = async (userData: Omit<User, 'id' | 'allocatedHours' | 'password'> & { password: string }) => {
    // Akun harus dibuat di Firebase Auth DULU. Kalau dokumen Firestore lebih dulu,
    // user akan punya profil tapi tidak bisa login sama sekali — persis kondisi
    // yang membuat 14 user lama tidak bisa masuk sebelum dimigrasi.
    const authUid = await createAuthAccount(userData.email, userData.password);

    const { password, ...profileData } = userData;
    const newUser: User = {
      ...profileData,
      id: authUid,
      allocatedHours: 0,
    };

    await createUserInDb(newUser);
    setRawUsers(prev => [...prev, newUser]);
    showToast(`Pengguna ${newUser.name} berhasil ditambahkan!`, 'success');
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setRawUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    updateUserInDb(userId, updates);
    showToast('Data pengguna berhasil diperbarui!', 'success');
  };

  /**
   * Menonaktifkan pengguna.
   *
   * Ini SENGAJA tidak hard-delete. Akun Firebase Auth tidak bisa dinonaktifkan
   * dari sisi client (butuh Admin SDK / Cloud Function), jadi dokumen yang
   * dihapus di Firestore akan meninggalkan akun Auth yang masih hidup —
   * pemegangnya tetap bisa login. Dan sebelumnya `loginWithFirebase` membuat
   * ulang profil otomatis untuk UID yang dokumennya hilang, sehingga user
   * yang "dihapus" bisa langsung masuk lagi.
   *
   * Sekarang: dokumen tetap ada tapi status-nya 'rejected', dan login
   * memblokir status tersebut. Efeknya sama seperti dihapus dari sisi user,
   * tapi tidak meninggalkan pintu masuk terbuka.
   */
  const deleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      showToast('Tidak dapat menonaktifkan akun Anda sendiri!', 'warning');
      return;
    }

    const target = rawUsers.find(u => u.id === userId);
    if (!target) return;

    try {
      await updateUserInDb(userId, {
        status: 'rejected',
        disabledAt: new Date().toISOString(),
      });
      setRawUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, status: 'rejected' as const } : u))
      );
      showToast(`${target.name} dinonaktifkan. Akunnya tidak bisa login lagi.`, 'info');
    } catch (e) {
      console.error('Gagal menonaktifkan pengguna:', e);
      showToast('Gagal menonaktifkan pengguna. Coba lagi.', 'warning');
    }
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    createTaskInDb(newTask);
    showToast(`Tugas "${newTask.title}" berhasil dibuat!`, 'success');
    // Telegram notification (fire-and-forget)
    sendTaskCreatedNotification(newTask, currentUser.name, users)
      .catch(err => console.warn('[Telegram] createTask notification failed:', err));
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    updateTaskInDb(taskId, updates);
    // Telegram notification (fire-and-forget)
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      sendTaskUpdatedNotification({ ...targetTask, ...updates }, updates, currentUser.name, users)
        .catch(err => console.warn('[Telegram] updateTask notification failed:', err));
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    deleteTaskInDb(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    showToast('Tugas berhasil dihapus.', 'info');
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
    updateTaskInDb(taskId, { status: newStatus });
    // Telegram notification (fire-and-forget)
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      sendTaskStatusNotification(targetTask, newStatus, currentUser.name)
        .catch(err => console.warn('[Telegram] statusChange notification failed:', err));
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addSubtask = (
    taskId: string, 
    title: string, 
    category: string = 'General',
    startDate?: string,
    dueDate?: string
  ) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false,
      category: category as any,
      startDate: startDate || targetTask.startDate,
      dueDate: dueDate || targetTask.dueDate,
    };

    updateTask(taskId, { subtasks: [...targetTask.subtasks, newSubtask] });
  };

  const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.map(st =>
      st.id === subtaskId ? { ...st, ...updates } : st
    );
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.filter(st => st.id !== subtaskId);
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addComment = (taskId: string, content: string, explicitMentionedUserIds?: string[]) => {
    const mentionedIds = new Set<string>(explicitMentionedUserIds || []);

    // Also scan comment text for @Name matching existing users
    users.forEach(u => {
      const escapedName = u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`@${escapedName}\\b`, 'i');
      if (pattern.test(content)) {
        mentionedIds.add(u.id);
      }
    });

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      taskId,
      userId: currentUser.id,
      content,
      mentions: Array.from(mentionedIds),
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    setComments(prev => [...prev, newComment]);
    addCommentToDb(newComment);

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      updateTask(taskId, { commentsCount: (targetTask.commentsCount || 0) + 1 });
      // Telegram notification (fire-and-forget)
      sendCommentNotification(targetTask, newComment, currentUser.name)
        .catch(err => console.warn('[Telegram] comment notification failed:', err));
    }

    // Dispatch in-app notification to each mentioned user (excluding author)
    const notifiedNames: string[] = [];
    mentionedIds.forEach(targetUserId => {
      if (targetUserId !== currentUser.id) {
        const targetUser = users.find(u => u.id === targetUserId);
        if (targetUser) {
          notifiedNames.push(targetUser.name);
          const newNotif: AppNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            userId: targetUserId,
            actorId: currentUser.id,
            actorName: currentUser.name,
            actorAvatar: currentUser.avatar,
            type: 'mention',
            taskId,
            taskTitle: targetTask?.title || 'Tugas Proyek',
            commentId: newComment.id,
            content,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications(prev => [newNotif, ...prev]);
          addNotificationToDb(newNotif).catch(err => console.warn('Failed to save notification to db:', err));
        }
      }
    });

    if (notifiedNames.length > 0) {
      showToast(`Notifikasi mention terkirim ke: ${notifiedNames.join(', ')}`, 'success');
    }
  };

  const applyRiskMitigation = (taskId: string, actionType: string, targetAssigneeId?: string, bufferDays: number = 3) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (actionType === 'reassign' && targetAssigneeId) {
      updateTask(taskId, { assigneeIds: [targetAssigneeId] });
      const newAssignee = users.find(u => u.id === targetAssigneeId);
      showToast(`Tugas "${task.title}" berhasil dialihkan ke ${newAssignee?.name || 'rekan tim'}.`, 'success');
    } else if (actionType === 'split_task') {
      // Split the task into 2-3 smaller subtasks derived from the task title/description
      const splitTitles: string[] = [];
      const baseTitle = task.title;
      if (task.description) {
        // Try to derive subtask titles from description lines (bullet or numbered)
        const descLines = task.description
          .split(/\n/)
          .map(l => l.trim())
          .filter(l => l && l.length > 0 && !l.toLowerCase().startsWith('catatan'));
        if (descLines.length >= 2) {
          splitTitles.push(...descLines.slice(0, 3));
        }
      }
      // Fallback: generate generic subtask titles from the task title
      if (splitTitles.length === 0) {
        const parts = baseTitle.split(/[,\/]/).map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length >= 2) {
          splitTitles.push(...parts.slice(0, 3));
        } else {
          splitTitles.push(`${baseTitle} - Bagian 1`, `${baseTitle} - Bagian 2`);
        }
      }
      const newSubtasks = splitTitles.slice(0, 3).map((stTitle, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: stTitle,
        completed: false,
        category: 'General' as any,
      }));
      updateTask(taskId, { subtasks: [...(task.subtasks || []), ...newSubtasks] });
      showToast(`Tugas "${task.title}" berhasil dipecah menjadi ${newSubtasks.length} sub-tugas.`, 'success');
    } else if (actionType === 'reduce_scope') {
      // Reduce scope: extend due date by 1 day as a minimal buffer
      const currentDue = new Date(task.dueDate || new Date());
      currentDue.setDate(currentDue.getDate() + 1);
      const newDueDate = currentDue.toISOString().slice(0, 10);
      updateTask(taskId, { dueDate: newDueDate });
      showToast(`Lingkup tugas "${task.title}" berhasil dikurangi. Tenggat disesuaikan +1 hari.`, 'success');
    } else {
      const currentDue = new Date(task.dueDate || new Date());
      currentDue.setDate(currentDue.getDate() + bufferDays);
      const newDueDate = currentDue.toISOString().slice(0, 10);
      updateTask(taskId, { dueDate: newDueDate });
      showToast(`Tenggat tugas "${task.title}" berhasil diperpanjang +${bufferDays} hari.`, 'success');
    }
  };

  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary>(() => generateExecutiveSummary(INITIAL_TASKS, INITIAL_USERS));

  const refreshExecutiveSummary = async () => {
    showToast('Sedang merefresh analisis AI...', 'info');
    const result = await generateLiveExecutiveSummary(filteredTasks, users, currentProject);
    setExecutiveSummary(result);
    showToast('Laporan eksekutif berhasil diperbarui!', 'success');
  };

  const userNotifications = useMemo(() => {
    return notifications
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, currentUser.id]);

  const unreadNotificationsCount = useMemo(() => {
    return userNotifications.filter(n => !n.isRead).length;
  }, [userNotifications]);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    markNotificationAsReadInDb(notificationId).catch(err => console.warn('Failed to mark read in db:', err));
  };

  const markAllNotificationsAsRead = () => {
    const unreadIds = userNotifications.filter(n => !n.isRead).map(n => n.id);
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n));
    if (unreadIds.length > 0) {
      markAllNotificationsAsReadInDb(unreadIds).catch(err => console.warn('Failed to mark all read in db:', err));
    }
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    deleteNotificationFromDb(notificationId).catch(err => console.warn('Failed to delete notif in db:', err));
  };

  return (
    <ProjectContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isSuperAdmin,
        isPM,
        systemSettings,
        updateSystemSettings,
        projects,
        currentProject,
        currentProjectId,
        setCurrentProjectId,
        createProject,
        updateProject,
        deleteProject,
        users,
        currentUser,
        setCurrentUserId,
        createUser,
        updateUser,
        deleteUser,
        tasks,
        filteredTasks,
        selectedTask,
        setSelectedTaskId,
        comments,
        activityLogs,
        activeView,
        setActiveView,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        filters,
        setFilters,
        resetFilters,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        addComment,
        notifications,
        userNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        isCreateModalOpen,
        setIsCreateModalOpen,
        createModalInitialStatus,
        setCreateModalInitialStatus,
        openCreateTaskModal,
        isSummaryModalOpen,
        setIsSummaryModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        applyRiskMitigation,
        executiveSummary,
        refreshExecutiveSummary,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
