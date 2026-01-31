import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, analyzing, success, error
    const [result, setResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const checkAuth = () => {
        if (!token) {
            navigate('/login');
            return false;
        }
        return true;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (!checkAuth()) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (!checkAuth()) return; // Should technically be caught by onClick of parent but good backup

        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        if (!checkAuth()) return;

        setStatus('analyzing');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/analyze', {
                method: 'POST',
                headers: {
                    'x-auth-token': token
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();

            if (data.appealId) {
                // Redirect to the appeal editor
                navigate(`/appeal/${data.appealId}`);
            } else {
                // Fallback if no ID returned (e.g. database error but analysis success)
                setResult(data);
                setStatus('success');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {status === 'idle' || status === 'uploading' || status === 'analyzing' || status === 'error' ? (
                <div className="w-full">
                    <div
                        className={`relative group bg-white dark:bg-slate-800 border border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
                            ${dragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleChange}
                        />

                        <div className="relative z-10 flex flex-col items-center gap-4 transition-transform duration-300">
                            <div className={`p-4 rounded-full transition-all duration-300 ${dragActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 group-hover:text-blue-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                    {file ? file.name : "Click to upload denial letter"}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">
                                    {file ? "Ready to process" : "PDF files only (max 10MB)"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {file && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                                disabled={status === 'uploading' || status === 'analyzing'}
                                className="btn btn-primary py-2 px-6 text-sm w-full sm:w-auto"
                            >
                                {status === 'analyzing' ? 'Analyzing...' : 'Generate Appeal'}
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-4 bg-red-50 text-red-600 text-center border-t border-red-100 text-sm font-medium">
                            Analysis failed. Please try again.
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
                    <div className="bg-bg-card border border-border rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-red-400">🚫</span> Denial Reason
                        </h3>
                        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg text-red-100">
                            {result?.analysis?.denialReason}
                        </div>
                    </div>

                    <div className="bg-bg-card border border-border rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-green-400">📝</span> Generated Appeal
                            </h3>
                            <button
                                className="btn btn-primary py-1 px-3 text-sm"
                                onClick={() => navigator.clipboard.writeText(result?.analysis?.appealLetter)}
                            >
                                Copy Text
                            </button>
                        </div>

                        <div className="whitespace-pre-wrap font-mono text-sm bg-slate-950 p-6 rounded-lg border border-slate-800 text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto">
                            {result?.analysis?.appealLetter}
                        </div>
                    </div>

                    <button
                        onClick={() => { setFile(null); setStatus('idle'); setResult(null); }}
                        className="text-slate-400 hover:text-white underline"
                    >
                        Analyze another claim
                    </button>
                </div>
            )}
        </div>
    );
}
