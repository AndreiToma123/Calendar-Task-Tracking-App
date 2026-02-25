import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Task, TasksByDate, Priority, DayStats } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface TaskContextType {
    tasks: TasksByDate;
    addTask: (date: string, title: string, priority: Priority) => void;
    toggleTask: (date: string, taskId: string) => void;
    deleteTask: (date: string, taskId: string) => void;
    editTask: (date: string, taskId: string, newTitle: string, newPriority: Priority) => void;
    moveTask: (taskId: string, fromDate: string, toDate: string) => void;
    getDayStats: (date: string) => DayStats;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const POINTS: Record<Priority, number> = {
    high: 5,
    medium: 2,
    low: 1,
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TasksByDate>({});

    useEffect(() => {
        if (!user) return;

        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching tasks:', error);
                return;
            }

            const groupedTasks: TasksByDate = {};
            data.forEach((row) => {
                if (!groupedTasks[row.date]) groupedTasks[row.date] = [];
                groupedTasks[row.date].push({
                    id: row.id,
                    title: row.title,
                    priority: row.priority as Priority,
                    completed: row.completed,
                });
            });

            setTasks(groupedTasks);
        };

        fetchTasks();
    }, [user]);

    const addTask = async (date: string, title: string, priority: Priority) => {
        if (!user) return;

        const fakeId = crypto.randomUUID();
        const newTask: Task = { id: fakeId, title, priority, completed: false };

        setTasks((prev) => ({
            ...prev,
            [date]: [...(prev[date] || []), newTask],
        }));

        const { data, error } = await supabase
            .from('tasks')
            .insert([{ user_id: user.id, date, title, priority, completed: false }])
            .select()
            .single();

        if (error) {
            console.error('Error adding task:', error);
            return;
        }

        setTasks((prev) => ({
            ...prev,
            [date]: prev[date].map((t) => (t.id === fakeId ? { ...t, id: data.id } : t)),
        }));
    };

    const toggleTask = async (date: string, taskId: string) => {
        setTasks((prev) => {
            const dayTasks = prev[date] || [];
            return {
                ...prev,
                [date]: dayTasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
            };
        });

        const task = tasks[date]?.find((t) => t.id === taskId);
        if (!task) return;

        const { error } = await supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', taskId);

        if (error) console.error('Error toggling task:', error);
    };

    const deleteTask = async (date: string, taskId: string) => {
        setTasks((prev) => {
            const dayTasks = prev[date] || [];
            return {
                ...prev,
                [date]: dayTasks.filter((t) => t.id !== taskId),
            };
        });

        const { error } = await supabase.from('tasks').delete().eq('id', taskId);

        if (error) console.error('Error deleting task:', error);
    };

    const editTask = async (date: string, taskId: string, newTitle: string, newPriority: Priority) => {
        setTasks((prev) => {
            const dayTasks = prev[date] || [];
            return {
                ...prev,
                [date]: dayTasks.map((t) =>
                    t.id === taskId ? { ...t, title: newTitle, priority: newPriority } : t
                ),
            };
        });

        const { error } = await supabase
            .from('tasks')
            .update({ title: newTitle, priority: newPriority })
            .eq('id', taskId);

        if (error) console.error('Error editing task:', error);
    };

    const moveTask = async (taskId: string, fromDate: string, toDate: string) => {
        const fromTasks = tasks[fromDate] || [];
        const taskToMove = fromTasks.find((t) => t.id === taskId);

        if (!taskToMove) return;

        setTasks((prev) => ({
            ...prev,
            [fromDate]: prev[fromDate].filter((t) => t.id !== taskId),
            [toDate]: [...(prev[toDate] || []), taskToMove],
        }));

        const { error } = await supabase
            .from('tasks')
            .update({ date: toDate })
            .eq('id', taskId);

        if (error) console.error('Error moving task:', error);
    };

    const getDayStats = (date: string): DayStats => {
        const dayTasks = tasks[date] || [];
        if (dayTasks.length === 0) {
            return { totalPoints: 0, earnedPoints: 0, percentage: 0 };
        }

        const totalPoints = dayTasks.reduce((sum, t) => sum + POINTS[t.priority], 0);
        const earnedPoints = dayTasks.reduce(
            (sum, t) => (t.completed ? sum + POINTS[t.priority] : sum),
            0
        );

        return {
            totalPoints,
            earnedPoints,
            percentage: totalPoints === 0 ? 0 : earnedPoints / totalPoints,
        };
    };

    return (
        <TaskContext.Provider
            value={{ tasks, addTask, toggleTask, deleteTask, editTask, moveTask, getDayStats }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
