import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TaskProvider } from './contexts/TaskContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <TaskProvider>
                <App />
            </TaskProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
