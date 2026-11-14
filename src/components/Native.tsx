import { isRtl, native } from "@/lib/names";

export function Native({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span className={`nat ${className}`} lang={code} dir={isRtl(code) ? "rtl" : undefined}>
      {native(code)}
    </span>
  );
}
