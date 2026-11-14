// RFC 6901 JSON Pointer. Shared by <V> (render) and the trace test (check).
export function pointer(doc: unknown, ptr: string): unknown {
  if (ptr === "") return doc;
  let cur: unknown = doc;
  for (const raw of ptr.slice(1).split("/")) {
    const key = raw.replace(/~1/g, "/").replace(/~0/g, "~");
    if (cur === null || typeof cur !== "object" || !(key in (cur as object))) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}
