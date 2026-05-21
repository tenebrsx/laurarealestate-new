/**
 * Formats a numeric price into a premium styled currency string.
 *
 * USD: US$ 1,250,000
 * DOP: RD$ 1,250,000
 */
export function formatCurrency(amount: number, currency: string): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '';
  }

  const cleanCurrency = currency?.toUpperCase() === 'DOP' ? 'DOP' : 'USD';
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cleanCurrency,
    maximumFractionDigits: 0,
  }).format(amount);

  // Normalize all spaces (like non-breaking spaces \u00A0) to a standard space
  const normalized = formatted.replace(/\s+/g, ' ');

  if (cleanCurrency === 'DOP') {
    // Replace "DOP" with "RD$"
    return normalized.replace('DOP', 'RD$').trim();
  } else {
    // Replace "$" with "US$ "
    return normalized.replace('$', 'US$ ').replace(/\s+/g, ' ').trim();
  }
}
