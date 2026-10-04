'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated successfully. You can now sign in with your new password.');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <form onSubmit={submit} className="glass card w-full bg-white">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#687386] hover:text-[#946b2f]"><ArrowLeft size={17}/> Back to login</Link>
          <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead9] text-[#946b2f]"><ShieldCheck size={22}/></div>
          <h1 className="mt-6 text-3xl font-black text-[#1d2635]">Create a new password</h1>
          <p className="mt-2 text-sm leading-6 text-[#687386]">Choose a new password for your authorized Hamiq account.</p>

          <label className="mt-7 block text-sm font-semibold text-[#1d2635]">New password</label>
          <input required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="input mt-2" type="password" autoComplete="new-password" />
          <label className="mt-4 block text-sm font-semibold text-[#1d2635]">Confirm password</label>
          <input required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} className="input mt-2" type="password" autoComplete="new-password" />

          {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">{error}</p>}
          {message && <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm leading-5 text-green-700">{message}</p>}
          {!ready && !message && <p className="mt-4 text-xs text-[#9a9182]">Open this page from the password reset email. If the link has expired, request a new one.</p>}

          <button disabled={loading || !ready} className="btn btn-primary mt-5 w-full justify-center">
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </main>
  );
}
