import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1d] text-[#cbd5e1] font-sans p-6 text-center">
      <h2 className="text-4xl font-black uppercase italic mb-4 tracking-tighter">
        Neural Link Broken
      </h2>
      <p className="text-slate-400 mb-8 font-bold uppercase tracking-widest text-sm">
        404 - SECTOR NOT FOUND
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-emerald-500 text-slate-900 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400"
      >
        RECONNECT TO HOME
      </Link>
    </div>
  );
}
