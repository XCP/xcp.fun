// components/MempoolStrip.tsx
import { fetchMempoolFairmints } from "@/lib/api";

export default async function MempoolStrip() {
  try {
    // MOCK DATA FOR TESTING - Remove this block when done
    const mockItems = [
      { tx_hash: "9ed0d3be90be5be307f7a5f1e89461faed02f33e0f0c94e7f5a2721d83701252", params: { asset: "PEPECASH" } },
      { tx_hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456", params: { asset: "RAREPEPE" } },
      { tx_hash: "f4e5d6c7b8a9012345678901234567890abcdef1234567890abcdef12345678", params: { asset: "DANKPEPE" } },
      { tx_hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", params: { asset: "WOJAK" } },
      { tx_hash: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", params: { asset: "BOBO" } },
      { tx_hash: "567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234", params: { asset: "GIGACHAD" } }
    ];
    const items = mockItems;

    // ORIGINAL CODE - Uncomment when removing mock
    // const items = await fetchMempoolFairmints(10);
    // if (!items || items.length === 0) return null;

    const mints = items
      .filter((e: any) => e.params?.asset && e.tx_hash)
      .slice(0, 10);

    if (mints.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">🟢</span>
          <span className="font-semibold text-sm text-green-900">Recent Activity</span>
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