import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall(): {
  canInstall: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
} {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const result = await deferred.userChoice;
    setDeferred(null);
    return result.outcome;
  };

  return { canInstall: !!deferred, promptInstall };
}
