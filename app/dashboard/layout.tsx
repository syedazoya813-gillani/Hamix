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
  Home,
  UserRound,
  Download,
  Menu,
  X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  ['overview', 'Overview', LayoutDashboard],
  ['tasks', 'Tasks', ListTodo],
  ['goals', 'Goals', Target],
  ['calendar', 'Calendar', CalendarDays],
  ['timetable', 'Class Timetable', CalendarDays],
  ['assistant', 'My Assistant', Sparkles],
  ['reports', 'Reports', BarChart3],
] as const;

const mobileNavigation = [
  ['/dashboard/overview', 'Overview', Home],
  ['/dashboard/tasks', 'Tasks', ListTodo],
  ['/dashboard/assistant', 'Assistant', Sparkles],
  ['/dashboard/reports', 'Reports', BarChart3],
  ['/dashboard/settings', 'Settings', Settings],
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [installEvent, setInstallEvent] = useState<any>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    const onAppInstalled = () => setInstallEvent(null);
    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

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

  async function installApp() {
    if (installEvent) {
      await installEvent.prompt();
      setInstallEvent(null);
      return;
    }

    // On browsers that do not expose beforeinstallprompt, the browser's own
    // install UI must be used. Keeping the button disabled avoids a dead click.
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: browser)').matches) {
      alert('To install Hamiq, open Chrome menu (⋮) and choose “Install app”.');
    }
  }

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
          <aside className="mobile-drawer relative h-full w-[290px] p-5 shadow-2xl">
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
              aria-expanded={mobile}
              className="rounded-xl border border-[#e5ddcf] bg-white p-2"
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <span className="flex items-center gap-2"><img src="/hamiq-mark.svg" alt="Hamiq" className="h-8 w-8 rounded-lg object-cover" /><span className="font-black">Hamiq</span></span>
            <button type="button" onClick={installApp} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2e6d3] text-[#946b2f]" aria-label="Install Hamiq"><Download size={17} /></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1380px] p-5 pb-24 md:p-8 md:pb-8 lg:p-10">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7e1d6] bg-white/95 px-2 py-2 shadow-[0_-8px_25px_rgba(43,34,21,.08)] backdrop-blur-md md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileNavigation.map(([href, label, Icon]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href as string} href={href as string} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold ${active ? 'bg-[#f4ead9] text-[#946b2f]' : 'text-[#7b8490]'}`}><Icon size={18} /><span className="truncate">{label as string}</span></Link>;
          })}
        </div>
      </nav>
    </div>
  );
}
