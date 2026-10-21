import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => setPrompt(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!prompt) return null;

  const install = async () => {
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  return (
    <button
      type="button"
      onClick={install}
      className="btn-secondary fixed bottom-4 right-4 z-50 h-11 w-11 px-0 shadow-float sm:h-10 sm:w-auto sm:px-4"
      aria-label="Instalar SIGES-PIN neste dispositivo"
      title="Instalar aplicativo"
    >
      <Download className="h-4 w-4" aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Instalar aplicativo</span>
    </button>
  );
}
