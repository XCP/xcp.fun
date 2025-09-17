"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FairminterCard from "./FairminterCard";
import type { Fairminter } from "@/lib/types";

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
  hideControls?: boolean;
};

export default function FairminterGrid({
  fairminters,
  currentBlock,
  tab,
  prices,
  initialFilter,
  initialSort,
  hideControls
}: FairminterGridProps) {
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
    (initialFilter as "all" | "xcp-burn" | "xcp-mint" | "btc-mint" | undefined) || "all"
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
    return "mint";
  };

  // Filter data
  const filteredData = fairminters.filter((fm) => {
    if (filterType === "all") return true;
    const paymentType = getPaymentType(fm);
    if (filterType === "xcp-burn") return paymentType === "burn";
    if (filterType === "xcp-mint") return paymentType === "mint";
    if (filterType === "btc-mint") return paymentType === "mint-btc";
    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.block_index - a.block_index;
      case "oldest":
        return a.block_index - b.block_index;
      case "progress-high":
        const progressA = a.hard_cap ? (a.earned_quantity / a.hard_cap) * 100 : 0;
        const progressB = b.hard_cap ? (b.earned_quantity / b.hard_cap) * 100 : 0;
        return progressB - progressA;
      case "progress-low":
        const progressLowA = a.hard_cap ? (a.earned_quantity / a.hard_cap) * 100 : 0;
        const progressLowB = b.hard_cap ? (b.earned_quantity / b.hard_cap) * 100 : 0;
        return progressLowA - progressLowB;
      case "ending-soon":
        if (a.end_block === 0 && b.end_block === 0) return 0;
        if (a.end_block === 0) return 1;
        if (b.end_block === 0) return -1;
        return a.end_block - b.end_block;
      case "starting-soon":
        // Handle scheduled/pending fairminters
        const blocksUntilStartA = a.start_block > 0 ? a.start_block - currentBlock : 0;
        const blocksUntilStartB = b.start_block > 0 ? b.start_block - currentBlock : 0;

        // If both have no start block, maintain original order
        if (blocksUntilStartA === 0 && blocksUntilStartB === 0) return 0;

        // Prioritize those without start blocks (already started)
        if (blocksUntilStartA === 0) return -1;
        if (blocksUntilStartB === 0) return 1;

        // Otherwise sort by blocks until start (sooner first)
        return blocksUntilStartA - blocksUntilStartB;
      default:
        return 0;
    }
  });

  return (
    <>
      {!hideControls && (
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
      )}

      <div className="grid gap-3">
        {sortedData.map((f) => (
          <FairminterCard
            key={f.tx_hash}
            fairminter={f}
            currentBlock={currentBlock}
            prices={prices}
            tab={tab}
          />
        ))}

        {sortedData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No fairminters match your filters.</p>
            {filterType !== "all" && (
              <button
                onClick={() => setFilterType("all")}
                className="mt-2 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}