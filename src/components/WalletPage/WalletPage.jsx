"use client"
import React, { useContext } from "react";
import { TokenContext } from "@/Helper/Context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import TransactionHistory from "./TransactionHistory";

// Wallet Page Component
const WalletPage = () => {
  const { 
        wallet, 
        setWallet, 
        tokens, 
        setTokens, 
        loading, 
        setLoading, 
        connectWallet 
    } = useContext(TokenContext);
  
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