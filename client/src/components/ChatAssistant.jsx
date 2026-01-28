import { useState, useContext, useRef, useEffect } from 'react';
import AIContext from '../context/AIContext';
import AuthContext from '../context/AuthContext';

export default function ChatAssistant() {
    const { messages, addMessage, setMessages, isOpen, toggleChat, contextData } = useContext(AIContext);
    const { token } = useContext(AuthContext);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (contextData?.appeal_id && token) {
            fetch(`http://localhost:5000/chat/${contextData.appeal_id}`, {
                headers: { 'x-auth-token': token }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setMessages(data);
                    } else {
                        setMessages([
                            { role: 'assistant', content: 'Hi! I can help you with medical billing, appeals, and coding questions. How can I assist you today?' }
                        ]);
                    }
                })
                .catch(console.error);
        }
    }, [contextData.appeal_id, token, setMessages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        addMessage('user', userMessage);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: contextData, // Send dynamic global context
                    appealId: contextData.appeal_id
                })
            });
            const data = await res.json();

            if (data.response) {
                addMessage('assistant', data.response);
            }
        } catch (err) {
            console.error(err);
            addMessage('assistant', "Sorry, I encountered an error connecting to the AI.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Chat Assistant Button - Only visible when closed */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 group hover:scale-110 bg-blue-600 hover:bg-blue-700"
                    title="Open Assistant"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </button>
            )}

            {/* Chat Assistant Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 z-40 border-l border-slate-200 dark:border-slate-700 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">AI Assistant</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {contextData.patient_name ? `Context: ${contextData.patient_name}` : 'General Assistant'}
                        </p>
                    </div>
                    <button onClick={toggleChat} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
