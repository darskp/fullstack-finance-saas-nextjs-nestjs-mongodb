import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Income } from '../users/schemas/income.schema';
import { Expense } from '../users/schemas/expense.schema';
import { User } from '../users/schemas/user.schema';
import { IncomeService } from '../users/income/income/income.service';
import { ExpensesService } from '../users/expenses/expenses.service';
import { TRANSACTION_KEYWORDS, INSIGHT_KEYWORDS, CATEGORIES, CURRENCY, SYSTEM_PROMPTS, REMOVE_KEYWORDS, CASUAL_MESSAGES } from './constants';
import { v4 as uuidv4 } from 'uuid';

const BLOCKED_KEYWORDS = ['hack', 'sql', 'delete all', 'drop table', 'password', 'token'];
const CATEGORY_EMOJI_MAP: Record<string, string> = {
  food: "🍔",
  transportation: "🚗",
  rent: "🏠",
  salary: "💼",
  shopping: "🛍️",
  healthcare: "🏥",
  entertainment: "🎮",
  utilities: "⚡",
  otherIncome: "💰",
  otherExpense: "📦"
};

@Injectable()
export class AiChatService {
  private groq: OpenAI;
  private pendingActions = new Map<string, any>();
  private userLatestPendingAction = new Map<string, string>(); 
  private lastListCache = new Map<string, any[]>();
  private chatHistoryCache = new Map<string, any[]>();

  constructor(
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private incomeService: IncomeService,
    private expensesService: ExpensesService,
  ) {
    const groqKey = this.configService.get<string>('GROQ_API_KEY');
    if (!groqKey) throw new InternalServerErrorException('GROQ_API_KEY is missing');

    this.groq = new OpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  async handleMessage(message: string, userId: string, payload?: any) {
    const msg = message.toLowerCase().trim();
    const lastPendingId = this.userLatestPendingAction.get(userId);

    
    if (payload?.pendingId) {
      return this.executeConfirmedAction(payload.pendingId, userId);
    }


    if (this.isCasual(msg)) return { reply: "👍" };

    
    if (this.isConfirm(msg)) {
      if (lastPendingId) return this.executeConfirmedAction(lastPendingId, userId);
      return { reply: "I'm not sure what you're confirming. What would you like to do?" };
    }

    // 1c. Cancel / Reset
    if (msg.includes('cancel') || msg.includes('stop') || (lastPendingId && msg === 'no')) {
      if (lastPendingId) {
        this.userLatestPendingAction.delete(userId);
        this.pendingActions.delete(lastPendingId);
        return { reply: "Cancelled 👍" };
      }
      return { reply: "Nothing to cancel!" };
    }

    // 1d. Safety Filter
    if (BLOCKED_KEYWORDS.some(k => msg.includes(k))) {
      return { reply: "I'm sorry, but I cannot assist with that request for security reasons. 🛡️" };
    }

    // 1e. Correction (IF pending action)
    if (lastPendingId && (msg.includes('edit') || msg.includes('not ') || msg.includes('change') || msg.includes('wrong'))) {
        return this.handlePendingCorrection(message, userId, lastPendingId);
    }

    // 1f. Delete Last (BACKEND LOGIC)
    if (msg.includes("delete last")) return this.handleDeleteLast(userId);

    // 1g. Balance (BACKEND LOGIC)
    if (msg.includes("balance")) return this.handleGetBalance(userId);

    // 1h. Weekly Expenses (BACKEND LOGIC)
    if (msg.includes("this week") || msg.includes("weekly summary")) return this.handleWeeklyExpenses(userId);

    // 1i. Salary (BACKEND LOGIC)
    if (msg.includes("salary")) return this.handleGetSalary(userId);

    // 1j. Show Transactions (BACKEND LOGIC)
    if (msg.includes("show") || msg.includes("list") || msg.includes("history")) return this.handleGetTransactions(userId);

    // 1k. Transactions (AI PROCESSING)
    if (this.isTransactionIntent(msg)) {
        this.updateChatHistory(userId, { role: 'user', content: message });
        const res = await this.proposeAddTransaction(message, userId);
        if (res?.reply) this.updateChatHistory(userId, { role: 'assistant', content: res.reply });
        return res;
    }

    // 1l. Fallback AI
    this.updateChatHistory(userId, { role: 'user', content: message });
    const intent = await this.aiDetectIntent(message, userId);
    
    let result;
    if (intent === 'remove_transaction') result = await this.proposeRemoveTransaction(message, userId);
    else if (intent === 'update_transaction') result = await this.proposeUpdateTransaction(message, userId);
    else if (intent === 'insight') result = await this.handleInsight(message, userId);
    else result = await this.handleGeneralChat(message, userId);

    if (result?.reply) {
        this.updateChatHistory(userId, { role: 'assistant', content: result.reply });
    }
    return result;
  }

  private isCasual(msg: string): boolean {
    return CASUAL_MESSAGES.includes(msg);
  }

  private isConfirm(msg: string): boolean {
    const confirmKeywords = ['yes', 'confirm', 'do it', 'correct', 'yep', 'yeah'];
    return confirmKeywords.includes(msg);
  }

  private isTransactionIntent(msg: string): boolean {
    const keywords = ['add', 'spent', 'bought', 'expense', 'income', 'paid', 'purchase'];
    return keywords.some(k => msg.includes(k)) || !!msg.match(/\d+/); // contains a number
  }

  private async handleDeleteLast(userId: string) {
    const [lastInc, lastExp] = await Promise.all([
      this.incomeModel.findOne({ userId }).sort({ createdAt: -1 }).lean().exec(),
      this.expenseModel.findOne({ userId }).sort({ createdAt: -1 }).lean().exec()
    ]);
    
    let last: any = null;
    if (lastInc && lastExp) {
      last = new Date((lastInc as any).createdAt) > new Date((lastExp as any).createdAt) ? { ...lastInc, type: 'Income' } : { ...lastExp, type: 'Expense' };
    } else {
      last = (lastInc ? { ...lastInc, type: 'Income' } : null) || (lastExp ? { ...lastExp, type: 'Expense' } : null);
    }

    if (!last) return { reply: "No transactions found to delete." };

    const pendingId = uuidv4();
    this.pendingActions.set(pendingId, { 
      userId,
      type: 'remove', 
      data: { transactionId: last._id.toString(), transactionType: last.type } 
    });
    this.userLatestPendingAction.set(userId, pendingId);

    return {
      reply: `Ready to remove your last transaction (**${last.title}**)?`,
      pendingAction: { 
        pendingId,
        type: 'remove', 
        title: `Delete: ${last.title}`, 
        details: `${CURRENCY.symbol}${last.amount} on ${new Date(last.date).toLocaleDateString()}`, 
      }
    };
  }

  private async handleGetBalance(userId: string) {
    const [inc, exp] = await Promise.all([
      this.incomeModel.find({ userId }).lean().exec(),
      this.expenseModel.find({ userId }).lean().exec()
    ]);
    const totalInc = inc.reduce((a, c) => a + parseFloat(c.amount || '0'), 0);
    const totalExp = exp.reduce((a, c) => a + parseFloat(c.amount || '0'), 0);
    return { reply: `Your net balance is **${CURRENCY.symbol}${(totalInc - totalExp).toFixed(2)}**.\n(Total Income: ${CURRENCY.symbol}${totalInc.toFixed(2)}, Total Expenses: ${CURRENCY.symbol}${totalExp.toFixed(2)})` };
  }

  private async handleWeeklyExpenses(userId: string) {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
    firstDay.setHours(0, 0, 0, 0);

    const weekly = await this.expenseModel.aggregate([
      { $match: { userId, date: { $gte: firstDay } } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]);
    
    const total = weekly[0]?.total || 0;
    return { reply: `You have spent **${CURRENCY.symbol}${total.toFixed(2)}** this week (since ${firstDay.toLocaleDateString()}).` };
  }

  private async handleGetSalary(userId: string) {
    const salaries = await this.incomeModel.find({ 
      userId, 
      $or: [{ category: 'salary' }, { title: /salary/i }] 
    }).sort({ date: -1 }).limit(5).lean().exec();

    if (!salaries.length) return { reply: "No salary income found." };
    
    const summary = salaries.map(s => `• ${new Date(s.date).toLocaleDateString()}: ${CURRENCY.symbol}${s.amount}`).join('\n');
    return { reply: `Recent salary income found:\n${summary}` };
  }

  private async handleGetTransactions(userId: string) {
    const [inc, exp] = await Promise.all([
      this.incomeModel.find({ userId }).sort({ date: -1 }).limit(10).lean().exec(),
      this.expenseModel.find({ userId }).sort({ date: -1 }).limit(10).lean().exec()
    ]);
    const recent = [...inc, ...exp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    this.lastListCache.set(userId, recent);

    if (!recent.length) return { reply: "No transactions found." };

    const summary = recent.map((t, i) => `${i + 1}. ${t.title}: **${CURRENCY.symbol}${t.amount}** (${new Date(t.date).toLocaleDateString()})`).join('\n');
    return { reply: `Here are your last 10 transactions:\n${summary}` };
  }

  private updateChatHistory(userId: string, entry: any) {
    const history = this.chatHistoryCache.get(userId) || [];
    history.push(entry);
    if (history.length > 10) history.shift(); // Keep last 10 (user + assistant pairs)
    this.chatHistoryCache.set(userId, history);
  }

  private async aiDetectIntent(message: string, userId: string): Promise<string> {
    const useHistory = message.toLowerCase().match(/it|that|those|them|then|change|update|fix|edit|wrong/);
    const history = useHistory ? (this.chatHistoryCache.get(userId) || []) : [];
    
    const systemPrompt = `You are an intent classifier for a finance app. 
    Classify based on the current message and context.
    Options: add_transaction | remove_transaction | update_transaction | insight | chat
    
    Rules:
    - ONLY return the option name.
    - If user says "ok", "yes", "got it", "thanks", use "chat".
    - "add_transaction" requires specific amount/category.
    - "update_transaction" requires explicit change keywords (change, update, fix, etc).
    - "insight" is for summaries, balances, history.
    - Default to "chat".`;
    
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-2),
        { role: 'user', content: message }
      ],
    });
    const intent = response.choices[0].message.content?.trim().toLowerCase() || 'chat';
    
    // Fallback: If AI is confused but keywords are obvious
    if (intent === 'chat') {
        const lowerMsg = message.toLowerCase();
        if (REMOVE_KEYWORDS.some(k => lowerMsg.includes(k))) return 'remove_transaction';
        if (TRANSACTION_KEYWORDS.some(k => lowerMsg.includes(k))) return 'add_transaction';
        if (INSIGHT_KEYWORDS.some(k => lowerMsg.includes(k))) return 'insight';
    }
    
    return intent;
  }

  private async handlePendingCorrection(message: string, userId: string, pendingId: string) {
    const pending = this.pendingActions.get(pendingId);
    if (!pending || pending.userId !== userId) return this.handleGeneralChat(message, userId);

    const prompt = `User wants to correct this pending ${pending.type} transaction.
    Current Data: ${JSON.stringify(pending.data)}
    User Msg: "${message}"
    
    Return updated data in same JSON format.
    JSON: ${JSON.stringify(pending.data)}`;

    const response = await this.groq.chat.completions.create({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: prompt }] });
    try {
      const updatedData = JSON.parse(this.cleanJson(response.choices[0].message.content || '{}'));
      this.pendingActions.set(pendingId, { ...pending, data: updatedData });
      
      const emoji = updatedData.emoji || (updatedData.type === 'income' ? '💰' : '📦');
      return {
        reply: `Updated! Ready to save this **${updatedData.type}**?`,
        pendingAction: { 
          pendingId,
          type: updatedData.type || pending.type, 
          title: updatedData.title || pending.title, 
          amount: updatedData.amount,
          emoji: emoji,
          date: updatedData.date || pending.data.date,
          details: `${CURRENCY.symbol}${updatedData.amount} for ${updatedData.category}`, 
        }
      };
    } catch (e) {
      return this.handleGeneralChat(message, userId);
    }
  }

  private async executeConfirmedAction(pendingId: string, userId: string) {
    const action = this.pendingActions.get(pendingId);
    if (!action || action.userId !== userId) return { reply: "Invalid or expired action. Please try again." };

    const { type, data } = action;
    try {
      // Step 3: Server Validation
      if (type === 'add' || type === 'income' || type === 'expense') {
        if (!data.amount || data.amount <= 0) throw new Error("Invalid amount");
        
        const dto = {
          ...data,
          transactionType: data.type === 'income' ? 'Income' : 'Expense',
        };
        const res = data.type === 'income' ? await this.incomeService.addIncome(userId, dto) : await this.expensesService.addExpenses(userId, dto);
        this.pendingActions.delete(pendingId);
        this.userLatestPendingAction.delete(userId);
        return { reply: `Added successfully! ✅`, transaction: res };
      }
      if (type === 'remove') {
        data.transactionType === 'Income' ? await this.incomeService.deleteIncome(data.transactionId, userId) : await this.expensesService.deleteExpenses(data.transactionId, userId);
        this.pendingActions.delete(pendingId);
        this.userLatestPendingAction.delete(userId);
        return { reply: "Transaction removed successfully! 🗑️" };
      }
      if (type === 'update') {
        data.transactionType === 'Income' ? await this.incomeService.updateIncome(data.transactionId, userId, data.updates) : await this.expensesService.updateExpenses(data.transactionId, userId, data.updates);
        this.pendingActions.delete(pendingId);
        this.userLatestPendingAction.delete(userId);
        return { reply: "Transaction updated successfully! 🛠️" };
      }
    } catch (e) { 
      return { reply: `Action failed: ${e.message}` }; 
    }
  }

  private cleanJson(text: string): string {
    // 1. Remove common markdown artifacts
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Extract only the JSON part if conversational text exists
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    
    return cleaned;
  }

  private async proposeAddTransaction(message: string, userId: string) {
    // Phase 2 Step 4: Strong Prompt
    const history = this.chatHistoryCache.get(userId) || [];
    const prompt = `You are a financial assistant. 
    Context: ${JSON.stringify(history.slice(-3))}
    Extract transaction details STRICTLY from: "${message}". 
    Current Date: ${new Date().toISOString()}.
    
    Allowed categories: ${[...CATEGORIES.income, ...CATEGORIES.expense].join(', ')}
    
    Return ONLY JSON:
    {
      "type": "income" | "expense",
      "amount": number,
      "category": string,
      "date": "ISOString" | null
    }`;

    const response = await this.groq.chat.completions.create({ 
      model: 'llama-3.1-8b-instant', 
      messages: [{ role: 'user', content: prompt }], 
    });
    
    const content = response.choices[0].message.content || '{}';
    let data;
    try {
      data = JSON.parse(this.cleanJson(content));
    } catch (e) {
      console.error("AI returned invalid JSON:", content);
      return { reply: "I'm having trouble analyzing that transaction. Could you try rephrasing? (e.g. 'Add 2000 for rent')" };
    }
    
    if (!data.amount) return { reply: "Please specify an amount. (e.g., 'Add 500 for food')" };

    // Phase 3 Step 6: Data Enrichment
    const enrichedData = {
      type: data.type || 'expense',
      amount: parseFloat(data.amount.toString().replace(/[^0-9.]/g, '')),
      category: data.category || (data.type === 'income' ? 'otherIncome' : 'otherExpense'),
      date: data.date || new Date().toISOString(),
      emoji: CATEGORY_EMOJI_MAP[data.category] || (data.type === 'income' ? '💰' : '📦'),
      title: `${data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : 'Miscellaneous'} ${data.type === 'income' ? 'Income' : 'Expense'}`
    };

    const pendingId = uuidv4();
    this.pendingActions.set(pendingId, { 
      userId,
      type: 'add', 
      data: { ...enrichedData, title: `Chat: ${enrichedData.title}` } 
    });
    this.userLatestPendingAction.set(userId, pendingId);

    return {
      reply: `Ready to add this **${enrichedData.type}**?`,
      pendingAction: { 
        pendingId,
        type: 'add', 
        title: enrichedData.title, 
        amount: enrichedData.amount,
        emoji: enrichedData.emoji,
        date: enrichedData.date,
        details: `${CURRENCY.symbol}${enrichedData.amount} for ${enrichedData.category}`, 
      }
    };
  }

  private async proposeRemoveTransaction(message: string, userId: string) {
    const cached = this.lastListCache.get(userId);
    let recent = cached;
    
    const indexMatch = message.match(/(\d+)(st|nd|rd|th)/) || message.match(/(\d+)/);
    if (indexMatch && !recent) {
        return { reply: "Please ask for transactions first so I can see which one you mean! (e.g., 'Show my last transactions')" };
    }

    if (indexMatch && recent) {
        const idx = parseInt(indexMatch[1]) - 1;
        if (idx < 0 || idx >= recent.length) {
            return { reply: "Invalid selection. Please choose a number from the list I showed you." };
        }
    }

    if (!recent) {
      const [inc, exp] = await Promise.all([
        this.incomeModel.find({ userId }).sort({ date: -1 }).limit(5).lean().exec(), 
        this.expenseModel.find({ userId }).sort({ date: -1 }).limit(5).lean().exec()
      ]);
      recent = [...inc, ...exp].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const history = this.chatHistoryCache.get(userId) || [];
    const prompt = `Identify transaction to remove: "${message}". 
    Context: ${JSON.stringify(history.slice(-3))}
    History (ordered): ${JSON.stringify(recent.map((t, idx) => ({ index: idx + 1, ...t })))}. 
    If referencing by number (e.g. "2nd"), use the corresponding ID.
    JSON: {"id":"str","type":"Income"|"Expense","title":"str"}`;

    const response = await this.groq.chat.completions.create({ 
      model: 'llama-3.1-8b-instant', 
      messages: [{ role: 'user', content: prompt }], 
    });
    const content = response.choices[0].message.content || '{}';
    let data;
    try {
      data = JSON.parse(this.cleanJson(content));
    } catch (e) {
      console.error("AI returned invalid JSON:", content);
      return { reply: "I'm having trouble identifying that transaction. Could you be more specific? (e.g., 'Delete my last food expense')" };
    }
    
    if (!data.id) return { reply: "I couldn't find that transaction. Could you specify which one? (e.g., 'Delete the food expense of $50')" };

    const pendingId = uuidv4();
    this.pendingActions.set(pendingId, { 
      userId,
      type: 'remove', 
      data: { transactionId: data.id, transactionType: data.type } 
    });
    this.userLatestPendingAction.set(userId, pendingId);

    return {
      reply: `Remove this **${data.type}** transaction?`,
      pendingAction: { 
        pendingId,
        type: 'remove', 
        title: `Remove ${data.title}`, 
        details: `Action cannot be undone.`, 
      }
    };
  }

  private async proposeUpdateTransaction(message: string, userId: string) {
    const cached = this.lastListCache.get(userId);
    let recent = cached;
    
    const indexMatch = message.match(/(\d+)(st|nd|rd|th)/) || message.match(/(\d+)/);
    if (indexMatch && !recent) {
        return { reply: "Please ask for transactions first so I can see which one you mean! (e.g., 'Show my last transactions')" };
    }

    if (indexMatch && recent) {
        const idx = parseInt(indexMatch[1]) - 1;
        if (idx < 0 || idx >= recent.length) {
            return { reply: "Invalid selection. Please choose a number from the list I showed you." };
        }
    }

    if (!recent) {
      const [inc, exp] = await Promise.all([
        this.incomeModel.find({ userId }).sort({ date: -1 }).limit(5).lean().exec(), 
        this.expenseModel.find({ userId }).sort({ date: -1 }).limit(5).lean().exec()
      ]);
      recent = [...inc, ...exp].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const history = this.chatHistoryCache.get(userId) || [];
    const prompt = `Identify update for: "${message}". 
    Context: ${JSON.stringify(history.slice(-3))}
    History (ordered): ${JSON.stringify(recent.map((t, idx) => ({ index: idx + 1, ...t })))}. 
    JSON: {"id":"str","type":"Income"|"Expense","updates":{"amount":"num","category":"str"}}`;

    const response = await this.groq.chat.completions.create({ 
      model: 'llama-3.1-8b-instant', 
      messages: [{ role: 'user', content: prompt }], 
    });
    const content = response.choices[0].message.content || '{}';
    let data;
    try {
      data = JSON.parse(this.cleanJson(content));
    } catch (e) {
      console.error("AI returned invalid JSON:", content);
      return { reply: "I'm having trouble processing that update. Could you rephrase? (e.g., 'Change the amount of my last rent to 2500')" };
    }

    if (!data.id) return { reply: "I couldn't identify the update. Could you specify which transaction and what to change?" };

    const pendingId = uuidv4();
    this.pendingActions.set(pendingId, { 
      userId,
      type: 'update', 
      data: { transactionId: data.id, transactionType: data.type, updates: data.updates } 
    });
    this.userLatestPendingAction.set(userId, pendingId);

    return {
      reply: `Confirm updates for this **${data.type}**?`,
      pendingAction: { 
        pendingId,
        type: 'update', 
        title: `Update Transaction`, 
        details: `Changes: ${JSON.stringify(data.updates)}`, 
      }
    };
  }

  private async handleInsight(message: string, userId: string) {
    const [inc, exp] = await Promise.all([
      this.incomeModel.find({ userId }).sort({ date: -1 }).limit(10).lean().exec(),
      this.expenseModel.find({ userId }).sort({ date: -1 }).limit(10).lean().exec()
    ]);
    const recent = [...inc, ...exp].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    this.lastListCache.set(userId, recent);

    const totalInc = inc.reduce((a, c) => a + parseFloat(c.amount.toString()), 0);
    const totalExp = exp.reduce((a, c) => a + parseFloat(c.amount.toString()), 0);

    const systemPrompt = `You are a finance assistant.
    Context: ${JSON.stringify(recent)}. 
    Totals: Income ${CURRENCY.symbol}${totalInc}, Expenses ${CURRENCY.symbol}${totalExp}, Net Balance ${CURRENCY.symbol}${totalInc - totalExp}. 
    
    RULES: 
    - Be short and clear.
    - NEVER repeat old data unless specifically asked.
    - NEVER generate data unless asked.
    - ONLY respond based on user request.
    - Provide a short, bulleted summary (Max 3 bullets).
    - ALWAYS use a numbered list for transactions.
    - STRICTLY finance only.`;

    const response = await this.groq.chat.completions.create({ 
      model: 'llama-3.1-8b-instant', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ] 
    });
    return { reply: response.choices[0].message.content };
  }

  private async handleGeneralChat(message: string, userId: string) {
    const [inc, exp] = await Promise.all([
      this.incomeModel.find({ userId }).sort({ date: -1 }).limit(5).lean().exec(),
      this.expenseModel.find({ userId }).sort({ date: -1 }).limit(5).lean().exec()
    ]);
    const recent = [...inc, ...exp].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    this.lastListCache.set(userId, recent);

    const totalInc = inc.reduce((a, c) => a + parseFloat(c.amount.toString()), 0);
    const totalExp = exp.reduce((a, c) => a + parseFloat(c.amount.toString()), 0);
    const bal = totalInc - totalExp;

    const systemPrompt = `You are a finance assistant.
    Balance: ${CURRENCY.symbol}${bal}. 
    
    RULES: 
    - Be short and clear.
    - NEVER repeat old data.
    - NEVER generate data unless asked.
    - ONLY respond based on user request.
    - If message is casual (ok, hi, thanks) → reply with short acknowledgement.
    - If question: answer briefly.
    - If unclear: ask simple clarification.
    - STRICTLY ONLY financial advice/summaries.
    - REJECT non-finance topics briefly.`;

    const response = await this.groq.chat.completions.create({ 
      model: 'llama-3.1-8b-instant', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ] 
    });
    return { reply: response.choices[0].message.content };
  }
}
