export const formatPrice = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const getApiErrorMessage = (
  error: { message?: string } | undefined,
  fallback = "Something went wrong. Please try again."
): string => error?.message || fallback;