// lib/api.ts
import { Fairminter, Fairmint, FMStatus } from './types';

const BASE = "https://api.counterparty.io:4000/v2";

export async function fetchFairminters(status: FMStatus = "all") {
  const url = `${BASE}/fairminters?status=${status}&limit=200&verbose=true`;
  const res = await fetch(url, {
    // ISR: revalidate every 30s for open, 120s for closed
    next: { revalidate: status === "open" ? 30 : status === "pending" ? 60 : 120 },
  });
  if (!res.ok) throw new Error(`fetchFairminters(${status}) ${res.status}`);
  const { result } = await res.json();
  return result as Fairminter[];
}

export async function fetchFairminter(txHash: string) {
  const url = `${BASE}/fairminters/${txHash}?verbose=true`;
  const res = await fetch(url, { next: { revalidate: 30 }});
  if (!res.ok) throw new Error(`fetchFairminter(${txHash}) ${res.status}`);
  const { result } = await res.json();
  return result as Fairminter;
}

export async function fetchFairmintsFor(txHash: string) {
  const url = `${BASE}/fairminters/${txHash}/fairmints?verbose=true&limit=100`;
  const res = await fetch(url, { next: { revalidate: 15 }});
  if (!res.ok) throw new Error(`fetchFairmintsFor(${txHash}) ${res.status}`);
  const data = await res.json();
  return {
    mints: data.result as Fairmint[],
    total: data.result_count || data.result.length
  };
}

// Optional: mempool strip
export async function fetchMempoolFairmints(limit = 20) {
  const url = `${BASE}/mempool/events/NEW_FAIRMINT`;
  const res = await fetch(url, { next: { revalidate: 10 }});
  if (!res.ok) throw new Error(`fetchMempoolFairmints ${res.status}`);
  const { result } = await res.json();
  return (result as Array<{ params?: { asset?: string }, tx_hash?: string }>).slice(0, limit);
}