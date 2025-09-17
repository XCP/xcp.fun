/**
 * XCP-420 Standard Verification
 *
 * Checks if a fairminter complies with the XCP-420 standard requirements.
 * Returns compliance mode: "strict", "loose", or false.
 * All values are compared as raw integers (not normalized).
 */

import type { Fairminter } from "./types";

export type XCP420Compliance = "strict" | "loose" | false;

/**
 * Verifies if a fairminter is XCP-420 compliant
 * @param fairminter The fairminter object to verify
 * @returns "strict" if fully compliant, "loose" if core compliant but missing/invalid per-address limits, false if non-compliant
 */
export function isXCP420(fairminter: Fairminter): XCP420Compliance {
  // Use minted_asset_commission_int which is what the API returns
  const commission = fairminter.minted_asset_commission_int ?? 0;

  // Check soft_cap_deadline_block validity
  // Strict: must be exactly end_block - 1
  // Loose: must be within 100 blocks of end_block (but still less than end_block)
  const deadlineValid = fairminter.soft_cap_deadline_block < fairminter.end_block;
  const deadlineStrictValid = fairminter.soft_cap_deadline_block === fairminter.end_block - 1;
  const deadlineLooseValid = deadlineValid &&
    (fairminter.end_block - fairminter.soft_cap_deadline_block) <= 100;

  // Check core XCP-420 parameters (required for both strict and loose)
  // For loose mode, we accept flexible deadline within 100 blocks
  const coreCompliant = (
    fairminter.hard_cap === 1000000000000000 &&                    // 10M tokens with 8 decimals
    fairminter.soft_cap === 420000000000000 &&                     // 4.2M tokens with 8 decimals
    fairminter.price === 10000000 &&                               // 0.1 XCP in satoshis
    fairminter.quantity_by_price === 100000000000 &&               // 1000 tokens with 8 decimals
    fairminter.end_block - fairminter.start_block === 1000 &&      // Exactly 1000 blocks duration
    deadlineLooseValid &&                                          // Deadline within acceptable range
    fairminter.burn_payment === true &&                            // XCP is burned
    fairminter.lock_quantity === true &&                           // Supply locked
    fairminter.divisible === true &&                               // 8 decimal places
    fairminter.premint_quantity === 0 &&                           // No premine
    commission === 0                                               // No commission
  );

  if (!coreCompliant) {
    return false;
  }

  // Check strict requirements:
  // 1. Per-address/tx limits must be properly set
  // 2. Deadline must be exactly end_block - 1
  const strictCompliant = (
    fairminter.max_mint_per_address > 0 &&                         // Must have a per-address limit
    fairminter.max_mint_per_address <= 3500000000000 &&            // Max 35k tokens
    fairminter.max_mint_per_tx === fairminter.max_mint_per_address && // Allow all mints in one tx
    deadlineStrictValid                                            // Deadline exactly end - 1
  );

  if (strictCompliant) {
    return "strict";
  }

  // Core compliant but not strict = loose
  // This covers cases where:
  // - max_mint_per_address is 0 or missing
  // - max_mint_per_tx is 0 or missing
  // - They don't equal each other
  // - Either exceeds 35,000 tokens
  return "loose";
}

/**
 * Helper to check if any XCP-420 compliance (strict or loose)
 */
export function hasXCP420Compliance(compliance: XCP420Compliance): boolean {
  return compliance !== false;
}

// XCP-420 Constants for reference
export const XCP420_PARAMS = {
  HARD_CAP: 1000000000000000,           // 10,000,000 tokens
  SOFT_CAP: 420000000000000,            // 4,200,000 tokens
  PRICE: 10000000,                      // 0.1 XCP
  QUANTITY_BY_PRICE: 100000000000,      // 1,000 tokens per mint
  MAX_MINT_PER_ADDRESS: 3500000000000,  // 35,000 tokens max
  DURATION_BLOCKS: 1000,                // 1,000 blocks (~7 days)
} as const;