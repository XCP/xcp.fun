// app/board/page.tsx
import Link from "next/link";
import { fetchFairminters } from "@/lib/api";
import { FMStatus } from "@/lib/types";
import { getCurrentBlockHeight } from "@/lib/blockHeight";
import { getPrices } from "@/lib/prices";
import MempoolStrip from "@/components/MempoolStrip";
import FairminterGrid from "@/components/FairminterGrid";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
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
            <a href="https://xcp.fun">XCP.FUN</a>
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

      <div className="mt-6">
        <FairminterGrid fairminters={data} currentBlock={currentBlock} tab={tab} prices={prices} />
      </div>
    </main>
  );
}