# TokenExchange

A demo cryptocurrency exchange front-end: browse a simulated market, connect a
mock wallet, place simulated buy/sell orders, and review trade history.

**Live:** https://iwd7k-bqaaa-aaaaj-az6fa-cai.icp0.io/ — served from an
[Internet Computer](https://internetcomputer.org/) asset canister.

> ⚠️ **This is a simulation.** There is no backend, no real wallet, no chain
> interaction, and no real money. Prices are generated locally by a timer and
> all balances are in-memory. It is a UI/portfolio demo, not a trading product.

---

## What it actually does

| Area | Behaviour |
|---|---|
| **Markets** | Lists BTC / ETH / ICP with prices that random-walk every 3s. Searchable from the navbar. Embeds a TradingView chart for the selected pair. |
| **Wallet** | "Connect wallet" simulates a 1s handshake and generates a mock `0x…` address, token balances, and seeded trade history. |
| **Trade** | Buy/sell against your simulated balances. Orders are validated for amount, price, holdings, and available cash. |
| **History** | Shows trades recorded during the session. |
| **Theme** | Light/dark/system toggle; the embedded chart follows it. |

State lives in a single React context (`src/Helper/Context.jsx`) and resets on
refresh — there is no persistence layer.

## Tech stack

- **Next.js 16** (App Router, static export via `output: "export"`)
- **React 19**, **Tailwind CSS 3**, **shadcn/ui** primitives on Radix
- **next-themes** for theming, **sonner** for toasts
- **Vitest** for unit tests
- **dfx** to deploy the exported site to an IC asset canister

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build + static export to `out/` |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Tests in watch mode |
| `npm run deploy:ic` | Build and deploy to the IC mainnet canister |

## Project structure

```
src/
├── app/                  # App Router entries (/, /markets, /trade, /wallet)
├── components/
│   ├── App/App.jsx       # Shell: provider + nav + main
│   ├── Navigation.jsx    # Header, search, wallet button, theme toggle
│   ├── MarketPage/       # Market list + TradingView chart
│   ├── TradePage/        # Order form and recent trades
│   ├── WalletPage/       # Balances and transaction history
│   ├── Theme/            # next-themes provider and toggle
│   └── ui/               # shadcn/ui primitives
├── Helper/Context.jsx    # Global state: tokens, wallet, cash, trades, price feed
└── lib/
    ├── trading.js        # Pure trading logic (validation, settlement, filtering)
    └── utils.js          # cn() class helper
```

Trading rules live in `src/lib/trading.js` as pure functions with no React
dependency, so they can be unit tested directly — see
`src/lib/__tests__/trading.test.js`.

## Deploying to the Internet Computer

The app builds to static files, which are uploaded to an asset canister.

```bash
npm run build          # produces out/
dfx deploy --network ic
```

`dfx.json` points the `token_exchange_assets` canister at `out/`, and
`canister_ids.json` records the deployed mainnet canister ID.

> `.dfx/` is generated (and holds local replica state and keys) — it is
> gitignored and must never be committed.

## Testing

```bash
npm test
```

The suite covers order validation (including insufficient funds and holdings),
balance settlement, market filtering, and the price simulation.

## Contributing

1. Fork and branch: `git checkout -b feature/my-change`
2. Make your change and keep `npm run lint` and `npm test` green
3. Open a pull request — CI runs lint, tests, build, and a dependency audit

## License

[MIT](./LICENSE)
