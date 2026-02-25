import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Task, TasksByDate, Priority, DayStats } from '../types';

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
    const [tasks, setTasks] = useState<TasksByDate>(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (date: string, title: string, priority: Priority) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            priority,
            completed: false,
        };

        setTasks((prev) => ({
            ...prev,
            [date]: [...(prev[date] || []), newTask],
        }));
    };

    const toggleTask = (date: string, taskId: string) => {
        setTasks((prev) => {
            const dayTasks = prev[date] || [];
            return {
                ...prev,
                [date]: dayTasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
            };
        });
    };

    const deleteTask = (date: string, taskId: string) => {
        setTasks((prev) => {
            const dayTasks = prev[date] || [];
            return {
                ...prev,
                [date]: dayTasks.filter((t) => t.id !== taskId),
            };
        });
    };

    const editTask = (date: string, taskId: string, newTitle: string, newPriority: Priority) => {
        setTasks((prev) => {
            const dayTasks = prev[date] || [];
            return {
                ...prev,
                [date]: dayTasks.map((t) =>
                    t.id === taskId ? { ...t, title: newTitle, priority: newPriority } : t
                ),
            };
        });
    };

    const moveTask = (taskId: string, fromDate: string, toDate: string) => {
        setTasks((prev) => {
            const fromTasks = prev[fromDate] || [];
            const taskToMove = fromTasks.find((t) => t.id === taskId);
            
            if (!taskToMove) return prev;

            return {
                ...prev,
                [fromDate]: fromTasks.filter((t) => t.id !== taskId),
                [toDate]: [...(prev[toDate] || []), taskToMove],
            };
        });
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
        <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, editTask, moveTask, getDayStats }}>
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
