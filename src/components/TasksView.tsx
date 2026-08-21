import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/crm';
import { isTaskDueSoon, isTaskOverdue } from '../utils/taskUtils';
import { TaskCalendarView } from './TaskCalendarView';
import { useLanguage } from '../context/LanguageContext';
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
  const { language, t } = useLanguage();
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

  const filteredTasks = tasks.filter((tItem) => {
    return (
      tItem.title.toLowerCase().includes(search.toLowerCase()) ||
      (tItem.assignedTo && tItem.assignedTo.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const statusGroups: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'Todo', label: language === 'id' ? 'Belum Dikerjakan (Todo)' : 'To Do', color: '#3B82F6' },
    { id: 'In Progress', label: language === 'id' ? 'Dalam Proses (In Progress)' : 'In Progress', color: '#F59E0B' },
    { id: 'Completed', label: language === 'id' ? 'Selesai (Completed)' : 'Completed', color: '#16A34A' }
  ];

  const priorityGroups: { id: TaskPriority; label: string; color: string }[] = [
    { id: 'High', label: language === 'id' ? 'Prioritas Tinggi (High)' : 'High Priority', color: '#DC2626' },
    { id: 'Medium', label: language === 'id' ? 'Prioritas Sedang (Medium)' : 'Medium Priority', color: '#D97706' },
    { id: 'Low', label: language === 'id' ? 'Prioritas Rendah (Low)' : 'Low Priority', color: '#2563EB' }
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
              <span>{t.tasks.title}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                {tasks.length} {language === 'id' ? 'Total Tugas' : 'Total Tasks'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.tasks.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher: Board vs Calendar */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{t.tasks.kanbanBoard}</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{t.tasks.calendarView}</span>
              </button>
            </div>

            {/* Board Group Switcher (only visible in board mode) */}
            {viewMode === 'board' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                <button
                  onClick={() => setGroupBy('status')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    groupBy === 'status' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {language === 'id' ? 'Status' : 'By Status'}
                </button>
                <button
                  onClick={() => setGroupBy('priority')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    groupBy === 'priority' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {language === 'id' ? 'Prioritas' : 'By Priority'}
                </button>
              </div>
            )}

            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.tasks.addTask}</span>
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
                placeholder={t.tasks.searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {language === 'id' ? `Menampilkan ${filteredTasks.length} task` : `Showing ${filteredTasks.length} tasks`}
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
            const groupTasks = filteredTasks.filter((tItem) =>
              groupBy === 'status' ? tItem.status === group.id : tItem.priority === group.id
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
                        {language === 'id' ? 'Tidak ada task pada kategori ini' : 'No tasks in this category'}
                      </div>
                    ) : (
                      groupTasks.map((tItem) => {
                        const isCompleted = tItem.status === 'Completed' || tItem.status === 'Done';
                        const isDueSoon = isTaskDueSoon(tItem);
                        const isOver = isTaskOverdue(tItem);

                        return (
                          <div
                            key={tItem.id}
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
                                onChange={() => tItem.id && onToggleTaskStatus(tItem.id)}
                                className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p
                                    className={`text-xs font-extrabold text-slate-900 ${
                                      isCompleted ? 'line-through text-slate-400' : ''
                                    }`}
                                  >
                                    {tItem.title}
                                  </p>
                                  {isDueSoon && !isCompleted && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-200 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      Due Soon
                                    </span>
                                  )}
                                </div>

                                {tItem.notes && (
                                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                    {tItem.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {tItem.dueDate && (
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
                                    {tItem.dueDate}
                                    {isDueSoon && !isCompleted && ' (Due Soon)'}
                                    {isOver && !isCompleted && ' (Overdue)'}
                                  </span>
                                )}

                                {tItem.assignedTo && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                                    <User className="w-3 h-3" />
                                    {tItem.assignedTo}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={() => handleOpenEditModal(tItem)}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                                  title={t.actions.edit}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => tItem.id && onDeleteTask(tItem.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  title={t.actions.delete}
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
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'id' ? 'Tambah Task di sini' : 'Add Task here'}</span>
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
                {editingTask ? (language === 'id' ? 'Edit Task' : 'Edit Task') : t.tasks.addTask}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                title={t.actions.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'id' ? 'Judul Task *' : 'Task Title *'}
                </label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'id' ? 'Prioritas' : 'Priority'}
                  </label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'id' ? 'Due Date (Tenggat Waktu)' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'id' ? 'Penanggung Jawab (Assigned To)' : 'Assigned To'}
                  </label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'id' ? 'Catatan Task' : 'Task Notes'}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={language === 'id' ? 'Instruksi tambahan...' : 'Additional notes...'}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {editingTask ? t.actions.save : t.actions.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
