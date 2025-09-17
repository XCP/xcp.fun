"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNumber, formatPrice } from "@/lib/formatters";

type Fairminter = {
  tx_hash: string;
  source: string;
  asset: string;
  price: number;
  max_mint_per_tx: number;
  max_mint_per_address: number;
  burn_payment: boolean;
  earned_quantity: number;
  hard_cap: number;
  soft_cap: number;
  block_time: number;
  start_block: number;
  end_block: number;
  block_index: number;
  divisible: boolean;
  lock_quantity: boolean;
  minted_asset_commission_int: number;
  description?: string;
  price_normalized?: string;
  hard_cap_normalized?: string;
  soft_cap_normalized?: string;
  earned_quantity_normalized?: string;
  max_mint_per_tx_normalized?: string;
  max_mint_per_address_normalized?: string;
};

type FairminterGridProps = {
  fairminters: Fairminter[];
  currentBlock: number;
  tab: string;
  prices: {
    xcpBtc: number;
    btcUsd: number;
    btcFeeRate: number;
  };
  initialFilter?: string;
  initialSort?: string;
};

export default function FairminterGrid({ fairminters, currentBlock, tab, prices, initialFilter, initialSort }: FairminterGridProps) {
  // Set default sort based on tab
  const getDefaultSort = () => {
    if (tab === "open") return "progress-high";
    if (tab === "pending") return "starting-soon";
    if (tab === "closed") return "oldest";
    return "newest";
  };

  // Track if sort has been manually changed from default
  const [customSort, setCustomSort] = useState<string | null>(initialSort || null);
  const [filterType, setFilterType] = useState<"all" | "xcp-burn" | "xcp-mint" | "btc-mint">(
    (initialFilter as any) || "all"
  );
  const router = useRouter();

  // Use custom sort if set, otherwise use default for current tab
  const sortBy = customSort || getDefaultSort();

  // Handle tab change - clear custom sort
  const handleTabChange = (newTab: string) => {
    setCustomSort(null); // Clear custom sort when changing tabs
    router.push(`/board?tab=${newTab}`);
  };

  // Helper function to determine payment type
  const getPaymentType = (fm: Fairminter) => {
    if (fm.price === 0 && fm.max_mint_per_tx > 0) return "mint-btc";
    if (fm.burn_payment && fm.price > 0) return "burn";
    if (!fm.burn_payment && fm.price > 0) return "mint-xcp";
    return "mint-xcp";
  };

  // Filter the data based on type selection
  const filteredData = fairminters.filter(fm => {
    // Filter out assets starting with "A"
    if (fm.asset && fm.asset.startsWith("A")) return false;

    if (filterType === "all") return true;
    const paymentType = getPaymentType(fm);
    if (filterType === "xcp-burn") return paymentType === "burn";
    if (filterType === "xcp-mint") return paymentType === "mint-xcp";
    if (filterType === "btc-mint") return paymentType === "mint-btc";
    return true;
  });

  // Sort the data based on selection
  const sortedData = [...filteredData].sort((a, b) => {
    const progressA = a.hard_cap ? (a.earned_quantity / a.hard_cap) * 100 : 0;
    const progressB = b.hard_cap ? (b.earned_quantity / b.hard_cap) * 100 : 0;

    switch (sortBy) {
      case "newest":
        return b.block_time - a.block_time;
      case "oldest":
        return a.block_time - b.block_time;
      case "progress-high":
        return progressB - progressA;
      case "progress-low":
        return progressA - progressB;
      case "ending-soon":
        // Calculate blocks remaining for both
        const blocksRemainingA = a.end_block > 0 ? a.end_block - currentBlock : Infinity;
        const blocksRemainingB = b.end_block > 0 ? b.end_block - currentBlock : Infinity;

        // Put items with no end block (Infinity) at the end
        if (blocksRemainingA === Infinity && blocksRemainingB === Infinity) return 0;
        if (blocksRemainingA === Infinity) return 1;
        if (blocksRemainingB === Infinity) return -1;

        // Sort by blocks remaining (ascending - soonest first)
        return blocksRemainingA - blocksRemainingB;
      case "starting-soon":
        // Calculate blocks until start for both
        const blocksUntilStartA = a.start_block > 0 ? a.start_block - currentBlock : 0;
        const blocksUntilStartB = b.start_block > 0 ? b.start_block - currentBlock : 0;

        // Items already started (0) come first, then sorted by blocks until start
        if (blocksUntilStartA === 0 && blocksUntilStartB === 0) return 0;
        if (blocksUntilStartA === 0) return -1;
        if (blocksUntilStartB === 0) return 1;

        // Sort by blocks until start (ascending - starting soonest first)
        return blocksUntilStartA - blocksUntilStartB;
      default:
        return 0;
    }
  });

  return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex gap-3">
          {[
            { key: "open", label: "🟢 Mintable" },
            { key: "pending", label: "⏳ Scheduled" },
            { key: "closed", label: "✅ Complete" }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                t.key === tab
                  ? "bg-black text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All</option>
            <option value="xcp-burn">XCP Burn</option>
            <option value="xcp-mint">XCP Mint</option>
            <option value="btc-mint">BTC Mint</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setCustomSort(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            {(tab === "open" || tab === "closed") && (
              <>
                <option value="progress-high">Most Progress</option>
                <option value="progress-low">Least Progress</option>
              </>
            )}
            {tab === "open" && (
              <option value="ending-soon">Ending Soon</option>
            )}
            {tab === "pending" && (
              <option value="starting-soon">Starting Soon</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {sortedData.map((f, index) => {
          const progress = f.hard_cap ? (f.earned_quantity / f.hard_cap) * 100 : 0;
          const paymentType = getPaymentType(f);

          // Check if this is XCP-420 compliant
          const isXCP420 = (
            f.hard_cap === 10000000 &&
            f.soft_cap === 4200000 &&
            parseFloat(f.price_normalized || "0") === 0.1 &&
            parseFloat(f.quantity_by_price_normalized || "0") === 1000 &&
            f.max_mint_per_address === 35000 &&
            f.end_block - f.start_block === 1000 &&
            f.lock_quantity === true &&
            f.burn_payment === true
          );

          // Calculate time display based on status
          let timeDisplay = '';

          if (tab === "open") {
            // Mintable - show remaining time
            if (f.end_block > 0 && f.end_block > currentBlock) {
              const blocksToGo = f.end_block - currentBlock;
              const minutesToGo = (blocksToGo * 10); // 10 min per block
              const hoursToGo = Math.floor(minutesToGo / 60);
              const daysToGo = Math.floor(hoursToGo / 24);

              timeDisplay = daysToGo > 0 ? `Ends in ${daysToGo} days` :
                           hoursToGo > 0 ? `Ends in ${hoursToGo} hours` :
                           `Ends in ${Math.floor(minutesToGo)} mins`;
            } else {
              timeDisplay = '';
            }
          } else if (tab === "pending") {
            // Scheduled - show when it starts
            if (f.start_block > 0 && f.start_block > currentBlock) {
              const blocksUntilStart = f.start_block - currentBlock;
              const minutesUntilStart = (blocksUntilStart * 10);
              const hoursUntilStart = Math.floor(minutesUntilStart / 60);
              const daysUntilStart = Math.floor(hoursUntilStart / 24);

              timeDisplay = daysUntilStart > 0 ? `Starts in ${daysUntilStart} days` :
                           hoursUntilStart > 0 ? `Starts in ${hoursUntilStart} hours` :
                           `Starts in ${Math.floor(minutesUntilStart)} mins`;
            } else {
              timeDisplay = 'Starting soon';
            }
          } else {
            // Complete - show when it ended
            const now = Math.floor(Date.now() / 1000);
            const secondsAgo = now - f.block_time;
            const minutesAgo = Math.floor(secondsAgo / 60);
            const hoursAgo = Math.floor(minutesAgo / 60);
            const daysAgo = Math.floor(hoursAgo / 24);

            timeDisplay = daysAgo > 0 ? `Ended ${daysAgo} days ago` :
                         hoursAgo > 0 ? `Ended ${hoursAgo} hours ago` :
                         minutesAgo > 0 ? `Ended ${minutesAgo} mins ago` :
                         'Just ended';
          }

          // Calculate if ending soon
          const blocksRemaining = f.end_block > 0 ? f.end_block - currentBlock : null;
          const isEndingSoon = blocksRemaining !== null && blocksRemaining > 0 && blocksRemaining < 100;

          // Check if fully minted (100% progress)
          const isFullyMinted = progress >= 100 && tab === "closed";

          return (
            <Link
              key={f.tx_hash}
              href={`/mint/${f.tx_hash}`}
              className={`block rounded-lg hover:shadow-lg transition-shadow bg-white overflow-hidden relative ${
                isXCP420 ? "" : "border-2 border-gray-200"
              }`}
              style={
                isXCP420 ? {
                  background: "white",
                  padding: "2px",
                  backgroundImage: "linear-gradient(45deg, #22c55e, #3b82f6, #a855f7, #ec4899, #22c55e)",
                  backgroundSize: "300% 300%",
                  animation: "holographic 3s ease infinite"
                } : {}
              }
            >
              <div className={`${isXCP420 ? "bg-white rounded-lg" : ""} flex flex-col md:flex-row`}>
                <div className="flex gap-4 flex-grow md:w-1/3 p-4">
                  <div className="flex-shrink-0">
                    <img
                      src={`https://app.xcp.io/img/full/${f.asset}`}
                      alt={f.asset}
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">{f.asset}</h2>
                      </div>
                      <div className="flex gap-1">
                        {isEndingSoon && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            ⚡ {blocksRemaining} blocks
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        paymentType === "mint-btc"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-pink-50 text-pink-600"
                      }`}>
                        {paymentType === "mint-btc" ? "BTC" : "XCP"}
                      </span>
                      <span className="font-mono">{f.source.slice(0, 6)}</span>
                      {timeDisplay && <span className="ml-1">{timeDisplay}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            isFullyMinted ? "bg-gradient-to-r from-blue-500 to-green-500" :
                            paymentType === "burn" ? "bg-gradient-to-r from-orange-500 to-red-500" :
                            paymentType === "mint-btc" ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                            "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-200 md:w-2/3 bg-gray-50 rounded-b-lg md:rounded-bl-none md:rounded-r-lg">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3 flex-1 p-4">
                    {/* First row */}
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Minted</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatNumber(parseFloat(f.earned_quantity_normalized))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Supply</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {f.hard_cap === 0 ? "∞" : formatNumber(parseFloat(f.hard_cap_normalized))}
                        {f.soft_cap > 0 && (
                          <span className="text-xs text-gray-500 ml-1 font-normal">
                            (soft: {formatNumber(parseFloat(f.soft_cap_normalized))})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {parseFloat(f.premint_quantity_normalized) > 0 && f.minted_asset_commission_int > 0 ? (
                        // Both premint and commission - show side by side
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-0.5">Premine</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatNumber(parseFloat(f.premint_quantity_normalized))}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-0.5">Comm</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {(() => {
                                const commission = f.minted_asset_commission_int / 1000000;
                                return commission % 1 === 0 ? `${commission}%` : `${commission.toFixed(1)}%`;
                              })()}
                            </div>
                          </div>
                        </div>
                      ) : parseFloat(f.premint_quantity_normalized) > 0 ? (
                        // Only premint
                        <>
                          <div className="text-xs text-gray-500 mb-0.5">Premine</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(parseFloat(f.premint_quantity_normalized))}
                          </div>
                        </>
                      ) : f.minted_asset_commission_int > 0 ? (
                        // Only commission
                        <>
                          <div className="text-xs text-gray-500 mb-0.5">Commission</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {(() => {
                              const commission = f.minted_asset_commission_int / 1000000;
                              return commission % 1 === 0 ? `${commission}%` : `${commission.toFixed(1)}%`;
                            })()}
                          </div>
                        </>
                      ) : (
                        // Neither - empty div to maintain grid layout
                        <div></div>
                      )}
                    </div>

                    {/* Second row */}
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Per Mint</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {paymentType === "mint-btc"
                          ? formatNumber(parseFloat(f.max_mint_per_tx_normalized || "0"))
                          : (() => {
                              const price = parseFloat(f.price_normalized);
                              if (price === 0) return "0 XCP";
                              // Format to 8 decimals and remove trailing zeros
                              const formatted = price.toFixed(8).replace(/\.?0+$/, '');
                              return `${paymentType === "burn" ? "🔥 " : ""}${formatted} XCP`;
                            })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Unit Price</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {(() => {
                          if (paymentType === "mint-btc") {
                            // BTC fee divided by how many units you get per mint
                            const btcFeePerMint = (prices.btcFeeRate * 250) / 100_000_000;
                            const unitsPerMint = parseFloat(f.max_mint_per_tx_normalized);
                            const pricePerUnit = (btcFeePerMint * prices.btcUsd) / unitsPerMint;
                            return `~${formatPrice(pricePerUnit)}`;
                          } else {
                            // XCP price is already per unit (per lot)
                            const xcpPerUnit = parseFloat(f.price_normalized);
                            const pricePerUnit = xcpPerUnit * prices.xcpBtc * prices.btcUsd;
                            return `~${formatPrice(pricePerUnit)}`;
                          }
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">
                        {(() => {
                          if (f.lock_quantity || f.lock_description) return "Locked";
                          if (f.max_mint_per_address > 0) return "Max/Addr";
                          return "";
                        })()}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {f.lock_quantity || f.lock_description ? (
                          <div className="flex gap-1.5">
                            {f.lock_quantity && (
                              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                🔒 Yes
                              </span>
                            )}
                            {f.lock_description && (
                              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                🔒 Description
                              </span>
                            )}
                          </div>
                        ) : f.max_mint_per_address > 0 ? (
                          formatNumber(parseFloat(f.max_mint_per_address_normalized))
                        ) : null}
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
          <div className="col-span-2 text-center py-12 text-gray-500">
            <p className="text-lg">No fairminters found in this category.</p>
          </div>
        )}
      </div>
    </>
  );
}