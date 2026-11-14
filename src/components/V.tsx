import { load } from "@/lib/data";
import { type Fmt, show } from "@/lib/format";
import { pointer } from "@/lib/pointer";

// A figure from an export. It renders the value found at `ptr` in `file`, and carries its source
// so tests/e2e/trace.spec.ts can check every figure on every page against the export.
export function V({ file, ptr, as = "int" }: { file: string; ptr: string; as?: Fmt }) {
  const doc = load<unknown>(file);
  const value = doc === null ? undefined : pointer(doc, ptr);
  if (value === undefined) return <span className="muted">unavailable</span>;
  return (
    <span data-src={`${file}#${ptr}`} data-as={as}>
      {show(value, as)}
    </span>
  );
}

// A number that is not data: an axis label, a unit in prose, a version in a name.
export function S({ children }: { children: React.ReactNode }) {
  return <span data-static="">{children}</span>;
}
