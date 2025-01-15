"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TradingViewWidget from "@/components/MarketPage/TradingViewWidget";
import Navigation from "@/components/Navigation";
import WalletPage from "@/components/WalletPage/WalletPage";
import MarketPage from "@/components/MarketPage/MarketPage";
import { ModeToggle } from "@/components/Theme/ModeToggle";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  ArrowUpDown,
  Search,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { TokenContext } from "@/Helper/Context";

// Mock WebSocket for real-time price updates
// const createPriceWebSocket = (onMessage) => {
//   return setInterval(() => {
//     INITIAL_TOKENS.forEach((token) => {
//       const priceChange = (Math.random() - 0.5) * (token.price * 0.02); // 2% max change
//       const newPrice = token.price + priceChange;
//       onMessage({
//         symbol: token.symbol,
//         price: newPrice,
//         timestamp: new Date().toISOString(),
//         volume: Math.random() * token.price * 100,
//       });
//     });
//   }, 3000);
// };

const TokenExchange = () => {
  const { INITIAL_TOKENS } = useContext(TokenContext);
  const { createPriceWebSocket } = useContext(TokenContext);
  // State Management
  const [currentPage, setCurrentPage] = useState("market");
  const [selectedToken, setSelectedToken] = useState(INITIAL_TOKENS[0]);
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [wallet, setWallet] = useState(null);
  const [trades, setTrades] = useState([]);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize WebSocket and price updates
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
            ].slice(-20); // Keep last 20 data points

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

  // // Connect Wallet Function
  // const connectWallet = async () => {
  //   try {
  //     setLoading(true);
  //     // Simulate wallet connection delay
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     const mockWallet = {
  //       address: "0x" + Math.random().toString(16).slice(2, 42),
  //       balances: {
  //         BTC: 0.5,
  //         ETH: 5.0,
  //         ICP: 100.0,
  //       },
  //     };

  //     setWallet(mockWallet);

  //     // Update token balances
  //     setTokens((prevTokens) =>
  //       prevTokens.map((token) => ({
  //         ...token,
  //         balance: mockWallet.balances[token.symbol] || 0,
  //       }))
  //     );

  //     setError(null);
  //   } catch (err) {
  //     setError("Failed to connect wallet: " + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Execute Trade Function
  // const executeTrade = async (type) => {
  //   if (!wallet) {
  //     setError("Please connect your wallet first");
  //     return;
  //   }

  //   if (!tradeAmount || !tradePrice) {
  //     setError("Please enter amount and price");
  //     return;
  //   }

  //   const amount = parseFloat(tradeAmount);
  //   const price = parseFloat(tradePrice);

  //   if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
  //     setError("Invalid amount or price");
  //     return;
  //   }

  //   if (type === "sell" && amount > selectedToken.balance) {
  //     setError("Insufficient balance");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     // Simulate trade execution delay
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     const trade = {
  //       id: Date.now(),
  //       type,
  //       token: selectedToken.symbol,
  //       amount,
  //       price,
  //       total: amount * price,
  //       timestamp: new Date().toISOString(),
  //     };

  //     setTrades((prev) => [trade, ...prev]);

  //     // Update token balances
  //     setTokens((prevTokens) =>
  //       prevTokens.map((token) => {
  //         if (token.symbol === selectedToken.symbol) {
  //           const newBalance =
  //             type === "buy" ? token.balance + amount : token.balance - amount;
  //           return { ...token, balance: newBalance };
  //         }
  //         return token;
  //       })
  //     );

  //     // Reset form
  //     setTradeAmount("");
  //     setTradePrice("");
  //     setError(null);
  //   } catch (err) {
  //     setError("Trade failed: " + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Filter tokens based on search
  // const filteredTokens = tokens.filter(
  //   (token) =>
  //     token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     token.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Navigation Component
  // const Navigation = () => (
  //   <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
  //     <div className="container mx-auto">
  //       <div className="flex items-center justify-between h-16">
  //         <div className="flex items-center space-x-4">
  //           <h1 className="text-xl font-bold">TokenExchange</h1>
  //           <nav className="hidden md:flex space-x-4">
  //             <Button
  //               variant={currentPage === "market" ? "default" : "ghost"}
  //               onClick={() => setCurrentPage("market")}
  //             >
  //               <TrendingUp className="mr-2 h-4 w-4" />
  //               Market
  //             </Button>
  //             <Button
  //               variant={currentPage === "trade" ? "default" : "ghost"}
  //               onClick={() => setCurrentPage("trade")}
  //             >
  //               <ArrowUpDown className="mr-2 h-4 w-4" />
  //               Trade
  //             </Button>
  //             <Button
  //               variant={currentPage === "wallet" ? "default" : "ghost"}
  //               onClick={() => setCurrentPage("wallet")}
  //             >
  //               <Wallet className="mr-2 h-4 w-4" />
  //               Wallet
  //             </Button>
  //             <ModeToggle />
  //           </nav>
  //         </div>
  //         <div className="flex items-center space-x-4">
  //           <div className="relative">
  //             <Search className="absolute left-2 top-2.5 h-4 w-4" />
  //             <Input
  //               placeholder="Search tokens..."
  //               className="pl-8 w-[200px]"
  //               value={searchTerm}
  //               onChange={(e) => setSearchTerm(e.target.value)}
  //             />
  //           </div>
  //           <Button
  //             variant="outline"
  //             onClick={connectWallet}
  //             disabled={loading || wallet}
  //           >
  //             {wallet
  //               ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
  //               : "Connect Wallet"}
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  // Market Page Component
  // const MarketPage = () => (
  //   <div className="space-y-6">
  //     {error && (
  //       <Alert variant="destructive">
  //         <AlertDescription>{error}</AlertDescription>
  //       </Alert>
  //     )}

  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Real Time Analysis</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //           {filteredTokens.map((token) => (
  //             <Button
  //               key={token.id}
  //               variant="outline"
  //               className="h-auto p-4 flex flex-col items-start"
  //               onClick={() => setSelectedToken(token)}
  //             >
  //               <div className="flex justify-between w-full">
  //                 <span className="font-bold">{token.symbol}</span>
  //                 <span
  //                   className={
  //                     token.change24h >= 0 ? "text-green-500" : "text-red-500"
  //                   }
  //                 >
  //                   {token.change24h.toFixed(2)}%
  //                 </span>
  //               </div>
  //               <div className="text-sm text-muted-foreground">
  //                 {token.name}
  //               </div>
  //               <div className="text-lg font-bold mt-2">
  //                 $
  //                 {token.price.toLocaleString(undefined, {
  //                   minimumFractionDigits: 2,
  //                   maximumFractionDigits: 2,
  //                 })}
  //               </div>
  //               {wallet && (
  //                 <div className="text-sm text-muted-foreground mt-2">
  //                   Balance: {token.balance.toFixed(4)} {token.symbol}
  //                 </div>
  //               )}
  //             </Button>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );

  // // Trade Page Component
  // const TradePage = () => (
  //   <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Trade {selectedToken?.symbol}</CardTitle>
  //       </CardHeader>
  //       <CardContent className="space-y-4">
  //         {error && (
  //           <Alert variant="destructive">
  //             <AlertDescription>{error}</AlertDescription>
  //           </Alert>
  //         )}

  //         <div className="space-y-2">
  //           <div className="text-sm text-muted-foreground">Amount</div>
  //           <Input
  //             type="number"
  //             placeholder="0.00"
  //             value={tradeAmount}
  //             onChange={(e) => setTradeAmount(e.target.value)}
  //           />
  //           {wallet && selectedToken && (
  //             <div className="text-sm text-muted-foreground">
  //               Available: {selectedToken.balance.toFixed(4)}{" "}
  //               {selectedToken.symbol}
  //             </div>
  //           )}
  //         </div>

  //         <div className="space-y-2">
  //           <div className="text-sm text-muted-foreground">Price</div>
  //           <Input
  //             type="number"
  //             placeholder="Market Price"
  //             value={tradePrice}
  //             onChange={(e) => setTradePrice(e.target.value)}
  //           />
  //           {selectedToken && (
  //             <div className="text-sm text-muted-foreground">
  //               Market Price: ${selectedToken.price.toFixed(2)}
  //             </div>
  //           )}
  //         </div>

  //         <div className="space-y-2">
  //           <div className="text-sm text-muted-foreground">Total</div>
  //           <Input
  //             type="number"
  //             value={
  //               tradeAmount && tradePrice
  //                 ? (parseFloat(tradeAmount) * parseFloat(tradePrice)).toFixed(
  //                     2
  //                   )
  //                 : ""
  //             }
  //             placeholder="0.00"
  //             readOnly
  //           />
  //         </div>

  //         <div className="grid grid-cols-2 gap-4">
  //           <Button
  //             className="w-full bg-green-500 hover:bg-green-600"
  //             onClick={() => executeTrade("buy")}
  //             disabled={loading || !wallet}
  //           >
  //             {loading ? "Processing..." : "Buy"}
  //           </Button>
  //           <Button
  //             className="w-full bg-red-500 hover:bg-red-600"
  //             onClick={() => executeTrade("sell")}
  //             disabled={loading || !wallet}
  //           >
  //             {loading ? "Processing..." : "Sell"}
  //           </Button>
  //         </div>
  //       </CardContent>
  //     </Card>

  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Recent Trades</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="space-y-4">
  //           {trades.length === 0 ? (
  //             <div className="text-center text-muted-foreground py-8">
  //               No trades yet
  //             </div>
  //           ) : (
  //             trades.map((trade) => (
  //               <div
  //                 key={trade.id}
  //                 className="flex items-center justify-between p-3 border rounded-lg"
  //               >
  //                 <div>
  //                   <div className="font-medium">
  //                     {trade.type === "buy" ? "Bought" : "Sold"} {trade.token}
  //                   </div>
  //                   <div className="text-sm text-muted-foreground">
  //                     {new Date(trade.timestamp).toLocaleString()}
  //                   </div>
  //                 </div>
  //                 <div className="text-right">
  //                   <div
  //                     className={
  //                       trade.type === "buy" ? "text-green-500" : "text-red-500"
  //                     }
  //                   >
  //                     {trade.amount.toFixed(4)} {trade.token}
  //                   </div>
  //                   <div className="text-sm text-muted-foreground">
  //                     @ ${trade.price.toFixed(2)}
  //                   </div>
  //                 </div>
  //               </div>
  //             ))
  //           )}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );

  // // Wallet Page Component
  // const WalletPage = () => (
  //   <div className="max-w-4xl mx-auto space-y-6">
  //     {!wallet ? (
  //       <Card>
  //         <CardContent>
  //           <div className="text-center py-8">
  //             <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
  //             <h3 className="mt-4 text-lg font-medium">Connect Your Wallet</h3>
  //             <p className="mt-2 text-sm text-muted-foreground">
  //               Connect your wallet to view your balances and trade
  //             </p>
  //             <Button
  //               className="mt-4"
  //               onClick={connectWallet}
  //               disabled={loading}
  //             >
  //               {loading ? "Connecting..." : "Connect Wallet"}
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     ) : (
  //       <>
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Your Wallet</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="space-y-4">
  //               <div className="p-4 bg-muted rounded-lg">
  //                 <div className="text-sm text-muted-foreground">Address</div>
  //                 <div className="font-mono">{wallet.address}</div>
  //               </div>
  //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //                 {tokens.map((token) => (
  //                   <div key={token.id} className="p-4 border rounded-lg">
  //                     <div className="flex justify-between items-center">
  //                       <div className="font-medium">{token.symbol}</div>
  //                       <div
  //                         className={
  //                           token.change24h >= 0
  //                             ? "text-green-500"
  //                             : "text-red-500"
  //                         }
  //                       >
  //                         {token.change24h.toFixed(2)}%
  //                       </div>
  //                     </div>
  //                     <div className="mt-2">
  //                       <div className="text-2xl font-bold">
  //                         {token.balance.toFixed(4)}
  //                       </div>
  //                       <div className="text-sm text-muted-foreground">
  //                         ≈ ${(token.balance * token.price).toFixed(2)}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>
  //           </CardContent>
  //         </Card>

  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Transaction History</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="space-y-4">
  //               {trades.length === 0 ? (
  //                 <div className="text-center text-muted-foreground py-8">
  //                   No transactions yet
  //                 </div>
  //               ) : (
  //                 trades.map((trade) => (
  //                   <div
  //                     key={trade.id}
  //                     className="flex items-center justify-between p-4 border rounded-lg"
  //                   >
  //                     <div className="flex items-center space-x-4">
  //                       <div
  //                         className={`p-2 rounded-full ${
  //                           trade.type === "buy" ? "bg-green-100" : "bg-red-100"
  //                         }`}
  //                       >
  //                         {trade.type === "buy" ? (
  //                           <ChevronUp className="text-green-500" />
  //                         ) : (
  //                           <ChevronDown className="text-red-500" />
  //                         )}
  //                       </div>
  //                       <div>
  //                         <div className="font-medium">
  //                           {trade.type === "buy" ? "Bought" : "Sold"}{" "}
  //                           {trade.token}
  //                         </div>
  //                         <div className="text-sm text-muted-foreground">
  //                           {new Date(trade.timestamp).toLocaleString()}
  //                         </div>
  //                       </div>
  //                     </div>
  //                     <div className="text-right">
  //                       <div
  //                         className={
  //                           trade.type === "buy"
  //                             ? "text-green-500"
  //                             : "text-red-500"
  //                         }
  //                       >
  //                         {trade.amount.toFixed(4)} {trade.token}
  //                       </div>
  //                       <div className="text-sm text-muted-foreground">
  //                         Total: ${(trade.amount * trade.price).toFixed(2)}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))
  //               )}
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </>
  //     )}
  //   </div>
  // );

  return (
    <div className={"min-h-screen bg-background"}>
      <Navigation />
      <main className="container mx-auto pt-24 pb-8 px-4">
        {currentPage === "market" && <MarketPage />}
        {currentPage === "trade" && <TradePage />}
        {currentPage === "wallet" && <WalletPage />}
        <div className="container mx-auto pt-8 ">
          <Card>
            <CardContent />
            <TradingViewWidget />
            <CardContent />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TokenExchange;
