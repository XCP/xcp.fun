// app/page.tsx
import { fetchFairminters } from "@/lib/api";
import { getCurrentBlockHeight } from "@/lib/blockHeight";
import { getPrices } from "@/lib/prices";
import SpecFairminterGrid from "@/components/SpecFairminterGrid";

export default async function Home() {
  const [openData, pendingData, closedData, currentBlock, prices] = await Promise.all([
    fetchFairminters("open"),
    fetchFairminters("pending"),
    fetchFairminters("closed"),
    getCurrentBlockHeight(),
    getPrices()
  ]);

  // No spec filter for now - showing all fairminters
  // To enable XCP-420 filter, uncomment the condition below:
  const isSpecFairminter = (f: any) => {
    return true; // Remove this line and uncomment below to enable filter
    /*
    return (
      f.hard_cap === 10000000 &&
      f.soft_cap === 4200000 &&
      parseFloat(f.price_normalized) === 0.1 &&
      parseFloat(f.quantity_by_price_normalized) === 1000 &&
      f.max_mint_per_address === 35000 && // 35 mints * 1000 units per mint
      f.end_block - f.start_block === 1000 && // 1000 blocks duration
      f.lock_quantity === true &&
      f.burn_payment === true
    );
    */
  };

  const litFairminters = openData.filter(isSpecFairminter);
  const rolledUpFairminters = pendingData.filter(isSpecFairminter);

  // For burned, we need to check if soft cap was reached (or no soft cap)
  const burnedFairminters = closedData.filter(f =>
    isSpecFairminter(f) && (f.soft_cap === 0 || f.earned_quantity >= f.soft_cap)
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-12 mt-4 md:mt-8">
        <h1 className="text-6xl font-bold mb-4">
          <a href="https://xcp.fun">XCP.FUN</a>
        </h1>
        <a href="/board" className="text-sm text-gray-500 hover:text-gray-700">
          View all fairminters →
        </a>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">XCP-420 Standard</h3>
          <a
            href="/create?preset=xcp420"
            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs md:text-sm"
          >
            🎲 Roll Your Own
          </a>
        </div>
        <p className="text-gray-600 text-sm">
          Fairminters that follow the XCP-420 standard are featured on this page. The standard requires:
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

      <div className="bg-amber-50 rounded-lg p-4 mb-8 border border-amber-200">
        <p className="text-sm text-amber-900">
          💡 If an XCP-420 mint doesn't reach its 4.2M soft-cap, the Counterparty protocol <span className="font-bold">automatically refunds all XCP to backers</span>. If it succeeds, the XCP committed is burned.
        </p>
      </div>

      {litFairminters.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🔥 Lit <span className="text-gray-500 font-normal text-lg">(Minting now)</span></h2>
          <SpecFairminterGrid
            fairminters={litFairminters}
            currentBlock={currentBlock}
            prices={prices}
            status="lit"
          />
        </section>
      )}

      {rolledUpFairminters.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🌿 Rolled Up <span className="text-gray-500 font-normal text-lg">(Upcoming — ready but not lit)</span></h2>
          <SpecFairminterGrid
            fairminters={rolledUpFairminters}
            currentBlock={currentBlock}
            prices={prices}
            status="rolled"
          />
        </section>
      )}

      {burnedFairminters.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">💀 Burned <span className="text-gray-500 font-normal text-lg">(Successful — XCP destroyed, token survives)</span></h2>
          <SpecFairminterGrid
            fairminters={burnedFairminters}
            currentBlock={currentBlock}
            prices={prices}
            status="burned"
          />
        </section>
      )}
    </main>
  );
}
