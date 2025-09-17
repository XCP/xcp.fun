// app/page.tsx
import Link from "next/link";
import { fetchFairminters } from "@/lib/api";
import { getCurrentBlockHeight } from "@/lib/blockHeight";
import { getPrices } from "@/lib/prices";
import { Fairminter } from "@/lib/types";
import SpecFairminterGrid from "@/components/SpecFairminterGrid";
import SkeletonCards from "@/components/SkeletonCards";

export default async function Home() {
  const [openData, pendingData, closedData, currentBlock, prices] = await Promise.all([
    fetchFairminters("open"),
    fetchFairminters("pending"),
    fetchFairminters("closed"),
    getCurrentBlockHeight(),
    getPrices()
  ]);

  // Apply XCP-420 filter for homepage
  const isSpecFairminter = (f: Fairminter) => {
    // Check if it matches XCP-420 standard
    // With verbose=true, we always get normalized values
    return (
      f.hard_cap === 10000000 &&
      f.soft_cap === 4200000 &&
      parseFloat(f.price_normalized!) === 0.1 &&
      parseFloat(f.quantity_by_price_normalized!) === 1000 &&
      parseFloat(f.max_mint_per_address_normalized!) <= 35000 && // Max 35 mints (35,000 tokens) per address
      parseFloat(f.max_mint_per_address_normalized!) > 0 && // Must have a per-address limit
      f.end_block - f.start_block >= 900 && // 900-1100 blocks duration
      f.end_block - f.start_block <= 1100 &&
      f.lock_quantity === true &&
      f.burn_payment === true &&
      f.divisible === true // 8 decimal places
    );
  };

  const litFairminters = openData.filter(isSpecFairminter);
  const rolledUpFairminters = pendingData.filter(isSpecFairminter);

  // For burned, we need to check if soft cap was reached (or no soft cap)
  const burnedFairminters = closedData.filter(f =>
    isSpecFairminter(f) && (f.soft_cap === 0 || f.earned_quantity >= f.soft_cap)
  );

  // For ashed, XCP-420 fairminters that didn't reach soft cap
  const ashedFairminters = closedData.filter(f =>
    isSpecFairminter(f) && f.soft_cap > 0 && f.earned_quantity < f.soft_cap
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-12 mt-4 md:mt-8">
        <h1 className="text-6xl font-bold mb-4">
          <Link href="/">XCP.FUN</Link>
        </h1>
        <a href="/board" className="text-sm text-gray-500 hover:text-gray-700">
          🔬 View all fairminters →
        </a>
      </div>

      <div className="relative rounded-lg p-0.5" style={{
        backgroundImage: "linear-gradient(45deg, #22c55e, #3b82f6, #a855f7, #ec4899, #22c55e)",
        backgroundSize: "300% 300%",
        animation: "holographic 3s ease infinite"
      }}>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">XCP-420 Standard</h3>
            <a
              href="https://github.com/XCP/xcp.fun/blob/master/docs/xcp-420.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs md:text-sm"
            >
              🎲 Roll One
            </a>
          </div>
          <p className="text-gray-600 text-sm">
            Only fairminters that follow the XCP-420 standard are featured on this page. The standard:
            <span className="font-mono text-xs block mt-2">
              <span className="hidden md:inline">
                10M hard cap • 4.2M soft cap • 1000 earned per mint • 0.1 XCP burned to mint • Max 35 mints per address • 1000 blocks • Supply locked • No Premine
              </span>
              <span className="md:hidden">
                10M hard cap • 4.2M soft cap<br />
                1000 earned per mint • 0.1 XCP burned<br />
                Max 35 mints per address • 1000 blocks<br />
                Supply locked • No Premine
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 mt-4 mb-8 border border-amber-200">
        <p className="text-sm text-amber-900">
          💡 If an XCP-420 mint doesn&apos;t reach its 4.2M soft-cap, the Counterparty protocol <span className="font-bold">automatically refunds all XCP to backers</span>. If it succeeds, the XCP committed gets burned.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <img src="/parrot.gif" alt="Party Parrot" className="w-7 h-7" />
          Lit <span className="text-gray-500 font-normal text-lg">(Minting now)</span>
        </h2>
        {litFairminters.length > 0 ? (
          <>
            <SpecFairminterGrid
              fairminters={litFairminters.slice(0, 30)}
              currentBlock={currentBlock}
              prices={prices}
              status="lit"
            />
            {litFairminters.length > 30 && (
              <div className="text-right">
                <a href="/board?tab=open&sort=progress-high" className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700">
                  View All →
                </a>
              </div>
            )}
          </>
        ) : (
          <SkeletonCards count={3} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🌿 Rolled Up <span className="text-gray-500 font-normal text-lg">(Upcoming — ready but not lit)</span></h2>
        {rolledUpFairminters.length > 0 ? (
          <>
            <SpecFairminterGrid
              fairminters={rolledUpFairminters.slice(0, 10)}
              currentBlock={currentBlock}
              prices={prices}
              status="rolled"
            />
            {rolledUpFairminters.length > 10 && (
              <div className="text-right">
                <a href="/board?tab=pending&sort=starting-soon" className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700">
                  View All →
                </a>
              </div>
            )}
          </>
        ) : (
          <SkeletonCards count={2} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🔥 Burned <span className="text-gray-500 font-normal text-lg">(Successful — XCP destroyed, token survives)</span></h2>
        {burnedFairminters.length > 0 ? (
          <>
            <SpecFairminterGrid
              fairminters={burnedFairminters.sort((a, b) => b.block_time - a.block_time).slice(0, 10)}
              currentBlock={currentBlock}
              prices={prices}
              status="burned"
            />
            {burnedFairminters.length > 10 && (
              <div className="text-right">
                <a href="/board?tab=closed&sort=progress-high" className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700">
                  View All →
                </a>
              </div>
            )}
          </>
        ) : (
          <SkeletonCards count={2} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">💀 Ashed <span className="text-gray-500 font-normal text-lg">(Failed — XCP refunded, token destroyed)</span></h2>
        {ashedFairminters.length > 0 ? (
          <>
            <SpecFairminterGrid
              fairminters={ashedFairminters.sort((a, b) => b.block_time - a.block_time).slice(0, 10)}
              currentBlock={currentBlock}
              prices={prices}
              status="ashed"
            />
            {ashedFairminters.length > 10 && (
              <div className="text-right">
                <a href="/board?tab=closed&sort=progress-low" className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700">
                  View All →
                </a>
              </div>
            )}
          </>
        ) : (
          <SkeletonCards count={2} />
        )}
      </section>
    </main>
  );
}
