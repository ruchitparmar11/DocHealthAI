import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function History() {
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (!token) return;

        fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/appeals', {
            headers: { 'x-auth-token': token }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch history');
                return res.json();
            })
            .then(data => {
                setAppeals(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Could not load history');
                setLoading(false);
            });
    }, [token]);

    if (loading) return <div className="text-center p-10 text-slate-400">Loading history...</div>;
    if (error) return <div className="text-center p-10 text-red-400">{error}</div>;

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Appeal History
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {appeals.length} appeals found
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appeals.length === 0 ? (
                    <div className="col-span-full text-slate-500 dark:text-slate-400 text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="mb-2 text-lg font-medium">No past appeals found</p>
                        <p className="text-sm">Upload a denial letter to get started</p>
                    </div>
                ) : (
                    appeals.map(appeal => (
                        <div key={appeal.id} className="card group hover:-translate-y-1 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                            {appeal.patient_name || 'Unknown Patient'}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                                             ${appeal.denial_reason ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                            Denied
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        Created: {new Date(appeal.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Reason for Denial:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                                    {appeal.denial_reason || 'No specific reason detected'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <Link
                                    to={`/appeal/${appeal.id}`}
                                    className="btn btn-secondary py-1.5 px-3 text-xs dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
                                >
                                    View Details
                                </Link>
                                <button
                                    className="btn btn-primary py-1.5 px-3 text-xs"
                                    onClick={() => navigator.clipboard.writeText(appeal.appeal_letter)}
                                >
                                    Copy Letter
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
