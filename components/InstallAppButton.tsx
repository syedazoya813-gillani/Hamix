'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    window.addEventListener('appinstalled', onInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !promptEvent) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  }

  return (
    <button
      type="button"
      onClick={install}
      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#687386] hover:bg-[#f8f3ea]"
    >
      <Download size={18} />
      Install Hamiq
    </button>
  );
}
