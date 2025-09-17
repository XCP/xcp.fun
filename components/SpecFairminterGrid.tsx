"use client";

import FairminterCard from "./FairminterCard";
import type { Fairminter } from "@/lib/types";

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
      {sortedData.map((f) => (
        <FairminterCard
          key={f.tx_hash}
          fairminter={f}
          currentBlock={currentBlock}
          prices={prices}
          tab={status === "lit" ? "open" : status === "rolled" ? "pending" : "closed"}
          homepageStatus={status}
        />
      ))}

      {sortedData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No fairminters in this category.</p>
        </div>
      )}
    </div>
  );
}