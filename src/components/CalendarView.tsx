import React from 'react';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
    format, addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarDay from './CalendarDay';

interface CalendarViewProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate, onDateChange, selectedDate, onSelectDate
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => onDateChange(addMonths(currentDate, 1));
    const prevMonth = () => onDateChange(subMonths(currentDate, 1));

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="icon-btn" onClick={prevMonth}><ChevronLeft /></button>
                <h2>{format(currentDate, 'MMMM yyyy')}</h2>
                <button className="icon-btn" onClick={nextMonth}><ChevronRight /></button>
            </div>

            <div className="calendar-grid">
                {weekDays.map(day => (
                    <div key={day} className="weekday-header">{day}</div>
                ))}
                {days.map(day => (
                    <CalendarDay
                        key={day.toISOString()}
                        date={day}
                        isSelected={day.toDateString() === selectedDate.toDateString()}
                        isCurrentMonth={day.getMonth() === monthStart.getMonth()}
                        onClick={onSelectDate}
                    />
                ))}
            </div>
        </div>
    );
};

export default CalendarView;
