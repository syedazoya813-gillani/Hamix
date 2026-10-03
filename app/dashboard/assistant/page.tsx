'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import { AssistantMessage } from '@/lib/assistant-message';

type Recommendation = {
  tasks: any[];
  todayClasses: any[];
  freeWindows: any[];
  events: any[];
  message: string;
  twin: any;
};

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const QUICK_PROMPTS = [
  'What should I do now?',
  'What should I study next?',
  'Plan my free time today',
];

export default function Assistant() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    void loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      const response = await fetch('/api/recommendations');
      if (!response.ok) return;
      setRec(await response.json());
    } catch {
      // The chat remains usable even if recommendations are unavailable.
    }
  }

  async function ask(text?: string) {
    const prompt = (text ?? message).trim();
    if (!prompt || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: prompt,
    };

    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.answer || 'I could not generate an answer right now.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'I could not connect to the assistant right now. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask();
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <div className="assistant-page">
      <header className="assistant-header">
        <div>
          <div className="assistant-kicker">
            <Sparkles size={15} />
            PERSONAL ASSISTANT
          </div>
          <h1>How can I help?</h1>
          <p>
            Ask Hamiq about your tasks, timetable, deadlines, study plan, or free time.
          </p>
        </div>

        {messages.length > 0 && (
          <button type="button" className="assistant-new-chat" onClick={clearChat}>
            <Plus size={16} />
            New chat
          </button>
        )}
      </header>

      <main className="assistant-shell">
        <section className="assistant-chat">
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <div className="assistant-welcome-icon hamiq-assistant-logo">
                <img src="/hamiq-mark.svg" alt="Hamiq" />
              </div>
              <h2>What would you like to work on?</h2>
              <p>
                I can turn your current Hamiq data into a clear next step instead of a long block of text.
              </p>

              <div className="assistant-prompts">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void ask(prompt)}
                    disabled={loading}
                    className="assistant-prompt"
                  >
                    <span>{prompt}</span>
                    <Send size={15} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="assistant-messages">
              {messages.map((item) => (
                <div key={item.id} className={`chat-row ${item.role}`}>
                  <div className="chat-avatar">
                    {item.role === 'assistant' ? <img src="/hamiq-mark.svg" alt="Hamiq" className="h-7 w-7 rounded-lg object-cover" /> : <User size={17} />}
                  </div>
                  <div className="chat-content">
                    <div className="chat-name">{item.role === 'assistant' ? 'Hamiq' : 'You'}</div>
                    {item.role === 'assistant' ? (
                      <AssistantMessage text={item.text} />
                    ) : (
                      <div className="user-message">{item.text}</div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="chat-row assistant">
                  <div className="chat-avatar"><img src="/hamiq-mark.svg" alt="Hamiq" className="h-7 w-7 rounded-lg object-cover" /></div>
                  <div className="chat-content">
                    <div className="chat-name">Hamiq</div>
                    <div className="typing"><span /><span /><span /></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form className="chat-composer" onSubmit={submit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void ask();
                }
              }}
              placeholder="Message Hamiq..."
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={loading || !message.trim()}
              className="chat-send"
            >
              <Send size={17} />
            </button>
          </form>
          <div className="composer-note">Hamiq can use your current tasks, timetable and available time.</div>
        </section>

        <aside className="assistant-context">
          <ContextCard
            icon={<CheckCircle2 size={17} />}
            title="Next focus"
            value={rec?.message || 'Loading your priorities...'}
          >
            {rec?.tasks?.slice(0, 3).map((task: any) => (
              <div key={task.id} className="context-item">
                <strong>{task.title}</strong>
                <span>
                  {task.priority || 'Normal'} · {Number(task.progress || 0)}% · {task.estimated_hours || 1}h
                </span>
              </div>
            ))}
          </ContextCard>

          <ContextCard icon={<Clock3 size={17} />} title="Free time today">
            {rec?.freeWindows?.length ? (
              rec.freeWindows.slice(0, 3).map((window: any, index: number) => (
                <div key={index} className="context-item">
                  <strong>{window.start}–{window.end}</strong>
                  <span>{window.minutes} minutes available</span>
                </div>
              ))
            ) : (
              <p className="context-empty">No free window of at least 30 minutes was found.</p>
            )}
          </ContextCard>

          <ContextCard icon={<CalendarDays size={17} />} title="Today's classes">
            {rec?.todayClasses?.length ? (
              rec.todayClasses.map((item: any, index: number) => (
                <div key={index} className="context-item">
                  <strong>{item.title}</strong>
                  <span>{item.start}–{item.end}</span>
                </div>
              ))
            ) : (
              <p className="context-empty">No classes recorded for today.</p>
            )}
          </ContextCard>
        </aside>
      </main>
    </div>
  );
}

function ContextCard({
  icon,
  title,
  value,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="context-card">
      <div className="context-title">
        <span>{icon}</span>
        <strong>{title}</strong>
      </div>
      {value && <p className="context-value">{value}</p>}
      <div className="context-list">{children}</div>
    </section>
  );
}

