// components/InstallAppBanner.tsx — 1-Tap Android App Installation Banner
import { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for Android Chrome if prompt hasn't fired yet
      alert("To install on Android:\n1. Tap the three dots (⋮) menu in Chrome\n2. Select 'Add to Home screen' or 'Install app'");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch {
      // Ignore prompt error
    } finally {
      setDeferredPrompt(null);
    }
  };

  // Do not render if installed or dismissed
  if (isInstalled || dismissed) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(79, 163, 224, 0.15) 0%, rgba(26, 29, 46, 0.95) 100%)',
        borderBottom: '1px solid rgba(79, 163, 224, 0.3)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0e1117',
            flexShrink: 0,
          }}
        >
          <Smartphone size={18} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
            Install AeroSmog.AI for Android
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Get full-screen app experience, real-time alerts & instant launcher
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleInstallClick}
          className="btn btn-accent"
          style={{
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 20,
          }}
        >
          <Download size={14} />
          Install App
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
