'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-white uppercase italic mb-4">Neural Handshake Interrupted</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        A system-wide exception has occurred in the tracking protocol.
      </p>
      <button
        onClick={() => reset()}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all"
      >
        RE-INITIATE SEQUENCE
      </button>
    </div>
  );
}
