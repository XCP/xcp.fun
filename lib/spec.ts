// lib/spec.ts
import { Fairminter } from './types';

export const BURN_SOFT_XCP = 420n;
export const BURN_HARD_XCP = 1000n;
export const DURATION_BLOCKS = 1000;

export function matchesBurnSpec(f: Fairminter): boolean {
  // burn_payment must be true, price > 0, caps match meme, and duration ≈ 1,000 blocks
  const durationOk =
    f.end_block > 0 && f.start_block > 0 && (f.end_block - f.start_block) === DURATION_BLOCKS;

  // price is in XCP satoshis per lot; soft/hard caps are in "lots"
  // We enforce "caps in XCP" by checking price * soft_cap == 420 XCP (in satoshis),
  // and price * hard_cap == 1000 XCP.
  const priceSats = BigInt(f.price);
  const softLots = BigInt(f.soft_cap);
  const hardLots = BigInt(f.hard_cap);

  const target420 = BURN_SOFT_XCP * 100_000_000n;  // 1 XCP = 1e8 sats
  const target1000 = BURN_HARD_XCP * 100_000_000n;

  const softOk = priceSats > 0n && (priceSats * softLots) === target420;
  const hardOk = priceSats > 0n && (priceSats * hardLots) === target1000;

  return f.burn_payment === true && durationOk && softOk && hardOk;
}