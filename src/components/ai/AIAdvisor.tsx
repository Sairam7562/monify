
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    text: 'Hello! I\'m your AI financial advisor. How can I help you today? You can ask me questions about budgeting, investing, debt management, or financial planning.',
    timestamp: new Date(),
  },
];

const suggestions = [
  "How can I improve my credit score?",
  "What's a good debt-to-income ratio?",
  "How much should I save for retirement?",
  "Should I pay off debt or invest?",
  "What's the difference between a Roth IRA and traditional IRA?",
  "How do I create an emergency fund?",
];

const AIAdvisor = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: generateMockResponse(input.trim()),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const generateMockResponse = (question: string): string => {
    // In a real application, this would call an AI API like OpenAI GPT
    // For now, we'll use some predefined responses
    
    const lowercaseQuestion = question.toLowerCase();
    
    if (lowercaseQuestion.includes('credit score')) {
      return "To improve your credit score, focus on these key areas: 1) Pay all bills on time, 2) Reduce credit card balances, 3) Don't close old credit accounts, 4) Limit new credit applications, 5) Regularly check your credit report for errors.";
    } else if (lowercaseQuestion.includes('debt-to-income')) {
      return "A good debt-to-income (DTI) ratio is typically 36% or less. Lenders generally prefer a DTI under 36%, with housing costs not exceeding 28% of your gross income. A DTI of 43% is usually the maximum for qualifying for a mortgage.";
    } else if (lowercaseQuestion.includes('retirement')) {
      return "A common guideline is to save 15% of your pre-tax income annually for retirement. By age 30, aim to have 1x your annual salary saved; by 40, 3x; by 50, 6x; by 60, 8x; and by 67, 10x your annual salary. Consider maximizing contributions to tax-advantaged accounts like 401(k)s and IRAs.";
    } else if (lowercaseQuestion.includes('debt or invest')) {
      return "This depends on the interest rates and your financial situation. Generally, prioritize high-interest debt (>7%) before investing. For lower-interest debt, you might do both: pay the minimum on the debt and invest the rest. Always contribute enough to get any employer 401(k) match first - that's an immediate 100% return.";
    } else if (lowercaseQuestion.includes('roth') && lowercaseQuestion.includes('traditional')) {
      return "Traditional IRAs offer tax deductions now but taxable withdrawals in retirement. Roth IRAs provide no immediate tax benefit, but qualified withdrawals in retirement are tax-free. If you expect to be in a higher tax bracket in retirement, a Roth IRA may be better. If you expect to be in a lower tax bracket in retirement, a Traditional IRA might be preferable.";
    } else if (lowercaseQuestion.includes('emergency fund')) {
      return "An emergency fund should cover 3-6 months of essential expenses. Start with a goal of $1,000, then build up. Keep it in a high-yield savings account for easy access. Automate small, regular contributions to make it manageable. Remember, this is for true emergencies only - job loss, major medical expenses, or unexpected home/car repairs.";
    } else {
      return "That's a great question about finances. In a full implementation, I would connect to an AI service like OpenAI's GPT to provide you with a detailed response. Is there something specific about your personal financial situation that you'd like to discuss?";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 max-w-[80%] rounded-lg p-4",
              message.type === 'user'
                ? "ml-auto bg-navido-blue-500 text-white"
                : "bg-white border shadow-sm"
            )}
          >
            <div className="flex-shrink-0 mt-1">
              {message.type === 'user' ? (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-navido-green-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                {message.text}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3 max-w-[80%] rounded-lg p-4 bg-white border shadow-sm">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-navido-green-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-navido-green-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-navido-green-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-navido-green-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 px-4">
        <div className="pb-4">
          <p className="text-sm text-gray-500 mb-2 flex items-center">
            <ArrowDown className="h-3 w-3 mr-1" /> Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pb-4">
          <Input
            placeholder="Ask a financial question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            className="bg-navido-blue-500 hover:bg-navido-blue-600"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
