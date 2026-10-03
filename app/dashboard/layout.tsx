'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import InstallAppButton from '@/components/InstallAppButton';

const navigation = [
  ['overview', 'Overview', LayoutDashboard],
  ['tasks', 'Tasks', ListTodo],
  ['goals', 'Goals', Target],
  ['calendar', 'Calendar', CalendarDays],
  ['timetable', 'Class Timetable', CalendarDays],
  ['assistant', 'My Assistant', Sparkles],
  ['reports', 'Reports', BarChart3],
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    async function checkReminders() {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const { data } = await supabase
        .from('tasks')
        .select('id,title,reminder_at,status')
        .not('reminder_at', 'is', null)
        .lte('reminder_at', now.toISOString())
        .neq('status', 'done');

      const seen = JSON.parse(localStorage.getItem('hamiq-reminders') || '{}');
      for (const task of data || []) {
        if (!seen[task.id]) {
          new Notification('Hamiq reminder', { body: task.title });
          seen[task.id] = Date.now();
        }
      }
      localStorage.setItem('hamiq-reminders', JSON.stringify(seen));
    }

    void checkReminders();
    timer = setInterval(() => void checkReminders(), 30000);
    return () => timer && clearInterval(timer);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const Nav = ({ close = false }: { close?: boolean }) => (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard/overview"
          onClick={() => close && setMobile(false)}
          className="flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#0f172a] shadow-sm">
            <img src="/hamiq-mark.svg" alt="Hamiq" className="h-full w-full object-cover" />
          </span>
          <span className="text-lg font-black tracking-tight">Hamiq</span>
        </Link>
        {close && (
          <button
            type="button"
            onClick={() => setMobile(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-[#f7f2e9]"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9b927f]">
        Workspace
      </div>

      <nav className="space-y-1">
        {navigation.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={`/dashboard/${href}`}
            onClick={() => close && setMobile(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
            aria-current={pathname.includes(`/${href}`) ? 'page' : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 border-t border-[#eee8dd] pt-4">
        <Link
          href="/dashboard/settings"
          onClick={() => close && setMobile(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
          aria-current={pathname.includes('/settings') ? 'page' : undefined}
        >
          <Settings size={18} />
          Settings
        </Link>
        <InstallAppButton />
        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#7b8088] hover:bg-[#f8f3ea]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen md:flex">
      <aside className="sidebar hidden w-[248px] shrink-0 md:block">
        <div className="sticky top-0 h-screen overflow-y-auto p-5">
          <Nav />
        </div>
      </aside>

      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            onClick={() => setMobile(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <aside className="sidebar relative h-full w-[290px] p-5 shadow-2xl">
            <Nav close />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#e9e3d8] bg-[#f7f5ef]/90 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setMobile(true)}
              className="rounded-xl border border-[#e5ddcf] bg-white p-2"
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <span className="flex items-center gap-2"><img src="/hamiq-mark.svg" alt="Hamiq" className="h-8 w-8 rounded-lg object-cover" /><span className="font-black">Hamiq</span></span>
            <span className="h-9 w-9 rounded-full bg-[#f2e6d3]" />
          </div>
        </header>

        <div className="mx-auto max-w-[1380px] p-5 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
