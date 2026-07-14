export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="w-6 h-6 border-2 border-black/10 border-t-[#ff2a85] rounded-full animate-spin" />
        <p className="text-[9px] tracking-[0.4em] uppercase text-black/35 font-bold">Loading</p>
      </div>
    </div>
  );
}
