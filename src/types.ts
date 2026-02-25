export type Priority = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    title: string;
    priority: Priority;
    completed: boolean;
}

export interface TasksByDate {
    [date: string]: Task[]; // date format: YYYY-MM-DD
}

export interface DayStats {
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
}
