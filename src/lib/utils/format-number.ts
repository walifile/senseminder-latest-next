export const fCurrency = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined || value === "") {
    return "$0.00";
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return "$0.00";
  }

  return `$${num.toFixed(2)}`;
};
