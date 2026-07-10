'use client';

import { useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Brain, Send, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Help me generate 5 research topic ideas in computer science',
  'How do I structure a research proposal?',
  'What should I include in a literature review?',
  'Create a 6-month research timeline for my undergraduate project',
  'How do I write research objectives?',
  'Explain the difference between qualitative and quantitative research',
];

const DEMO_RESPONSES: Record<string, string> = {
  default: `Hello! I am your AI Research Assistant. I can help you with:

**Research Topics** — Generate and refine research ideas based on your field and interests.

**Proposal Writing** — Structure introductions, objectives, literature reviews, and methodology sections.

**Literature Review** — Identify research gaps, summarize sources, and build your review outline.

**Timeline Planning** — Create realistic month-by-month research schedules mapped to your project type.

**Writing Improvement** — Review your writing for clarity, academic tone, and structure.

What would you like help with today?`,
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: DEMO_RESPONSES.default },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content }]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200));

    const reply = `Thank you for your question about: **"${content}"**

This is a demonstration of the AI Research Assistant. In the full version, I would provide detailed, context-aware guidance tailored to your specific research project, field of study, and current stage in the research lifecycle.

The AI assistant uses your project data — including your topic, supervisor feedback, and current stage — to give you relevant, personalized advice.

**What I can help with in the full version:**
- Generating topic ideas specific to your field
- Reviewing your actual proposal or report sections
- Suggesting references and research gaps
- Building a personalized timeline based on your project deadlines

Would you like to explore any of these capabilities?`;

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <DashboardShell
      basePath="/dashboard/student"
      title="AI Research Assistant"
      breadcrumbs={[{ label: 'Student', href: '/dashboard/student' }, { label: 'AI Assistant' }]}
    >
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm shrink-0">
          <div className="w-10 h-10 bg-[#0B5ED7]/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#0B5ED7]" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">ResearchFlow AI</p>
            <p className="text-xs text-slate-400">Powered by research-focused AI</p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700 border-0 text-xs">Online</Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-[#0B5ED7] rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-[#0B5ED7] text-white rounded-tr-none'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0B5ED7] rounded-full flex items-center justify-center mr-2 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="mb-3 flex flex-wrap gap-2 shrink-0">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#0B5ED7] hover:text-[#0B5ED7] px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="relative shrink-0">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your research..."
            rows={3}
            className="resize-none pr-12 bg-white border-slate-200 text-sm"
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2 w-8 h-8 bg-[#0B5ED7] hover:bg-[#0a52c4]"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2 shrink-0">
          AI responses are for guidance only. Always consult your supervisor for research decisions.
        </p>
      </div>
    </DashboardShell>
  );
}
