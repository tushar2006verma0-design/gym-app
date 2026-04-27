export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-bold text-white uppercase tracking-widest animate-pulse italic">
        Synchronizing Neural Patterns...
      </h2>
    </div>
  );
}
