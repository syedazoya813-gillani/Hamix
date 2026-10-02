'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [available, setAvailable] = useState('5');
  const [study, setStudy] = useState('');
  const [studyStart, setStudyStart] = useState('');
  const [studyEnd, setStudyEnd] = useState('');
  const [sleep, setSleep] = useState('7');
  const [workload, setWorkload] = useState('medium');
  const [work, setWork] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function finish() {
    setError('');
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { error: profileError } = await s.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      onboarding_complete: true,
    });

    if (profileError) {
      setError(profileError.message);
      return;
    }

    // Study hours are explicitly provided by the user. There is no hardcoded study value.
    const availableHours = Number(available) || 0;
    const studyHours = Number(study);
    const sleepHours = Number(sleep) || 0;

    if (!Number.isFinite(studyHours) || studyHours < 0 || studyHours > 24) {
      setError('Please enter your usual study hours per day (0–24).');
      return;
    }

    if ((studyStart && !studyEnd) || (!studyStart && studyEnd)) {
      setError('Select both study start and end time, or leave both empty.');
      return;
    }

    if (studyStart && studyEnd && studyStart === studyEnd) {
      setError('Study start and end time cannot be the same.');
      return;
    }

    const { error: twinError } = await s.from('twin_profiles').upsert({
      user_id: user.id,
      available_hours: availableHours,
      sleep_hours: sleepHours,
      workload_level: workload,
      study_hours: studyHours,
      work_hours: 0,
      study_start_time: studyStart || null,
      study_end_time: studyEnd || null,
    });

    if (twinError) {
      setError(twinError.message);
      return;
    }

    if (goal.trim()) {
      await s.from('goals').insert({
        user_id: user.id,
        title: goal,
        priority: 'high',
      });
    }

    if (work.trim()) {
      await s.from('memories').insert({
        user_id: user.id,
        category: 'project',
        content: work,
        source: 'onboarding',
        confidence: 1,
      });
    }

    router.push('/dashboard/overview');
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="glass card w-full max-w-xl">
        <div className="mb-6">
          <img src="/hamiq-logo.svg" alt="Hamiq" className="h-14 w-auto object-contain" />
        </div>

        <div className="text-sm text-[#946b2f]">STEP {step} OF 7</div>

        {step === 1 && (
          <>
            <h1 className="mt-4 text-3xl font-black">What’s your primary goal?</h1>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="input mt-6"
              placeholder="e.g. Complete my AI degree"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mt-4 text-3xl font-black">How much available time do you have?</h1>
            <input
              value={available}
              onChange={e => setAvailable(e.target.value)}
              className="input mt-6"
              type="number"
              min="0"
              max="24"
              step="0.5"
            />
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="mt-4 text-3xl font-black">How many hours do you usually study per day?</h1>
            <p className="muted mt-2 text-sm">This value is saved to your Hamiq profile and used throughout your dashboard.</p>
            <input
              value={study}
              onChange={e => setStudy(e.target.value)}
              className="input mt-6"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="e.g. 3"
            />
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="mt-4 text-3xl font-black">When do you usually study?</h1>
            <p className="muted mt-2 text-sm">Choose a preferred study window. You can leave it empty if your study time changes.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div><span className="muted text-xs">Start</span><input value={studyStart} onChange={e => setStudyStart(e.target.value)} className="input mt-1" type="time" /></div>
              <div><span className="muted text-xs">End</span><input value={studyEnd} onChange={e => setStudyEnd(e.target.value)} className="input mt-1" type="time" /></div>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="mt-4 text-3xl font-black">Typical sleep duration?</h1>
            <input
              value={sleep}
              onChange={e => setSleep(e.target.value)}
              className="input mt-6"
              type="number"
              min="0"
              max="24"
              step="0.5"
            />
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="mt-4 text-3xl font-black">Current workload?</h1>
            <select value={workload} onChange={e => setWorkload(e.target.value)} className="input mt-6">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </>
        )}

        {step === 7 && (
          <>
            <h1 className="mt-4 text-3xl font-black">What are you working on?</h1>
            <textarea
              value={work}
              onChange={e => setWork(e.target.value)}
              className="input mt-6 min-h-28"
              placeholder="Projects, courses, work, deadlines..."
            />
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          onClick={() => step < 7 ? setStep(step + 1) : finish()}
          className="btn btn-primary mt-7 w-full"
        >
          {step < 7 ? 'Continue' : 'Build my Hamiq'}
        </button>
      </div>
    </main>
  );
}
