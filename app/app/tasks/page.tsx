'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Clock, X, Calendar as CalIcon, Trash2, Edit } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Avatar, SectionTabs } from '@/components/crm/crm-ui';
import { useTasks } from '@/lib/data/hooks';
import type { Task } from '@/lib/crm-data';
import { cn } from '@/lib/utils';
import { insertRecord, updateRecord, deleteRecord } from '@/lib/data/crud';
import { toast } from '@/components/ui/toast';

const COLUMNS: { id: Task['status']; color: string }[] = [
  { id: 'Backlog', color: 'bg-slate-300' },
  { id: 'In Progress', color: 'bg-cyan-500' },
  { id: 'Review', color: 'bg-amber-500' },
  { id: 'Done', color: 'bg-emerald-500' },
];

const PRIORITY_COLORS: Record<Task['priority'], 'red' | 'yellow' | 'muted'> = {
  Urgent: 'red',
  High: 'yellow',
  Medium: 'muted',
  Low: 'muted',
};

export default function TasksPage() {
  const { data: initialTasks = [], refetch } = useTasks();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  const tasks = useMemo(() => {
    return localTasks.length > 0 ? localTasks : initialTasks;
  }, [localTasks, initialTasks]);

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<Task | null>(null);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'In Progress' as Task['status'],
    priority: 'Medium' as Task['priority'],
    dueDate: 'Tomorrow',
    assignee: 'Current Telecaller',
  });

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'In Progress',
      priority: 'High',
      dueDate: 'Today, 5:00 PM',
      assignee: 'Self',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Task) => {
    setEditingTask(t);
    setFormData({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast({ title: 'Title Required', description: 'Please enter a task title.' });
      return;
    }

    if (editingTask) {
      const updated = { ...editingTask, ...formData };
      await updateRecord('tasks', editingTask.id, formData);
      setLocalTasks((prev) => (prev.length > 0 ? prev : tasks).map((item) => (item.id === editingTask.id ? updated : item)));
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...formData,
        tags: ['Telecalling Task'],
      };
      await insertRecord('tasks', newTask);
      setLocalTasks((prev) => [newTask, ...(prev.length > 0 ? prev : tasks)]);
    }

    setIsModalOpen(false);
    if (selected) setSelected(null);
    refetch();
  };

  const toggleDone = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const newStatus: Task['status'] = target.status === 'Done' ? 'In Progress' : 'Done';
    await updateRecord('tasks', id, { status: newStatus });
    setLocalTasks((prev) => (prev.length > 0 ? prev : tasks).map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    toast({ title: 'Task Updated', description: `Task status changed to ${newStatus}` });
    refetch();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteRecord('tasks', id);
      setLocalTasks((prev) => (prev.length > 0 ? prev : tasks).filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Follow-up Queue"
        subtitle={`${tasks.filter((t) => t.status !== 'Done').length} pending tasks • ${tasks.filter((t) => t.status === 'Done').length} completed`}
        actions={
          <div className="flex items-center gap-3">
            <SectionTabs tabs={['kanban', 'list']} active={view} onChange={(v) => setView(v as 'kanban' | 'list')} />
            <Button variant="primary" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </div>
        }
      />

      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="w-72 shrink-0">
                <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', col.color)} />
                    <span className="text-sm font-bold text-slate-800">{col.id}</span>
                    <span className="text-xs font-semibold text-slate-500">({colTasks.length})</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      onClick={() => setSelected(task)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <p className="text-sm font-bold text-slate-900 leading-snug">{task.title}</p>
                        <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                      </div>
                      <p className="mb-3 text-xs text-slate-500 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <span className="text-xs font-medium text-slate-600">{task.assignee}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <Clock className="h-3 w-3" />{task.dueDate}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <Card className="p-0 bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/80 transition-colors">
                <button onClick={() => toggleDone(task.id)}>
                  {task.status === 'Done' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-slate-300 hover:text-slate-500" />}
                </button>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelected(task)}>
                  <p className={cn('text-sm font-bold text-slate-900', task.status === 'Done' && 'text-slate-400 line-through')}>{task.title}</p>
                  <p className="truncate text-xs text-slate-500">{task.description}</p>
                </div>
                <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                <span className="text-xs text-slate-500 font-medium">{task.dueDate}</span>
                <button onClick={() => handleOpenEditModal(task)} className="p-1.5 text-slate-400 hover:text-blue-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Task Title</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Follow up on proposal"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter details or notes..."
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Due Date & Time</label>
                  <input
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    placeholder="e.g. Tomorrow, 2:00 PM"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">{editingTask ? 'Update Task' : 'Save Task'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900">{selected.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{selected.description || 'No description provided.'}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex justify-between items-center"><span className="text-slate-500">Status</span><Badge variant="primary">{selected.status}</Badge></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Priority</span><Badge variant={PRIORITY_COLORS[selected.priority]}>{selected.priority}</Badge></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Due Date</span><span className="font-bold text-slate-800">{selected.dueDate}</span></div>
              </div>

              <div className="flex gap-2">
                <Button variant="primary" className="flex-1" onClick={() => { toggleDone(selected.id); setSelected(null); }}>
                  {selected.status === 'Done' ? 'Reopen Task' : 'Mark Complete'}
                </Button>
                <Button variant="outline" onClick={() => handleOpenEditModal(selected)}>Edit</Button>
                <Button variant="outline" onClick={() => handleDeleteTask(selected.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

