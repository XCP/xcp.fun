import React from "react";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { isXCP420 } from "@/lib/xcp420";
import type { Fairminter } from "@/lib/types";

type FairminterCardProps = {
  fairminter: Fairminter;
  currentBlock: number;
  prices: {
    xcpBtc: number;
    btcUsd: number;
    btcFeeRate: number;
  };
  tab?: string;
  homepageStatus?: "lit" | "burned" | "rolled" | "ashed";
};

export default function FairminterCard({ fairminter: f, currentBlock, prices, tab = "open", homepageStatus }: FairminterCardProps) {
  const progress = f.hard_cap ? (f.earned_quantity / f.hard_cap) * 100 : 0;

  // Helper function to determine payment type
  const getPaymentType = () => {
    if (f.price === 0 && f.max_mint_per_tx > 0) return "mint-btc";
    if (f.burn_payment && f.price > 0) return "burn";
    return "mint";
  };
  const paymentType = getPaymentType();

  // Check XCP-420 compliance
  const xcp420Compliance = isXCP420(f);

  // Calculate time display
  let timeDisplay = '';
  if (f.status === 'open' && f.end_block > currentBlock) {
    const blocksToGo = f.end_block - currentBlock;
    const minutesToGo = blocksToGo * 10;
    const hoursToGo = Math.floor(minutesToGo / 60);
    const daysToGo = Math.floor(hoursToGo / 24);

    timeDisplay = daysToGo > 0 ? `${daysToGo} days left` :
                  hoursToGo > 0 ? `${hoursToGo} hours left` :
                  `${Math.floor(minutesToGo)} mins left`;
  } else if (f.status === 'pending' && f.start_block > currentBlock) {
    const blocksUntilStart = f.start_block - currentBlock;
    const minutesUntilStart = blocksUntilStart * 10;
    const hoursUntilStart = Math.floor(minutesUntilStart / 60);
    const daysUntilStart = Math.floor(hoursUntilStart / 24);

    timeDisplay = daysUntilStart > 0 ? `Starts in ${daysUntilStart} days` :
                  hoursUntilStart > 0 ? `Starts in ${hoursUntilStart} hours` :
                  `Starts in ${Math.floor(minutesUntilStart)} mins`;
  } else if (f.status === 'closed') {
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
  const isEndingSoon = f.status === "open" && blocksRemaining !== null && blocksRemaining > 0 && blocksRemaining < 100;

  // Check if fully minted (100% progress)
  const isFullyMinted = progress >= 100 && tab === "closed";

  return (
    <div
      className={`block rounded-lg bg-white overflow-hidden relative ${
        xcp420Compliance ? "" : "border-2 border-gray-200"
      }`}
      style={
        xcp420Compliance ? {
          background: "white",
          padding: "2px",
          backgroundImage: "linear-gradient(45deg, #22c55e, #3b82f6, #a855f7, #ec4899, #22c55e)",
          backgroundSize: "300% 300%",
          animation: "holographic 3s ease infinite"
        } : {}
      }
    >
      <div className={`${xcp420Compliance ? "bg-white rounded-lg" : ""} flex flex-col`}>
        <div className="flex flex-col md:flex-row">
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
                  <h2 className="text-lg font-bold text-gray-900">
                    {f.asset} {homepageStatus
                      ? (homepageStatus === "ashed" ? "💀" :
                         homepageStatus === "burned" ? "🔥" :
                         homepageStatus === "rolled" ? "⌚" : "")
                      : (paymentType === "burn" && "🔥")}
                  </h2>
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
                  {formatNumber(parseFloat(f.earned_quantity_normalized || "0"))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Supply</div>
                <div className="text-sm font-semibold text-gray-900">
                  {f.hard_cap === 0 ? "∞" : formatNumber(parseFloat(f.hard_cap_normalized || "0"))}
                  {f.soft_cap > 0 && (
                    <span className="text-xs text-gray-500 ml-1 font-normal">
                      (soft: {formatNumber(parseFloat(f.soft_cap_normalized || "0"))})
                    </span>
                  )}
                </div>
              </div>
              <div>
                {parseFloat(f.premint_quantity_normalized || "0") > 0 && f.minted_asset_commission_int > 0 ? (
                  // Both premint and commission - show side by side
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-0.5">Premine</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatNumber(parseFloat(f.premint_quantity_normalized || "0"))}
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
                ) : parseFloat(f.premint_quantity_normalized || "0") > 0 ? (
                  // Only premint
                  <>
                    <div className="text-xs text-gray-500 mb-0.5">Premine</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatNumber(parseFloat(f.premint_quantity_normalized || "0"))}
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
                ) : xcp420Compliance ? (
                  // XCP-420 compliance - show max per address limit
                  <>
                    <div className="text-xs text-gray-500 mb-0.5">Max Per Address</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {f.max_mint_per_address && f.max_mint_per_address > 0
                        ? formatNumber(f.max_mint_per_address / 100000000)
                        : "∞"}
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
                    : formatNumber(parseFloat(f.quantity_by_price_normalized || "1"))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Unit Price</div>
                <div className="text-sm font-semibold text-gray-900">
                  {(() => {
                    if (paymentType === "mint-btc") {
                      // BTC fee divided by how many units you get per mint
                      const btcFeePerMint = (prices.btcFeeRate * 250) / 100_000_000;
                      const unitsPerMint = parseFloat(f.max_mint_per_tx_normalized || "0");
                      const pricePerUnit = (btcFeePerMint * prices.btcUsd) / unitsPerMint;
                      return `~${formatPrice(pricePerUnit)}`;
                    } else {
                      // price_normalized is already XCP per unit/token
                      const xcpPerUnit = parseFloat(f.price_normalized || "0");
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
                    formatNumber(parseFloat(f.max_mint_per_address_normalized || "0"))
                  ) : null}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center px-4 border-l border-gray-200">
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
          <div className="md:hidden px-4 pb-4">
            <button
              className="w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
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
    </div>
  );
}