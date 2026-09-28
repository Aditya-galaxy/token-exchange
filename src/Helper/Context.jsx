"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  INITIAL_TOKENS,
  INITIAL_CASH,
  applyTradeToCash,
  applyTradeToTokens,
  appendPricePoint,
  createMockWallet,
  generateMockTransactions,
  nextPrice,
} from "@/lib/trading";

export const TokenContext = createContext(null);

/** How often the simulated price feed emits a tick. */
const PRICE_TICK_MS = 3000;

const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [selectedToken, setSelectedToken] = useState(INITIAL_TOKENS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [trades, setTrades] = useState([]);

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
      // Simulate a wallet handshake.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockWallet = createMockWallet();
      setWallet(mockWallet);
      setCash(INITIAL_CASH);
      setTrades(generateMockTransactions(mockWallet.address));
      setTokens((prev) =>
        prev.map((token) => ({
          ...token,
          balance: mockWallet.balances[token.symbol] ?? 0,
        }))
      );

      // Only report success once it actually succeeded.
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
    toast("Wallet disconnected");
  }, []);

  /** Record a validated trade and settle balances. */
  const addTrade = useCallback((tradeDetails) => {
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
    setCash((prev) => applyTradeToCash(prev, { type, total: total ?? amount * price }));
  }, [wallet]);

  // Memoised so consumers don't re-render on every provider render.
  const value = useMemo(
    () => ({
      INITIAL_TOKENS,
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
      addTrade,
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
      addTrade,
    ]
  );

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};

export default TokenProvider;
