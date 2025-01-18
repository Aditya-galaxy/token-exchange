"use client"
import React, { useState, useContext, useEffect } from 'react';
import { TokenContext } from "@/Helper/Context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TradePage = () => {
  // Context values
  const {
    wallet,
    tokens,
    setTokens,
    trades,
    addTrade,
  } = useContext(TokenContext);

  // Local state
  const [selectedToken, setSelectedToken] = useState(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update trade price when token selection changes
  useEffect(() => {
    if (selectedToken) {
      setTradePrice(selectedToken.price.toString());
    }
  }, [selectedToken]);

  // Find token by symbol
  const getTokenBySymbol = (symbol) => {
    return tokens.find(token => token.symbol === symbol);
  };

  // Handle token selection
  const handleTokenSelect = (symbol) => {
    const token = getTokenBySymbol(symbol);
    setSelectedToken(token);
    setError(null);
  };

  // Validate trade
  const validateTrade = (type, amount, price) => {
    if (!wallet) {
      throw new Error("Please connect your wallet first");
    }

    if (!selectedToken) {
      throw new Error("Please select a token");
    }

    if (!amount || !price) {
      throw new Error("Please enter amount and price");
    }

    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(price);

    if (isNaN(numAmount) || isNaN(numPrice)) {
      throw new Error("Invalid amount or price");
    }

    if (numAmount <= 0 || numPrice <= 0) {
      throw new Error("Amount and price must be positive");
    }

    if (type === "sell") {
      const currentBalance = selectedToken.balance || 0;
      if (numAmount > currentBalance) {
        throw new Error(`Insufficient ${selectedToken.symbol} balance`);
      }
    }

    return { numAmount, numPrice };
  };

  // Execute trade
  const executeTrade = async (type) => {
    try {
      setLoading(true);
      setError(null);

      // Validate trade
      const { numAmount, numPrice } = validateTrade(type, tradeAmount, tradePrice);

      // Create trade object
      const trade = {
        type,
        token: selectedToken.symbol,
        amount: numAmount,
        price: numPrice
      };

      // Add trade to history
      addTrade(trade);

      // Reset form
      setTradeAmount("");
      setTradePrice(selectedToken.price.toString());

      // Show success message
      setError(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${numAmount} ${selectedToken.symbol}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter trades for current token
  const tokenTrades = trades
    .filter(trade => trade.token === selectedToken?.symbol)
    .slice(0, 5); // Show only last 5 trades

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade {selectedToken?.symbol || "Tokens"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant={error.includes("Successfully") ? "default" : "destructive"}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Select Token</div>
            <Select
              onValueChange={handleTokenSelect}
              value={selectedToken?.symbol}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol} - ${token.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Amount</div>
            <Input
              type="number"
              placeholder="0.00"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
            />
            {wallet && selectedToken && (
              <div className="text-sm text-muted-foreground">
                Available: {selectedToken.balance?.toFixed(4) || '0.0000'} {selectedToken.symbol}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Price</div>
            <Input
              type="number"
              placeholder="Market Price"
              value={tradePrice}
              onChange={(e) => setTradePrice(e.target.value)}
            />
            {selectedToken && (
              <div className="text-sm text-muted-foreground">
                Market Price: ${selectedToken.price.toFixed(2)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total</div>
            <Input
              type="number"
              value={
                tradeAmount && tradePrice
                  ? (parseFloat(tradeAmount) * parseFloat(tradePrice)).toFixed(2)
                  : ""
              }
              placeholder="0.00"
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => executeTrade("buy")}
              disabled={loading || !wallet}
            >
              {loading ? "Processing..." : "Buy"}
            </Button>
            <Button
              className="w-full bg-red-500 hover:bg-red-600"
              onClick={() => executeTrade("sell")}
              disabled={loading || !wallet}
            >
              {loading ? "Processing..." : "Sell"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent {selectedToken?.symbol || ''} Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!selectedToken ? (
              <div className="text-center text-muted-foreground py-8">
                <div>Connect your wallet first</div>
                <div>Select a token to view trades</div>
              </div>
            ) : tokenTrades.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No trades yet for {selectedToken.symbol}
              </div>
            ) : (
              tokenTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {trade.type === "buy" ? "Bought" : "Sold"} {trade.token}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={
                        trade.type === "buy" ? "text-green-500" : "text-red-500"
                      }
                    >
                      {trade.amount.toFixed(4)} {trade.token}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @ ${trade.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradePage;