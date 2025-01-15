
// Markets Page Component
import React from "react";
import TokenBalance from "@/components/TokenBalance";

const MarketPage = ({ tokens }) => {
    return (<><div className="space-y-6">
        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Market Overview</CardTitle>
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
                                $
                                {token.price.toLocaleString(undefined, {
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

        {selectedToken && (
            <Card>
                <CardHeader>
                    <CardTitle>{selectedToken.symbol} Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={selectedToken.priceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(time) =>
                                                new Date(time).toLocaleTimeString()
                                            }
                                        />
                                        <YAxis
                                            domain={["auto", "auto"]}
                                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                                        />
                                        <Tooltip
                                            labelFormatter={(label) =>
                                                new Date(label).toLocaleString()
                                            }
                                            formatter={(value) => [
                                                "$" + value.toLocaleString(),
                                                "Price",
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Market Cap
                                    </div>
                                    <div className="text-lg font-bold">
                                        ${selectedToken.marketCap}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        24h Volume
                                    </div>
                                    <div className="text-lg font-bold">
                                        ${selectedToken.volume24h}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        24h Trades
                                    </div>
                                    <div className="text-lg font-bold">
                                        {selectedToken.trades.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={selectedToken.priceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(time) =>
                                                new Date(time).toLocaleTimeString()
                                            }
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(label) =>
                                                new Date(label).toLocaleString()
                                            }
                                            formatter={(value) => [
                                                value.toLocaleString(),
                                                "Volume",
                                            ]}
                                        />
                                        <Bar dataKey="volume" fill="#2563eb" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
    </>)
};
  
export default MarketPage;
