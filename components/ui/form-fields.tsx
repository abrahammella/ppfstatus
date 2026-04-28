"use client";

import clsx from "clsx";

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  error,
  helper,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  error?: string;
  helper?: string;
  className?: string;
}) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-bold uppercase tracking-wide text-zinc-700">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100 aria-[invalid=true]:border-brand-red-500 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-brand-red-100"
      />
      {error ? (
        <span className="text-xs text-brand-red-700 font-medium">{error}</span>
      ) : helper ? (
        <span className="text-[11px] text-zinc-500">{helper}</span>
      ) : null}
    </label>
  );
}

export function FormSelect({
  label,
  name,
  defaultValue,
  options,
  error,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  className?: string;
}) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-bold uppercase tracking-wide text-zinc-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-brand-red-700 font-medium">{error}</span> : null}
    </label>
  );
}

export function FormTextarea({
  label,
  name,
  rows = 3,
  placeholder,
  defaultValue,
  error,
  className,
}: {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-bold uppercase tracking-wide text-zinc-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error) || undefined}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100"
      />
      {error ? <span className="text-xs text-brand-red-700 font-medium">{error}</span> : null}
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "rounded-xl bg-brand-red-600 text-white text-sm font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-brand-red-700 active:bg-brand-red-900 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_-10px_oklch(0.56_0.23_25/0.55)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "rounded-xl bg-zinc-100 text-zinc-700 text-sm font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-zinc-200 transition",
        className,
      )}
    >
      {children}
    </button>
  );
}
