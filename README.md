# XCP.FUN - Burn-only Fairmints Tracker

A clean, DB-less Next.js app that filters and displays Counterparty burn-only fairmints matching specific criteria:
- ✅ Burn payment only
- ✅ 420 XCP soft cap
- ✅ 1000 XCP hard cap
- ✅ 1,000 blocks duration

## Features

- **Three tabs**: Minting (open), Scheduled (pending), Completed (closed)
- **Live mempool strip**: Shows currently minting assets
- **Detail pages**: View individual fairminter details and recent mints
- **No database required**: Uses ISR caching with the Counterparty v2 API
- **Responsive design**: Clean, modern UI with Tailwind CSS

## Tech Stack

- Next.js 15.5 (App Router)
- TypeScript
- Tailwind CSS
- Counterparty v2 API
- ISR (Incremental Static Regeneration) for caching

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment

No environment variables needed! The app connects directly to the public Counterparty API.

## API Endpoints Used

- `GET /v2/fairminters` - List fairminters by status
- `GET /v2/fairminters/{tx_hash}` - Get fairminter details
- `GET /v2/fairminters/{tx_hash}/fairmints` - Get mints for a fairminter
- `GET /v2/mempool/events/NEW_FAIRMINT` - Live mempool events

## Caching Strategy

- **Open mints**: 30 second revalidation
- **Pending mints**: 60 second revalidation
- **Completed mints**: 120 second revalidation
- **Mempool**: 10 second revalidation

## Spec Filter

The app only shows fairminters that match ALL of these criteria:
```typescript
- burn_payment === true
- (end_block - start_block) === 1000
- price * soft_cap === 420 XCP (in satoshis)
- price * hard_cap === 1000 XCP (in satoshis)
```

## Deploy on Vercel

The easiest way to deploy is via Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/xcp-fun)

Or use the CLI:
```bash
vercel
```

## License

MIT
