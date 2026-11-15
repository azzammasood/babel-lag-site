import { english, isRtl, langTag, native } from "@/lib/names";

export function Native({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span className={`nat ${className}`} lang={langTag(code)} dir={isRtl(code) ? "rtl" : undefined}>
      {native(code)}
    </span>
  );
}

// The name in the language itself, then the English name when it differs.
export function Names({ code }: { code: string }) {
  const own = native(code);
  const en = english(code);
  return (
    <>
      <Native code={code} />
      {own === en ? null : <span className="muted"> {en}</span>}
    </>
  );
}
