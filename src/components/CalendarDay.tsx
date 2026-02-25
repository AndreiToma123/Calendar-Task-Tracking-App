import React from 'react';
import { format, isToday } from 'date-fns';
import { useTasks } from '../contexts/TaskContext';

interface CalendarDayProps {
    date: Date;
    onClick: (date: Date) => void;
    isSelected: boolean;
    isCurrentMonth: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, onClick, isSelected, isCurrentMonth }) => {
    const { getDayStats } = useTasks();
    const dateKey = format(date, 'yyyy-MM-dd');
    const { percentage, totalPoints } = getDayStats(dateKey);

    // We will use CSS classes for colors defined in index.css
    let dayClass = 'calendar-day';
    if (!isCurrentMonth) dayClass += ' other-month';
    if (isSelected) dayClass += ' selected';
    if (isToday(date)) dayClass += ' today';

    // Dynamic color class
    if (totalPoints > 0) {
        if (percentage >= 0.9) dayClass += ' day-success';
        else if (percentage >= 0.5) dayClass += ' day-warning';
        else dayClass += ' day-danger';
    }

    return (
        <div className={dayClass} onClick={() => onClick(date)}>
            <span className="day-number">{format(date, 'd')}</span>
            {totalPoints > 0 && (
                <div className="day-indicator" style={{ opacity: 0.5 }}>
                    {Math.round(percentage * 100)}%
                </div>
            )}
        </div>
    );
};

export default CalendarDay;
