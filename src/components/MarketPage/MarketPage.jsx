"use client";
import { TokenContext } from "@/Helper/Context";
import React, { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TradingViewWidget from "@/components/MarketPage/TradingViewWidget";

const MarketPage = () => {
  const { INITIAL_TOKENS, createPriceWebSocket } = useContext(TokenContext);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tokens, setTokens] = useState(INITIAL_TOKENS || []);
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    const wsInterval = createPriceWebSocket((data) => {
      setTokens((prevTokens) => {
        return prevTokens.map((token) => {
          if (token.symbol === data.symbol) {
            const newPriceData = [
              ...(token.priceData || []),
              {
                date: data.timestamp,
                price: data.price,
                volume: data.volume,
              },
            ].slice(-20);

            const oldPrice = token.price;
            const newPrice = data.price;
            const newChange = ((newPrice - oldPrice) / oldPrice) * 100;

            return {
              ...token,
              price: newPrice,
              priceData: newPriceData,
              change24h: newChange,
            };
          }
          return token;
        });
      });
    });

    return () => clearInterval(wsInterval);
  }, []);

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto pt-8 pb-8 px-4">
        <div className="grid grid-cols-1 gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Real Time Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredTokens.map((token) => (
                  <Button
                    key={token.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex justify-between w-full">
                      <span className="font-bold">{token.symbol}</span>
                      <span
                        className={
                          token.change24h >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {token.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {token.name}
                    </div>
                    <div className="text-lg font-bold mt-2">
                      ${token.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    {wallet && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Balance: {token.balance.toFixed(4)} {token.symbol}
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-0">
              {selectedToken ? (
            <TradingViewWidget 
              selectedSymbol={`BINANCE:${selectedToken.symbol}USDT`}
            />
          ) : (
            <TradingViewWidget />
          )}
            </CardContent>
          </Card>

          
        </div>
      </main>
    </div>
  );
};

export default MarketPage;