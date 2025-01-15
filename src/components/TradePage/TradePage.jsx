// Trade Page Component
import React, { useState, useContext } from 'react';
import { TokenContext } from "@/Helper/Context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Trade Page Component
const TradePage = () => {
  const { selectedToken, setSelectedToken, tokens, setTokens } = useContext(TokenContext);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trades, setTrades] = useState([]);
  const [wallet, setWallet] = useState(null);
  const executeTrade = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate inputs
      if (!tradeAmount || !tradePrice) {
        throw new Error("Please enter amount and price");
      }
      
      const amount = parseFloat(tradeAmount);
      const price = parseFloat(tradePrice);
      
      if (amount <= 0 || price <= 0) {
        throw new Error("Amount and price must be positive");
      }

      // Create trade object
      const trade = {
        id: Date.now(),
        type,
        token: selectedToken.symbol,
        amount,
        price,
        timestamp: new Date().toISOString()
      };

      // Update trades
      setTrades(prev => [...prev, trade]);
      
      // Reset form
      setTradeAmount("");
      setTradePrice("");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return(
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade {selectedToken?.symbol}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                Available: {selectedToken.balance.toFixed(4)}{" "}
                {selectedToken.symbol}
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
                  ? (parseFloat(tradeAmount) * parseFloat(tradePrice)).toFixed(
                      2
                    )
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
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trades.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No trades yet
              </div>
            ) : (
              trades.map((trade) => (
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
}
export default TradePage;

  