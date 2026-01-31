import { useState, useEffect, useContext } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AuthContext from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';

export default function DashboardHome({ children }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_revenue: 0,
        success_rate: 0,
        pending_count: 0,
        chart_data: [],
        reason_data: [],
        recent_activity: []
    });
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (!token) return;

        fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/appeals/stats', {
            headers: { 'x-auth-token': token }
        })
            .then(res => res.json())
            .then(data => {
                setStats({
                    total_revenue: data.total_revenue,
                    success_rate: data.success_rate,
                    pending_count: data.total_appeals,
                    chart_data: data.chart_data || [],
                    reason_data: data.reason_data || [],
                    recent_activity: data.recent_activity || []
                });
            })
            .catch(console.error);
    }, [token]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card dark:bg-slate-800 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Value in Appeals</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total_revenue)}</h3>
                        <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Automated</span>
                    </div>
                </div>
                <div className="card dark:bg-slate-800 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Generated Appeals</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending_count}</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">Processed</span>
                    </div>
                </div>
                <div className="card dark:bg-slate-800 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Success Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.success_rate}%</h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300 px-2 py-0.5 rounded-full">Baseline</span>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="card dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Denial Letter</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">AI will analyze the PDF and generate an appeal instantly.</p>
                    </div>
                </div>
                {children}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Recovery Trend</h3>
                        <select className="text-sm border-slate-200 dark:border-slate-600 rounded-md text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border p-1 focus:outline-none">
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chart_data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tooltip-bg, #fff)',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Denial Reason Breakdown */}
                <div className="card dark:bg-slate-800 dark:border-slate-700 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Denial Reasons</h3>
                    <div className="flex-1 min-h-[250px] relative">
                        {stats.reason_data && stats.reason_data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.reason_data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.reason_data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--tooltip-bg, #fff)',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: '#0f172a' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-slate-600 dark:text-slate-400 text-xs ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                                <p className="text-sm">No data available yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="card dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Claims Activity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                <th className="py-3 pl-2">Patient</th>
                                <th className="py-3">Denial Reason</th>
                                <th className="py-3">Amount</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 pr-2 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {stats.recent_activity && stats.recent_activity.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="py-3 pl-2 font-medium text-slate-900 dark:text-white">{item.patient_name || 'Unknown'}</td>
                                    <td className="py-3 text-slate-600 dark:text-slate-300">
                                        <span className="truncate block max-w-[200px]" title={item.denial_reason}>{item.denial_reason ? (item.denial_reason.length > 30 ? item.denial_reason.substring(0, 30) + '...' : item.denial_reason) : 'N/A'}</span>
                                    </td>
                                    <td className="py-3 text-slate-600 dark:text-slate-300">{formatCurrency(item.claim_amount || 0)}</td>
                                    <td className="py-3">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.status === 'Sent' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' :
                                            item.status === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900'
                                            }`}>
                                            {item.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-2 text-right text-slate-500 dark:text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!stats.recent_activity || stats.recent_activity.length === 0) && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <p>No recent appeals found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
