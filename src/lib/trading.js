/**
 * Pure trading logic for the TokenExchange demo.
 *
 * Everything here is deliberately free of React so it can be unit tested and
 * reasoned about on its own. The UI layer (Context + pages) composes these.
 *
 * NOTE: This is a simulation. No real funds, orders, or chains are involved.
 */

/** Starting market data for the simulated exchange. */
export const INITIAL_TOKENS = [
  {
    id: 1,
    symbol: "BTC",
    name: "Bitcoin",
    price: 90000,
    marketCap: "850B",
    volume24h: "25B",
    change24h: 2.5,
    trades: 125432,
    priceData: [],
    balance: 0,
  },
  {
    id: 2,
    symbol: "ICP",
    name: "Internet Computer Protocol",
    price: 10,
    marketCap: "45B",
    volume24h: "5B",
    change24h: 5.8,
    trades: 45678,
    priceData: [],
    balance: 0,
  },
  {
    id: 3,
    symbol: "ETH",
    name: "Ethereum",
    price: 3000,
    marketCap: "320B",
    volume24h: "15B",
    change24h: -1.2,
    trades: 98765,
    priceData: [],
    balance: 0,
  },
];

/** Starting simulated cash balance, in USD. */
export const INITIAL_CASH = 100000;

/** Max fraction a single simulated tick can move a price. */
const TICK_VOLATILITY = 0.02;

/** How many price points to retain per token for sparklines. */
export const PRICE_HISTORY_LIMIT = 20;

/**
 * Produce the next simulated price for a token.
 * Drifts from the token's *current* price so the series actually walks
 * instead of jittering around a constant.
 */
export function nextPrice(currentPrice, random = Math.random) {
  const delta = (random() - 0.5) * currentPrice * TICK_VOLATILITY;
  // Clamp to a sane floor so a long walk can't go negative.
  return Math.max(currentPrice + delta, currentPrice * 0.5);
}

/** Append a price point to a token, capped at PRICE_HISTORY_LIMIT. */
export function appendPricePoint(token, { price, timestamp, volume }) {
  const priceData = [
    ...(token.priceData || []),
    { date: timestamp, price, volume },
  ].slice(-PRICE_HISTORY_LIMIT);

  const change24h =
    token.price > 0 ? ((price - token.price) / token.price) * 100 : 0;

  return { ...token, price, priceData, change24h };
}

/** Case-insensitive filter over symbol and name. */
export function filterTokens(tokens, term) {
  const q = (term || "").trim().toLowerCase();
  if (!q) return tokens;
  return tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  );
}

/**
 * Validate a trade before it is applied.
 *
 * @throws {Error} with a user-facing message when the trade is not allowed.
 * @returns {{amount: number, price: number, total: number}}
 */
export function validateTrade({ type, amount, price, token, wallet, cash }) {
  if (!wallet) throw new Error("Please connect your wallet first");
  if (!token) throw new Error("Please select a token");
  if (amount === "" || amount == null || price === "" || price == null) {
    throw new Error("Please enter both an amount and a price");
  }

  const numAmount = Number.parseFloat(amount);
  const numPrice = Number.parseFloat(price);

  if (Number.isNaN(numAmount) || Number.isNaN(numPrice)) {
    throw new Error("Amount and price must be valid numbers");
  }
  if (!Number.isFinite(numAmount) || !Number.isFinite(numPrice)) {
    throw new Error("Amount and price must be finite numbers");
  }
  if (numAmount <= 0 || numPrice <= 0) {
    throw new Error("Amount and price must be greater than zero");
  }

  const total = numAmount * numPrice;

  if (type === "sell") {
    const held = token.balance || 0;
    if (numAmount > held) {
      throw new Error(
        `Insufficient ${token.symbol} balance — you hold ${held.toFixed(4)}`
      );
    }
  } else if (type === "buy") {
    // Previously unchecked, which allowed unlimited buying power.
    if (total > cash) {
      throw new Error(
        `Insufficient cash — this costs $${total.toFixed(
          2
        )} but you have $${cash.toFixed(2)}`
      );
    }
  } else {
    throw new Error(`Unknown trade type: ${type}`);
  }

  return { amount: numAmount, price: numPrice, total };
}

/** Apply a trade to the token list, returning a new array. */
export function applyTradeToTokens(tokens, { symbol, type, amount }) {
  return tokens.map((token) => {
    if (token.symbol !== symbol) return token;
    const delta = type === "buy" ? amount : -amount;
    return { ...token, balance: (token.balance || 0) + delta };
  });
}

/** Apply a trade to the cash balance. */
export function applyTradeToCash(cash, { type, total }) {
  return type === "buy" ? cash - total : cash + total;
}

/** Build a deterministic-shaped mock wallet address. */
export function createMockWallet(random = Math.random) {
  const hex = Array.from({ length: 40 }, () =>
    Math.floor(random() * 16).toString(16)
  ).join("");
  return {
    address: `0x${hex}`,
    balances: { BTC: 0.5, ETH: 5.0, ICP: 100.0 },
  };
}

/** Seed a handful of plausible past trades so the history view isn't empty. */
export function generateMockTransactions(address, random = Math.random) {
  const symbols = ["BTC", "ETH", "ICP"];
  const now = Date.now();
  const DAY_MS = 86_400_000;

  return Array.from({ length: 5 }, (_, i) => ({
    id: `tx-seed-${i}`,
    type: random() > 0.5 ? "buy" : "sell",
    token: symbols[Math.floor(random() * symbols.length)],
    amount: Number.parseFloat((random() * 2).toFixed(4)),
    price: Number.parseFloat((random() * 50000).toFixed(2)),
    timestamp: now - i * DAY_MS,
    address,
  }));
}

/** Shorten an address for display: 0x1234…abcd */
export function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
