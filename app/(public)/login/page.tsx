import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { LoginShowcase } from "./login-showcase";

export const metadata: Metadata = { title: "Iniciar sesión — JS Detailing Center" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="min-h-dvh showroom-bg flex items-center justify-center p-3 sm:p-6 lg:p-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden grid lg:grid-cols-2 lg:min-h-[640px] ring-1 ring-zinc-200">
        <LoginShowcase />

        <div className="px-6 py-8 sm:px-12 sm:py-14 flex flex-col bg-white">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-red-600" />
              <span className="text-xs font-bold tracking-[0.25em] text-zinc-900">
                JS&nbsp;DETAILING&nbsp;CENTER
              </span>
            </div>
          </div>

          <div className="mt-6 sm:mt-10 lg:mt-16">
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-brand-red-600">
              <span className="h-px w-6 bg-brand-red-600" />
              Inicia sesión
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 leading-[1]">
              Protege cada<br />
              <span className="text-brand-red-600">detalle</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-sm text-zinc-500 max-w-sm leading-relaxed">
              Plataforma interna para gestionar el flujo completo de PPF y Ceramic Coating, desde la
              recepción hasta la entrega.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-10 flex-1">
            <LoginForm next={next} />
          </div>

          <div className="mt-6 sm:mt-8 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">
              Cuentas de demostración
            </p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-700 font-mono">
              <li>admin@jsdetailing.do · admin123</li>
              <li>tecnico@jsdetailing.do · tecnico123</li>
              <li>especialista@jsdetailing.do · especialista123</li>
              <li>qc@jsdetailing.do · qc123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
