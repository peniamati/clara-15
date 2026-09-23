import React from 'react';

interface Props { children: React.ReactNode; label: string }
interface State { failed: boolean }

export class AsyncPanelBoundary extends React.Component<Props, State> {
  declare props: Props;
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error): void {
    if (!/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed/i.test(String(error))) return;
    const now = Date.now();
    const key = 'clara15-asset-retry';
    try {
      if (now - Number(sessionStorage.getItem(key) || 0) < 120000) return;
      sessionStorage.setItem(key, String(now));
    } catch { /* The retry still works without storage. */ }
    const url = new URL(window.location.href);
    url.searchParams.set('actualizar', String(now));
    window.location.replace(url.toString());
  }

  render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="fixed inset-0 z-[300] flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#050505] p-6 text-center text-white">
        <h2 className="font-serif text-3xl">No se pudo abrir {this.props.label}</h2>
        <p className="max-w-md text-zinc-300">La invitación se actualizó mientras estaba abierta. Recargá la página para usar la versión nueva.</p>
        <button className="rounded-full bg-white px-7 py-3 font-semibold text-black" onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set('actualizar', String(Date.now()));
          window.location.replace(url.toString());
        }}>Recargar página</button>
      </div>
    );
  }
}
