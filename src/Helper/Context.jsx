"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  INITIAL_TOKENS,
  INITIAL_CASH,
  applyTradeToCash,
  applyTradeToTokens,
  createMockWallet,
  nextPrice,
  appendPricePoint,
} from "@/lib/trading";
import { equity as computeEquity, performanceStats, replayTrades } from "@/lib/portfolio";
import { evaluateChallenges, courseProgress } from "@/lib/curriculum";
import { loadJSON, saveJSON, clearAll } from "@/lib/storage";

export const TokenContext = createContext(null);

/** How often the simulated price feed emits a tick. */
const PRICE_TICK_MS = 3000;

/** Persisted slices. Prices are deliberately NOT persisted — they re-simulate. */
const KEYS = { wallet: "wallet", cash: "cash", trades: "trades", balances: "balances" };

const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [selectedToken, setSelectedToken] = useState(INITIAL_TOKENS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [trades, setTrades] = useState([]);
  // Guards the persistence effect so we don't write defaults over saved state
  // before the initial load has run.
  const [hydrated, setHydrated] = useState(false);

  // ---- Restore a previous session -----------------------------------------
  // localStorage does not exist during SSR, so hydration must happen in an
  // effect. A lazy useState initializer would read it on the server and cause
  // a hydration mismatch; this runs exactly once on mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedWallet = loadJSON(KEYS.wallet, null);
    if (savedWallet) {
      setWallet(savedWallet);
      setCash(loadJSON(KEYS.cash, INITIAL_CASH));
      setTrades(loadJSON(KEYS.trades, []));
      const balances = loadJSON(KEYS.balances, {});
      setTokens((prev) =>
        prev.map((t) => ({ ...t, balance: balances[t.symbol] ?? 0 }))
      );
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ---- Persist on change ---------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    saveJSON(KEYS.wallet, wallet);
    saveJSON(KEYS.cash, cash);
    saveJSON(KEYS.trades, trades);
    saveJSON(
      KEYS.balances,
      Object.fromEntries(tokens.map((t) => [t.symbol, t.balance ?? 0]))
    );
  }, [hydrated, wallet, cash, trades, tokens]);

  /**
   * Simulated price feed, owned by the provider so every page reads the same
   * market data. This is an interval-driven mock, not a real WebSocket.
   */
  useEffect(() => {
    const id = setInterval(() => {
      setTokens((current) =>
        current.map((token) =>
          appendPricePoint(token, {
            price: nextPrice(token.price),
            timestamp: new Date().toISOString(),
            volume: Math.random() * token.price * 100,
          })
        )
      );
    }, PRICE_TICK_MS);

    return () => clearInterval(id);
  }, []);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // A practice account starts genuinely flat: cash only, no granted tokens
      // and no seeded history. Otherwise cost basis, P&L and the lesson
      // challenges would all be measuring trades the learner never made.
      const mockWallet = createMockWallet();
      setWallet(mockWallet);
      setCash(INITIAL_CASH);
      setTrades([]);
      setTokens((prev) => prev.map((token) => ({ ...token, balance: 0 })));

      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Could not connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setTrades([]);
    setCash(INITIAL_CASH);
    setTokens((prev) => prev.map((token) => ({ ...token, balance: 0 })));
    clearAll(Object.values(KEYS));
    toast("Wallet disconnected");
  }, []);

  /** Wipe the practice account and start the course over. */
  const resetAccount = useCallback(() => {
    setTrades([]);
    setCash(INITIAL_CASH);
    setTokens((prev) => prev.map((token) => ({ ...token, balance: 0 })));
    toast.success("Practice account reset");
  }, []);

  /** Record a validated trade and settle balances. */
  const addTrade = useCallback(
    (tradeDetails) => {
      const { type, token: symbol, amount, price, total } = tradeDetails;

      setTrades((prev) => [
        {
          id: `tx-${Date.now()}`,
          timestamp: Date.now(),
          address: wallet?.address,
          type,
          token: symbol,
          amount,
          price,
        },
        ...prev,
      ]);

      setTokens((prev) => applyTradeToTokens(prev, { symbol, type, amount }));
      setCash((prev) =>
        applyTradeToCash(prev, { type, total: total ?? amount * price })
      );
    },
    [wallet]
  );

  // ---- Derived learning state ---------------------------------------------
  const priceBySymbol = useMemo(
    () => Object.fromEntries(tokens.map((t) => [t.symbol, t.price])),
    [tokens]
  );

  const { positions, closed } = useMemo(() => replayTrades(trades), [trades]);
  const stats = useMemo(() => performanceStats(closed), [closed]);
  const equity = useMemo(
    () => computeEquity(cash, positions, priceBySymbol),
    [cash, positions, priceBySymbol]
  );

  const challengeResults = useMemo(
    () =>
      evaluateChallenges({
        trades,
        closed,
        positions,
        stats,
        equity,
        startingEquity: INITIAL_CASH,
      }),
    [trades, closed, positions, stats, equity]
  );
  const progress = useMemo(
    () => courseProgress(challengeResults),
    [challengeResults]
  );

  const value = useMemo(
    () => ({
      INITIAL_TOKENS,
      INITIAL_CASH,
      tokens,
      setTokens,
      selectedToken,
      setSelectedToken,
      searchTerm,
      setSearchTerm,
      loading,
      setLoading,
      wallet,
      setWallet,
      cash,
      trades,
      connectWallet,
      disconnectWallet,
      resetAccount,
      addTrade,
      // learning
      positions,
      closed,
      stats,
      equity,
      priceBySymbol,
      challengeResults,
      progress,
    }),
    [
      tokens,
      selectedToken,
      searchTerm,
      loading,
      wallet,
      cash,
      trades,
      connectWallet,
      disconnectWallet,
      resetAccount,
      addTrade,
      positions,
      closed,
      stats,
      equity,
      priceBySymbol,
      challengeResults,
      progress,
    ]
  );

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};

export default TokenProvider;
