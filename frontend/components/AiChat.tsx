"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import api from '@/services/apiClient';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface PendingAction {
  type: 'add' | 'remove' | 'update';
  title: string;
  details: string;
  pendingId: string;
  amount?: number;
  emoji?: string;
  date?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pendingAction?: PendingAction;
  isActionResolved?: boolean;
}

const STORAGE_KEY = 'finance_ai_chat_history';
const ALL_SUGGESTIONS = [
    "Add $500 for food",
    "Spent $200 at shopping",
    "Show last 10 transactions",
    "What is my balance?",
    "How much did I spend this week?",
    "Add $2000 for rent",
    "$300 at movies yesterday",
    "Delete my last transaction",
    "Show salary income",
    "$1000 freelance 25 Mar",
    "Update my last food expense to $600",
    "Total expenses this month?",
    "Analyze my spending habits",
    "Clear last transaction",
    "Income from investments?",
    "Add $300 Transport",
    "Show grocery spending",
    "My net balance?"
];

const AiChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const shuffleSuggestions = () => {
        const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
        setVisibleSuggestions(shuffled.slice(0, 5));
    };

    useEffect(() => {
        shuffleSuggestions();
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const restored = JSON.parse(saved).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(restored);
            } catch (e) {
                console.error('Failed to load history', e);
            }
        } else {
            setMessages([{
                role: 'assistant',
                content: "👋 You can manage your finances here.\n\nTry:\n• Add $500 food\n• Show last 10 transactions\n• Check your balance",
                timestamp: new Date()
            }]);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSendMessage = async (customMessage?: string, payload?: any) => {
        const userMsg = (customMessage || input).trim();
        if (!userMsg && !payload) return;

        if (!payload) {
            setInput('');
            setMessages((prev) => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        }
        
        setIsLoading(true);
        try {
            const res = await api.post('/ai-chat', { message: userMsg, payload: payload });
            setMessages((prev) => [...prev, { 
                role: 'assistant', 
                content: res.data.reply, 
                timestamp: new Date(),
                pendingAction: res.data.pendingAction
            }]);
            shuffleSuggestions();
        } catch (error) {
            toast.error('Failed to get response');
            setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I had an error.", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAction = (msgIndex: number, action: PendingAction) => {
        const current = [...messages];
        current[msgIndex].isActionResolved = true;
        setMessages(current);
        handleSendMessage(`Confirming: ${action.title}`, { pendingId: action.pendingId });
        shuffleSuggestions();
    };

    const handleCancelAction = (msgIndex: number) => {
        const current = [...messages];
        current[msgIndex].isActionResolved = true;
        setMessages(current);
        handleSendMessage('cancel');
    };

    const handleEditAction = () => {
        toast.info("You can type naturally to refine this (e.g., 'Make it 500' or 'Change title to Rent')");
        const inputElem = document.querySelector('input');
        if (inputElem) inputElem.focus();
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f8fafc]">
            <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-3">
                <div className="bg-blue-600/10 p-2 rounded-lg"><Bot className="w-6 h-6 text-blue-600" /></div>
                <div>
                    <h2 className="text-slate-900 font-bold tracking-tight">Finance AI Dashboard</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Safe Mode Enabled</p>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? "ml-auto flex-row-reverse max-w-[80%]" : "mr-auto max-w-[85%]")}>
                            <div className={cn("p-2 rounded-lg shrink-0", m.role === 'user' ? "bg-blue-600" : "bg-white border text-slate-400")}>
                                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className={cn("p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap font-medium", m.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border-slate-200 text-slate-700 rounded-tl-none")}>
                                    {m.content}
                                    <span className="text-[9px] mt-2 block opacity-50">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {m.pendingAction && !m.isActionResolved && (
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden relative group">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Review Action</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{m.pendingAction.emoji || '✨'}</span>
                                                <h3 className="text-base font-bold text-slate-900">{m.pendingAction.title}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                                                <p className="text-xl font-black text-slate-800 tabular-nums">${m.pendingAction.amount || '??'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                                <p className="text-xs font-bold text-slate-600">
                                                    {m.pendingAction.date ? new Date(m.pendingAction.date).toLocaleDateString() : 'Today'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleConfirmAction(i, m.pendingAction!)} 
                                                className="flex-[2] text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                                            >
                                                Confirm
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleEditAction()} 
                                                className="flex-1 text-xs font-bold border-slate-200 hover:bg-slate-50"
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleCancelAction(i)} 
                                                className="flex-1 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex items-center gap-3 text-slate-400 italic text-xs ml-2"><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</div>}
                </div>
            </div>

            <div className="p-4 border-t bg-white">
                {!isLoading && (
                    <div className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-4">
                        {visibleSuggestions.map((s, i) => (
                            <button key={i} onClick={() => handleSendMessage(s)} className="text-[10px] bg-slate-50 hover:bg-blue-50 border px-3 py-1.5 rounded-full transition-all font-bold text-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-300">{s}</button>
                        ))}
                    </div>
                )}
                <div className="max-w-4xl mx-auto flex gap-2">
                    <Input placeholder='Ask or type: "Add 500 food", "Show last transactions"' value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="h-12 bg-slate-100/50 border-none font-medium" />
                    <Button onClick={() => handleSendMessage()} disabled={isLoading} className="h-12 w-12 bg-blue-600 rounded-xl"><Send className="w-5 h-5" /></Button>
                </div>
            </div>
        </div>
    );
};

export default AiChat;
