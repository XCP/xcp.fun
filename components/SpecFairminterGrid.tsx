"use client";

import Link from "next/link";
import { formatNumber, formatPrice } from "@/lib/formatters";

type Fairminter = {
  tx_hash: string;
  source: string;
  asset: string;
  price: number;
  hard_cap: number;
  soft_cap: number;
  burn_payment: boolean;
  earned_quantity: number;
  block_time: number;
  start_block: number;
  end_block: number;
  block_index: number;
  divisible: boolean;
  lock_quantity: boolean;
  minted_asset_commission_int: number;
  max_mint_per_address: number;
  description?: string | null;
  price_normalized?: string;
  hard_cap_normalized?: string;
  soft_cap_normalized?: string;
  earned_quantity_normalized?: string;
  quantity_by_price_normalized?: string;
};

type SpecFairminterGridProps = {
  fairminters: Fairminter[];
  currentBlock: number;
  prices: {
    xcpBtc: number;
    btcUsd: number;
    btcFeeRate: number;
  };
  status: "lit" | "burned" | "rolled" | "ashed";
};

export default function SpecFairminterGrid({ fairminters, currentBlock, prices, status }: SpecFairminterGridProps) {
  // Sort based on status
  const sortedData = [...fairminters].sort((a, b) => {
    if (status === "lit") {
      // Sort by progress for active
      const progressA = a.hard_cap === 0 ? 0 : (a.earned_quantity / a.hard_cap) * 100;
      const progressB = b.hard_cap === 0 ? 0 : (b.earned_quantity / b.hard_cap) * 100;
      return progressB - progressA;
    } else if (status === "rolled") {
      // Sort by starting soon
      const blocksUntilStartA = a.start_block > 0 ? a.start_block - currentBlock : 0;
      const blocksUntilStartB = b.start_block > 0 ? b.start_block - currentBlock : 0;
      if (blocksUntilStartA === 0 && blocksUntilStartB === 0) return 0;
      if (blocksUntilStartA === 0) return -1;
      if (blocksUntilStartB === 0) return 1;
      return blocksUntilStartA - blocksUntilStartB;
    } else {
      // Sort by oldest for completed
      return a.block_time - b.block_time;
    }
  });

  return (
    <div className="grid gap-3">
      {sortedData.map((f) => {
        const progress = f.hard_cap === 0 ? 0 : (f.earned_quantity / f.hard_cap) * 100;

        // Calculate time display
        let timeDisplay = '';
        if (status === "lit") {
          if (f.end_block > 0 && f.end_block > currentBlock) {
            const blocksToGo = f.end_block - currentBlock;
            const minutesToGo = blocksToGo * 10;
            const hoursToGo = Math.floor(minutesToGo / 60);
            const daysToGo = Math.floor(hoursToGo / 24);

            timeDisplay = daysToGo > 0 ? `${daysToGo} days left` :
                         hoursToGo > 0 ? `${hoursToGo} hours left` :
                         `${Math.floor(minutesToGo)} mins left`;
          }
        } else if (status === "rolled") {
          if (f.start_block > 0 && f.start_block > currentBlock) {
            const blocksUntilStart = f.start_block - currentBlock;
            const minutesUntilStart = blocksUntilStart * 10;
            const hoursUntilStart = Math.floor(minutesUntilStart / 60);
            const daysUntilStart = Math.floor(hoursUntilStart / 24);

            timeDisplay = daysUntilStart > 0 ? `Starts in ${daysUntilStart} days` :
                         hoursUntilStart > 0 ? `Starts in ${hoursUntilStart} hours` :
                         `Starts in ${Math.floor(minutesUntilStart)} mins`;
          }
        } else {
          const now = Math.floor(Date.now() / 1000);
          const secondsAgo = now - f.block_time;
          const minutesAgo = Math.floor(secondsAgo / 60);
          const hoursAgo = Math.floor(minutesAgo / 60);
          const daysAgo = Math.floor(hoursAgo / 24);

          timeDisplay = daysAgo > 0 ? `${daysAgo} days ago` :
                       hoursAgo > 0 ? `${hoursAgo} hours ago` :
                       minutesAgo > 0 ? `${minutesAgo} mins ago` :
                       'Just now';
        }

        // Calculate blocks remaining for "ending soon" badge
        const blocksRemaining = f.end_block > 0 ? f.end_block - currentBlock : null;
        const isEndingSoon = status === "lit" && blocksRemaining !== null && blocksRemaining > 0 && blocksRemaining < 100;

        return (
          <Link
            key={f.tx_hash}
            href={`/mint/${f.tx_hash}`}
            className="block border border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left section with image and basic info */}
              <div className="flex gap-4 p-4 md:w-1/2">
                <div className="flex-shrink-0">
                  <img
                    src={`https://app.xcp.io/img/full/${f.asset}`}
                    alt={f.asset}
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-900">{f.asset}</h2>
                    {isEndingSoon && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        ⚡ {blocksRemaining} blocks
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-mono">{f.source.slice(0, 6)}</span>
                    {timeDisplay && <span>{timeDisplay}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 relative">
                      {/* Soft cap marker if not reached */}
                      {f.soft_cap > 0 && f.earned_quantity < f.soft_cap && f.hard_cap > 0 && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                          style={{ left: `${(f.soft_cap / f.hard_cap) * 100}%` }}
                        />
                      )}
                      <div
                        className="h-2.5 rounded-full transition-all bg-gradient-to-r from-orange-500 to-red-500 relative"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right section with streamlined stats */}
              <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-200 md:w-1/2 bg-gray-50">
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Per Mint</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatNumber(parseFloat(f.quantity_by_price_normalized || "1"))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Unit Price</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {(() => {
                          const priceNorm = parseFloat(f.price_normalized || "0");
                          const qtyNorm = parseFloat(f.quantity_by_price_normalized || "1");
                          if (priceNorm === 0 || qtyNorm === 0) return "~$0";
                          const xcpPerUnit = priceNorm / qtyNorm;
                          const pricePerUnit = xcpPerUnit * prices.xcpBtc * prices.btcUsd;
                          return `~${formatPrice(pricePerUnit)}`;
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Max Per Address</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {f.max_mint_per_address === 0 ? "∞" : formatNumber(f.max_mint_per_address)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center px-4 border-l border-gray-200">
                  <button
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    style={{ backgroundColor: "#161624" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a1b2e"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#161624"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`https://horizon.market/explorer/tx/${f.tx_hash}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    ↗️ View TX
                  </button>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {sortedData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No fairminters in this category.</p>
        </div>
      )}
    </div>
  );
}