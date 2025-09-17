// app/mint/[txid]/page.tsx
import { fetchFairminter, fetchFairmintsFor } from "@/lib/api";
import { getCurrentBlockHeight } from "@/lib/blockHeight";
import { getPrices } from "@/lib/prices";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ txid: string }>;
};

export default async function FairminterPage({ params }: PageProps) {
  const { txid } = await params;

  try {
    const [fm, mintsData, currentBlock, prices] = await Promise.all([
      fetchFairminter(txid),
      fetchFairmintsFor(txid),
      getCurrentBlockHeight(),
      getPrices()
    ]);

    const { mints, total: totalMints } = mintsData;

    const progress = fm.hard_cap === 0 ? 0 : (fm.earned_quantity / fm.hard_cap) * 100;

    // Determine status display
    let statusDisplay = '';
    let statusColor = '';
    if (fm.status === 'open') {
      statusDisplay = '🔥 Lit';
      statusColor = 'bg-green-100 text-green-700';
    } else if (fm.status === 'pending') {
      statusDisplay = '🌿 Rolled Up';
      statusColor = 'bg-yellow-100 text-yellow-700';
    } else {
      const softCapReached = fm.soft_cap === 0 || fm.earned_quantity >= fm.soft_cap;
      statusDisplay = softCapReached ? '💀 Burned' : '⚰️ Ashed';
      statusColor = softCapReached ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
    }

    // Calculate time display
    let timeDisplay = '';
    if (fm.status === 'open' && fm.end_block > currentBlock) {
      const blocksToGo = fm.end_block - currentBlock;
      const minutesToGo = blocksToGo * 10;
      const hoursToGo = Math.floor(minutesToGo / 60);
      const daysToGo = Math.floor(hoursToGo / 24);
      timeDisplay = daysToGo > 0 ? `${daysToGo} days left` :
                   hoursToGo > 0 ? `${hoursToGo} hours left` :
                   `${Math.floor(minutesToGo)} mins left`;
    } else if (fm.status === 'pending' && fm.start_block > currentBlock) {
      const blocksUntilStart = fm.start_block - currentBlock;
      const minutesUntilStart = blocksUntilStart * 10;
      const hoursUntilStart = Math.floor(minutesUntilStart / 60);
      const daysUntilStart = Math.floor(hoursUntilStart / 24);
      timeDisplay = daysUntilStart > 0 ? `Starts in ${daysUntilStart} days` :
                   hoursUntilStart > 0 ? `Starts in ${hoursUntilStart} hours` :
                   `Starts in ${Math.floor(minutesUntilStart)} mins`;
    } else if (fm.status === 'closed') {
      const now = Math.floor(Date.now() / 1000);
      const secondsAgo = now - fm.block_time;
      const minutesAgo = Math.floor(secondsAgo / 60);
      const hoursAgo = Math.floor(minutesAgo / 60);
      const daysAgo = Math.floor(hoursAgo / 24);
      timeDisplay = daysAgo > 0 ? `${daysAgo} days ago` :
                   hoursAgo > 0 ? `${hoursAgo} hours ago` :
                   minutesAgo > 0 ? `${minutesAgo} mins ago` :
                   'Just now';
    }

    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            XCP.FUN
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left section with image and basic info */}
            <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="mb-4">
                <img
                  src={`https://app.xcp.io/img/full/${fm.asset}`}
                  alt={fm.asset}
                  className="w-32 h-32 object-contain rounded-lg mx-auto"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{fm.asset}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                  {statusDisplay}
                </span>
                {timeDisplay && (
                  <p className="text-sm text-gray-500 mt-2">{timeDisplay}</p>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creator</span>
                  <span className="font-mono">{fm.source.slice(0, 6)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TX</span>
                  <span className="font-mono">{fm.tx_hash.slice(0, 6)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Block</span>
                  <span className="font-mono">{fm.block_index.toLocaleString()}</span>
                </div>
              </div>
              {fm.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{fm.description}</p>
                </div>
              )}
            </div>

            {/* Right section with details */}
            <div className="flex-1 p-6">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Progress</h3>
                  <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 relative">
                  {fm.soft_cap > 0 && fm.earned_quantity < fm.soft_cap && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                      style={{ left: `${(fm.soft_cap / fm.hard_cap) * 100}%` }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                        soft cap
                      </span>
                    </div>
                  )}
                  <div
                    className="h-3 rounded-full transition-all bg-gradient-to-r from-orange-500 to-red-500 relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatNumber(parseFloat(fm.earned_quantity_normalized || fm.earned_quantity.toString()))} minted</span>
                  <span>{fm.hard_cap === 0 ? '∞' : formatNumber(parseFloat(fm.hard_cap_normalized || fm.hard_cap.toString()))} cap</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Per Mint</div>
                  <div className="font-semibold">
                    {formatNumber(parseFloat(fm.quantity_by_price_normalized || fm.quantity_by_price?.toString() || "1"))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Unit Price</div>
                  <div className="font-semibold">
                    {(() => {
                      const priceNorm = parseFloat(fm.price_normalized || "0");
                      const qtyNorm = parseFloat(fm.quantity_by_price_normalized || "1");
                      if (priceNorm === 0 || qtyNorm === 0) return "~$0";
                      const xcpPerUnit = priceNorm / qtyNorm;
                      const pricePerUnit = xcpPerUnit * prices.xcpBtc * prices.btcUsd;
                      return `~${formatPrice(pricePerUnit)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Max Per Address</div>
                  <div className="font-semibold">
                    {fm.max_mint_per_address === 0 ? '∞' : formatNumber(fm.max_mint_per_address)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Mint Price</div>
                  <div className="font-semibold">
                    {fm.price === 0 ? "TX Fees" : `${formatNumber(parseFloat(fm.price_normalized || "0"))} XCP`}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Soft Cap</div>
                  <div className="font-semibold">
                    {fm.soft_cap === 0 ? 'None' : formatNumber(parseFloat(fm.soft_cap_normalized || fm.soft_cap.toString()))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Commission</div>
                  <div className="font-semibold">
                    {(() => {
                      const commission = fm.minted_asset_commission_int / 1000000;
                      return commission === 0 ? 'None' : (commission % 1 === 0 ? `${commission}%` : `${commission.toFixed(1)}%`);
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Payment</div>
                  <div className="font-semibold">
                    {fm.price === 0 ? '💰 Mint BTC' : fm.burn_payment ? '🔥 Burn XCP' : '💰 Mint XCP'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Supply Lock</div>
                  <div className="font-semibold">
                    {fm.lock_quantity ? '🔒 Locked' : '🔓 Unlocked'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="font-semibold">
                    {fm.end_block - fm.start_block} blocks
                  </div>
                </div>
              </div>


              {/* Recent mints section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">
                  Recent Mints {totalMints > 0 && <span className="text-sm font-normal text-gray-500">({totalMints.toLocaleString()} total)</span>}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mints.slice(0, 50).map((mint) => (
                    <div
                      key={mint.tx_hash}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-xs text-gray-700">
                          {mint.source.slice(0, 8)}...{mint.source.slice(-6)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Block {mint.block_index.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatNumber(parseFloat(mint.earn_quantity_normalized || mint.earn_quantity.toString()))} units
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(parseFloat(mint.paid_quantity_normalized || (mint.paid_quantity / 100_000_000).toString()))} XCP
                        </div>
                      </div>
                    </div>
                  ))}
                  {mints.length === 0 && (
                    <p className="text-center text-gray-500 py-6">No mints yet</p>
                  )}
                  {totalMints > 50 && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Showing first 50 of {totalMints.toLocaleString()} mints
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}