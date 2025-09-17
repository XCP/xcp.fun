// app/board/page.tsx
import { fetchFairminters } from "@/lib/api";
import { getCurrentBlockHeight } from "@/lib/blockHeight";
import { getPrices } from "@/lib/prices";
import MempoolStrip from "@/components/MempoolStrip";
import FairminterGrid from "@/components/FairminterGrid";

type PageProps = {
  searchParams: Promise<{ tab?: string; filter?: string; sort?: string }>;
};

export default async function Board({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = (params.tab ?? "open") as "open" | "pending" | "closed";
  const [data, currentBlock, prices] = await Promise.all([
    fetchFairminters(tab),
    getCurrentBlockHeight(),
    getPrices()
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold">
            XCP.FUN
          </h1>
          <div className="flex gap-6 text-sm text-gray-500">
            <div className="text-right">
              <div>BTC Price</div>
              <div className="font-mono font-bold">${Math.round(prices.btcUsd).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div>XCP Price</div>
              <div className="font-mono font-bold">${(prices.xcpBtc * prices.btcUsd).toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div>Block Height</div>
              <div className="font-mono font-bold">{currentBlock.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <MempoolStrip />

      <div className="mt-4 mb-6 text-xs text-gray-500">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-x-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{
                backgroundImage: "linear-gradient(45deg, #22c55e, #3b82f6, #a855f7, #ec4899)",
                backgroundSize: "300% 300%"
              }}></div>
              <span>Holographic border indicates XCP-420 standard</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <span>Indicates burn</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span>🔒</span>
            <span>Indicates supply locked cannot be changed</span>
          </div>
        </div>
      </div>

      <div>
        <FairminterGrid
          fairminters={data}
          currentBlock={currentBlock}
          tab={tab}
          prices={prices}
          initialFilter={params.filter}
          initialSort={params.sort}
        />
      </div>
    </main>
  );
}