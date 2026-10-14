export function formatCents(value: number | null, currency: string | null) {
  if (value === null) return "Amount unclear";
  if (!currency) return `${(value / 100).toFixed(2)} (currency unclear)`;
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value / 100); }
  catch { return `${(value / 100).toFixed(2)} ${currency}`; }
}
export function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
