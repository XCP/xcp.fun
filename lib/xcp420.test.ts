/**
 * Test fixtures and validation for XCP-420 compliance
 */

import { isXCP420, hasXCP420Compliance } from "./xcp420";
import type { Fairminter } from "./types";

// Base fairminter with all required fields (non-compliant by default)
const baseFairminter: Fairminter = {
  tx_hash: "test_hash",
  tx_index: 1,
  block_index: 1000000,
  source: "test_address",
  asset: "TESTTOKEN",
  asset_parent: null,
  asset_longname: null,
  description: "Test token",
  price: 0,
  quantity_by_price: 0,
  hard_cap: 0,
  soft_cap: 0,
  start_block: 990000,
  end_block: 1000000,
  burn_payment: false,
  max_mint_per_tx: 0,
  max_mint_per_address: 0,
  premint_quantity: 0,
  minted_asset_commission_int: 0,
  soft_cap_deadline_block: 0,
  lock_description: false,
  lock_quantity: false,
  divisible: false,
  pre_minted: false,
  status: "open",
  mime_type: "",
  earned_quantity: 0,
  paid_quantity: 0,
  commission: 0,
  block_time: Date.now(),
};

// Test fixtures for STRICT compliance
export const strictCompliantFixtures: Fairminter[] = [
  {
    ...baseFairminter,
    asset: "STRICT420",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,  // Exactly 35,000 tokens
    max_mint_per_tx: 3500000000000,       // Must equal max_mint_per_address
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "STRICT420MIN",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 100000000,      // 1 token (minimum valid)
    max_mint_per_tx: 100000000,           // Must equal max_mint_per_address
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
];

// Test fixtures for LOOSE compliance
export const looseCompliantFixtures: Fairminter[] = [
  {
    ...baseFairminter,
    asset: "LOOSE420_NO_ADDR_LIMIT",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 0,              // Missing per-address limit
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "LOOSE420_NO_TX_LIMIT",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 0,                   // Missing per-tx limit
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "LOOSE420_MISMATCHED",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 1000000000000,       // Different from max_mint_per_address
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "LOOSE420_TOO_HIGH",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 5000000000000,  // 50,000 tokens (> 35,000)
    max_mint_per_tx: 5000000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "LOOSE420_NO_LIMITS",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 0,              // Both limits missing (API default)
    max_mint_per_tx: 0,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
];

// Test fixtures for NON-compliance
export const nonCompliantFixtures: Fairminter[] = [
  {
    ...baseFairminter,
    asset: "WRONG_HARD_CAP",
    hard_cap: 2000000000000000,           // Wrong: 20M instead of 10M
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "WRONG_SOFT_CAP",
    hard_cap: 1000000000000000,
    soft_cap: 500000000000000,            // Wrong: 5M instead of 4.2M
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "WRONG_PRICE",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 20000000,                      // Wrong: 0.2 XCP instead of 0.1
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "WRONG_QUANTITY",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 200000000000,      // Wrong: 2000 instead of 1000
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "WRONG_DURATION",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 992000,                    // Wrong: 2000 blocks instead of 1000
    soft_cap_deadline_block: 991999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "WRONG_DEADLINE",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 991000,      // Wrong: equal to end_block instead of end-1
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "NO_BURN",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: false,                  // Wrong: payment not burned
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "NOT_LOCKED",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: false,                 // Wrong: supply not locked
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "NOT_DIVISIBLE",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: false,                     // Wrong: not divisible
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "HAS_PREMINT",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 100000000000,       // Wrong: has premine
    minted_asset_commission_int: 0,
  },
  {
    ...baseFairminter,
    asset: "HAS_COMMISSION",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 3500000000000,
    max_mint_per_tx: 3500000000000,
    start_block: 990000,
    end_block: 991000,
    soft_cap_deadline_block: 990999,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 5000000, // Wrong: 5% commission
  },
];

// Test runner
export function runComplianceTests() {
  console.log("Testing XCP-420 Compliance...\n");

  console.log("STRICT COMPLIANCE TESTS:");
  strictCompliantFixtures.forEach(fm => {
    const result = isXCP420(fm);
    const pass = result === "strict";
    console.log(`  ${pass ? "✅" : "❌"} ${fm.asset}: ${result}`);
    if (!pass) {
      console.log(`     Expected: strict, Got: ${result}`);
    }
  });

  console.log("\nLOOSE COMPLIANCE TESTS:");
  looseCompliantFixtures.forEach(fm => {
    const result = isXCP420(fm);
    const pass = result === "loose";
    console.log(`  ${pass ? "✅" : "❌"} ${fm.asset}: ${result}`);
    if (!pass) {
      console.log(`     Expected: loose, Got: ${result}`);
    }
  });

  console.log("\nNON-COMPLIANCE TESTS:");
  nonCompliantFixtures.forEach(fm => {
    const result = isXCP420(fm);
    const pass = result === false;
    console.log(`  ${pass ? "✅" : "❌"} ${fm.asset}: ${result}`);
    if (!pass) {
      console.log(`     Expected: false, Got: ${result}`);
    }
  });

  console.log("\nHELPER FUNCTION TEST:");
  console.log(`  hasXCP420Compliance("strict"): ${hasXCP420Compliance("strict")} (expected: true)`);
  console.log(`  hasXCP420Compliance("loose"): ${hasXCP420Compliance("loose")} (expected: true)`);
  console.log(`  hasXCP420Compliance(false): ${hasXCP420Compliance(false)} (expected: false)`);
}

// Edge cases for real-world scenarios
export const edgeCaseFixtures = {
  // XCPNOTFUN from earlier - should be loose
  xcpnotfun: {
    ...baseFairminter,
    asset: "XCPNOTFUN",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 0,              // API returned 0
    max_mint_per_tx: 3500000000000,
    start_block: 915070,
    end_block: 916070,
    soft_cap_deadline_block: 916069,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
  // XCPFUN from earlier - should be false (wrong duration)
  xcpfun: {
    ...baseFairminter,
    asset: "XCPFUN",
    hard_cap: 1000000000000000,
    soft_cap: 420000000000000,
    price: 10000000,
    quantity_by_price: 100000000000,
    max_mint_per_address: 0,
    max_mint_per_tx: 3500000000000,
    start_block: 915060,
    end_block: 916061,                    // 1001 blocks, not 1000
    soft_cap_deadline_block: 916060,
    burn_payment: true,
    lock_quantity: true,
    divisible: true,
    premint_quantity: 0,
    minted_asset_commission_int: 0,
  },
};

// Export individual test results for use in other tests
export const testResults = {
  strict: strictCompliantFixtures.map(fm => ({
    asset: fm.asset,
    expected: "strict" as const,
    actual: isXCP420(fm),
  })),
  loose: looseCompliantFixtures.map(fm => ({
    asset: fm.asset,
    expected: "loose" as const,
    actual: isXCP420(fm),
  })),
  nonCompliant: nonCompliantFixtures.map(fm => ({
    asset: fm.asset,
    expected: false as const,
    actual: isXCP420(fm),
  })),
};