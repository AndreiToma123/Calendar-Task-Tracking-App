import { useState } from 'react';
import CalendarView from './components/CalendarView';
import TaskSidebar from './components/TaskSidebar';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';
import { LogOut } from 'lucide-react';
import './index.css';

function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">Loading...</div>;
    }

    if (!session) {
        return <Login />;
    }

    return (
        <div className="app-container">
            <div className="main-content relative pt-12">
                <div className="absolute top-0 right-0 left-0 flex justify-between items-center px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <ThemeToggle />
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
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
