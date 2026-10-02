'use client';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Trash2, Clock3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type EventRow = { id:string; title:string; start_time:string; end_time:string; event_type:string };
type TaskRow = { id:string; title:string; deadline:string|null; status:string };

function startOfWeek(date: Date) { const d = new Date(date); const day = d.getDay(); d.setDate(d.getDate() - day); d.setHours(0,0,0,0); return d; }
function key(d: Date) { return d.toISOString().slice(0,10); }

export default function CalendarPage() {
  const supabase = createClient();
  const [events,setEvents] = useState<EventRow[]>([]); const [tasks,setTasks] = useState<TaskRow[]>([]);
  const [week,setWeek] = useState(() => startOfWeek(new Date()));
  const [title,setTitle] = useState(''); const [date,setDate] = useState(key(new Date())); const [start,setStart] = useState('09:00'); const [end,setEnd] = useState('10:00'); const [type,setType] = useState('event'); const [adding,setAdding] = useState(false);
  async function load(){ const from = new Date(week); const to = new Date(week); to.setDate(to.getDate()+7); const [{data:e},{data:t}] = await Promise.all([supabase.from('events').select('*').gte('start_time',from.toISOString()).lt('start_time',to.toISOString()).order('start_time'),supabase.from('tasks').select('id,title,deadline,status').not('deadline','is',null).gte('deadline',from.toISOString()).lt('deadline',to.toISOString()).order('deadline')]); setEvents(e||[]); setTasks(t||[]); }
  useEffect(()=>{load()},[week]);
  const days = useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(week);d.setDate(d.getDate()+i);return d}),[week]);
  async function addEvent(e:React.FormEvent){e.preventDefault();const {data:{user}}=await supabase.auth.getUser();if(!user)return;const startDate=new Date(`${date}T${start}:00`);const endDate=new Date(`${date}T${end}:00`);await supabase.from('events').insert({user_id:user.id,title,start_time:startDate.toISOString(),end_time:endDate.toISOString(),event_type:type});setTitle('');setAdding(false);load();}
  async function remove(id:string){await supabase.from('events').delete().eq('id',id);load();}
  function eventsFor(d:Date){return events.filter(x=>key(new Date(x.start_time))===key(d));}
  function tasksFor(d:Date){return tasks.filter(x=>x.deadline && key(new Date(x.deadline))===key(d));}
  return <div>
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-3"><CalendarDays className="text-violet-300"/><h1 className="text-3xl font-black">Calendar</h1></div><p className="muted mt-1">Your real events and task deadlines from Supabase.</p></div><button onClick={()=>setAdding(!adding)} className="btn btn-primary gap-2"><Plus size={17}/> Add event</button></div>
    {adding&&<form onSubmit={addEvent} className="glass card mb-5 grid gap-3 md:grid-cols-5"><input required className="input md:col-span-2" placeholder="Event title" value={title} onChange={e=>setTitle(e.target.value)}/><input required className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/><input required className="input" type="time" value={start} onChange={e=>setStart(e.target.value)}/><input required className="input" type="time" value={end} onChange={e=>setEnd(e.target.value)}/><select className="input" value={type} onChange={e=>setType(e.target.value)}><option>event</option><option>study</option><option>work</option><option>personal</option></select><button className="btn btn-primary md:col-span-5">Save event</button></form>}
    <div className="mb-4 flex items-center justify-between"><button className="btn" onClick={()=>{const d=new Date(week);d.setDate(d.getDate()-7);setWeek(d)}}>← Previous</button><div className="font-bold">{days[0].toLocaleDateString(undefined,{month:'short',day:'numeric'})} – {days[6].toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</div><button className="btn" onClick={()=>{const d=new Date(week);d.setDate(d.getDate()+7);setWeek(d)}}>Next →</button></div>
    <div className="grid gap-3 md:grid-cols-7">{days.map(d=><div className="glass card min-h-56" key={key(d)}><div className="border-b border-white/10 pb-3"><div className="muted text-xs">{d.toLocaleDateString(undefined,{weekday:'short'})}</div><div className="text-xl font-black">{d.getDate()}</div></div><div className="mt-3 space-y-2">{tasksFor(d).map(t=><div key={t.id} className="rounded-lg bg-amber-500/10 p-2 text-xs"><div className="font-semibold">Deadline</div><div className="mt-1">{t.title}</div></div>)}{eventsFor(d).map(x=><div key={x.id} className="rounded-lg bg-violet-500/10 p-2 text-xs"><div className="flex items-center justify-between gap-2"><span className="font-semibold">{x.event_type}</span><button onClick={()=>remove(x.id)} className="text-red-300"><Trash2 size={12}/></button></div><div className="mt-1">{x.title}</div><div className="muted mt-1 flex items-center gap-1"><Clock3 size={11}/>{new Date(x.start_time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div></div>)}{!tasksFor(d).length&&!eventsFor(d).length&&<div className="muted pt-2 text-xs">No plans</div>}</div></div>)}</div>
  </div>
}
