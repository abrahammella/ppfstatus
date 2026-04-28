"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logoutAction } from "@/app/(public)/login/actions";
import type { Role } from "@/lib/flow/ppf-stages";
import { ROLE_LABELS } from "@/lib/flow/ppf-stages";
import clsx from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ICON_DASHBOARD = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h6v6H3zM11 4h6v3h-6zM11 9h6v7h-6zM3 12h6v4H3z" />
  </svg>
);
const ICON_BOARD = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h4v12H3zM9 4h4v8H9zM15 4h4v6h-4z" />
  </svg>
);
const ICON_PLUS = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M10 4v12M4 10h12" />
  </svg>
);
const ICON_USERS = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 8a3 3 0 11-6 0 3 3 0 016 0zM4 17v-1a4 4 0 014-4h2a4 4 0 014 4v1" />
  </svg>
);
const ICON_BADGE = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 2l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6L5.1 17.2 6 11.7l-4-3.9 5.5-.8z" />
  </svg>
);

const ICON_LIST = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M5 5h12M5 10h12M5 15h12" />
  </svg>
);

const ICON_CATALOG = (
  <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h12v12H4zM7 8h6M7 12h4" />
  </svg>
);

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: ICON_DASHBOARD },
  { href: "/tablero", label: "Tablero", icon: ICON_BOARD },
  { href: "/tickets/nuevo", label: "Nuevo ticket", icon: ICON_PLUS },
  { href: "/clientes", label: "Clientes", icon: ICON_USERS },
  { href: "/servicios", label: "Servicios", icon: ICON_LIST },
  { href: "/catalogo", label: "Catálogo", icon: ICON_CATALOG },
  { href: "/empleados", label: "Empleados", icon: ICON_BADGE },
];

const EMPLOYEE_NAV: Record<Exclude<Role, "admin">, NavItem[]> = {
  tecnico: [{ href: "/tecnico", label: "Mis lavados", icon: ICON_BOARD }],
  especialista: [{ href: "/especialista", label: "Mis aplicaciones", icon: ICON_BOARD }],
  qc: [{ href: "/qc", label: "Pendientes de QC", icon: ICON_BOARD }],
};

function SidebarContent({
  role,
  name,
  items,
  pathname,
  onNavigate,
}: {
  role: Role;
  name: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="absolute -top-24 -left-16 size-56 rounded-full brand-glow blur-3xl opacity-60 pointer-events-none" />

      <div className="relative px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <div className="relative size-11 rounded-xl bg-black ring-1 ring-white/10 overflow-hidden shrink-0">
          <Image src="/brand/logojs.jpg" alt="JS Detailing Center" fill sizes="44px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black tracking-[0.18em] truncate">JS DETAILING</div>
          <div className="text-[10px] font-bold tracking-[0.3em] text-brand-red-500">CENTER</div>
        </div>
      </div>

      <div className="relative px-5 py-3 border-b border-white/5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Sesión</div>
        <div className="text-xs text-zinc-400 mt-1">{ROLE_LABELS[role]}</div>
      </div>

      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition relative",
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              )}
            >
              {active ? (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-brand-red-600" />
              ) : null}
              <span
                className={clsx(
                  "size-7 rounded-lg flex items-center justify-center transition",
                  active ? "bg-brand-red-600 text-white" : "bg-white/5 text-zinc-400",
                )}
              >
                {it.icon}
              </span>
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white/5 ring-1 ring-white/5">
          <div className="size-9 rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 ring-1 ring-white/10 text-white flex items-center justify-center text-xs font-black">
            {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-[11px] text-zinc-500 truncate">{ROLE_LABELS[role]}</div>
          </div>
        </div>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );
}

export function Sidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const items = role === "admin" ? ADMIN_NAV : EMPLOYEE_NAV[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden sticky top-0 z-30 bg-brand-black text-zinc-100 px-4 py-3 flex items-center justify-between ring-1 ring-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative size-9 rounded-lg bg-black ring-1 ring-white/10 overflow-hidden">
            <Image src="/brand/logojs.jpg" alt="JS Detailing Center" fill sizes="36px" className="object-cover" />
          </div>
          <div>
            <div className="text-xs font-black tracking-[0.18em]">JS DETAILING</div>
            <div className="text-[9px] font-bold tracking-[0.3em] text-brand-red-500 -mt-0.5">CENTER</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="size-10 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 flex items-center justify-center transition"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-brand-black text-zinc-100 rounded-r-3xl m-2 ml-0 overflow-hidden ring-1 ring-white/5 relative">
        <SidebarContent role={role} name={name} items={items} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-brand-black text-zinc-100 flex flex-col overflow-hidden ring-1 ring-white/5 relative"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="absolute top-3 right-3 z-10 size-9 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 flex items-center justify-center transition"
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
              <SidebarContent
                role={role}
                name={name}
                items={items}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
