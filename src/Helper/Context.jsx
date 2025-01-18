"use client";
import React, { createContext, useState } from 'react';
import { toast } from "sonner";

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
  const [trades, setTrades] = useState([]);

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
        }, 3000);
  };

  // Mock transaction generation function
    const generateMockTransactions = (address) => {
        const mockTrades = [];
        const tokens = ['BTC', 'ETH', 'ICP'];
        const now = Date.now();
        
        // Generate last 5 mock transactions
        for (let i = 0; i < 5; i++) {
            mockTrades.push({
                id: `tx-${i}`,
                type: Math.random() > 0.5 ? 'buy' : 'sell',
                token: tokens[Math.floor(Math.random() * tokens.length)],
                amount: parseFloat((Math.random() * 2).toFixed(4)),
                price: parseFloat((Math.random() * 50000).toFixed(2)),
                timestamp: now - (i * 86400000), // Each transaction 1 day apart
                address
            });
        }
        return mockTrades;
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

            // Generate mock transactions for the wallet
            const mockTrades = generateMockTransactions(mockWallet.address);
            setTrades(mockTrades);
            
            setWallet(mockWallet);

            // Update token balances
            setTokens((prevTokens) =>
                prevTokens.map((token) => ({
                    ...token,
                    balance: mockWallet.balances[token.symbol] || 0,
                }))
            );
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        } finally {
            setLoading(false);
            toast("Wallet connected successfully");
        }
  };
  const addTrade = (tradeDetails) => {
        const newTrade = {
            id: `tx-${Date.now()}`,
            timestamp: Date.now(),
            address: wallet?.address,
            ...tradeDetails
        };
        
      setTrades(prevTrades => [newTrade, ...prevTrades]);
      
        // Update token balances based on trade
        setTokens(prevTokens => 
            prevTokens.map(token => {
                if (token.symbol === tradeDetails.token) {
                    const balanceChange = tradeDetails.type === 'buy' 
                        ? tradeDetails.amount 
                        : -tradeDetails.amount;
                    return {
                        ...token,
                        balance: (token.balance || 0) + balanceChange
                    };
                }
                return token;
            })
        );
  };
  const value = {
    INITIAL_TOKENS,
    selectedToken,
    setSelectedToken,
    tokens,
    loading,
    setLoading,
    wallet,
    setWallet,
    tokens,
    setTokens,
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    connectWallet,
    createPriceWebSocket,
    trades,
    addTrade
    };
  
    return (
        <div><TokenContext.Provider value={value}>
            {children}
        </TokenContext.Provider></div>
  )
}

export default TokenProvider;
