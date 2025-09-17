// lib/types.ts
export type Fairminter = {
  tx_hash: string;
  tx_index: number;
  block_index: number;
  source: string;
  asset: string;
  asset_parent: string | null;
  asset_longname: string | null;
  description: string | null;
  price: number;                    // in XCP satoshis
  quantity_by_price: number;        // lots per price
  hard_cap: number;
  soft_cap: number;
  start_block: number;
  end_block: number;
  burn_payment: boolean;
  max_mint_per_tx: number;
  max_mint_per_address: number;
  premint_quantity: number;
  minted_asset_commission_int: number;
  soft_cap_deadline_block: number;
  lock_description: boolean;
  lock_quantity: boolean;
  divisible: boolean;
  pre_minted: boolean;
  status: "open" | "pending" | "closed";
  mime_type: string;
  earned_quantity: number;          // total lots minted so far
  paid_quantity: number;            // total lots paid
  commission: number;
  block_time: number;
  // normalized fields exist if verbose=true:
  price_normalized?: string;
  hard_cap_normalized?: string;
  soft_cap_normalized?: string;
  quantity_by_price_normalized?: string;
  max_mint_per_tx_normalized?: string;
  max_mint_per_address_normalized?: string;
  premint_quantity_normalized?: string;
  earned_quantity_normalized?: string;
  commission_normalized?: string;
  paid_quantity_normalized?: string;
};

export type Fairmint = {
  tx_hash: string;
  tx_index: number;
  block_index: number;
  source: string;
  fairminter_tx_hash: string;
  asset: string;
  earn_quantity: number;
  paid_quantity: number;
  commission: number;
  status: "valid" | "invalid";
  block_time: number;
  asset_info?: {
    asset_longname: string | null;
    description: string;
    issuer: string;
    divisible: boolean;
    locked: boolean;
    owner?: string;
  };
  earn_quantity_normalized?: string;
  commission_normalized?: string;
  paid_quantity_normalized?: string;
};

export type FMStatus = "all" | "open" | "closed" | "pending";