/** Formats a number as USD currency, e.g. 1234.5 -> "$1,234.50" */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/** Formats a number with thousands separators, e.g. 12000 -> "12,000" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/** Capitalizes and de-hyphenates category slugs, e.g. "mens-shirts" -> "Mens Shirts" */
export function formatCategoryLabel(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
