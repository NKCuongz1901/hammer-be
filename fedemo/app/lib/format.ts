export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatLocation(
  city: string | null | undefined,
  country: string | null | undefined,
): string {
  const parts = [city, country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function formatText(value: string | null | undefined): string {
  return value && value.trim() ? value : "—";
}

export function formatList(values: string[] | null | undefined): string {
  return values && values.length ? values.join(", ") : "—";
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
