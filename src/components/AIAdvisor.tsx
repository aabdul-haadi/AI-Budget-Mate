import React, { useState, useEffect } from 'react';
import { Bot, Send, Loader, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface AIAdvisorProps {
  transactions: any[];
  budgets: any;
  goals: any[];
  userProfile?: { username?: string } | null;
  darkMode: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAdvisor({
  transactions,
  budgets,
  goals,
  userProfile,
  darkMode
}: AIAdvisorProps) {
  const getUserName = () => {
    return userProfile?.username || 'friend';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🤖 Assalamu Alaikum ${getUserName()}! I'm SARA, your AI financial advisor. Ask about your finances, budgets, or savings! 🔒 Chat clears every 24 hours for privacy.`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackedCategories, setTrackedCategories] = useState<Set<string>>(new Set());

  // Clear messages every 24 hours
  useEffect(() => {
    const lastClear = localStorage.getItem('lastChatClear');
    const now = Date.now();

    if (!lastClear || now - parseInt(lastClear) > 24 * 60 * 60 * 1000) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `🤖 Assalamu Alaikum ${getUserName()}! I'm SARA, your AI financial advisor. Ask about your finances, budgets, or savings! 🔒 Chat clears every 24 hours for privacy.`,
          timestamp: new Date(),
        },
      ]);
      localStorage.setItem('lastChatClear', now.toString());
      setTrackedCategories(new Set());
    }

    const interval = setInterval(() => {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `🤖 Assalamu Alaikum ${getUserName()}! I'm SARA, your AI financial advisor. Ask about your finances, budgets, or savings! 🔒 Chat clears every 24 hours for privacy.`,
          timestamp: new Date(),
        },
      ]);
      localStorage.setItem('lastChatClear', Date.now().toString());
      setTrackedCategories(new Set());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userProfile]);

  // Check for overspending
  useEffect(() => {
    const checkOverspending = () => {
      const categoryExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      Object.entries(budgets).forEach(([category, budget]: [string, any]) => {
        const spent = categoryExpenses[category] || 0;
        const budgetLimit = budget?.amount || 0;
        if (spent > budgetLimit && !trackedCategories.has(category)) {
          const overSpentAmount = spent - budgetLimit;
          const message: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `⚠️ ${getUserName()}, you've overspent in ${category} by PKR ${overSpentAmount.toLocaleString()} (Budget: PKR ${budgetLimit.toLocaleString()}).\n• Pause non-essential spending.\n• Check transactions in the app.\n• Consider a small Sadaqah.\nInsha’Allah, you’ll manage this! 🌟`,
            timestamp: new Date(),
          };
          setMessages((prev) => {
            if (prev.some((m) => m.content === message.content)) return prev;
            return [...prev, message];
          });
          setTrackedCategories((prev) => new Set(prev).add(category));
          toast.warn(`Overspent in ${category} by PKR ${overSpentAmount.toLocaleString()}!`);
        }
      });
    };

    checkOverspending();
  }, [transactions, budgets, userProfile]);

  // Get financial context
  const getFinancialContext = () => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const savings = totalIncome - totalExpenses;

    const categoryExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpenses,
      savings,
      categoryExpenses,
      budgets,
      goals,
      transactionCount: transactions.length,
    };
  };

  // Handle special inputs
  const handleSpecialInputs = (input: string): Message | null => {
    const trimmedInput = input.trim().toLowerCase();
    if (trimmedInput === 'bye') {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Assalamu Alaikum ${getUserName()}! Goodbye, may Allah bless you! 🌟`,
        timestamp: new Date(),
      };
    }
    if (['hello', 'hi'].includes(trimmedInput)) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Assalamu Alaikum ${getUserName()}! How can I assist with your finances today? 😊`,
        timestamp: new Date(),
      };
    }
    return null;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Check for special inputs
    const specialResponse = handleSpecialInputs(inputMessage);
    if (specialResponse) {
      setMessages((prev) => [...prev, specialResponse]);
      setIsLoading(false);
      return;
    }

    try {
      const financialContext = getFinancialContext();

      const prompt = `You are SARA, a friendly Islamic financial advisor for Pakistani users. Be concise, warm, and respectful of Islamic values. User: ${getUserName()}.

PERSONALITY:
- Friendly, encouraging
- Simple, clear language
- Actionable advice
- Pakistani context
- 50-100 words
- End positively
- Avoid manual tracking; promote app tracking
- Include Zakat/Sadaqah when relevant

FINANCIAL SNAPSHOT:
- Income: PKR ${financialContext.totalIncome}
- Expenses: PKR ${financialContext.totalExpenses}
- Savings: PKR ${financialContext.savings}
- Expenses by Category: ${JSON.stringify(financialContext.categoryExpenses)}
- Budgets: ${JSON.stringify(financialContext.budgets)}
- Goals: ${JSON.stringify(financialContext.goals)}
- Transactions: ${financialContext.transactionCount}

GUIDELINES:
- Answer ONLY the user's question
- Use PKR
- 1-2 actionable tips
- Local context
- Bullet points
- Islamic principles (no Riba)
- Encouraging close

FORMAT:
1. Greeting
2. Direct answer
3. 1-2 tips
4. Encouragement

Question: ${inputMessage}`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': 'AIzaSyC0mqYX2jaxXDog-s49KWSA15OozbhNDKE',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 150, // Tighter for concise responses
              topP: 0.9,
              topK: 40,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI API Error:', error);

      const financialContext = getFinancialContext();
      let fallbackMessage = `🤖 Hi ${getUserName()}! I'm offline but here’s a quick tip:\n`;

      if (inputMessage.toLowerCase().includes('budget')) {
        fallbackMessage += `Check your spending in the app.\n• Adjust high-expense categories.\nStay on track! 🌟`;
      } else if (inputMessage.toLowerCase().includes('save')) {
        fallbackMessage += `Save PKR ${Math.round(financialContext.totalIncome * 0.1).toLocaleString()} monthly.\n• Use Islamic savings accounts.\nKeep it up! 🌟`;
      } else {
        fallbackMessage += `Track your finances in the app.\n• Review expenses weekly.\nYou’re doing great! 🌟`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.info('AI offline - using your data for insights!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${darkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Financial Advisor
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Personalized financial advice powered by AI
          </p>
        </div>
      </div>

      <div className={`rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-3 border-b text-center ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            🔒 Chat messages clear every 24 hours for privacy
          </p>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {message.timestamp.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`border-t p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about finances, budgets, or savings..."
              className={`flex-1 p-3 rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          "💰 How can I save more this month?",
          "📊 Analyze my spending",
          "📅 Budget tips for next month",
          "🎯 Reach savings goals faster",
        ].map((question) => (
          <button
            key={question}
            onClick={() => setInputMessage(question.replace(/💰|📊|📅|🎯/g, '').trim())}
            className={`p-3 rounded-lg border text-left transition-colors ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:border-blue-400 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}