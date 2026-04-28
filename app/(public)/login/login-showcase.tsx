import Image from "next/image";

/** Decorative left panel for the login screen. Mirrors the brand marketing
 * material (black + red glow + bold typography). */
export function LoginShowcase() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-brand-black p-10">
      {/* Brand red glow blobs (matches PPF FULL CAR ad) */}
      <div className="absolute -top-32 -left-24 size-80 rounded-full brand-glow blur-3xl opacity-80" />
      <div className="absolute -bottom-32 -right-20 size-96 rounded-full brand-glow blur-3xl opacity-70" />

      {/* Faint diagonal scan-lines (carbon-fiber feel) */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 6px, white 6px 7px)",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative size-12 rounded-xl bg-black ring-1 ring-white/10 overflow-hidden">
          <Image
            src="/brand/logojs.jpg"
            alt="JS Detailing Center"
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-white text-sm font-black tracking-[0.2em]">JS DETAILING</div>
          <div className="text-brand-red-500 text-[10px] font-bold tracking-[0.4em]">CENTER</div>
        </div>
      </div>

      {/* Stack of floating mock-up cards */}
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Top — quick stat card */}
        <div
          className="float-slow relative ml-auto -mr-2 w-64 rounded-2xl bg-white shadow-2xl p-4 z-30"
          style={{ ["--rot" as string]: "2deg" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                Tickets activos
              </div>
              <div className="mt-1 text-3xl font-black text-zinc-900 tabular-nums">12</div>
            </div>
            <span className="rounded-full bg-brand-red-50 text-brand-red-700 text-[10px] font-bold px-2 py-0.5 border border-brand-red-100">
              +2 hoy
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-brand-red-500 to-brand-red-700" />
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-500">
            7 en aplicación · 3 en QC · 2 listos
          </div>
        </div>

        {/* Middle — vehicle in progress card */}
        <div
          className="float-slow relative -mt-6 ml-2 w-72 rounded-2xl bg-white shadow-2xl p-4 z-20"
          style={{ ["--rot" as string]: "-3deg", animationDelay: "1.5s" }}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-base font-black ring-1 ring-white/10">
              🚙
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-zinc-900 truncate uppercase">
                Tahoe 2025
              </div>
              <div className="text-[11px] text-zinc-500 truncate">Carlos M. · Cabina PPF</div>
            </div>
            <span className="text-[10px] font-bold uppercase text-brand-red-700 bg-brand-red-50 border border-brand-red-100 rounded-full px-2 py-0.5">
              Aplicación
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-brand-red-500 to-brand-red-700" />
            </div>
            <span className="text-[10px] tabular-nums text-zinc-700 font-bold">67%</span>
          </div>
        </div>

        {/* Bottom — happy clients card (red brand) */}
        <div
          className="float-slow relative -mt-4 -ml-4 w-60 rounded-2xl bg-brand-red-600 text-white shadow-2xl p-4 z-10 ring-1 ring-white/10"
          style={{ ["--rot" as string]: "4deg", animationDelay: "0.8s" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-90">
            Clientes satisfechos
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-black tabular-nums">4.9</span>
            <span className="text-brand-yellow-300 text-base">★★★★★</span>
          </div>
          <div className="mt-3 flex -space-x-2">
            {["AB", "CM", "JR", "SC"].map((init, i) => (
              <span
                key={init}
                className={
                  "size-7 rounded-full ring-2 ring-brand-red-600 text-[10px] font-bold flex items-center justify-center text-zinc-900 " +
                  ["bg-amber-200", "bg-zinc-100", "bg-stone-200", "bg-orange-200"][i]
                }
              >
                {init}
              </span>
            ))}
            <span className="size-7 rounded-full ring-2 ring-brand-red-600 bg-brand-red-900 text-[10px] font-bold flex items-center justify-center">
              2K+
            </span>
          </div>
        </div>
      </div>

      {/* Footer tagline */}
      <div className="relative z-10 flex items-center justify-between text-white/60">
        <div>
          <div className="text-[10px] tracking-[0.4em] font-bold uppercase">3M Pro 100</div>
          <div className="text-[10px] tracking-[0.2em] uppercase mt-0.5 text-white/40">
            Instalador autorizado
          </div>
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase font-medium text-white/40">
          Detailing&nbsp;OS
        </div>
      </div>
    </div>
  );
}
