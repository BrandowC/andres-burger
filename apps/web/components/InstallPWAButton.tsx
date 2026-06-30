"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isStandalone, setIsStandalone] = useState(false);
  const [debugMessage, setDebugMessage] = useState(
    "Verificando instalación...",
  );

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone,
      );

    setIsStandalone(standalone);

    console.log("[PWA] standalone:", standalone);

    if (standalone) {
      setDebugMessage("App instalada");
    } else {
      setDebugMessage("Instalar app");
    }

    function handleBeforeInstallPrompt(event: Event) {
      console.log("[PWA] beforeinstallprompt capturado");
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setDebugMessage("Instalar app");
    }

    function handleAppInstalled() {
      console.log("[PWA] appinstalled capturado");
      setIsStandalone(true);
      setInstallPrompt(null);
      setDebugMessage("App instalada");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (isStandalone) {
      alert("La app ya está instalada o estás dentro del modo aplicación.");
      return;
    }

    if (!installPrompt) {
      alert(
        "Chrome todavía no permite mostrar el instalador automático. Revisa el icono de instalación en la barra del navegador o el menú de Chrome → Instalar app. Si no aparece, revisa los iconos 192x192 y 512x512 del manifest.",
      );
      return;
    }

    await installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    console.log("[PWA] userChoice:", choice);

    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
      setIsStandalone(true);
      setDebugMessage("App instalada");
    }
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className={`rounded-2xl px-5 py-3 font-black shadow-xl transition hover:scale-105 active:scale-95 ${
        isStandalone
          ? "bg-green-300 text-[#061a35]"
          : "bg-cyan-300 text-[#061a35] shadow-cyan-300/20"
      }`}
    >
      {debugMessage}
    </button>
  );
}
