import { Task } from '../types/crm';

/**
 * Parses a due date string (YYYY-MM-DD or ISO timestamp) into a Date object.
 * If only YYYY-MM-DD is given, sets time to 23:59:59 local time.
 */
export function parseTaskDueDate(dueDateStr?: string): Date | null {
  if (!dueDateStr) return null;

  try {
    if (dueDateStr.includes('T')) {
      const date = new Date(dueDateStr);
      return isNaN(date.getTime()) ? null : date;
    }

    const parts = dueDateStr.split('-').map(Number);
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const date = new Date(year, month - 1, day, 23, 59, 59, 999);
      return isNaN(date.getTime()) ? null : date;
    }

    const fallback = new Date(dueDateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  } catch {
    return null;
  }
}

/**
 * Checks if a task is due within 24 hours of the current date/time.
 * Returns true if the task is not completed/done/cancelled and its due date is within the next 24 hours (or today).
 */
export function isTaskDueSoon(task: Pick<Task, 'dueDate' | 'status'>, now: Date = new Date()): boolean {
  if (!task.dueDate) return false;

  const normalizedStatus = (task.status || '').toLowerCase();
  if (normalizedStatus === 'completed' || normalizedStatus === 'done' || normalizedStatus === 'cancelled') {
    return false;
  }

  const dueDate = parseTaskDueDate(task.dueDate);
  if (!dueDate) return false;

  const nowMs = now.getTime();
  const dueMs = dueDate.getTime();
  const diffMs = dueMs - nowMs;

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  // Due within 24 hours: not already in past before start of today, and within 24 hours ahead
  // If it's today (even if local time has passed midday, as long as it's the current date) or within the next 24h
  const startOfTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  
  if (dueMs < startOfTodayMs) {
    // Strictly overdue (past days)
    return false;
  }

  return diffMs <= TWENTY_FOUR_HOURS_MS;
}

/**
 * Checks if a task is overdue (past due date and not completed).
 */
export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status'>, now: Date = new Date()): boolean {
  if (!task.dueDate) return false;

  const normalizedStatus = (task.status || '').toLowerCase();
  if (normalizedStatus === 'completed' || normalizedStatus === 'done' || normalizedStatus === 'cancelled') {
    return false;
  }

  const dueDate = parseTaskDueDate(task.dueDate);
  if (!dueDate) return false;

  const startOfTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  return dueDate.getTime() < startOfTodayMs;
}

/**
 * Human-readable status tag for UI display
 */
export function getTaskDueBadge(task: Pick<Task, 'dueDate' | 'status'>): {
  type: 'overdue' | 'due-soon' | 'normal' | 'completed';
  label: string;
} {
  const normalizedStatus = (task.status || '').toLowerCase();
  if (normalizedStatus === 'completed' || normalizedStatus === 'done') {
    return { type: 'completed', label: 'Selesai' };
  }

  if (isTaskOverdue(task)) {
    return { type: 'overdue', label: 'Overdue (Terlewat)' };
  }

  if (isTaskDueSoon(task)) {
    return { type: 'due-soon', label: 'Due Soon (< 24 Jam)' };
  }

  return { type: 'normal', label: task.dueDate || '' };
}
