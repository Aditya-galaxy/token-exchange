import React, { useState, useContext } from "react";
import { Context } from "@/Helper/Context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import TransactionHistory from "./TransactionHistory";

// Wallet Page Component
const WalletPage = () => {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);

  // Connect Wallet Function
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

      setError(null);
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    } finally {
      setLoading(false);
      }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!wallet ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Connect Your Wallet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your wallet to view your balances and trade
              </p>
              <Button
                className="mt-4"
                onClick={connectWallet}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-mono">{wallet.address}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tokens.map((token) => (
                    <div key={token.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{token.symbol}</div>
                        <div
                          className={
                            token.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {token.change24h.toFixed(2)}%
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">
                          {token.balance.toFixed(4)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ ${(token.balance * token.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
        <TransactionHistory />
        </>
      )}
    </div>
  );
}
export default WalletPage;