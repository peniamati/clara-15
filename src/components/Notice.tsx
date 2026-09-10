import React, { useEffect, useState } from 'react';
export function Notice() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const show = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener('invitation-notice', show);
    return () => window.removeEventListener('invitation-notice', show);
  }, []);
  if (!message) return null;
  return <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Aviso"><div className="w-full max-w-md rounded-2xl border border-white/20 bg-zinc-950 p-6 text-white"><p>{message}</p><button autoFocus className="mt-5 w-full rounded-xl bg-white p-3 text-black" onClick={() => setMessage('')}>Entendido</button></div></div>;
}
