/**
 * XCP-420 Standard Verification
 *
 * Checks if a fairminter complies with the XCP-420 standard requirements.
 * All values are compared as raw integers (not normalized).
 */

import type { Fairminter } from "./types";

/**
 * Verifies if a fairminter is XCP-420 compliant
 * @param fairminter The fairminter object to verify
 * @returns true if XCP-420 compliant, false otherwise
 */
export function isXCP420(fairminter: Fairminter): boolean {
  // Use minted_asset_commission_int which is what the API returns
  const commission = fairminter.minted_asset_commission_int ?? 0;

  return (
    fairminter.hard_cap === 1000000000000000 &&                    // 10M tokens with 8 decimals
    fairminter.soft_cap === 420000000000000 &&                     // 4.2M tokens with 8 decimals
    fairminter.price === 10000000 &&                               // 0.1 XCP in satoshis
    fairminter.quantity_by_price === 100000000000 &&               // 1000 tokens with 8 decimals
    fairminter.max_mint_per_address <= 3500000000000 &&            // Max 35k tokens
    fairminter.max_mint_per_address > 0 &&                         // Must have a per-address limit
    fairminter.max_mint_per_tx === fairminter.max_mint_per_address && // Allow all mints in one tx
    fairminter.end_block - fairminter.start_block === 1000 &&      // Exactly 1000 blocks duration
    fairminter.soft_cap_deadline_block === fairminter.end_block - 1 && // Deadline is end - 1
    fairminter.burn_payment === true &&                            // XCP is burned
    fairminter.lock_quantity === true &&                           // Supply locked
    fairminter.divisible === true &&                               // 8 decimal places
    fairminter.premint_quantity === 0 &&                           // No premine
    commission === 0                                               // No commission
  );
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