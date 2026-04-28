"use client";

export function ExportServicesButton() {
  function handleClick() {
    // Build CSV from currently visible rows in the searchable table.
    const rows = Array.from(
      document.querySelectorAll<HTMLTableRowElement>("[data-searchable-table] tbody tr"),
    ).filter((tr) => tr.offsetParent !== null && tr.dataset.search !== undefined);

    if (rows.length === 0) {
      alert("No hay servicios para exportar.");
      return;
    }

    const header = ["Vehículo", "Cliente", "Tipo", "Fecha", "Notas"];
    const csvRows = [header.join(",")];

    for (const tr of rows) {
      const cells = Array.from(tr.querySelectorAll<HTMLTableCellElement>("td")).slice(0, 5);
      const values = cells.map((td) => td.innerText.replace(/\n/g, " ").trim());
      csvRows.push(
        values
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(","),
      );
    }

    const blob = new Blob(["﻿" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `servicios_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-xl bg-zinc-100 text-zinc-700 text-sm font-bold uppercase tracking-wide px-4 py-2.5 hover:bg-zinc-200 transition inline-flex items-center gap-2"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" />
      </svg>
      Exportar CSV
    </button>
  );
}
