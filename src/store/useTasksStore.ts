import { create } from 'zustand';
import { Task, TaskPriority, TaskStatus, Checklist, ChecklistItem } from '../types';
import { TasksRepository } from '../services/db/TasksRepository';
import { ChecklistsRepository } from '../services/db/ChecklistsRepository';

interface TasksState {
  tasks: Task[];
  checklists: Checklist[];
  todayTasks: Task[];
  statusFilter: TaskStatus | 'all' | 'overdue';
  activeTab: 'tasks' | 'checklists';
  metrics: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  isLoading: boolean;

  loadTasks: () => void;
  loadChecklists: () => void;
  loadTodayTasks: () => void;
  setStatusFilter: (filter: TaskStatus | 'all' | 'overdue') => void;
  setActiveTab: (tab: 'tasks' | 'checklists') => void;

  // Task actions
  createTask: (data: {
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    due_at?: string | null;
  }) => Task;
  updateTask: (
    id: string,
    updates: Partial<{
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      due_at: string | null;
    }>
  ) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Checklist actions
  createChecklist: (title: string, items: string[]) => Checklist;
  addItemToChecklist: (checklistId: string, text: string) => void;
  toggleChecklistItem: (itemId: string) => void;
  deleteChecklistItem: (itemId: string) => void;
  deleteChecklist: (checklistId: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  checklists: [],
  todayTasks: [],
  statusFilter: 'all',
  activeTab: 'tasks',
  metrics: { total: 0, pending: 0, completed: 0, overdue: 0 },
  isLoading: false,

  loadTasks: () => {
    set({ isLoading: true });
    try {
      const { statusFilter } = get();
      const tasks = TasksRepository.getAll({ status: statusFilter });
      const metrics = TasksRepository.getMetrics();
      const todayTasks = TasksRepository.getTodayTasks();
      set({ tasks, metrics, todayTasks, isLoading: false });
    } catch (e) {
      console.warn('Error loading tasks:', e);
      set({ isLoading: false });
    }
  },

  loadChecklists: () => {
    try {
      const checklists = ChecklistsRepository.getAll();
      set({ checklists });
    } catch (e) {
      console.warn('Error loading checklists:', e);
    }
  },

  loadTodayTasks: () => {
    try {
      const todayTasks = TasksRepository.getTodayTasks();
      set({ todayTasks });
    } catch (e) {
      console.warn('Error loading today tasks:', e);
    }
  },

  setStatusFilter: (filter) => {
    set({ statusFilter: filter });
    get().loadTasks();
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  createTask: (data) => {
    const task = TasksRepository.create(data);
    get().loadTasks();
    return task;
  },

  updateTask: (id, updates) => {
    TasksRepository.update(id, updates);
    get().loadTasks();
  },

  toggleTaskStatus: (id) => {
    TasksRepository.toggleStatus(id);
    get().loadTasks();
  },

  deleteTask: (id) => {
    TasksRepository.delete(id);
    get().loadTasks();
  },

  createChecklist: (title, items) => {
    const chk = ChecklistsRepository.create(title, items);
    get().loadChecklists();
    return chk;
  },

  addItemToChecklist: (checklistId, text) => {
    ChecklistsRepository.addItem(checklistId, text);
    get().loadChecklists();
  },

  toggleChecklistItem: (itemId) => {
    ChecklistsRepository.toggleItem(itemId);
    get().loadChecklists();
  },

  deleteChecklistItem: (itemId) => {
    ChecklistsRepository.deleteItem(itemId);
    get().loadChecklists();
  },

  deleteChecklist: (checklistId) => {
    ChecklistsRepository.delete(checklistId);
    get().loadChecklists();
  },
}));
