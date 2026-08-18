import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/crm';
import { isTaskDueSoon, isTaskOverdue, parseTaskDueDate } from '../utils/taskUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Filter,
  Eye,
  CheckSquare,
  Flame,
  AlertTriangle,
  X,
  Edit,
  Trash2
} from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (id: any, task: Partial<Task>) => void;
  onDeleteTask: (id: any) => void;
  onToggleTaskStatus: (id: any) => void;
  onOpenAddModalWithDate?: (dateStr: string) => void;
  onOpenEditModal?: (task: Task) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskStatus,
  onOpenAddModalWithDate,
  onOpenEditModal
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: string; tasks: Task[] } | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Extract unique assignees for filter
  const assignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignedTo && t.assignedTo.trim()) {
        set.add(t.assignedTo.trim());
      }
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Filter tasks based on filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedAssignee !== 'all' && t.assignedTo !== selectedAssignee) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      if (selectedStatus !== 'all') {
        const isDone = t.status === 'Done' || t.status === 'Completed';
        if (selectedStatus === 'Done' && !isDone) return false;
        if (selectedStatus === 'Todo' && t.status !== 'Todo') return false;
        if (selectedStatus === 'In Progress' && t.status !== 'In Progress') return false;
      }
      return true;
    });
  }, [tasks, selectedAssignee, selectedPriority, selectedStatus]);

  // Group filtered tasks by normalized YYYY-MM-DD
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      if (!t.dueDate) return;
      // Normalize date to YYYY-MM-DD
      let dateKey = '';
      if (t.dueDate.includes('T')) {
        dateKey = t.dueDate.split('T')[0];
      } else {
        dateKey = t.dueDate.trim();
      }

      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Statistics
  const monthStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let dueSoon = 0;
    let overdue = 0;

    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    filteredTasks.forEach((t) => {
      if (t.dueDate && t.dueDate.startsWith(prefix)) {
        total++;
        const isDone = t.status === 'Done' || t.status === 'Completed';
        if (isDone) {
          completed++;
        } else {
          if (isTaskDueSoon(t)) dueSoon++;
          if (isTaskOverdue(t)) overdue++;
        }
      }
    });

    return { total, completed, dueSoon, overdue };
  }, [filteredTasks, currentYear, currentMonth]);

  // Generate calendar days grid (Monday to Sunday)
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday as first day: 0 = Mon, ..., 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInCurrentMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        date: prevDate,
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const thisDate = new Date(currentYear, currentMonth, d);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: thisDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month padding to fill a complete 35 or 42 grid
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingDays; n++) {
      const nextDate = new Date(currentYear, currentMonth + 1, n);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      days.push({
        date: nextDate,
        dateStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const getPriorityBorder = (priority?: TaskPriority) => {
    switch (priority) {
      case 'High':
        return 'border-l-red-500 bg-red-50/60 text-red-950';
      case 'Medium':
        return 'border-l-amber-500 bg-amber-50/60 text-amber-950';
      case 'Low':
      default:
        return 'border-l-blue-500 bg-blue-50/60 text-blue-950';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={handlePrevMonth}
                title="Bulan Sebelumnya"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 hover:bg-white rounded-xl transition-all"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNextMonth}
                title="Bulan Berikutnya"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500 hidden sm:block" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Assignee Filter */}
            {assignees.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Staff</option>
                  {assignees.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Prioritas</option>
                <option value="High">Tinggi (High)</option>
                <option value="Medium">Sedang (Medium)</option>
                <option value="Low">Rendah (Low)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Selesai (Done)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Month Summary Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline Bulan Ini</p>
              <p className="text-sm font-black text-slate-900">{monthStats.total} Tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Due Soon (&lt;24 Jam)</p>
              <p className="text-sm font-black text-amber-900">{monthStats.dueSoon} Tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-red-50/50 border border-red-200/60">
            <div className="p-2 rounded-xl bg-red-100 text-red-700">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Overdue (Terlewat)</p>
              <p className="text-sm font-black text-red-900">{monthStats.overdue} Tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Selesai (Completed)</p>
              <p className="text-sm font-black text-emerald-900">{monthStats.completed} Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid Component */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-black text-slate-600">
          {DAY_NAMES.map((name, idx) => (
            <div
              key={name}
              className={`py-3.5 border-r border-slate-200/60 last:border-r-0 ${
                idx >= 5 ? 'text-amber-600 bg-amber-50/30' : ''
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-y divide-x divide-slate-100">
          {calendarGrid.map((dayItem) => {
            const dayTasks = tasksByDate[dayItem.dateStr] || [];
            const hasDueSoon = dayTasks.some((t) => isTaskDueSoon(t));
            const hasOverdue = dayTasks.some((t) => isTaskOverdue(t));

            return (
              <div
                key={dayItem.dateStr}
                className={`min-h-[120px] p-2 flex flex-col justify-between transition-all group relative ${
                  !dayItem.isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-300'
                    : dayItem.isToday
                    ? 'bg-amber-50/20 ring-1 ring-inset ring-amber-400'
                    : 'bg-white hover:bg-slate-50/50'
                }`}
              >
                {/* Day Header with Date & Add Button */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-xs font-black inline-flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                      dayItem.isToday
                        ? 'bg-amber-500 text-white shadow-xs'
                        : dayItem.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayItem.dayNumber}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Status Alert Pills on Date Header */}
                    {hasDueSoon && (
                      <span
                        title="Ada task due soon (<24h)"
                        className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                      />
                    )}
                    {hasOverdue && (
                      <span
                        title="Ada task overdue"
                        className="w-2 h-2 rounded-full bg-red-500"
                      />
                    )}

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={() => onOpenAddModalWithDate?.(dayItem.dateStr)}
                      title={`Tambah task pada ${dayItem.dateStr}`}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-100/60 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tasks List within Day */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => {
                    const isDone = task.status === 'Done' || task.status === 'Completed';
                    const dueSoon = isTaskDueSoon(task);
                    const overdue = isTaskOverdue(task);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenEditModal?.(task)}
                        title={`${task.title} - ${task.assignedTo || 'Unassigned'}`}
                        className={`text-[10px] p-1.5 rounded-lg border-l-2 border transition-all cursor-pointer truncate flex items-center justify-between gap-1 ${
                          isDone
                            ? 'bg-slate-100/70 border-slate-200 border-l-emerald-500 text-slate-400 line-through'
                            : dueSoon
                            ? 'border-amber-300 border-l-amber-500 bg-amber-50 text-amber-950 font-bold shadow-2xs'
                            : overdue
                            ? 'border-red-200 border-l-red-500 bg-red-50 text-red-950 font-bold'
                            : getPriorityBorder(task.priority) + ' border-slate-200/80 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => task.id && onToggleTaskStatus(task.id)}
                            className="w-2.5 h-2.5 rounded text-amber-500 border-slate-300 focus:ring-0 cursor-pointer shrink-0"
                          />
                          <span className="truncate">{task.title}</span>
                        </div>

                        {dueSoon && !isDone && (
                          <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0 animate-pulse" />
                        )}
                      </div>
                    );
                  })}

                  {/* More Tasks Pill */}
                  {dayTasks.length > 3 && (
                    <button
                      onClick={() => setSelectedDayTasks({ date: dayItem.dateStr, tasks: dayTasks })}
                      className="w-full text-left px-1.5 py-0.5 rounded bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 text-[9px] font-extrabold transition-all"
                    >
                      +{dayTasks.length - 3} task lainnya...
                    </button>
                  )}
                </div>

                {/* Day Footer Info if tasks exist */}
                {dayTasks.length > 0 && (
                  <div
                    onClick={() => setSelectedDayTasks({ date: dayItem.dateStr, tasks: dayTasks })}
                    className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold cursor-pointer hover:text-amber-600"
                  >
                    <span>{dayTasks.length} task</span>
                    <Eye className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Expanded Detail Modal */}
      {selectedDayTasks && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Daftar Deadline: {selectedDayTasks.date}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedDayTasks.tasks.length} task terjadwal pada tanggal ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayTasks(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDayTasks.tasks.map((task) => {
                const isDone = task.status === 'Done' || task.status === 'Completed';
                const dueSoon = isTaskDueSoon(task);
                const overdue = isTaskOverdue(task);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isDone
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : dueSoon
                        ? 'bg-amber-50/50 border-amber-300'
                        : overdue
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-white border-slate-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => task.id && onToggleTaskStatus(task.id)}
                          className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-extrabold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedDayTasks(null);
                            onOpenEditModal?.(task);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (task.id) onDeleteTask(task.id);
                            setSelectedDayTasks((prev) =>
                              prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== task.id) } : null
                            );
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      {dueSoon && !isDone && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold flex items-center gap-1 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Due Soon (&lt;24 Jam)
                        </span>
                      )}

                      {overdue && !isDone && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-extrabold flex items-center gap-1 border border-red-200">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          Overdue
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        Prioritas: {task.priority || 'Medium'}
                      </span>

                      {task.assignedTo && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => {
                  const d = selectedDayTasks.date;
                  setSelectedDayTasks(null);
                  onOpenAddModalWithDate?.(d);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Task di Tanggal Ini</span>
              </button>

              <button
                onClick={() => setSelectedDayTasks(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
