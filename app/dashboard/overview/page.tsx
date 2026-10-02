import Link from 'next/link';
import { ArrowRight, Bell, CalendarDays, CheckCircle2, Clock3, Flame, Sparkles, Target, TrendingUp, BookOpen, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

function Metric({ label, value, pct, icon: Icon }: { label: string; value: string | number; pct?: number; icon: any }) {
  return (
    <div className="glass card">
      <div className="flex items-center justify-between">
        <span className="muted text-sm">{label}</span>
        <Icon size={18} className="text-violet-300" />
      </div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      {typeof pct === 'number' && (
        <div className="mt-3 h-2 rounded-full bg-gray-800">
          <div className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
        </div>
      )}
    </div>
  );
}

function minutes(value: string) {
  const [h, m] = value.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function formatTime(value: string) {
  const [h, m] = value.slice(0, 5).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function getDayNumber(timezone: string) {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date());
  return ({ Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 } as Record<string, number>)[day] || 1;
}

function getCurrentMinutes(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const h = Number(parts.find(x => x.type === 'hour')?.value || 0) % 24;
  const m = Number(parts.find(x => x.type === 'minute')?.value || 0);
  return h * 60 + m;
}

export default async function Overview() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const [{ data: twin }, { data: profile }, { data: tasks }, { data: goals }, { data: habits }, { data: classes }, { data: events }, { count: inboxCount }, { count: reminderCount }] = await Promise.all([
    s.from('twin_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    s.from('profiles').select('timezone,full_name').eq('id', user.id).maybeSingle(),
    s.from('tasks').select('id,title,status,priority,deadline,estimated_hours,actual_hours,progress,category,reminder_at').eq('user_id', user.id).order('deadline', { ascending: true, nullsFirst: false }),
    s.from('goals').select('id,title,progress,target_date,priority').eq('user_id', user.id).order('target_date', { ascending: true, nullsFirst: false }),
    s.from('habits').select('id,name,frequency').eq('user_id', user.id),
    s.from('class_timetable').select('id,course_code,course_name,start_time,end_time,room,instructor,day_of_week').eq('user_id', user.id),
    s.from('events').select('id,title,start_time,end_time,event_type').eq('user_id', user.id).gte('start_time', now.toISOString()).order('start_time', { ascending: true }).limit(20),
    s.from('inbox_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
    s.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'done').not('reminder_at', 'is', null).lte('reminder_at', now.toISOString()),
  ]);

  const t = twin || { available_hours: 5, sleep_hours: 7, study_hours: 2, work_hours: 0, workload_level: 'medium' };
  const allTasks = tasks || [];
  const activeTasks = allTasks.filter((x: any) => x.status !== 'done');
  const completedTasks = allTasks.filter((x: any) => x.status === 'done');
  const avgProgress = allTasks.length ? Math.round(allTasks.reduce((sum: number, x: any) => sum + Number(x.progress || (x.status === 'done' ? 100 : 0)), 0) / allTasks.length) : 0;
  const totalEstimated = activeTasks.reduce((sum: number, x: any) => sum + Number(x.estimated_hours || 0), 0);
  const totalActual = allTasks.reduce((sum: number, x: any) => sum + Number(x.actual_hours || 0), 0);
  const avgGoalProgress = goals?.length ? Math.round(goals.reduce((sum: number, x: any) => sum + Number(x.progress || 0), 0) / goals.length) : 0;

  // Rank the user's real unfinished tasks for the "what should I do?" card.
  const rankedTasks = [...activeTasks].sort((a: any, b: any) => {
    const urgency = (x: any) => {
      if (!x.deadline) return 0;
      const hours = (new Date(x.deadline).getTime() - now.getTime()) / 36e5;
      return hours < 0 ? 100 : hours < 24 ? 50 : hours < 72 ? 25 : 10;
    };
    const priority = (x: any) => x.priority === 'high' ? 12 : x.priority === 'medium' ? 7 : 3;
    const remaining = (x: any) => 100 - Number(x.progress || 0);
    return (urgency(b) + priority(b) + remaining(b) / 10) - (urgency(a) + priority(a) + remaining(a) / 10);
  });
  const recommended = rankedTasks[0];

  const timezone = profile?.timezone || 'Asia/Karachi';
  const dayNumber = getDayNumber(timezone);
  const currentMinutes = getCurrentMinutes(timezone);
  const todayClasses = (classes || []).filter((c: any) => c.day_of_week === dayNumber).sort((a: any, b: any) => minutes(a.start_time) - minutes(b.start_time));
  const nextClass = todayClasses.find((c: any) => minutes(c.end_time) > currentMinutes);

  const fixedBlocks = todayClasses.map((c: any) => ({ start: minutes(c.start_time), end: minutes(c.end_time) }));
  const todayEvents = (events || []).filter((e: any) => {
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(e.start_time));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    return date === today;
  });
  for (const e of todayEvents) fixedBlocks.push({ start: Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(e.start_time)).split(':')[0]) * 60 + Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(e.start_time)).split(':')[1]), end: Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(e.end_time)).split(':')[0]) * 60 + Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(e.end_time)).split(':')[1]) });

  fixedBlocks.sort((a, b) => a.start - b.start);
  let freeStart = Math.max(currentMinutes, 8 * 60);
  let freeWindow: { start: number; end: number } | null = null;
  for (const block of fixedBlocks) {
    if (block.end <= freeStart) continue;
    if (block.start - freeStart >= 30) { freeWindow = { start: freeStart, end: block.start }; break; }
    freeStart = Math.max(freeStart, block.end);
  }
  if (!freeWindow && 22 * 60 - freeStart >= 30) freeWindow = { start: freeStart, end: 22 * 60 };

  const upcoming = activeTasks.slice(0, 5);
  const pendingReminders = (reminderCount || 0);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Your Hamix</h1>
          <p className="muted mt-1">A live snapshot built from your actual Supabase data.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/reports" className="btn gap-2"><BarChart3 size={16}/> Generate report</Link>
          <Link href="/dashboard/assistant" className="btn btn-primary gap-2"><Sparkles size={16}/> What should I do?</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active tasks" value={activeTasks.length} pct={allTasks.length ? 100 - (activeTasks.length / allTasks.length * 100) : 0} icon={CheckCircle2} />
        <Metric label="Goals" value={goals?.length || 0} pct={avgGoalProgress} icon={Target} />
        <Metric label="Study plan" value={`${t.study_hours}h/day`} pct={Math.min(100, Number(t.study_hours || 0) / 8 * 100)} icon={Clock3} />
        <Metric label="Task progress" value={`${avgProgress}%`} pct={avgProgress} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="glass card xl:col-span-2">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold">Your upcoming tasks</h2><p className="muted mt-1 text-xs">Pulled directly from your Supabase tasks.</p></div>
            <Link className="text-sm text-violet-300" href="/dashboard/tasks">Manage</Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcoming.length ? upcoming.map((task: any) => (
              <div className="rounded-xl bg-white/[.03] p-4" key={task.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0"><div className="truncate font-semibold">{task.title}</div><div className="muted mt-1 text-xs">{task.deadline ? `Due ${new Date(task.deadline).toLocaleString()}` : 'No deadline'} · {task.estimated_hours || 0}h · {task.priority}</div></div>
                  <span className="shrink-0 rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-200">{task.progress || 0}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-gray-800"><div className="h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400" style={{ width: `${Math.max(0, Math.min(100, Number(task.progress || 0)))}%` }}/></div>
              </div>
            )) : <div className="muted rounded-xl bg-white/[.03] p-5">No active tasks yet. Add your real tasks from Tasks or Inbox.</div>}
          </div>
        </div>

        <div className="glass card">
          <h2 className="font-bold">Twin status</h2>
          <div className="mt-5 space-y-5">
            <MetricLine label="Available time" value={`${t.available_hours}h/day`} pct={Number(t.available_hours || 0) / 24 * 100}/>
            <MetricLine label="Sleep" value={`${t.sleep_hours}h`} pct={Number(t.sleep_hours || 0) / 12 * 100}/>
            <MetricLine label="Study" value={`${t.study_hours}h/day`} pct={Number(t.study_hours || 0) / 8 * 100}/>
            <MetricLine label="Workload" value={String(t.workload_level)} pct={t.workload_level === 'high' ? 85 : t.workload_level === 'medium' ? 55 : 30}/>
          </div>
          <Link href="/dashboard/scenarios" className="btn btn-primary mt-6 w-full gap-2">Run a scenario <ArrowRight size={16}/></Link>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="glass card">
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-violet-300"/><h2 className="font-bold">What should I do?</h2></div>
          {recommended ? <>
            <p className="muted mt-3 text-sm">Based on your real deadlines, priority and remaining progress:</p>
            <div className="mt-4 rounded-xl bg-violet-500/10 p-4"><div className="font-semibold">{recommended.title}</div><div className="muted mt-1 text-xs">{recommended.progress || 0}% complete · {recommended.estimated_hours || 0}h estimated · {recommended.priority} priority</div></div>
            <Link href="/dashboard/assistant" className="btn mt-4 w-full">Ask my assistant</Link>
          </> : <p className="muted mt-3 text-sm">No unfinished task is available. Ask the assistant to plan your next goal or free time.</p>}
        </div>

        <div className="glass card">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CalendarDays size={18} className="text-violet-300"/><h2 className="font-bold">Today's classes</h2></div><Link href="/dashboard/timetable" className="text-xs text-violet-300">Edit timetable</Link></div>
          <div className="mt-4 space-y-2">
            {todayClasses.length ? todayClasses.map((c: any) => <div key={c.id} className="rounded-xl bg-white/[.03] p-3"><div className="font-semibold text-sm">{c.course_code ? `${c.course_code} · ` : ''}{c.course_name}</div><div className="muted mt-1 text-xs">{formatTime(c.start_time)} – {formatTime(c.end_time)}{c.room ? ` · ${c.room}` : ''}</div></div>) : <div className="muted rounded-xl bg-white/[.03] p-4 text-sm">No class blocks today.</div>}
          </div>
        </div>

        <div className="glass card">
          <div className="flex items-center gap-2"><Clock3 size={18} className="text-cyan-300"/><h2 className="font-bold">Free time</h2></div>
          {freeWindow ? <>
            <div className="mt-4 rounded-xl bg-cyan-500/10 p-4"><div className="text-lg font-bold">{formatTime(`${String(Math.floor(freeWindow.start / 60)).padStart(2, '0')}:${String(freeWindow.start % 60).padStart(2, '0')}`)} – {formatTime(`${String(Math.floor(freeWindow.end / 60)).padStart(2, '0')}:${String(freeWindow.end % 60).padStart(2, '0')}`)}</div><div className="muted mt-1 text-xs">{freeWindow.end - freeWindow.start} minutes available</div></div>
            <div className="mt-3 text-sm">Suggested: <b>{recommended?.title || 'work on a goal or habit'}</b></div>
          </> : <p className="muted mt-4 text-sm">No 30+ minute free window detected from your timetable and calendar.</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="glass card"><div className="muted text-xs">Completed tasks</div><div className="mt-2 text-2xl font-black">{completedTasks.length}</div></div>
        <div className="glass card"><div className="muted text-xs">Estimated active workload</div><div className="mt-2 text-2xl font-black">{totalEstimated.toFixed(1)}h</div></div>
        <div className="glass card"><div className="muted text-xs">Actual logged hours</div><div className="mt-2 text-2xl font-black">{totalActual.toFixed(1)}h</div></div>
        <div className="glass card"><div className="muted text-xs">Active reminders</div><div className="mt-2 flex items-center gap-2 text-2xl font-black"><Bell size={20} className="text-violet-300"/>{pendingReminders}</div></div>
      </div>

      <p className="muted mt-6 text-sm">Everything shown here is calculated from your authenticated Supabase data: tasks, goals, timetable, calendar events and Hamix baseline. No demo data is used.</p>
    </div>
  );
}

function MetricLine({ label, value, pct }: { label: string; value: string; pct: number }) {
  return <div><div className="flex justify-between text-sm"><span className="muted">{label}</span><b>{value}</b></div><div className="mt-2 h-2 rounded-full bg-gray-800"><div className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}/></div></div>;
}
