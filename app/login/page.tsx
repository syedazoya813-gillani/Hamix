'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_EMAIL = 'hammalalam406@gmail.com';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Invalid credentials. Hamix access credentials are provided by the administrator.');
    } else {
      router.push('/dashboard/overview');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex">
            <img src="/hamix-logo.png" alt="Hamix" className="h-20 w-auto object-contain" />
          </Link>
          <div className="mt-16 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e7d5b6] bg-[#f4ead9] px-4 py-2 text-sm font-medium text-[#946b2f]">
              <ShieldCheck size={16} /> Authorized access
            </div>
            <h1 className="text-6xl font-black leading-[1.02] tracking-tight text-[#1d2635]">Your personal planning space, securely connected.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#687386]">Sign in with the credentials supplied by the Hamix administrator. New public account registration is disabled.</p>
          </div>
        </section>

        <form onSubmit={submit} className="glass card mx-auto w-full max-w-md bg-white">
          <div className="lg:hidden">
            <Link href="/" className="inline-flex"><img src="/hamix-logo.png" alt="Hamix" className="h-14 w-auto object-contain" /></Link>
          </div>
          <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead9] text-[#946b2f]"><ShieldCheck size={22}/></div>
          <h1 className="mt-6 text-3xl font-black text-[#1d2635]">Hamix Login</h1>
          <p className="mt-2 text-sm leading-6 text-[#687386]">Use the email and password provided by the administrator.</p>

          <label className="mt-7 block text-sm font-semibold text-[#1d2635]">Email</label>
          <input required value={email} onChange={e => setEmail(e.target.value)} className="input mt-2" placeholder="Your authorized email" type="email" autoComplete="email" />
          <label className="mt-4 block text-sm font-semibold text-[#1d2635]">Password</label>
          <input required value={password} onChange={e => setPassword(e.target.value)} className="input mt-2" placeholder="Your password" type="password" autoComplete="current-password" />

          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button disabled={loading} className="btn btn-primary mt-5 w-full justify-center gap-2">
            {loading ? 'Signing in...' : <>Sign in to Hamix <ArrowRight size={17}/></>}
          </button>

          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#e8e1d5]"/><span className="text-xs text-[#9a9182]">NEED ACCESS?</span><div className="h-px flex-1 bg-[#e8e1d5]"/></div>

          <a href={`mailto:${ADMIN_EMAIL}?subject=Hamix%20Access%20Request`} className="btn w-full justify-center gap-2 border border-[#e1d5c1] bg-[#fffaf2] text-[#805c25] hover:bg-[#f8efdf]">
            <Mail size={17}/> Contact Hamix Admin
          </a>
          <p className="mt-3 text-center text-xs leading-5 text-[#7b8491]">Credentials are provided by the administrator.<br/><span className="font-medium text-[#946b2f]">{ADMIN_EMAIL}</span></p>

          <Link href="/demo" className="mt-5 block text-center text-sm font-semibold text-[#1d2635] hover:text-[#946b2f]">Try the demo instead →</Link>
        </form>
      </div>
    </main>
  );
}
