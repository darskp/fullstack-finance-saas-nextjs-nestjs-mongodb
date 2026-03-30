"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Check } from 'lucide-react';
import api from '@/services/apiClient';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import EmojiPicker from "emoji-picker-react";
import { Calendar } from "./ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/Select";
import { INCOME_CATEGORY_CONSTANTS, EXPENSE_CATEGORY_CONSTANTS } from "@/utils/constants";
import { ChevronDownIcon } from "lucide-react";

interface PendingAction {
  type: 'income' | 'expense' | 'delete' | 'update';
  title: string;
  details: string;
  pendingId: string;
  amount?: number;
  emoji?: string;
  date?: string;
}

const ACTION_THEMES = {
  income: {
    color: 'emerald-600',
    bg: 'bg-emerald-600',
    border: 'border-emerald-100',
    lightBg: 'bg-emerald-50',
    text: 'text-emerald-700',
    shadow: 'shadow-emerald-200',
    hover: 'hover:bg-emerald-700',
    accent: 'emerald',
    badge: 'Income',
  },
  expense: {
    color: 'amber-500',
    bg: 'bg-amber-500',
    border: 'border-amber-100',
    lightBg: 'bg-amber-50',
    text: 'text-amber-700',
    shadow: 'shadow-amber-200',
    hover: 'hover:bg-amber-600',
    accent: 'amber',
    badge: 'Expense',
  },
  delete: {
    color: 'rose-500',
    bg: 'bg-rose-500',
    border: 'border-rose-100',
    lightBg: 'bg-rose-50',
    text: 'text-rose-700',
    shadow: 'shadow-rose-200',
    hover: 'hover:bg-rose-600',
    accent: 'rose',
    badge: 'Delete',
  },
  update: {
    color: 'indigo-600',
    bg: 'bg-indigo-600',
    border: 'border-indigo-100',
    lightBg: 'bg-indigo-50',
    text: 'text-indigo-700',
    shadow: 'shadow-indigo-200',
    hover: 'hover:bg-indigo-700',
    accent: 'indigo',
    badge: 'Update',
  },
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pendingActions?: PendingAction[];
  resolvedStatus?: Record<string, 'confirmed' | 'cancelled'>;
}

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
  "Total expenses this month?",
  "Analyze my spending habits",
  "My net balance?",
  "Add $300 Transport",
];

const AiChat = () => {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Inject Clerk token into every API request
  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const shuffleSuggestions = () => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setVisibleSuggestions(shuffled.slice(0, 5));
  };

  // Load chat history from the backend (MongoDB) on mount
  useEffect(() => {
    shuffleSuggestions();
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await api.get('/ai-chat/history', { headers });
        const { history, activePendingIds } = res.data;
        
        if (history && history.length > 0) {
          const restored: Message[] = history.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt),
            pendingActions: m.pendingActions,
            // Mark all loaded actions as historically confirmed if they aren't in activePendingIds
            resolvedStatus: (m.pendingActions || []).reduce((acc: any, pa: any) => {
              if (!activePendingIds.includes(pa.pendingId)) {
                acc[pa.pendingId] = 'confirmed';
              }
              return acc;
            }, {}),
          }));
          setMessages(restored);
        } else {
          setMessages([{
            role: 'assistant',
            content: "👋 You can manage your finances here.\n\nTry:\n• Add $500 food\n• Show last 10 transactions\n• Check your balance",
            timestamp: new Date()
          }]);
        }
      } catch (e) {
        console.error('Failed to load history', e);
        setMessages([{
          role: 'assistant',
          content: "👋 Welcome! Type a message to get started.",
          timestamp: new Date()
        }]);
      } finally {
        setIsHistoryLoading(false);
        // Initial scroll to bottom after data is loaded and DOM rendered
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }
    };
    loadHistory();
  }, [getAuthHeaders]);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 300; // Increased threshold
      
      // Auto-scroll for user messages or if we're near the bottom
      if (isAtBottom || (messages.length > 0 && messages[messages.length-1].role === 'user')) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (customMessage?: string, payload?: any) => {
    const userMsg = (customMessage || input).trim();
    if (!userMsg && !payload) return;

    // Append user message to UI immediately (optimistic update)
    if (!payload) {
      setInput('');
      setMessages((prev) => [...prev, {
        role: 'user',
        content: userMsg,
        timestamp: new Date()
      }]);
    }

    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await api.post('/ai-chat', { message: userMsg || '', payload }, { headers });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date(),
        pendingActions: res.data.pendingActions,
        resolvedStatus: {},
      }]);
      shuffleSuggestions();
    } catch (error) {
      toast.error('Failed to get response');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Sorry, I had an error connecting to the AI.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (msgIndex: number, action: PendingAction) => {
    setMessages(prev => {
      const updated = [...prev];
      const status = updated[msgIndex].resolvedStatus || {};
      updated[msgIndex] = { ...updated[msgIndex], resolvedStatus: { ...status, [action.pendingId]: 'confirmed' } };
      return updated;
    });
    handleSendMessage('Confirmed', { pendingId: action.pendingId });
    // Proactive UX Tip: Suggest undo after a successful confirmation
    setVisibleSuggestions(["Delete my last transaction", "Show last 10 transactions", "What is my balance?"]);
  };

  const handleCancelAction = (msgIndex: number, action: PendingAction) => {
    setMessages(prev => {
      const updated = [...prev];
      const status = updated[msgIndex].resolvedStatus || {};
      updated[msgIndex] = { ...updated[msgIndex], resolvedStatus: { ...status, [action.pendingId]: 'cancelled' } };
      return updated;
    });
    handleSendMessage('cancel', { pendingId: action.pendingId });
  };

  const handleEditAction = () => {
    toast.info("Type naturally to refine (e.g., 'Change it to $600' or 'Change category to rent')");
    const inputElem = document.querySelector('input');
    if (inputElem) inputElem.focus();
  };

  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const updateActionLocal = (msgIdx: number, paIdx: number, newFields: Partial<PendingAction>) => {
    setMessages(prev => {
      const updated = [...prev];
      const actions = [...(updated[msgIdx].pendingActions || [])];
      actions[paIdx] = { ...actions[paIdx], ...newFields };
      updated[msgIdx] = { ...updated[msgIdx], pendingActions: actions };
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc]">
      {/* Header with Glassmorphism */}
      <div className="p-4 border-b border-slate-200 bg-white/40 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2.5 rounded-xl shadow-inner"><Bot className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h2 className="text-slate-900 font-black tracking-tight text-sm">FINANCE INTELLIGENCE</h2>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Llama 3.3 · Active</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200/50">
           <p className="text-[10px] font-black text-slate-500 tabular-nums">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {isHistoryLoading ? (
            <div className="flex items-center gap-3 text-slate-400 italic text-xs ml-2 justify-center mt-10">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your conversation history...
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? "ml-auto flex-row-reverse max-w-[80%]" : "mr-auto max-w-[85%]")}>
                <div className={cn("p-2 rounded-lg shrink-0", m.role === 'user' ? "bg-blue-600" : "bg-white border text-slate-400")}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className="flex flex-col gap-2">
                  <div className={cn("p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap font-medium", m.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border-slate-200 text-slate-700 rounded-tl-none")}>
                    {m.content}
                    <span className="text-[9px] mt-2 block opacity-50">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {/* Pending Action Confirmation Cards */}
                  {m.pendingActions?.map((pa, paIdx) => {
                    const status = m.resolvedStatus?.[pa.pendingId];
                    const isConfirmed = status === 'confirmed';
                    const isCancelled = status === 'cancelled';
                    const isResolved = !!status;
                    
                    const theme = ACTION_THEMES[pa.type as keyof typeof ACTION_THEMES] || ACTION_THEMES.expense;

                    // Logic to find if this is the latest assistant message with actions
                    const assistantMessagesWithActions = messages.filter(msg => msg.role === 'assistant' && msg.pendingActions && msg.pendingActions.length > 0);
                    const lastMessageWithActions = assistantMessagesWithActions[assistantMessagesWithActions.length - 1];
                    const isFromLastMessage = m === lastMessageWithActions;
                    const isExpired = !isFromLastMessage && !isResolved;

                    const isEditing = editingActionId === pa.pendingId;
                    const constants = pa.type === 'income' ? INCOME_CATEGORY_CONSTANTS : EXPENSE_CATEGORY_CONSTANTS;

                    return (
                      <div key={pa.pendingId} className={cn(
                        "bg-white border rounded-2xl p-5 shadow-2xl max-w-sm overflow-hidden relative transition-all group",
                        (isResolved || isExpired) ? "shadow-none border-slate-100 opacity-90" : "border-slate-200 ring-4 ring-blue-500/5",
                        isExpired && "grayscale"
                      )}>
                        <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-opacity", theme.bg, (isResolved || isExpired) ? "opacity-30" : "opacity-100")} />
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {isConfirmed ? "Action Confirmed" : isCancelled ? "Action Cancelled" : isExpired ? "Draft Replaced" : isEditing ? "Editing Action" : `Review Action ${m.pendingActions!.length > 1 ? `(${paIdx + 1}/${m.pendingActions!.length})` : ''}`}
                            </p>
                            <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border", theme.text, theme.border, theme.lightBg)}>
                              {theme.badge}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <div className="flex items-center gap-2 w-full">
                                <div className="relative">
                                  <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-2xl border border-slate-200 p-1 rounded-lg hover:bg-slate-50 bg-white shadow-sm"
                                  >
                                    {pa.emoji || '✨'}
                                  </button>
                                  {showEmojiPicker && (
                                    <div className="absolute top-10 left-0 z-50">
                                      <EmojiPicker 
                                        onEmojiClick={(e) => {
                                          updateActionLocal(i, paIdx, { emoji: e.emoji });
                                          setShowEmojiPicker(false);
                                        }} 
                                      />
                                    </div>
                                  )}
                                </div>
                                <Input 
                                  value={pa.title} 
                                  onChange={(e) => updateActionLocal(i, paIdx, { title: e.target.value })}
                                  className="h-9 text-sm font-bold border-slate-200 focus:ring-2 ring-blue-500"
                                />
                              </div>
                            ) : (
                              <>
                                <span className={cn("text-2xl", (isResolved || isExpired) && "grayscale-[0.5]")}>{pa.emoji || '✨'}</span>
                                <div className="flex flex-col">
                                  <h3 className={cn("text-base font-bold", (isResolved || isExpired) ? "text-slate-500" : "text-slate-900")}>{pa.title}</h3>
                                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    {pa.details || (pa.type === 'income' ? 'Salary' : 'General')}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {isEditing && pa.type !== 'delete' && (
                          <div className="mb-4">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                             <Select 
                              value={pa.details} // Using details field for category string in draft state
                              onValueChange={(val) => updateActionLocal(i, paIdx, { details: val })}
                             >
                                <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 text-xs font-medium">
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {constants.map(({ value, title }) => (
                                      <SelectItem key={value} value={value} className="text-xs">{title}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                             </Select>
                          </div>
                        )}

                        <div className={cn("rounded-xl p-4 mb-5 border flex justify-between items-center", theme.lightBg, theme.border, (isResolved || isExpired) && "opacity-60")}>
                          <div className="flex-1">
                            <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70", theme.text)}>Amount</p>
                            {isEditing ? (
                               <div className="relative">
                                 <span className={cn("absolute left-2 top-1/2 -translate-y-1/2 font-black text-xs", theme.text)}>$</span>
                                 <Input 
                                  type="number"
                                  value={pa.amount} 
                                  onChange={(e) => updateActionLocal(i, paIdx, { amount: parseFloat(e.target.value) })}
                                  className={cn("h-9 pl-6 text-sm font-black tabular-nums bg-white border-slate-200 focus:ring-2 ring-blue-500", theme.text)}
                                />
                               </div>
                            ) : (
                              <p className={cn("text-xl font-black tabular-nums", theme.text)}>${pa.amount ?? '??'}</p>
                            )}
                          </div>
                          <div className="text-right flex-1 ml-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                            {isEditing ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="h-9 w-full px-2 text-[10px] bg-white border-slate-200 flex justify-between font-bold text-slate-600">
                                    {pa.date ? new Date(pa.date).toLocaleDateString() : 'Pick a date'}
                                    <ChevronDownIcon className="w-3 h-3 ml-1" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <Calendar 
                                    mode="single"
                                    selected={pa.date ? new Date(pa.date) : undefined}
                                    onSelect={(date) => updateActionLocal(i, paIdx, { date: date?.toISOString() })}
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <p className="text-xs font-bold text-slate-600">
                                {pa.date ? new Date(pa.date).toLocaleDateString() : 'Today'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mb-4" />

                        {!isResolved && !isExpired ? (
                          <div className="space-y-4">
                            {/* Contextual Refinement Chips (Hidden for delete actions as they are binary) */}
                            {pa.type !== 'delete' && (
                              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                                {[
                                  { label: 'Title', prefix: 'Rename title to ' },
                                  { label: 'Amount', prefix: 'Change amount to ' },
                                  { label: 'Emoji', prefix: 'Change emoji to ' },
                                  { label: 'Date', prefix: 'Change date to ' },
                                  { label: 'Category', prefix: 'Change category to ' }
                                ].map(chip => (
                                  <button
                                    key={chip.label}
                                    onClick={() => {
                                      setInput(chip.prefix);
                                      document.querySelector('input')?.focus();
                                    }}
                                    className={cn(
                                      "text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95",
                                      theme.lightBg, theme.text, theme.border, "hover:bg-white hover:shadow-sm"
                                    )}
                                  >
                                    {chip.label}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2">
                              {isEditing ? (
                                <Button
                                  size="sm"
                                  onClick={() => setEditingActionId(null)}
                                  className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                >
                                  Done Editing
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmAction(i, pa)}
                                    className={cn("flex-[2] text-xs font-bold text-white shadow-lg", theme.bg, theme.hover, theme.shadow)}
                                  >
                                    Confirm {theme.badge}
                                  </Button>
                                  {pa.type !== 'delete' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingActionId(pa.pendingId)}
                                      className="flex-1 text-xs font-bold border-slate-200 hover:bg-slate-50"
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelAction(i, pa)}
                                    className="flex-1 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : isConfirmed ? (
                          <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", theme.text)}>
                            <div className={cn("p-1 rounded-full text-white", theme.bg)}>
                              <Check className="w-3 h-3" strokeWidth={4} />
                            </div>
                            Success! Action Executed
                          </div>
                        ) : isCancelled ? (
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                             <div className="p-1 rounded-full bg-slate-100 text-slate-400">
                               <Check className="w-3 h-3 grayscale rotate-45" strokeWidth={4} />
                             </div>
                             Action Cancelled
                           </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                             Expired Draft
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-12 animate-pulse">
               <span className="flex gap-1">
                 <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               </span>
               AI Analytical Engine processing
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-white relative z-30 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        {!isLoading && (
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            {visibleSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s)}
                className="whitespace-nowrap text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-all font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-200 shadow-sm active:scale-95 animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              placeholder='Ask: "Add 500 food", "Balance?", "Delete last"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              className="h-12 bg-slate-100/50 border-none font-medium pr-10 rounded-2xl focus-visible:ring-blue-500/20"
            />
          </div>
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
