"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addCommentAction,
  deleteCommentAction,
} from "@/app/(admin)/tickets/[id]/comment-actions";
import type { TicketComment } from "@/lib/schemas";
import { ROLE_LABELS, type Role } from "@/lib/flow/ppf-stages";

export interface AuthorInfo {
  id: string;
  name: string;
  role: Role;
}

export function CommentsThread({
  ticketId,
  comments,
  authors,
  currentUserId,
  currentUserRole,
  canComment,
}: {
  ticketId: string;
  comments: TicketComment[];
  authors: AuthorInfo[];
  currentUserId: string;
  currentUserRole: Role;
  canComment: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const sorted = [...comments].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : 1,
  );

  function handleSubmit(formData: FormData) {
    formData.set("ticketId", ticketId);
    setError(null);
    startTransition(async () => {
      const res = await addCommentAction(formData);
      if (!res.ok) {
        setError(res.error ?? "No se pudo enviar.");
        return;
      }
      setText("");
      router.refresh();
    });
  }

  function handleDelete(commentId: string) {
    const fd = new FormData();
    fd.set("ticketId", ticketId);
    fd.set("commentId", commentId);
    startTransition(async () => {
      await deleteCommentAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 ? (
        <div className="text-xs text-zinc-500 italic">
          Sin comentarios todavía. Deja una nota para el equipo.
        </div>
      ) : (
        <ol className="space-y-3">
          {sorted.map((c) => {
            const author = authorMap.get(c.authorId);
            const canDelete =
              currentUserRole === "admin" || c.authorId === currentUserId;
            return (
              <li
                key={c.id}
                className="rounded-2xl bg-zinc-50/70 border border-zinc-100 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-white text-[10px] font-black flex items-center justify-center ring-1 ring-white/40 shrink-0">
                      {(author?.name ?? "?")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 truncate">
                        {author?.name ?? "Usuario"}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                        {author ? ROLE_LABELS[author.role] : "—"} ·{" "}
                        {new Date(c.createdAt).toLocaleString("es-DO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={pending}
                      className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 hover:text-brand-red-700 disabled:opacity-40"
                    >
                      Borrar
                    </button>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-800 mt-2 whitespace-pre-wrap break-words">
                  {c.text}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {canComment ? (
        <form action={handleSubmit} className="space-y-2 border-t border-zinc-100 pt-4">
          <textarea
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deja una nota para el equipo…"
            rows={2}
            maxLength={1000}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100 transition resize-none"
          />
          {error ? (
            <div className="text-xs text-brand-red-700">{error}</div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-zinc-400">{text.length}/1000</span>
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="rounded-lg bg-brand-red-600 text-white text-xs font-bold uppercase tracking-wide px-4 py-1.5 hover:bg-brand-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Enviando…" : "Comentar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-xs text-zinc-500 italic border-t border-zinc-100 pt-3">
          Solo los asignados a este ticket pueden comentar.
        </div>
      )}
    </div>
  );
}
