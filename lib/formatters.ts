// lib/formatters.ts

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  if (num < 1000) {
    // Ensure no scientific notation for small numbers
    return num.toFixed(0);
  }

  if (num < 10000) {
    // 1.0K - 9.9K
    return (num / 1000).toFixed(1) + 'K';
  }

  if (num < 1000000) {
    // 10K - 999K
    return Math.floor(num / 1000) + 'K';
  }

  if (num < 10000000) {
    // 1.0M - 9.9M
    return (num / 1000000).toFixed(1) + 'M';
  }

  if (num < 1000000000) {
    // 10M - 999M
    return Math.floor(num / 1000000) + 'M';
  }

  if (num < 10000000000) {
    // 1.0B - 9.9B
    return (num / 1000000000).toFixed(1) + 'B';
  }

  if (num < 1000000000000) {
    // 10B - 999B
    return Math.floor(num / 1000000000) + 'B';
  }

  if (num < 10000000000000) {
    // 1.0T - 9.9T (trillion)
    return (num / 1000000000000).toFixed(1) + 'T';
  }

  if (num < 1000000000000000) {
    // 10T - 999T
    return Math.floor(num / 1000000000000) + 'T';
  }

  if (num < 10000000000000000) {
    // 1.0Q - 9.9Q (quadrillion)
    return (num / 1000000000000000).toFixed(1) + 'Q';
  }

  // 10Q+
  return Math.floor(num / 1000000000000000) + 'Q';
}

export function formatPrice(price: number): string {
  if (price === 0) return '$0';

  // For very small numbers, find the first significant digit
  if (price < 0.0001) {
    // Convert to string and find first non-zero digit
    const priceStr = price.toFixed(20); // Use high precision
    const match = priceStr.match(/0\.(0*)([1-9])/);

    if (match) {
      const leadingZeros = match[1].length;
      const decimalPlaces = leadingZeros + 3; // Show 3 significant digits

      // Limit to max 12 decimal places to avoid being too long
      if (decimalPlaces > 12) {
        return '<$0.000000000001';
      }

      return `$${price.toFixed(decimalPlaces)}`;
    }

    // Fallback for edge cases
    return `$${price.toFixed(8)}`;
  }

  if (price < 0.01) {
    return `$${price.toFixed(4)}`;
  }

  if (price < 1) {
    return `$${price.toFixed(3)}`;
  }

  if (price < 10) {
    return `$${price.toFixed(2)}`;
  }

  if (price < 100) {
    return `$${price.toFixed(2)}`;
  }

  if (price < 1000) {
    return `$${price.toFixed(0)}`;
  }

  // For large numbers, use K/M/B notation
  if (price < 10000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }

  if (price < 1000000) {
    return `$${Math.floor(price / 1000)}K`;
  }

  if (price < 10000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }

  return `$${Math.floor(price / 1000000)}M`;
}