import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

export default function Profile() {
    const { user, token, loadUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'security'

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (activeTab === 'security' && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/auth/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    name: formData.name,
                    password: formData.password || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            await loadUser(); // Refresh context
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header / Banner */}
            <div className="relative mb-10 group">
                <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <svg className="w-32 h-32 text-white/10 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                    </div>
                </div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-2xl ring-4 ring-white/50 dark:ring-slate-700/50">
                            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-400 select-none">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <div className="mb-3 pb-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white drop-shadow-sm tracking-tight">{user?.name}</h1>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <span className="text-sm font-medium">{user?.email}</span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 rounded-full border border-blue-100 dark:border-blue-800">Pro Member</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="md:col-span-3 space-y-2">
                    <nav className="sticky top-24 space-y-1">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${activeTab === 'general'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <svg className={`w-5 h-5 transition-colors ${activeTab === 'general' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            General
                            {activeTab === 'general' && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${activeTab === 'security'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <svg className={`w-5 h-5 transition-colors ${activeTab === 'security' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Security
                        </button>
                    </nav>
                </div>

                {/* Main Content Card */}
                <div className="md:col-span-9">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ring-1 ring-slate-900/5">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {activeTab === 'general' ? 'Personal Information' : 'Security Settings'}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        {activeTab === 'general' ? 'Manage your personal details and public profile.' : 'Manage your password and account security.'}
                                    </p>
                                </div>
                                {activeTab === 'security' && (
                                    <div className="hidden sm:block px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
                                        Secure Connection
                                    </div>
                                )}
                            </div>

                            {message && (
                                <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm ${message.type === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800'
                                    }`}>
                                    <div className={`p-1.5 rounded-full ${message.type === 'error' ? 'bg-red-100 dark:bg-red-800/30' : 'bg-green-100 dark:bg-green-800/30'}`}>
                                        {message.type === 'error' ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 group">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">Display Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 opacity-75">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                </div>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-inner"
                                                />
                                            </div>
                                            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                Managed by organization
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg text-blue-600 dark:text-blue-400">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Account Status: Good</h4>
                                            <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">Your account is fully active and has access to all premium features.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                                        <h4 className="text-base font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                                            <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </span>
                                            Security Recommendations
                                        </h4>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed max-w-2xl">
                                            We recommend using a strong password that you don't use on other websites. Your password should contain at least 8 characters, including numbers and symbols.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 group">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">New Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transform hover:-translate-y-0.5"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            Save Changes
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
