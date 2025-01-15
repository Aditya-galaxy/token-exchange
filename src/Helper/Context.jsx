"use client";
import React, { createContext, useState } from 'react';

export const TokenContext = createContext();

const TokenProvider = ({ children }) => {
    // Initial token data
  const INITIAL_TOKENS = [
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
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [selectedToken, setSelectedToken] = useState(INITIAL_TOKENS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);

  const createPriceWebSocket = (onMessage) => {
        return setInterval(() => {INITIAL_TOKENS.forEach((token) => {
            const priceChange = (Math.random() - 0.5) * (token.price * 0.02); // 2% max change
            const newPrice = token.price + priceChange;
            onMessage({
                symbol: token.symbol,
                price: newPrice,
                timestamp: new Date().toISOString(),
                volume: Math.random() * token.price * 100,
            });
        });
        }, 5000);
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockWallet = {
        address: "0x" + Math.random().toString(16).slice(2, 42),
        balances: {
          BTC: 0.5,
          ETH: 5.0,
          ICP: 100.0,
        },
      };

      setWallet(mockWallet);

      // Update token balances
      setTokens((prevTokens) =>
        prevTokens.map((token) => ({
          ...token,
          balance: mockWallet.balances[token.symbol] || 0,
        }))
      );

    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setLoading(false);
    }
  };
  
    return (
        <div><TokenContext.Provider value={{ INITIAL_TOKENS, tokens, searchTerm, setSearchTerm, wallet, setWallet, loading, setLoading,
      connectWallet, setTokens, selectedToken, setSelectedToken, createPriceWebSocket }}>
            {children}
        </TokenContext.Provider></div>
  )
}

export default TokenProvider;
