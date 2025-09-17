// components/MempoolStrip.tsx
import { fetchMempoolFairmints } from "@/lib/api";

export default async function MempoolStrip() {
  try {
    // Fetch extra to check if there are more
    const items = await fetchMempoolFairmints(30);

    if (!items || items.length === 0) return null;

    const allMints = items.filter((e): e is { params: { asset: string }, tx_hash: string } =>
      Boolean(e.params?.asset && e.tx_hash)
    );

    if (allMints.length === 0) return null;

    // Show first 25
    const displayMints = allMints.slice(0, 25);
    const remainingCount = Math.max(0, allMints.length - 25);

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">🟢</span>
          <span className="font-semibold text-sm text-green-900">
            In the Mempool ({allMints.length} {allMints.length === 1 ? 'tx' : 'txs'})
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {displayMints.map((item, i) => (
            <a
              key={`${item.tx_hash}-${i}`}
              href={`https://mempool.space/tx/${item.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-white/70 px-2 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
            >
              {item.params.asset} <span className="text-gray-400">({item.tx_hash.slice(0, 6)}...)</span>
            </a>
          ))}
          {remainingCount > 0 && (
            <span className="text-xs px-2 py-1 text-gray-500">
              and {remainingCount} more...
            </span>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch mempool fairmints:", error);
    return null;
  }
}