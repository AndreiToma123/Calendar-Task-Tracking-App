import { useState } from 'react';
import CalendarView from './components/CalendarView';
import TaskSidebar from './components/TaskSidebar';
import ThemeToggle from './components/ThemeToggle';
import './index.css';

function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="app-container">
            <div className="main-content">
                <ThemeToggle />
                <CalendarView
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />
            </div>
            <TaskSidebar selectedDate={selectedDate} />
        </div>
    );
}

export default App;
