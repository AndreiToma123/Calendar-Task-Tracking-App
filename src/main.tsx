import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TaskProvider } from './contexts/TaskContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <TaskProvider>
                    <App />
                </TaskProvider>
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
