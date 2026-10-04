'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_EMAIL = 'hammalalam406@gmail.com';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase is not configured.');
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage('If this email is authorized, a password reset link has been sent. Check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send the reset email. Please contact the administrator.');
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
          <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead9] text-[#946b2f]"><ShieldCheck size={22}/></div>
          <h1 className="mt-6 text-3xl font-black text-[#1d2635]">Forgot Password?</h1>
          <p className="mt-2 text-sm leading-6 text-[#687386]">Enter your authorized Hamiq email address. We will send a secure password reset link.</p>

          <label className="mt-7 block text-sm font-semibold text-[#1d2635]">Email</label>
          <input required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-2" placeholder="Your authorized email" type="email" autoComplete="email" />

          {message && <p className="mt-4 rounded-xl bg-green-50 px-3 py-3 text-sm leading-6 text-green-700">{message}</p>}
          {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-sm leading-6 text-red-700">{error}</p>}

          <button disabled={loading} className="btn btn-primary mt-5 w-full justify-center gap-2">
            <Mail size={17}/>{loading ? 'Sending...' : 'Send reset link'}
          </button>

          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#e8e1d5]"/><span className="text-xs text-[#9a9182]">NEED HELP?</span><div className="h-px flex-1 bg-[#e8e1d5]"/></div>
          <a href={`mailto:${ADMIN_EMAIL}?subject=Hamiq%20Password%20Reset%20Help`} className="btn w-full justify-center border border-[#e1d5c1] bg-[#fffaf2] text-[#805c25] hover:bg-[#f8efdf]">Contact Hamiq Admin</a>
          <p className="mt-3 text-center text-xs leading-5 text-[#7b8491]">Access is administrator-controlled.<br/><span className="font-medium text-[#946b2f]">{ADMIN_EMAIL}</span></p>
        </form>
      </div>
    </main>
  );
}
