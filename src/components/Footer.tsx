"use client";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-glass bg-[#050505] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-accent-glow/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col items-center gap-2 z-10 text-center">
        <span className="font-serif italic tracking-widest text-lg bg-gradient-to-r from-white/80 via-white to-white/80 bg-clip-text text-transparent">
          In the most selfish way possible, I hope nobody admires you the way I do.
        </span>
      </div>
    </footer>
  );
}
