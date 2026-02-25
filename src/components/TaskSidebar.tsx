import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTasks } from '../contexts/TaskContext';
import type { Task, Priority } from '../types';
import { Check, Trash2, Plus, Edit2, Calendar, Archive } from 'lucide-react';

interface TaskSidebarProps {
    selectedDate: Date;
    onClose?: () => void;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ selectedDate }) => {
    const dailyDateKey = format(selectedDate, 'yyyy-MM-dd');
    const { tasks, addTask, toggleTask, deleteTask, editTask, moveTask, getDayStats } = useTasks();

    const [viewMode, setViewMode] = useState<'daily' | 'backlog'>('daily');
    const dateKey = viewMode === 'backlog' ? 'backlog' : dailyDateKey;

    const dayTasks = tasks[dateKey] || [];
    const { totalPoints, earnedPoints } = getDayStats(dailyDateKey);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
    const [isAdding, setIsAdding] = useState(false);

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editPriority, setEditPriority] = useState<Priority>('medium');

    const isPastDate = viewMode === 'daily' && dailyDateKey < format(new Date(), 'yyyy-MM-dd');

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditPriority(task.priority);
        setIsAdding(false);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditTitle('');
        setEditPriority('medium');
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTitle.trim() || !editingTaskId) return;
        editTask(dateKey, editingTaskId, editTitle, editPriority);
        cancelEditing();
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(dateKey, newTaskTitle, newTaskPriority);
        setNewTaskTitle('');
        setIsAdding(false);
    };

    return (
        <div className="task-sidebar">
            <div className="sidebar-view-toggle">
                <button
                    className={`view-toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
                    onClick={() => { setViewMode('daily'); setIsAdding(false); cancelEditing(); }}
                >
                    Daily
                </button>
                <button
                    className={`view-toggle-btn ${viewMode === 'backlog' ? 'active' : ''}`}
                    onClick={() => { setViewMode('backlog'); setIsAdding(false); cancelEditing(); }}
                >
                    Backlog
                </button>
            </div>

            <div className="sidebar-header">
                <h2>{viewMode === 'backlog' ? 'Backlog Tasks' : format(selectedDate, 'MMMM do')}</h2>
                {viewMode === 'daily' && (
                    <div className="stats-badge">
                        {earnedPoints} / {totalPoints} pts
                    </div>
                )}
            </div>

            <div className="task-list">
                {dayTasks.length === 0 ? (
                    <p className="empty-state">No tasks {viewMode === 'backlog' ? 'in backlog' : 'for this day'}.</p>
                ) : (
                    dayTasks.map(task => (
                        editingTaskId === task.id ? (
                            <form key={task.id} className="add-task-form" onSubmit={handleSaveEdit}>
                                <input
                                    type="text"
                                    placeholder="Task title..."
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    autoFocus
                                />
                                <div className="priority-selector">
                                    {(['high', 'medium', 'low'] as Priority[]).map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`priority-btn ${p} ${editPriority === p ? 'active' : ''}`}
                                            onClick={() => setEditPriority(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={cancelEditing} className="cancel-btn">Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={!editTitle.trim()}>Save</button>
                                </div>
                            </form>
                        ) : (
                            <div key={task.id} className={`task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
                                <div className="task-content" onClick={() => toggleTask(dateKey, task.id)}>
                                    <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                                        {task.completed && <Check size={14} />}
                                    </div>
                                    <span className="task-title">{task.title}</span>
                                    {viewMode === 'daily' && (
                                        <span className="task-points">
                                            {task.priority === 'high' ? '5' : task.priority === 'medium' ? '2' : '1'}pts
                                        </span>
                                    )}
                                </div>
                                <div className="task-actions">
                                    {viewMode === 'backlog' ? (
                                        <button
                                            className="icon-action-btn move-btn"
                                            title={`Move to ${format(selectedDate, 'MMM do')}`}
                                            onClick={() => moveTask(task.id, 'backlog', dailyDateKey)}
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className="icon-action-btn move-btn"
                                            title="Move to Backlog"
                                            onClick={() => moveTask(task.id, dailyDateKey, 'backlog')}
                                        >
                                            <Archive size={16} />
                                        </button>
                                    )}
                                    <button className="icon-action-btn edit-btn" onClick={() => startEditing(task)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="icon-action-btn delete-btn" onClick={() => deleteTask(dateKey, task.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    ))
                )}
            </div>

            {isPastDate ? (
                <div className="past-date-notice">
                    You cannot add tasks to past dates.
                </div>
            ) : isAdding ? (
                <form className="add-task-form" onSubmit={handleAddTask}>
                    <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        autoFocus
                    />
                    <div className="priority-selector">
                        {(['high', 'medium', 'low'] as Priority[]).map(p => (
                            <button
                                key={p}
                                type="button"
                                className={`priority-btn ${p} ${newTaskPriority === p ? 'active' : ''}`}
                                onClick={() => setNewTaskPriority(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={() => setIsAdding(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn" disabled={!newTaskTitle.trim()}>Add</button>
                    </div>
                </form>
            ) : (
                <button className="add-task-fab" onClick={() => setIsAdding(true)}>
                    <Plus /> New Task
                </button>
            )}
        </div>
    );
};

export default TaskSidebar;
