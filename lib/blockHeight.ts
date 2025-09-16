// lib/blockHeight.ts

let cachedBlockHeight: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

async function fetchFromCounterparty(): Promise<number | null> {
  try {
    const res = await fetch("https://api.counterparty.io:4000/v2/blocks?limit=1", {
      next: { revalidate: 300 } // 5 minutes
    });
    if (res.ok) {
      const data = await res.json();
      return data.result[0]?.block_index || null;
    }
  } catch (e) {
    console.error("Counterparty API error:", e);
  }
  return null;
}

async function fetchFromMempool(): Promise<number | null> {
  try {
    const res = await fetch("https://mempool.space/api/blocks/tip/height", {
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const height = await res.text();
      return parseInt(height, 10);
    }
  } catch (e) {
    console.error("Mempool API error:", e);
  }
  return null;
}

async function fetchFromBlockstream(): Promise<number | null> {
  try {
    const res = await fetch("https://blockstream.info/api/blocks/tip/height", {
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const height = await res.text();
      return parseInt(height, 10);
    }
  } catch (e) {
    console.error("Blockstream API error:", e);
  }
  return null;
}

export async function getCurrentBlockHeight(): Promise<number> {
  // Check cache first
  const now = Date.now();
  if (cachedBlockHeight && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedBlockHeight;
  }

  // Try all three sources in parallel
  const [counterparty, mempool, blockstream] = await Promise.allSettled([
    fetchFromCounterparty(),
    fetchFromMempool(),
    fetchFromBlockstream()
  ]);

  // Get all successful results
  const heights: number[] = [];

  if (counterparty.status === 'fulfilled' && counterparty.value !== null) {
    heights.push(counterparty.value);
  }
  if (mempool.status === 'fulfilled' && mempool.value !== null) {
    heights.push(mempool.value);
  }
  if (blockstream.status === 'fulfilled' && blockstream.value !== null) {
    heights.push(blockstream.value);
  }

  // Use the most common height or the highest if all different
  if (heights.length === 0) {
    // Fallback to a reasonable default if all APIs fail
    return cachedBlockHeight || 914955;
  }

  // Take the median value to avoid outliers
  heights.sort((a, b) => a - b);
  const medianIndex = Math.floor(heights.length / 2);
  const blockHeight = heights[medianIndex];

  // Update cache
  cachedBlockHeight = blockHeight;
  cacheTimestamp = now;

  return blockHeight;
}

// For client-side components that need reactive updates
export function useBlockHeight() {
  // This would be a React hook if we need client-side reactivity
  // For now, we'll just export the async function
  return getCurrentBlockHeight();
}