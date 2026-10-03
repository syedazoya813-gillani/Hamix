'use client';

import { useEffect, useState } from 'react';
import { Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Settings() {
  const s = createClient();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [studyHours, setStudyHours] = useState('');
  const [studyStart, setStudyStart] = useState('');
  const [studyEnd, setStudyEnd] = useState('');
  const [ai, setAI] = useState<any>();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!s) return;
      const { data: { user } } = await s.auth.getUser();
      if (!user) return;

      setEmail(user.email || '');

      const [{ data: profile }, { data: twin }] = await Promise.all([
        s.from('profiles').select('full_name,timezone').eq('id', user.id).maybeSingle(),
        s.from('twin_profiles')
          .select('study_hours,study_start_time,study_end_time')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (profile) {
        setFullName(profile.full_name || '');
        setTimezone(profile.timezone || 'Asia/Karachi');
      }
      setStudyHours(twin?.study_hours == null ? '' : String(twin.study_hours));
      setStudyStart(twin?.study_start_time || '');
      setStudyEnd(twin?.study_end_time || '');

      const r = await fetch('/api/ai/status');
      setAI(await r.json());
    })();
  }, []);

  async function save() {
    if (!s || saving) return;
    setMessage('');

    const { data: { user } } = await s.auth.getUser();
    if (!user) {
      setMessage('Your session has expired. Please sign in again.');
      return;
    }

    const parsedStudy = Number(studyHours);
    if (studyHours === '' || !Number.isFinite(parsedStudy) || parsedStudy < 0 || parsedStudy > 24) {
      setMessage('Enter study hours between 0 and 24.');
      return;
    }
    if ((studyStart && !studyEnd) || (!studyStart && studyEnd)) {
      setMessage('Select both study start and end time, or leave both empty.');
      return;
    }
    if (studyStart && studyEnd && studyStart === studyEnd) {
      setMessage('Study start and end time cannot be the same.');
      return;
    }

    setSaving(true);
    try {
      // Upsert keeps one profile per authenticated user and avoids the
      // twin_profiles_user_id_key duplicate-key error on later saves.
      const { error: profileError } = await s.from('profiles').upsert(
        {
          id: user.id,
          full_name: fullName,
          timezone,
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        setMessage(profileError.message);
        return;
      }

      const { error: twinError } = await s.from('twin_profiles').upsert(
        {
          user_id: user.id,
          study_hours: parsedStudy,
          study_start_time: studyStart || null,
          study_end_time: studyEnd || null,
        },
        { onConflict: 'user_id' }
      );

      setMessage(twinError ? twinError.message : 'Settings saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Settings2 className="text-violet-300" />
          <h1 className="text-3xl font-black">Settings</h1>
        </div>
        <p className="muted mt-1">Manage your Hamiq profile, study routine and AI connection.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass card">
          <h2 className="text-lg font-bold">Profile & Study Routine</h2>
          <label className="muted mt-5 block text-sm">Email</label>
          <input className="input mt-2 opacity-60" value={email} disabled />

          <label className="muted mt-4 block text-sm">Full name</label>
          <input className="input mt-2" value={fullName} onChange={e => setFullName(e.target.value)} />

          <label className="muted mt-4 block text-sm">Timezone</label>
          <input className="input mt-2" value={timezone} onChange={e => setTimezone(e.target.value)} />

          <label className="muted mt-4 block text-sm">Study hours per day</label>
          <input
            className="input mt-2"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={studyHours}
            onChange={e => setStudyHours(e.target.value)}
            placeholder="Enter your usual study hours"
          />
          <p className="muted mt-1 text-xs">This is your target study duration, not a hardcoded value.</p>

          <label className="muted mt-4 block text-sm">Preferred study time</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <span className="muted text-xs">Start</span>
              <input className="input mt-1" type="time" value={studyStart} onChange={e => setStudyStart(e.target.value)} />
            </div>
            <div>
              <span className="muted text-xs">End</span>
              <input className="input mt-1" type="time" value={studyEnd} onChange={e => setStudyEnd(e.target.value)} />
            </div>
          </div>
          <p className="muted mt-1 text-xs">Hamiq uses this window when suggesting when to study. Leave it empty if your study time changes daily.</p>

          <button onClick={save} disabled={saving} className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {message && <p className="mt-3 text-sm text-cyan-300">{message}</p>}
        </div>

        <div className="glass card">
          <div className="flex items-center gap-3"><Sparkles className="text-violet-300" /><h2 className="text-lg font-bold">AI connection</h2></div>
          <div className="mt-5 rounded-xl bg-white/[.03] p-4">
            <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${ai?.configured ? 'bg-cyan-400' : 'bg-amber-400'}`} /><b>{ai?.configured ? 'AI connected' : 'Demo fallback active'}</b></div>
            <p className="muted mt-2 text-sm">Provider: {ai?.provider || 'loading...'}</p>
            {!ai?.configured && <p className="muted mt-3 text-sm">Add the provider API key to <code>.env.local</code> and restart Next.js.</p>}
          </div>
          <div className="mt-5 rounded-xl bg-white/[.03] p-4">
            <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-cyan-300" /><b>Data isolation</b></div>
            <p className="muted mt-2 text-sm">Your Supabase Row Level Security policies restrict database rows to your authenticated user.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
