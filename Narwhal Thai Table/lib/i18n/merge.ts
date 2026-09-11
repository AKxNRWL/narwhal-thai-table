/** Recursive Partial — arrays are taken whole (a translated list replaces the English list). */
export type DeepPartial<T> = T extends readonly (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * deepMerge(base, patch) — every key in `patch` overrides `base`; nested
 * objects merge recursively; arrays and scalars replace. Used to lay a
 * partial translation over the English dictionary so a missing line shows
 * English rather than nothing.
 */
export function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (patch === undefined || patch === null) return base;
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch as unknown as T;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const p = (patch as Record<string, unknown>)[key];
    if (p === undefined) continue;
    const b = (base as Record<string, unknown>)[key];
    out[key] = isPlainObject(b) && isPlainObject(p) ? deepMerge(b, p as DeepPartial<typeof b>) : p;
  }
  return out as T;
}
