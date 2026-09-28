import { describe, it, expect } from "vitest";
import {
  INITIAL_CASH,
  INITIAL_TOKENS,
  PRICE_HISTORY_LIMIT,
  appendPricePoint,
  applyTradeToCash,
  applyTradeToTokens,
  createMockWallet,
  filterTokens,
  generateMockTransactions,
  nextPrice,
  truncateAddress,
  validateTrade,
} from "../trading";

const btc = () => ({ ...INITIAL_TOKENS[0], balance: 1 });
const wallet = { address: "0xabc", balances: {} };

describe("validateTrade", () => {
  it("rejects when no wallet is connected", () => {
    expect(() =>
      validateTrade({ type: "buy", amount: "1", price: "10", token: btc(), wallet: null, cash: 100 })
    ).toThrow(/connect your wallet/i);
  });

  it("rejects when no token is selected", () => {
    expect(() =>
      validateTrade({ type: "buy", amount: "1", price: "10", token: null, wallet, cash: 100 })
    ).toThrow(/select a token/i);
  });

  it("rejects missing amount or price", () => {
    expect(() =>
      validateTrade({ type: "buy", amount: "", price: "10", token: btc(), wallet, cash: 100 })
    ).toThrow(/amount and a price/i);
  });

  it("rejects non-numeric input", () => {
    expect(() =>
      validateTrade({ type: "buy", amount: "abc", price: "10", token: btc(), wallet, cash: 100 })
    ).toThrow(/valid numbers/i);
  });

  it("rejects zero and negative values", () => {
    expect(() =>
      validateTrade({ type: "buy", amount: "0", price: "10", token: btc(), wallet, cash: 100 })
    ).toThrow(/greater than zero/i);
    expect(() =>
      validateTrade({ type: "buy", amount: "-1", price: "10", token: btc(), wallet, cash: 100 })
    ).toThrow(/greater than zero/i);
  });

  it("rejects selling more than is held", () => {
    expect(() =>
      validateTrade({ type: "sell", amount: "5", price: "10", token: btc(), wallet, cash: 100 })
    ).toThrow(/insufficient btc/i);
  });

  it("allows selling exactly the held balance", () => {
    const result = validateTrade({
      type: "sell", amount: "1", price: "10", token: btc(), wallet, cash: 0,
    });
    expect(result).toEqual({ amount: 1, price: 10, total: 10 });
  });

  // Regression: buys used to be completely unchecked, giving infinite buying power.
  it("rejects a buy that exceeds available cash", () => {
    expect(() =>
      validateTrade({ type: "buy", amount: "2", price: "100", token: btc(), wallet, cash: 150 })
    ).toThrow(/insufficient cash/i);
  });

  it("allows a buy within available cash", () => {
    const result = validateTrade({
      type: "buy", amount: "1", price: "100", token: btc(), wallet, cash: 150,
    });
    expect(result).toEqual({ amount: 1, price: 100, total: 100 });
  });

  it("rejects an unknown trade type", () => {
    expect(() =>
      validateTrade({ type: "swap", amount: "1", price: "1", token: btc(), wallet, cash: 100 })
    ).toThrow(/unknown trade type/i);
  });
});

describe("applyTradeToTokens", () => {
  it("credits the balance on buy and leaves others untouched", () => {
    const out = applyTradeToTokens(INITIAL_TOKENS, { symbol: "BTC", type: "buy", amount: 2 });
    expect(out.find((t) => t.symbol === "BTC").balance).toBe(2);
    expect(out.find((t) => t.symbol === "ETH").balance).toBe(0);
  });

  it("debits the balance on sell", () => {
    const seeded = applyTradeToTokens(INITIAL_TOKENS, { symbol: "BTC", type: "buy", amount: 3 });
    const out = applyTradeToTokens(seeded, { symbol: "BTC", type: "sell", amount: 1 });
    expect(out.find((t) => t.symbol === "BTC").balance).toBe(2);
  });

  it("does not mutate the input array", () => {
    const before = JSON.stringify(INITIAL_TOKENS);
    applyTradeToTokens(INITIAL_TOKENS, { symbol: "BTC", type: "buy", amount: 1 });
    expect(JSON.stringify(INITIAL_TOKENS)).toBe(before);
  });
});

describe("applyTradeToCash", () => {
  it("debits cash on buy and credits on sell", () => {
    expect(applyTradeToCash(1000, { type: "buy", total: 250 })).toBe(750);
    expect(applyTradeToCash(1000, { type: "sell", total: 250 })).toBe(1250);
  });

  it("round-trips a buy then sell back to the starting cash", () => {
    const afterBuy = applyTradeToCash(INITIAL_CASH, { type: "buy", total: 500 });
    expect(applyTradeToCash(afterBuy, { type: "sell", total: 500 })).toBe(INITIAL_CASH);
  });
});

describe("filterTokens", () => {
  it("returns everything for an empty or whitespace term", () => {
    expect(filterTokens(INITIAL_TOKENS, "")).toHaveLength(3);
    expect(filterTokens(INITIAL_TOKENS, "   ")).toHaveLength(3);
  });

  it("matches on symbol and name, case-insensitively", () => {
    expect(filterTokens(INITIAL_TOKENS, "btc").map((t) => t.symbol)).toEqual(["BTC"]);
    expect(filterTokens(INITIAL_TOKENS, "ethereum").map((t) => t.symbol)).toEqual(["ETH"]);
    expect(filterTokens(INITIAL_TOKENS, "INTERNET").map((t) => t.symbol)).toEqual(["ICP"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTokens(INITIAL_TOKENS, "doge")).toEqual([]);
  });
});

describe("nextPrice", () => {
  it("stays within the volatility band", () => {
    expect(nextPrice(100, () => 1)).toBeCloseTo(101, 5);
    expect(nextPrice(100, () => 0)).toBeCloseTo(99, 5);
  });

  it("never returns a negative price", () => {
    let price = 100;
    for (let i = 0; i < 500; i++) price = nextPrice(price, () => 0);
    expect(price).toBeGreaterThan(0);
  });
});

describe("appendPricePoint", () => {
  it("caps stored history at PRICE_HISTORY_LIMIT", () => {
    let token = { ...INITIAL_TOKENS[0] };
    for (let i = 0; i < PRICE_HISTORY_LIMIT + 10; i++) {
      token = appendPricePoint(token, { price: 100 + i, timestamp: `t${i}`, volume: 1 });
    }
    expect(token.priceData).toHaveLength(PRICE_HISTORY_LIMIT);
  });

  it("computes percentage change against the previous price", () => {
    const token = appendPricePoint(
      { ...INITIAL_TOKENS[0], price: 100, priceData: [] },
      { price: 110, timestamp: "t", volume: 1 }
    );
    expect(token.change24h).toBeCloseTo(10, 5);
    expect(token.price).toBe(110);
  });
});

describe("wallet helpers", () => {
  it("creates a 0x-prefixed 40-character address", () => {
    const w = createMockWallet(() => 0.5);
    expect(w.address).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it("seeds five mock transactions tagged with the address", () => {
    const txs = generateMockTransactions("0xfeed", () => 0.5);
    expect(txs).toHaveLength(5);
    expect(txs.every((t) => t.address === "0xfeed")).toBe(true);
    expect(txs.every((t) => ["buy", "sell"].includes(t.type))).toBe(true);
  });

  it("truncates addresses for display and tolerates empty input", () => {
    expect(truncateAddress("0x1234567890abcdef")).toBe("0x1234...cdef");
    expect(truncateAddress("")).toBe("");
    expect(truncateAddress(null)).toBe("");
  });
});
