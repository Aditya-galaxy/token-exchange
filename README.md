# TokenExchange

**A platform for learning to trade.** Work through short lessons on market
mechanics, position sizing and risk, then complete each lesson's challenge by
placing real orders in a simulated market — with a coach reviewing your
decisions as you size them.

**Live:** [Internet Computer canister](https://iwd7k-bqaaa-aaaaj-az6fa-cai.icp0.io/)
· [Vercel mirror](https://token-exchange-lac.vercel.app) — the IC deployment is
served from an [Internet Computer](https://internetcomputer.org/) asset canister.

> ⚠️ **This is a simulation, and an educational one.** There is no backend, no
> real wallet, no chain interaction, and no real money. Prices are generated
> locally by a timer. Nothing here is financial advice — it teaches process
> (sizing, risk, reviewing your own results), not what to buy.

---

## What it actually does

| Area | Behaviour |
|---|---|
| **Learn** | Five lessons, each with a knowledge check and a challenge verified against your actual trading activity — never self-reported. Progress persists. |
| **Coach** | Reviews an order *before* you place it: flags oversized positions, adding to a position, no cash buffer, and losing streaks. Judges process, not outcome. |
| **Track record** | Equity, P&L, win rate, average win vs average loss, profit factor, and open positions with unrealized P&L. |
| **Markets** | Lists BTC / ETH / ICP with prices that random-walk every 3s. Searchable from the navbar. Embeds a TradingView chart for the selected pair. |
| **Wallet** | "Connect wallet" simulates a 1s handshake and generates a mock `0x…` address, token balances, and seeded trade history. |
| **Trade** | Buy/sell against your simulated balances. Orders are validated for amount, price, holdings, and available cash. |
| **History** | Shows trades recorded during the session. |
| **Theme** | Light/dark/system toggle; the embedded chart follows it. |

Your practice account starts flat — $100,000 in simulated cash, no granted
tokens and no seeded history — so cost basis, P&L and every lesson challenge
measure only trades you actually made. State lives in a single React context
(`src/Helper/Context.jsx`) and persists to `localStorage`, so progress survives
a refresh. "Reset account" on the Wallet page starts the course over.

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
├── app/                  # App Router entries (/, /markets, /trade, /wallet, /learn)
├── components/
│   ├── App/App.jsx       # Shell: provider + nav + main
│   ├── Navigation.jsx    # Header, search, wallet button, theme toggle
│   ├── LearnPage/        # Course overview, lesson view, quizzes
│   ├── MarketPage/       # Market list + TradingView chart
│   ├── TradePage/        # Order form and recent trades
│   ├── WalletPage/       # Balances and transaction history
│   ├── Theme/            # next-themes provider and toggle
│   └── ui/               # shadcn/ui primitives
├── Helper/Context.jsx    # Global state: tokens, wallet, cash, trades, price feed
└── lib/
    ├── trading.js        # Order validation, settlement, filtering
    ├── portfolio.js      # Cost basis, realized/unrealized P&L, performance stats
    ├── coach.js          # Decision review and account summaries
    ├── curriculum.js     # Lessons, quizzes, and verifiable challenges
    ├── storage.js        # Guarded localStorage persistence
    └── utils.js          # cn() class helper
```

All domain logic lives in `src/lib/` as pure functions with no React
dependency, so it can be unit tested directly. Lesson challenges are
`check(state)` functions evaluated against live account state — adding a lesson
means adding one entry to `LESSONS` in `curriculum.js`, nothing else.

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

66 tests covering order validation (including insufficient funds and holdings),
balance settlement, market filtering, the price simulation, cost-basis
accounting, performance statistics, coaching rules, and every lesson challenge.

## Contributing

1. Fork and branch: `git checkout -b feature/my-change`
2. Make your change and keep `npm run lint` and `npm test` green
3. Open a pull request — CI runs lint, tests, build, and a dependency audit

## License

[MIT](./LICENSE)
