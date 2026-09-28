"use client";

import React, { useContext, useState } from "react";
import dynamic from "next/dynamic";
import { TokenContext } from "@/Helper/Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { filterTokens } from "@/lib/trading";
import Footer from "../Footer";
import LoadingSpinner from "./LoadingSpinner";

// ssr:false already defers this to the client, so no `mounted` flag is needed.
const TradingViewWidget = dynamic(() => import("./TradingViewWidget"), {
  ssr: false,
  loading: LoadingSpinner,
});

const MarketPage = () => {
  // Read shared market state from context. Previously this page kept its own
  // copies of tokens/searchTerm/wallet, so the navbar search did nothing here
  // and live prices never reached the rest of the app.
  const { tokens, searchTerm, wallet } = useContext(TokenContext);
  const [selectedToken, setSelectedToken] = useState(null);

  const visibleTokens = filterTokens(tokens, searchTerm);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto pt-8 pb-8 px-4">
        <div className="grid grid-cols-1 gap-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Real Time Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {visibleTokens.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No tokens match “{searchTerm}”.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visibleTokens.map((token) => (
                    <Button
                      key={token.id}
                      variant="outline"
                      aria-pressed={selectedToken?.symbol === token.symbol}
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setSelectedToken(token)}
                    >
                      <div className="flex justify-between w-full">
                        <span className="font-bold">{token.symbol}</span>
                        <span
                          className={
                            token.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {token.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.name}
                      </div>
                      <div className="text-lg font-bold mt-2">
                        $
                        {token.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      {wallet && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Balance: {(token.balance ?? 0).toFixed(4)}{" "}
                          {token.symbol}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <TradingViewWidget
                key={selectedToken?.symbol ?? "default"}
                selectedSymbol={
                  selectedToken
                    ? `BINANCE:${selectedToken.symbol}USDT`
                    : undefined
                }
              />
            </CardContent>
          </Card>

          <Footer />
        </div>
      </main>
    </div>
  );
};

export default MarketPage;
