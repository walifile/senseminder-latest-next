export const NONE_VALUES = ["", "none", "0"] as const;

export function isNoneValue(value: string): boolean {
  const trimmed = String(value).trim().toLowerCase();
  return (NONE_VALUES as readonly string[]).includes(trimmed);
}
