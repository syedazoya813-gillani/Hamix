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
            Ask Hamix about your tasks, timetable, deadlines, study plan, or free time.
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
              <div className="assistant-welcome-icon hamix-assistant-logo">
                <img src="/hamix-mark.png" alt="Hamix" />
              </div>
              <h2>What would you like to work on?</h2>
              <p>
                I can turn your current Hamix data into a clear next step instead of a long block of text.
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
                    {item.role === 'assistant' ? <img src="/hamix-mark.png" alt="Hamix" className="h-7 w-7 rounded-lg object-cover" /> : <User size={17} />}
                  </div>
                  <div className="chat-content">
                    <div className="chat-name">{item.role === 'assistant' ? 'Hamix' : 'You'}</div>
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
                  <div className="chat-avatar"><img src="/hamix-mark.png" alt="Hamix" className="h-7 w-7 rounded-lg object-cover" /></div>
                  <div className="chat-content">
                    <div className="chat-name">Hamix</div>
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
              placeholder="Message Hamix..."
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
          <div className="composer-note">Hamix can use your current tasks, timetable and available time.</div>
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

function AssistantMessage({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let table: string[][] = [];

  const flushTable = () => {
    if (!table.length) return;
    const rows = table;
    table = [];
    blocks.push(<MarkdownTable key={`table-${blocks.length}`} rows={rows} />);
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());

      if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) return;
      table.push(cells);
      return;
    }

    flushTable();

    if (!line) {
      blocks.push(<div key={`space-${index}`} className="message-space" />);
      return;
    }

    const heading = line.replace(/^#{1,6}\s*/, '').replace(/^\*\*(.*?)\*\*:?$/, '$1');
    if (/^#{1,6}\s/.test(line) || /^\*\*[^*]+\*\*:?$/.test(line)) {
      blocks.push(<h3 key={index}>{formatInline(heading)}</h3>);
      return;
    }

    if (/^[-•]\s/.test(line)) {
      blocks.push(
        <div key={index} className="message-bullet">
          <span>•</span>
          <div>{formatInline(line.replace(/^[-•]\s*/, ''))}</div>
        </div>
      );
      return;
    }

    if (/^\d+[.)]\s/.test(line)) {
      const match = line.match(/^(\d+)[.)]\s(.*)$/);
      blocks.push(
        <div key={index} className="message-number">
          <span>{match?.[1] || '•'}</span>
          <div>{formatInline(match?.[2] || line)}</div>
        </div>
      );
      return;
    }

    if (/\b\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\b/.test(line)) {
      blocks.push(
        <div key={index} className="message-time">
          <Clock3 size={14} />
          <span>{formatInline(line)}</span>
        </div>
      );
      return;
    }

    blocks.push(<p key={index}>{formatInline(line)}</p>);
  });

  flushTable();

  return <div className="assistant-message">{blocks}</div>;
}

function MarkdownTable({ rows }: { rows: string[][] }) {
  if (!rows.length) return null;
  const [header, ...body] = rows;

  return (
    <div className="message-table-wrap">
      <table className="message-table">
        <thead>
          <tr>{header.map((cell, i) => <th key={i}>{formatInline(cell)}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {header.map((_, c) => <td key={c}>{formatInline(row[c] || '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}
