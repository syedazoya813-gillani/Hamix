'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Sparkles, Target, X } from 'lucide-react';
import { useState } from 'react';

const tasks = [
  { title: 'DSA Quiz Preparation', meta: 'Today · 1.5h', priority: 'High', progress: 62 },
  { title: 'Database Assignment', meta: 'Tomorrow · 2h', priority: 'Medium', progress: 35 },
  { title: 'AI Semester Project', meta: 'Oct 10 · 4h', priority: 'High', progress: 20 },
];

export default function DemoPage() {
  const [notice, setNotice] = useState(true);
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#1d2635]">
      <header className="sticky top-0 z-20 border-b border-[#e7e1d7] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3"><img src="/hamix-mark.png" alt="Hamix" className="h-10 w-10 rounded-xl"/><span className="text-xl font-black">Hamix</span><span className="hidden rounded-full bg-[#f0e5d1] px-2.5 py-1 text-xs font-semibold text-[#946b2f] sm:inline">Demo</span></Link>
          <div className="flex items-center gap-2"><Link href="/" className="btn hidden sm:inline-flex">Home</Link><Link href="/login" className="btn btn-primary">Login <ArrowRight size={16}/></Link></div>
        </div>
      </header>
      {notice && <div className="border-b border-[#e7d5b6] bg-[#fff8eb]"><div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 text-sm text-[#76551f] md:px-8"><span><b>Demo mode:</b> This workspace uses sample data. No account or login is required.</span><button onClick={()=>setNotice(false)} aria-label="Close demo notice"><X size={17}/></button></div></div>}
      <div className="mx-auto grid max-w-[1400px] gap-0 md:grid-cols-[235px_1fr]">
        <aside className="hidden border-r border-[#e7e1d7] py-8 pr-5 md:block"><div className="space-y-1">{[['Overview', Sparkles, true], ['Tasks', CheckCircle2, false], ['Goals', Target, false], ['Calendar', CalendarDays, false], ['Assistant', Sparkles, false], ['Reports', Clock3, false]].map(([label, Icon, active]) => <div key={label as string} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${active ? 'bg-[#f0e5d1] text-[#805c25]' : 'text-[#737d8b]'}`}><Icon size={18}/>{label as string}</div>)}</div><div className="mt-10 rounded-2xl border border-[#e7d5b6] bg-white p-4"><div className="text-xs font-bold uppercase tracking-wider text-[#9a9182]">Demo workspace</div><p className="mt-2 text-sm leading-6 text-[#687386]">Explore how Hamix organizes tasks, time, goals and decisions.</p><Link href="/login" className="mt-4 inline-flex text-sm font-bold text-[#946b2f]">Get authorized access →</Link></div></aside>
        <section className="min-w-0 px-5 py-8 md:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7d5b6] bg-[#f4ead9] px-3 py-1.5 text-xs font-semibold text-[#946b2f]"><Sparkles size={14}/> Personal planning demo</div><h1 className="text-4xl font-black tracking-tight md:text-5xl">Your day, made clearer.</h1><p className="mt-2 max-w-2xl text-[#687386]">A preview of the Hamix workspace using realistic sample data.</p></div><Link href="/login" className="btn btn-primary w-fit">Use my Hamix <ArrowRight size={17}/></Link></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CheckCircle2} label="Active tasks" value="4" sub="2 high priority" /><Metric icon={Target} label="Goal progress" value="68%" sub="Across 3 goals" /><Metric icon={Clock3} label="Study plan" value="2.5h/day" sub="5h available" /><Metric icon={CalendarDays} label="Next class" value="10:00 AM" sub="Artificial Intelligence" /></div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="glass card bg-white"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Today’s focus</h2><p className="mt-1 text-sm text-[#7a8491]">Hamix organizes your workload by urgency and remaining effort.</p></div><span className="rounded-full bg-[#f4ead9] px-3 py-1 text-xs font-bold text-[#946b2f]">Sample</span></div><div className="mt-5 space-y-3">{tasks.map(task=><div key={task.title} className="rounded-2xl border border-[#eee7dc] p-4"><div className="flex items-start justify-between gap-4"><div><div className="font-bold">{task.title}</div><div className="mt-1 text-xs text-[#7a8491]">{task.meta}</div></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${task.priority==='High'?'bg-[#f8e6d9] text-[#9a4f2f]':'bg-[#f4ead9] text-[#946b2f]'}`}>{task.priority}</span></div><div className="mt-3 h-2 rounded-full bg-[#eee9e0]"><div className="h-2 rounded-full bg-[#b68434]" style={{width:`${task.progress}%`}}/></div></div>)}</div></div>
            <div className="glass card bg-white"><div className="flex items-center gap-2"><Sparkles size={19} className="text-[#946b2f]"/><h2 className="text-xl font-black">Hamix Assistant</h2></div><div className="mt-5 rounded-2xl bg-[#f8f4ec] p-4"><p className="text-sm leading-7 text-[#536071]">“Start with DSA Quiz Preparation. It is high priority and can be completed in a focused 90-minute block.”</p></div><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-[#e8dfd1] px-3 py-2 text-xs text-[#687386]">What should I do?</span><span className="rounded-full border border-[#e8dfd1] px-3 py-2 text-xs text-[#687386]">Plan my evening</span></div><Link href="/login" className="btn btn-primary mt-5 w-full justify-center">Open full assistant</Link></div>
          </div>
          <div className="mt-5 rounded-2xl border border-[#e7d5b6] bg-[#fffaf2] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-bold text-[#946b2f]">READY TO USE YOUR OWN DATA?</div><h2 className="mt-1 text-xl font-black">Get your Hamix credentials from the administrator.</h2><p className="mt-1 text-sm text-[#687386]">Public signup is disabled. Authorized credentials are provided manually.</p></div><a href="mailto:hammalalam406@gmail.com?subject=Hamix%20Access%20Request" className="btn btn-primary w-fit">Contact Admin</a></div></div>
        </section>
      </div>
    </main>
  );
}
function Metric({icon:Icon,label,value,sub}:{icon:any;label:string;value:string;sub:string}) { return <div className="glass card bg-white"><div className="flex items-center justify-between"><span className="text-sm text-[#7a8491]">{label}</span><Icon size={18} className="text-[#946b2f]"/></div><div className="mt-3 text-2xl font-black">{value}</div><div className="mt-1 text-xs text-[#8b94a0]">{sub}</div></div> }
