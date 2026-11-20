"use client";
import { useEffect, useId, useRef, useState } from "react";

export type SortOption = { value: string; label: string; key: string; dir: 1 | -1; text?: boolean };
export type Facet = { value: string; label: string };

// A bounded, scrollable region for a long list or table, with search, optional facets and
// optional sorting. Rows are server-rendered children marked `data-row`; this only hides or
// reorders them, so every row (and every traced figure in it) stays in the page.
//   data-search="..."   text to match (defaults to the row's text)
//   data-facet="..."    value matched by the facet chips
//   data-s-<key>="..."  sort value (numbers sort numerically)
export function Searchable({
  label,
  placeholder = "Search",
  sorts,
  facets,
  height = "min(70vh, 640px)",
  children,
}: {
  label: string;
  placeholder?: string;
  sorts?: SortOption[];
  facets?: Facet[];
  height?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const shown = useRef<HTMLSpanElement>(null);
  const [q, setQ] = useState("");
  const [facet, setFacet] = useState("");
  const [sort, setSort] = useState(sorts?.[0]?.value ?? "");

  useEffect(() => {
    const rows = box.current ? [...box.current.querySelectorAll<HTMLElement>("[data-row]")] : [];
    const needle = q.trim().toLowerCase();
    let n = 0;
    for (const r of rows) {
      const hay = (r.dataset.search ?? r.textContent ?? "").toLowerCase();
      const ok = (!needle || hay.includes(needle)) && (!facet || r.dataset.facet === facet);
      r.hidden = !ok;
      if (ok) n++;
    }
    if (shown.current) shown.current.textContent = `${n} of ${rows.length} shown`;
  }, [q, facet]);

  useEffect(() => {
    const opt = sorts?.find((s) => s.value === sort);
    if (!opt || !box.current) return;
    const rows = [...box.current.querySelectorAll<HTMLElement>("[data-row]")];
    const parent = rows[0]?.parentElement;
    if (!parent) return;
    const val = (r: HTMLElement) => r.getAttribute(`data-s-${opt.key}`) ?? "";
    rows.sort((a, b) => {
      if (opt.text) return val(a).localeCompare(val(b)) * opt.dir;
      const x = Number(val(a));
      const y = Number(val(b));
      // missing values last whatever the direction
      if (Number.isNaN(x) || val(a) === "") return 1;
      if (Number.isNaN(y) || val(b) === "") return -1;
      return (x - y) * opt.dir;
    });
    for (const r of rows) parent.appendChild(r);
  }, [sort, sorts]);

  return (
    <div className="searchable">
      <div className="toolbar">
        <label className="search">
          <span className="vh">{placeholder}</span>
          <input type="search" placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {sorts?.length ? (
          <label className="sortby">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {facets?.length ? (
          <div className="facets" role="group" aria-label="Filter">
            {[{ value: "", label: "All" }, ...facets].map((f) => (
              <button
                key={f.value || "all"}
                type="button"
                className="chip"
                aria-pressed={facet === f.value}
                onClick={() => setFacet(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
        <span className="count small muted" aria-live="polite" data-static="" ref={shown} />
      </div>
      <div
        className="scrollbox"
        ref={box}
        style={{ maxHeight: height }}
        tabIndex={0}
        role="region"
        aria-label={label}
        id={id}
      >
        {children}
      </div>
    </div>
  );
}
