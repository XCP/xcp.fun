// Check why specific transactions aren't showing as XCP-420
const txHashes = [
  "8d23314c782e13590ea43f3e0ae329a77e6dc8495940a216860f5223b5143570",
  "79b412354d6936d2592a5753033aff87d7e61433b37ad1004037e305bbfd8b06",
  "f6c5b29df017698c9ff6e619089d1c3978a5b6943e19d4a1239c84c9716e88f0"
];

async function checkTransaction(txHash) {
  const url = `https://api.counterparty.io:4000/v2/fairminters/${txHash}?verbose=true`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const fm = data.result;

    console.log("\n========================================");
    console.log("Transaction:", txHash);
    console.log("Asset:", fm.asset);
    console.log("\nXCP-420 Requirements Check:");
    console.log("----------------------------");

    // Check each requirement - using raw integer values only
    const checks = {
      "Hard cap = 10,000,000": fm.hard_cap === 1000000000000000,  // 10M with 8 decimals
      "Soft cap = 4,200,000": fm.soft_cap === 420000000000000,   // 4.2M with 8 decimals
      "Price = 0.1 XCP": fm.price === 10000000,  // 0.1 XCP in satoshis
      "Quantity per price = 1000": fm.quantity_by_price === 100000000000,  // 1000 with 8 decimals
      "Max per address <= 35,000": fm.max_mint_per_address <= 3500000000000 && fm.max_mint_per_address > 0,
      "Max per TX = Max per address": fm.max_mint_per_tx === fm.max_mint_per_address,
      "Duration = 1000 blocks": fm.end_block - fm.start_block === 1000,
      "Lock quantity = true": fm.lock_quantity === true,
      "Burn payment = true": fm.burn_payment === true,
      "Divisible = true": fm.divisible === true,
      "No premine": (fm.premint_quantity || 0) === 0,
      "No commission": (fm.minted_asset_commission || 0) === 0
    };

    let allPass = true;
    for (const [check, passed] of Object.entries(checks)) {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
      if (!passed) allPass = false;
    }

    console.log("\nActual values:");
    console.log("--------------");
    console.log("Hard cap:", fm.hard_cap_normalized || (fm.hard_cap / 100000000), "(raw:", fm.hard_cap + ")");
    console.log("Soft cap:", fm.soft_cap_normalized || (fm.soft_cap / 100000000), "(raw:", fm.soft_cap + ")");
    console.log("Price:", fm.price / 100000000, "XCP (raw:", fm.price + ") - API normalized:", fm.price_normalized);
    console.log("Quantity by price:", fm.quantity_by_price_normalized || (fm.quantity_by_price / 100000000), "(raw:", fm.quantity_by_price + ")");
    console.log("Max per address:", fm.max_mint_per_address_normalized || (fm.max_mint_per_address / 100000000), "(raw:", fm.max_mint_per_address + ")");
    console.log("Max per TX:", fm.max_mint_per_tx_normalized || (fm.max_mint_per_tx / 100000000), "(raw:", fm.max_mint_per_tx + ")");
    console.log("Premint quantity:", fm.premint_quantity || 0);
    console.log("Commission:", fm.minted_asset_commission || 0, "(", (fm.minted_asset_commission_int || 0) / 1000000, "%)");
    console.log("Start block:", fm.start_block);
    console.log("End block:", fm.end_block);
    console.log("Duration:", fm.end_block - fm.start_block, "blocks");
    console.log("Lock quantity:", fm.lock_quantity);
    console.log("Burn payment:", fm.burn_payment);
    console.log("Divisible:", fm.divisible);

    console.log("\n" + (allPass ? "✅ This IS XCP-420 compliant!" : "❌ This is NOT XCP-420 compliant"));

  } catch (error) {
    console.error("Error fetching transaction:", error);
  }
}

async function checkAll() {
  for (const txHash of txHashes) {
    await checkTransaction(txHash);
  }
}

checkAll();