import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, User as UserIcon, Loader2, Calendar } from 'lucide-react';

export const Login: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        // Supabase requires an email under the hood, so we generate a consistent fake one
        const fakeEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@taskflow.auth.com`;

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({
                    email: fakeEmail,
                    password,
                });

                if (error) throw error;
                setSuccessMsg('Successfully registered! You can now sign in.');
                setIsRegistering(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: fakeEmail,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon-wrapper">
                        <Calendar size={32} />
                    </div>
                    <h1 className="login-title">
                        TaskFlow Cloud
                    </h1>
                    <p className="login-subtitle">
                        {isRegistering ? 'Create your secure workspace' : 'Sign in to access your secure workspace'}
                    </p>
                </div>

                <div className="login-tabs">
                    <button
                        type="button"
                        onClick={() => { setIsRegistering(false); setError(null); setSuccessMsg(null); }}
                        className={`login-tab-btn ${!isRegistering ? 'active' : ''}`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsRegistering(true); setError(null); setSuccessMsg(null); }}
                        className={`login-tab-btn ${isRegistering ? 'active' : ''}`}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div className="login-error">
                        <Lock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[var(--success-color)] rounded-xl text-sm flex items-start gap-3">
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label className="login-label">
                            Username
                        </label>
                        <div className="login-input-wrapper">
                            <div className="login-input-icon">
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="login-input"
                                placeholder="e.g. admin"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label className="login-label">
                            Password
                        </label>
                        <div className="login-input-wrapper">
                            <div className="login-input-icon">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-submit-btn"
                    >
                        {loading ? <Loader2 size={20} className="spin-animation" /> : (isRegistering ? 'Create Account' : 'Sign In')}
                    </button>

                    <p className="login-footer">
                        Secure connection via Supabase
                    </p>
                </form>
            </div>
        </div>
    );
};
