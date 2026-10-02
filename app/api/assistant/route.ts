import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHamixInsights } from '@/lib/ai/extraction';

export async function POST(req:Request){
  const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const {message}=await req.json(); if(!message?.trim())return NextResponse.json({error:'Message required'},{status:400});
  const [{data:tasks},{data:goals},{data:twin},{data:classes},{data:events},{data:profile}]=await Promise.all([
    s.from('tasks').select('title,status,priority,progress,estimated_hours,deadline,category').neq('status','done').order('deadline',{ascending:true,nullsFirst:false}).limit(30),
    s.from('goals').select('title,progress,target_date,priority').order('created_at',{ascending:false}).limit(15),
    s.from('twin_profiles').select('available_hours,study_hours,sleep_hours,workload_level').eq('user_id',user.id).maybeSingle(),
    s.from('class_timetable').select('day_of_week,course_code,course_name,start_time,end_time,room').order('day_of_week').order('start_time'),
    s.from('events').select('title,start_time,end_time,event_type').gte('start_time',new Date().toISOString()).order('start_time').limit(20),
    s.from('profiles').select('timezone').eq('id',user.id).maybeSingle()
  ]);
  const context={userMessage:message,today:new Date().toISOString(),timezone:profile?.timezone||'Asia/Karachi',twin,unfinishedTasks:tasks||[],goals:goals||[],weeklyClassTimetable:classes||[],upcomingEvents:events||[]};
  try{const answer=await generateHamixInsights({role:'personal planner',instruction:'You are the user’s single personal Hamix assistant. Answer only about what this user should do next, how to use their free time, scheduling around classes, deadlines, goals, and workload. Use the supplied data. Give a short prioritized action plan with 1-3 actions, explain why, and mention when to do them if the data supports it. Never invent a class, deadline, or time. If there is no free time, say so. Protect user agency: recommendations are suggestions, not commands.',...context});return NextResponse.json({answer});}
  catch(e){return NextResponse.json({answer:`I couldn't reach the AI right now. Based on your stored data, focus first on: ${(tasks||[]).slice(0,3).map((x:any)=>x.title).join(', ')||'your next goal'}.`,fallback:true});}
}
