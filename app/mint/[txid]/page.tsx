// app/mint/[txid]/page.tsx
import { fetchFairminter, fetchFairmintsFor } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ txid: string }>;
};

export default async function FairminterPage({ params }: PageProps) {
  const { txid } = await params;

  try {
    const fm = await fetchFairminter(txid);
    const mints = await fetchFairmintsFor(txid);

    const soldLots = fm.earned_quantity || 0;
    const softPct = fm.soft_cap ? (soldLots / fm.soft_cap) * 100 : 0;
    const hardPct = fm.hard_cap ? (soldLots / fm.hard_cap) * 100 : 0;

    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/board"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to board
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{fm.asset}</h1>
                <p className="text-gray-600 mt-2">
                  {fm.description || "No description provided"}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                fm.status === "open" ? "bg-green-100 text-green-700" :
                fm.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {fm.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Mint Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium">{fm.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{fm.end_block - fm.start_block} blocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Block Range</span>
                  <span className="font-medium">{fm.start_block} → {fm.end_block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Type</span>
                  <span className="font-medium">
                    {fm.burn_payment ? "🔥 Burn" : "💰 Mint"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Divisible</span>
                  <span className="font-medium">{fm.divisible ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Economics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price per lot</span>
                  <span className="font-medium">
                    {fm.price_normalized ?? (fm.price / 100_000_000).toFixed(8)} XCP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Soft cap</span>
                  <span className="font-medium">{fm.soft_cap} lots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hard cap</span>
                  <span className="font-medium">{fm.hard_cap} lots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Commission</span>
                  <span className="font-medium">
                    {(fm.minted_asset_commission_int / 1_000_000).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lots sold</span>
                  <span className="font-medium">{fm.earned_quantity}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {fm.earned_quantity} / {fm.hard_cap} lots minted
                </span>
                <span className="font-medium">{hardPct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(hardPct, 100)}%` }}
                />
                {softPct > 0 && softPct < 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-yellow-500"
                    style={{ left: `${softPct}%` }}
                    title={`Soft cap: ${softPct.toFixed(1)}%`}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Soft: {softPct.toFixed(1)}% ({fm.soft_cap} lots)</span>
                <span>Hard: {hardPct.toFixed(1)}% ({fm.hard_cap} lots)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Fairmints ({mints.length} total)
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mints.slice(0, 50).map((mint) => (
                <div
                  key={mint.tx_hash}
                  className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm text-gray-700 truncate">
                      {mint.source}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Block #{mint.block_index}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {mint.earn_quantity} lots
                    </div>
                    <div className="text-xs text-gray-500">
                      Paid: {mint.paid_quantity_normalized ?? (mint.paid_quantity / 100_000_000).toFixed(8)} XCP
                    </div>
                  </div>
                </div>
              ))}
              {mints.length === 0 && (
                <p className="text-center text-gray-500 py-8">No mints yet</p>
              )}
              {mints.length > 50 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Showing first 50 of {mints.length} mints
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
            <div className="flex gap-4 text-xs text-gray-500">
              <span>TX: {fm.tx_hash.slice(0, 16)}...</span>
              <span>Creator: {fm.source}</span>
              <span>Block: {fm.block_index}</span>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}