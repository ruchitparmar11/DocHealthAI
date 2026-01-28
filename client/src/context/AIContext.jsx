import { createContext, useState } from 'react';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I can help you with medical billing, appeals, and coding questions. How can I assist you today?' }
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [contextData, setContextData] = useState({}); // Stores current page context (e.g. appeal details)

    const toggleChat = () => setIsOpen(prev => !prev);

    const addMessage = (role, content) => {
        setMessages(prev => [...prev, { role, content }]);
    };

    return (
        <AIContext.Provider value={{
            messages,
            addMessage,
            setMessages,
            isOpen,
            toggleChat,
            contextData,
            setContextData
        }}>
            {children}
        </AIContext.Provider>
    );
};

export default AIContext;
