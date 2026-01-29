function convertValue(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}

export function parseFilters<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  defaults: T
): T {
  const filters = { ...defaults } as T;
  searchParams.forEach((value, key) => {
    filters[key as keyof T] = convertValue(value) as T[keyof T];
  });
  return filters;
}
