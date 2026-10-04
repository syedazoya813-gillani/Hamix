
'use client';

import Link from 'next/link';
import {
  ArrowRight, CalendarDays, CheckCircle2, Clock3, Sparkles,
  Target, X, Plus, Trash2, BarChart3, Send, LockKeyhole
} from 'lucide-react';
import { useState } from 'react';

type DemoTask = {
  id: number;
  title: string;
  deadline: string;
  hours: number;
  priority: string;
  progress: number;
};

const initialTasks: DemoTask[] = [
  { id: 1, title: 'DSA Quiz Preparation', deadline: 'Today', hours: 1.5, priority: 'High', progress: 62 },
  { id: 2, title: 'Database Assignment', deadline: 'Tomorrow', hours: 2, priority: 'Medium', progress: 35 },
  { id: 3, title: 'AI Semester Project', deadline: 'Oct 10', hours: 4, priority: 'High', progress: 20 },
];

const navigation = [
  { label: 'Overview', icon: Sparkles },
  { label: 'Tasks', icon: CheckCircle2 },
  { label: 'Goals', icon: Target },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Assistant', icon: Sparkles },
  { label: 'Reports', icon: BarChart3 },
];

export default function DemoPage() {
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [active, setActive] = useState('Overview');
  const [notice, setNotice] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hours, setHours] = useState('1');
  const [priority, setPriority] = useState('Medium');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(
    'Welcome to Hamiq! Ask me what you should work on, or how to plan your day.'
  );

  const completed = tasks.filter(t => t.progress >= 100).length;
  const remaining = tasks.length - completed;
  const progress = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0;

  function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    setTasks(old => [
      ...old,
      {
        id: Date.now(),
        title: title.trim(),
        deadline: deadline || 'No deadline',
        hours: Math.max(0.5, Number(hours) || 1),
        priority,
        progress: 0,
      },
    ]);

    setTitle('');
    setDeadline('');
    setHours('1');
    setPriority('Medium');
    setShowForm(false);
    setActive('Tasks');
  }

  function toggleTask(id: number) {
    setTasks(old => old.map(t =>
      t.id === id ? { ...t, progress: t.progress >= 100 ? 0 : 100 } : t
    ));
  }

  function deleteTask(id: number) {
    setTasks(old => old.filter(t => t.id !== id));
  }

  function askAssistant(message = question) {
    const q = message.trim();
    if (!q) return;

    const nextTask = tasks
      .filter(t => t.progress < 100)
      .sort((a, b) =>
        (a.priority === 'High' ? 0 : 1) -
        (b.priority === 'High' ? 0 : 1)
      )[0];

    const lower = q.toLowerCase();
    let reply = '';

    if (lower.includes('report') || lower.includes('progress')) {
      reply = `Your demo has ${tasks.length} tasks. ${completed} are complete and ${remaining} remain. Average progress is ${progress}%.`;
    } else if (lower.includes('evening') || lower.includes('time') || lower.includes('plan')) {
      reply = nextTask
        ? `Try a ${nextTask.hours}-hour focus session for "${nextTask.title}". Take a short break afterwards, then review your remaining tasks. This is a demo suggestion, not a live calendar analysis.`
        : 'All your demo tasks are complete! You could review your goals or take a well-earned break.';
    } else {
      reply = nextTask
        ? `My suggested next task is "${nextTask.title}". Priority: ${nextTask.priority}. Estimated time: ${nextTask.hours} hour(s). You can mark it complete in the Tasks section.`
        : 'Great work! All your demo tasks are complete. Add a new task if you want to keep planning.';
    }

    setAnswer(reply);
    setQuestion('');
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1d2635]">
      <header className="sticky top-0 z-20 border-b border-[#e7e1d7] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/hamiq-mark.svg" alt="Hamiq" className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-black">Hamiq</span>
            <span className="rounded-full bg-[#f0e5d1] px-2.5 py-1 text-xs font-semibold text-[#946b2f]">Demo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn hidden sm:inline-flex">Home</Link>
            <Link href="/login" className="btn btn-primary">
              Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {notice && (
        <div className="border-b border-[#e7d5b6] bg-[#fff8eb]">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 text-sm text-[#76551f] md:px-8">
            <span><b>Demo mode:</b> Try the features using sample data. Changes are temporary and are not saved to an account.</span>
            <button onClick={() => setNotice(false)} aria-label="Close demo notice"><X size={17} /></button>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1400px] md:grid-cols-[235px_1fr]">
        <aside className="border-b border-[#e7e1d7] p-4 md:border-b-0 md:border-r md:py-8 md:pr-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-1 md:space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  if (label === 'Goals' || label === 'Calendar') {
                    setShowLogin(true);
                  } else {
                    setActive(label);
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium md:justify-start ${
                  active === label
                    ? 'bg-[#f0e5d1] text-[#805c25]'
                    : 'text-[#737d8b] hover:bg-white'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 hidden rounded-2xl border border-[#e7d5b6] bg-white p-4 md:block">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9a9182]">Demo workspace</div>
            <p className="mt-2 text-sm leading-6 text-[#687386]">Try task planning, the assistant and progress reports.</p>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-8 md:px-8 lg:px-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7d5b6] bg-[#f4ead9] px-3 py-1.5 text-xs font-semibold text-[#946b2f]">
                <Sparkles size={14} /> Interactive demo
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                {active === 'Overview' ? 'Your day, made clearer.' : active}
              </h1>
              <p className="mt-2 text-[#687386]">Explore Hamiq using temporary sample data.</p>
            </div>
            <button onClick={() => setShowLogin(true)} className="btn btn-primary w-fit">
              Use my Hamiq <ArrowRight size={17} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={CheckCircle2} label="Active tasks" value={String(remaining)} sub={`${completed} completed`} />
            <Metric icon={Target} label="Average progress" value={`${progress}%`} sub="Across demo tasks" />
            <Metric icon={Clock3} label="Estimated workload" value={`${tasks.filter(t => t.progress < 100).reduce((s, t) => s + t.hours, 0)}h`} sub="Remaining tasks" />
            <Metric icon={CalendarDays} label="Total tasks" value={String(tasks.length)} sub="In this demo session" />
          </div>

          {(active === 'Overview' || active === 'Tasks') && (
            <div className="mt-5 rounded-2xl border border-[#eee7dc] bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">{active === 'Overview' ? 'Today’s focus' : 'Manage demo tasks'}</h2>
                  <p className="mt-1 text-sm text-[#7a8491]">Add tasks, set deadlines and mark work complete.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary w-fit">
                  <Plus size={17} /> Add Task
                </button>
              </div>

              {showForm && (
                <form onSubmit={addTask} className="mt-5 grid gap-3 rounded-xl bg-[#f8f4ec] p-4">
                  <label className="text-sm font-semibold">
                    Task title
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Prepare presentation" className="mt-1 w-full rounded-xl border border-[#e8dfd1] bg-white p-3 font-normal" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm font-semibold">
                      Deadline
                      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 w-full rounded-xl border border-[#e8dfd1] bg-white p-3 font-normal" />
                    </label>
                    <label className="text-sm font-semibold">
                      Estimated hours
                      <input type="number" min="0.5" step="0.5" value={hours} onChange={e => setHours(e.target.value)} className="mt-1 w-full rounded-xl border border-[#e8dfd1] bg-white p-3 font-normal" />
                    </label>
                    <label className="text-sm font-semibold">
                      Priority
                      <select value={priority} onChange={e => setPriority(e.target.value)} className="mt-1 w-full rounded-xl border border-[#e8dfd1] bg-white p-3 font-normal">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn btn-primary">Save Demo Task</button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn">Cancel</button>
                  </div>
                </form>
              )}

              <div className="mt-5 space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="rounded-2xl border border-[#eee7dc] p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        aria-label="Toggle task completion"
                        className={`mt-1 shrink-0 ${task.progress >= 100 ? 'text-green-600' : 'text-[#a6a098]'}`}
                      >
                        <CheckCircle2 size={23} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className={`font-bold ${task.progress >= 100 ? 'line-through opacity-60' : ''}`}>{task.title}</div>
                        <div className="mt-1 text-xs text-[#7a8491]">
                          {task.deadline} · {task.hours}h
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-[#eee9e0]">
                          <div className="h-2 rounded-full bg-[#b68434]" style={{ width: `${task.progress}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-[#7a8491]">{task.progress}% complete</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        task.priority === 'High' ? 'bg-[#f8e6d9] text-[#9a4f2f]' :
                        task.priority === 'Low' ? 'bg-gray-100 text-gray-600' :
                        'bg-[#f4ead9] text-[#946b2f]'
                      }`}>{task.priority}</span>
                      <button onClick={() => deleteTask(task.id)} aria-label="Delete task" className="text-[#9a7770]">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p className="py-6 text-center text-sm text-[#7a8491]">No tasks yet. Add your first demo task!</p>}
              </div>
            </div>
          )}

          {(active === 'Overview' || active === 'Assistant') && (
            <div className="mt-5 rounded-2xl border border-[#eee7dc] bg-white p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#946b2f]" />
                <h2 className="text-xl font-black">Hamiq Assistant</h2>
                <span className="rounded-full bg-[#f4ead9] px-2 py-1 text-xs text-[#946b2f]">Demo</span>
              </div>
              <div className="mt-4 rounded-2xl bg-[#f8f4ec] p-4">
                <p className="text-sm leading-7 text-[#536071]">{answer}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['What should I do next?', 'Plan my evening', 'Show my progress'].map(prompt => (
                  <button key={prompt} onClick={() => askAssistant(prompt)} className="rounded-full border border-[#e8dfd1] px-3 py-2 text-xs text-[#687386] hover:bg-[#f8f4ec]">
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={e => { e.preventDefault(); askAssistant(); }} className="mt-4 flex gap-2">
                <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about your demo tasks..." className="min-w-0 flex-1 rounded-xl border border-[#e8dfd1] p-3 text-sm" />
                <button type="submit" aria-label="Send message" className="btn btn-primary"><Send size={17} /></button>
              </form>
              <p className="mt-2 text-xs text-[#8b94a0]">This is a sample assistant experience; it does not call the live AI service.</p>
            </div>
          )}

          {active === 'Reports' && (
            <div className="mt-5 rounded-2xl border border-[#eee7dc] bg-white p-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-[#946b2f}" />
                <h2 className="text-xl font-black">Demo Progress Report</h2>
              </div>
              <p className="mt-2 text-sm text-[#687386]">A summary calculated from your current demo tasks.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <ReportStat label="Total tasks" value={tasks.length} />
                <ReportStat label="Completed" value={completed} />
                <ReportStat label="Remaining" value={remaining} />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <span>Overall progress</span><span>{progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#eee9e0]">
                  <div className="h-3 rounded-full bg-[#b68434]" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <button onClick={() => window.print()} className="btn btn-primary mt-5">Print / Save Report</button>
            </div>
          )}

          {(active === 'Overview' || active === 'Reports') && (
            <div className="mt-5 rounded-2xl border border-[#e7d5b6] bg-[#fffaf2] p-5">
              <div className="text-sm font-bold text-[#946b2f]">READY FOR YOUR OWN WORKSPACE?</div>
              <h2 className="mt-1 text-xl font-black">Unlock your personal Hamiq account.</h2>
              <p className="mt-1 text-sm text-[#687386]">Your demo changes are temporary. Log in to access your account features.</p>
              <Link href="/login" className="btn btn-primary mt-4 w-fit">Login <ArrowRight size={16} /></Link>
            </div>
          )}
        </section>
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLogin(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="login-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#f4ead9] p-3 text-[#946b2f]"><LockKeyhole size={22} /></div>
                <div>
                  <h2 id="login-title" className="text-xl font-black">Login required</h2>
                  <p className="mt-1 text-sm text-[#687386]">This feature needs your personal workspace.</p>
                </div>
              </div>
              <button onClick={() => setShowLogin(false)} aria-label="Close popup"><X size={20} /></button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#536071]">You can keep exploring sample tasks and reports without logging in. Sign in to use account-specific features.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary">Go to Login <ArrowRight size={16} /></Link>
              <button onClick={() => setShowLogin(false)} className="btn">Continue Demo</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon: Icon, label, value, sub }: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eee7dc] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#7a8491]">{label}</span>
        <Icon size={18} className="text-[#946b2f}" />
      </div>
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs text-[#8b94a0]">{sub}</div>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#f8f4ec] p-4">
      <div className="text-sm text-[#687386]">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}
