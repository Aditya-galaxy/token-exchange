import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Navigation Component

export default function Navigation(props) {
    return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
        <div className="container mx-auto">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">CryptoExchange</h1>
                    <nav className="hidden md:flex space-x-4">
                        <Button
                            variant={currentPage === "markets" ? "default" : "ghost"}
                            onClick={() => setCurrentPage("markets")}
                        >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Markets
                        </Button>
                        <Button
                            variant={currentPage === "trade" ? "default" : "ghost"}
                            onClick={() => setCurrentPage("trade")}
                        >
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Trade
                        </Button>
                        <Button
                            variant={currentPage === "wallet" ? "default" : "ghost"}
                            onClick={() => setCurrentPage("wallet")}
                        >
                            <Wallet className="mr-2 h-4 w-4" />
                            Wallet
                        </Button>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tokens..."
                            className="pl-8 w-[200px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={connectWallet}
                        disabled={loading || wallet}
                    >
                        {wallet
                            ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                            : "Connect Wallet"}
                    </Button>
                </div>
            </div>
        </div>
    </div >
    )
};

