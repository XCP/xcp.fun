# 🍆 XCP-69 Standard (Draft)

XCP-69 is a draft companion to the XCP-420 Standard.

Where XCP-420 is optimized for safe, low-risk meme launches (achievable thresholds, smaller stakes, and guaranteed burns), XCP-69 is designed for larger, higher-commitment launches. It raises the bar for participation, increases XCP at risk, and introduces a post-mint liquidity pool mechanic.

## 🎯 Goals

- **Scale Up:** Require more community buy-in to reach soft cap
- **Raise Stakes:** 6.9k–10k XCP per mint creates real skin in the game
- **Add Safety:** Instead of burning immediately, pooled XCP creates a floor on the DEX
- **Phased Lifecycle:** Mint → 2-month floor → supply burn + dividend

## 🔑 Key Parameters

- **Supply:** 100M tokens
- **Soft Cap:** 69M tokens
- **Hard Cap:** 100M tokens
- **Total XCP:** ~6,900–10,000 XCP (at 0.1 XCP per 1,000 tokens)
- **Duration:** 1,000 blocks (~7 days)
- **Per-Address Limit:** TBD (to balance whales vs distribution)
- **Divisible:** true (8 decimal places)
- **Premine:** 0

## 🔄 Lifecycle

### 1. Mint Phase (Critical Mass)
- If <69M minted → all XCP refunded (fail)
- If ≥69M minted → success, all XCP pooled (not burned)

### 2. Pool Phase (Floor Liquidity)
- Platform uses pooled XCP to place a DEX order for the full supply at mint price, expiring in 2 months
- **Variant:** multiple staggered orders above/below mint for a crude price curve
- Holders now have a 2-month exit path at break-even (less Bitcoin tx fees)

### 3. Resolution Phase (Burn + Dividend)
When orders expire:
- If order unfilled → platform holds both XCP + TOKEN
- TOKEN acquired is burned to reduce supply
- Remaining XCP is issued back as a dividend to holders, minus a small platform fee

## ⚡ Why It's Valuable

- **Critical Mass Check:** High soft cap ensures broad community participation
- **Floor Guarantee:** 2-month DEX order creates a temporary safety net at mint price
- **Post-Mint Alignment:** Supply burn + XCP dividend strengthens surviving tokens
- **Bigger Energy:** Designed for serious meme-economy launches, not just low-risk experiments

## 🚧 Notes

- **Trustless Limitation:** Current Counterparty protocol can only burn XCP, not pool it
- **Platform Role:** Requires a service operator to hold pooled XCP, manage DEX orders, and handle burns/dividends
- **Future Path:** Protocol-level support could one day pool XCP directly into an AMM (true trustless liquidity)

## 💡 In Short

**XCP-420** = safe, fun, burn-based mints
**XCP-69** = bigger stakes, pooled liquidity, and a phased path: mint → floor → burn/dividend