"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4 sm:gap-5">
      <input type="hidden" name="next" value={next ?? ""} />

      <Field
        label="Correo"
        name="email"
        type="email"
        placeholder="tu@jsdetailing.do"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />

      <Field
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      {state.error ? (
        <div className="rounded-2xl bg-brand-red-50 text-brand-red-700 text-sm px-4 py-3 border border-brand-red-100">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 sm:mt-2 w-full rounded-2xl bg-brand-red-600 text-white font-bold uppercase tracking-wide py-3.5 sm:py-4 transition hover:bg-brand-red-700 active:bg-brand-red-900 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_15px_40px_-10px_oklch(0.56_0.23_25/0.55)]"
      >
        {pending ? "Verificando…" : "Continuar"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  required,
  error,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-zinc-900 mb-2">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 sm:px-5 py-3 sm:py-4 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100 aria-[invalid=true]:border-brand-red-500 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-brand-red-100"
      />
      {error ? <span className="mt-1.5 block text-xs text-brand-red-700">{error}</span> : null}
    </label>
  );
}
