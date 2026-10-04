'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    if (!supabase) {
      setError('Supabase is not configured.');
      return () => {
        active = false;
      };
    }
    
     supabase.auth.getSession().then(({ data, error: sessionError }: any) => {
       if (!active) return;

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      setReady(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setReady(Boolean(session));
      }
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase is not configured.');

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage('Your password has been updated successfully. You can now sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update your password. Please request a new reset link.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <form onSubmit={submit} className="glass card w-full max-w-md bg-white">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#805c25] hover:underline">
            <ArrowLeft size={16} /> Back to login
          </Link>

          <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead9] text-[#946b2f]">
            <LockKeyhole size={22} />
          </div>

          <h1 className="mt-6 text-3xl font-black text-[#1d2635]">Create a new password</h1>
          <p className="mt-2 text-sm leading-6 text-[#687386]">
            Choose a strong password for your authorized Hamiq account.
          </p>

          {!ready && !error && (
            <p className="mt-5 rounded-xl bg-[#fff8eb] px-3 py-3 text-sm leading-6 text-[#76551f]">
              Checking your secure reset session...
            </p>
          )}

          <label className="mt-7 block text-sm font-semibold text-[#1d2635]">New password</label>
          <input
            required
            disabled={!ready || loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-2"
            placeholder="At least 8 characters"
            type="password"
            autoComplete="new-password"
          />

          <label className="mt-4 block text-sm font-semibold text-[#1d2635]">Confirm password</label>
          <input
            required
            disabled={!ready || loading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input mt-2"
            placeholder="Repeat your password"
            type="password"
            autoComplete="new-password"
          />

          {message && (
            <p className="mt-4 flex gap-2 rounded-xl bg-green-50 px-3 py-3 text-sm leading-6 text-green-700">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-sm leading-6 text-red-700">
              {error}
            </p>
          )}

          <button disabled={!ready || loading} className="btn btn-primary mt-5 w-full justify-center">
            {loading ? 'Updating...' : 'Update password'}
          </button>

          <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-[#1d2635] hover:text-[#946b2f]">
            Return to Hamiq Login
          </Link>
        </form>
      </div>
    </main>
  );
}
