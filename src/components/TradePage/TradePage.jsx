"use client"
import React, { useState, useContext } from 'react';
import { TokenContext } from "@/Helper/Context";
import { validateTrade } from "@/lib/trading";
import { reviewOrder } from "@/lib/coach";
import { formatUsd, positionSizePct, unrealizedPnl } from "@/lib/portfolio";
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
    cash,
    trades,
    addTrade,
    positions,
    closed,
    equity,
  } = useContext(TokenContext);

  // Local state
  // Track the symbol, not the token object: deriving from context keeps
  // balances/prices live instead of freezing a snapshot at selection time.
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [loading, setLoading] = useState(false);
  // Errors and successes are distinct concerns; sharing one slot meant
  // "Successfully bought..." rendered inside a destructive Alert.
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const selectedToken =
    tokens.find((token) => token.symbol === selectedSymbol) ?? null;

  const position = selectedSymbol ? positions[selectedSymbol] : null;
  const orderTotal =
    Number.parseFloat(tradeAmount) * Number.parseFloat(tradePrice) || 0;

  // Coach the order *before* it is placed — that's when advice is useful.
  const coachNotes =
    wallet && selectedToken && orderTotal > 0
      ? reviewOrder({
          type: "buy",
          symbol: selectedToken.symbol,
          total: orderTotal,
          equity,
          cash,
          position,
          closed,
        })
      : [];

  const handleTokenSelect = (symbol) => {
    const token = tokens.find((t) => t.symbol === symbol);
    setSelectedSymbol(symbol);
    setTradePrice(token ? String(token.price) : "");
    setError(null);
    setSuccess(null);
  };

  // Execute trade
  const executeTrade = async (type) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { amount, price, total } = validateTrade({
        type,
        amount: tradeAmount,
        price: tradePrice,
        token: selectedToken,
        wallet,
        cash,
      });

      addTrade({ type, token: selectedToken.symbol, amount, price, total });

      setTradeAmount("");
      setTradePrice(String(selectedToken.price));
      setSuccess(
        `Successfully ${type === "buy" ? "bought" : "sold"} ${amount} ${selectedToken.symbol}`
      );
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
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {wallet && (
            <div className="text-sm text-muted-foreground">
              Cash available:{" "}
              <span className="font-medium text-foreground">
                ${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Select Token</div>
            <Select
              onValueChange={handleTokenSelect}
              value={selectedSymbol ?? undefined}
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

          {position && position.quantity > 0 && selectedToken && (
            <div className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open position</span>
                <span className="font-medium">
                  {position.quantity.toFixed(4)} {selectedToken.symbol}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">
                  Avg cost ${position.avgCost.toFixed(2)}
                </span>
                <span
                  className={
                    unrealizedPnl(position, selectedToken.price) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {formatUsd(unrealizedPnl(position, selectedToken.price))} unrealized
                </span>
              </div>
            </div>
          )}

          {coachNotes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Coach</span>
                <span>
                  {positionSizePct(orderTotal, equity).toFixed(1)}% of account
                </span>
              </div>
              {coachNotes.map((note) => (
                <p
                  key={note.id}
                  className={`rounded-lg border-l-2 bg-muted/40 p-2.5 text-xs leading-relaxed ${
                    note.level === "danger"
                      ? "border-l-red-500 text-red-400"
                      : note.level === "warn"
                      ? "border-l-yellow-500 text-yellow-300"
                      : "border-l-green-500 text-green-400"
                  }`}
                >
                  {note.message}
                </p>
              ))}
            </div>
          )}

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