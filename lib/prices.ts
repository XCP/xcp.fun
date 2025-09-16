// lib/prices.ts

let cachedXcpBtcPrice: number | null = null;
let cachedBtcUsdPrice: number | null = null;
let cachedBtcFeeRate: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchXcpBtcPrice(): Promise<number | null> {
  try {
    const res = await fetch("https://api.dex-trade.com/v1/public/ticker?pair=XCPBTC");
    if (res.ok) {
      const data = await res.json();
      if (data.status && data.data?.last) {
        return parseFloat(data.data.last);
      }
    }
  } catch (e) {
    console.error("XCP/BTC price fetch error:", e);
  }
  return null;
}

async function fetchBtcUsdPrice(): Promise<number | null> {
  try {
    // Try multiple sources for BTC price
    const res = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=BTC");
    if (res.ok) {
      const data = await res.json();
      if (data.data?.rates?.USD) {
        return parseFloat(data.data.rates.USD);
      }
    }
  } catch (e) {
    console.error("BTC/USD price fetch error:", e);
  }

  // Fallback to another source
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    if (res.ok) {
      const data = await res.json();
      return parseFloat(data.price);
    }
  } catch (e) {
    console.error("Binance BTC price fetch error:", e);
  }

  return null;
}

async function fetchBtcFeeRate(): Promise<number | null> {
  try {
    const res = await fetch("https://mempool.space/api/v1/fees/recommended");
    if (res.ok) {
      const data = await res.json();
      // Return medium priority fee rate in sats/vByte
      return data.halfHourFee || data.hourFee || 10;
    }
  } catch (e) {
    console.error("BTC fee rate fetch error:", e);
  }
  return 10; // Default fallback
}

export async function getPrices() {
  const now = Date.now();

  // Check cache
  if (cachedXcpBtcPrice && cachedBtcUsdPrice && (now - cacheTimestamp) < CACHE_DURATION) {
    return {
      xcpBtc: cachedXcpBtcPrice,
      btcUsd: cachedBtcUsdPrice,
      btcFeeRate: cachedBtcFeeRate || 10
    };
  }

  // Fetch all prices in parallel
  const [xcpBtc, btcUsd, btcFeeRate] = await Promise.all([
    fetchXcpBtcPrice(),
    fetchBtcUsdPrice(),
    fetchBtcFeeRate()
  ]);

  // Update cache
  if (xcpBtc) cachedXcpBtcPrice = xcpBtc;
  if (btcUsd) cachedBtcUsdPrice = btcUsd;
  if (btcFeeRate) cachedBtcFeeRate = btcFeeRate;
  cacheTimestamp = now;

  return {
    xcpBtc: cachedXcpBtcPrice || 0.00004,  // Default fallback
    btcUsd: cachedBtcUsdPrice || 100000,   // Default fallback
    btcFeeRate: cachedBtcFeeRate || 10
  };
}

export function calculateXcpUsdPrice(xcpAmount: number, xcpBtcRate: number, btcUsdPrice: number): number {
  return xcpAmount * xcpBtcRate * btcUsdPrice;
}

export function calculateBtcTxFee(feeRate: number, txSize: number = 250): number {
  // Returns fee in satoshis
  return feeRate * txSize;
}