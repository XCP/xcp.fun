// components/MempoolStrip.tsx
import { fetchMempoolFairmints } from "@/lib/api";

export default async function MempoolStrip() {
  try {
    const items = await fetchMempoolFairmints(10);

    if (!items || items.length === 0) return null;

    const mints = items
      .filter((e: any) => e.params?.asset && e.tx_hash)
      .slice(0, 10);

    if (mints.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">🟢</span>
          <span className="font-semibold text-sm text-green-900">In the Mempool ({mints.length} txs)</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {mints.map((item: any, i: number) => (
            <a
              key={`${item.tx_hash}-${i}`}
              href={`/mint/${item.tx_hash}`}
              className="text-xs bg-white/70 px-2 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
            >
              {item.params.asset}
            </a>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch mempool fairmints:", error);
    return null;
  }
}