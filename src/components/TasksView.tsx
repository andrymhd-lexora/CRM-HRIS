import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/crm';
import { isTaskDueSoon, isTaskOverdue } from '../utils/taskUtils';
import { TaskCalendarView } from './TaskCalendarView';
import {
  CheckSquare,
  Search,
  Plus,
  Calendar,
  User,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  LayoutGrid,
  CalendarDays
} from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (id: any, task: Partial<Task>) => void;
  onDeleteTask: (id: any) => void;
  onToggleTaskStatus: (id: any) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskStatus
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'status' | 'priority'>('status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    status: 'Todo' as TaskStatus,
    priority: 'Medium' as TaskPriority,
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    notes: ''
  });

  const filteredTasks = tasks.filter((t) => {
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const statusGroups: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'Todo', label: 'Belum Dikerjakan (Todo)', color: '#3B82F6' },
    { id: 'In Progress', label: 'Dalam Proses (In Progress)', color: '#F59E0B' },
    { id: 'Completed', label: 'Selesai (Completed)', color: '#16A34A' }
  ];

  const priorityGroups: { id: TaskPriority; label: string; color: string }[] = [
    { id: 'High', label: 'Prioritas Tinggi (High)', color: '#DC2626' },
    { id: 'Medium', label: 'Prioritas Sedang (Medium)', color: '#D97706' },
    { id: 'Low', label: 'Prioritas Rendah (Low)', color: '#2563EB' }
  ];

  const handleOpenAddModal = (initialStatus?: TaskStatus, initialDueDate?: string) => {
    setEditingTask(null);
    setFormData({
      title: '',
      status: initialStatus || 'Todo',
      priority: 'Medium',
      dueDate: initialDueDate || new Date().toISOString().split('T')[0],
      assignedTo: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      status: task.status || 'Todo',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
      notes: task.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask && editingTask.id) {
      onUpdateTask(editingTask.id, formData);
    } else {
      onAddTask(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Main Top Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-500" />
              <span>Task & Activity Planner</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                {tasks.length} Tasks Total
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasikan deadline, tugas, dan agenda tim sales dalam Kanban Board atau Kalender Bulanan interaktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher: Board vs Calendar */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  viewMode === 'board'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  viewMode === 'calendar'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
            </div>

            {/* Board Group Switcher (only visible in board mode) */}
            {viewMode === 'board' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                <button
                  onClick={() => setGroupBy('status')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    groupBy === 'status' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  By Status
                </button>
                <button
                  onClick={() => setGroupBy('priority')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    groupBy === 'priority' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  By Priority
                </button>
              </div>
            )}

            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Task</span>
            </button>
          </div>
        </div>

        {/* Search (Board View) */}
        {viewMode === 'board' && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari task, penanggung jawab..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Menampilkan {filteredTasks.length} task
            </span>
          </div>
        )}
      </div>

      {/* Render View Mode */}
      {viewMode === 'calendar' ? (
        <TaskCalendarView
          tasks={tasks}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onToggleTaskStatus={onToggleTaskStatus}
          onOpenAddModalWithDate={(dateStr) => handleOpenAddModal('Todo', dateStr)}
          onOpenEditModal={handleOpenEditModal}
        />
      ) : (
        /* Task Grouped Columns View (Kanban) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(groupBy === 'status' ? statusGroups : priorityGroups).map((group) => {
            const groupTasks = filteredTasks.filter((t) =>
              groupBy === 'status' ? t.status === group.id : t.priority === group.id
            );

            return (
              <div
                key={group.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3 className="font-extrabold text-xs text-slate-900">{group.label}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {groupTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {groupTasks.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Tidak ada task pada kategori ini
                      </div>
                    ) : (
                      groupTasks.map((t) => {
                        const isCompleted = t.status === 'Completed' || t.status === 'Done';
                        const isDueSoon = isTaskDueSoon(t);
                        const isOver = isTaskOverdue(t);

                        return (
                          <div
                            key={t.id}
                            className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                              isCompleted
                                ? 'bg-slate-50/60 border-slate-200/60 opacity-80'
                                : isDueSoon
                                ? 'bg-amber-50/30 border-amber-300 hover:shadow-md'
                                : isOver
                                ? 'bg-red-50/20 border-red-200 hover:shadow-md'
                                : 'bg-white border-slate-200/80 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => t.id && onToggleTaskStatus(t.id)}
                                className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p
                                    className={`text-xs font-extrabold text-slate-900 ${
                                      isCompleted ? 'line-through text-slate-400' : ''
                                    }`}
                                  >
                                    {t.title}
                                  </p>
                                  {isDueSoon && !isCompleted && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-200 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      Due Soon
                                    </span>
                                  )}
                                </div>

                                {t.notes && (
                                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                    {t.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {t.dueDate && (
                                  <span
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                                      isCompleted
                                        ? 'bg-slate-100 text-slate-500'
                                        : isDueSoon
                                        ? 'bg-amber-50 text-amber-700 border border-amber-300 font-extrabold'
                                        : isOver
                                        ? 'bg-red-50 text-red-600 border border-red-200/60'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {isDueSoon && !isCompleted ? (
                                      <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                    ) : isOver && !isCompleted ? (
                                      <AlertCircle className="w-3 h-3 text-red-600" />
                                    ) : (
                                      <Calendar className="w-3 h-3" />
                                    )}
                                    {t.dueDate}
                                    {isDueSoon && !isCompleted && ' (Due Soon)'}
                                    {isOver && !isCompleted && ' (Overdue)'}
                                  </span>
                                )}

                                {t.assignedTo && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                                    <User className="w-3 h-3" />
                                    {t.assignedTo}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={() => handleOpenEditModal(t)}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => t.id && onDeleteTask(t.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {groupBy === 'status' && (
                  <button
                    onClick={() => handleOpenAddModal(group.id as TaskStatus)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tambah Task di sini</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTask ? 'Edit Task' : 'Tambah Task Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Task *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Follow up proposal dengan Budi Santoso"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date (Tenggat Waktu)</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab (Assigned To)</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Nama anggota tim"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Task</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instruksi tambahan..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  {editingTask ? 'Simpan Perubahan' : 'Tambah Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

