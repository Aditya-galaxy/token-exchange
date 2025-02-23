"use client"
import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowUpDown, Search, TrendingUp } from "lucide-react";
import { TokenContext } from "@/Helper/Context";
import { ModeToggle } from "./Theme/ModeToggle";

const Navigation = () => {
  const pathname = usePathname();
  const currentPath = pathname.slice(1) || 'markets';
  
  const { searchTerm, setSearchTerm, wallet, connectWallet, loading } = useContext(TokenContext);
  
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">TokenExchange</h1>
            <nav className="hidden md:flex space-x-4">
              <Link href="/markets">
                <Button
                  variant={currentPath === "markets" ? "default" : "ghost"}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Markets
                </Button>
              </Link>
              <Link href="/trade">
                <Button
                  variant={currentPath === "trade" ? "default" : "ghost"}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Trade
                </Button>
              </Link>
              <Link href="/wallet">
                <Button
                  variant={currentPath === "wallet" ? "default" : "ghost"}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Button>
              </Link>
              <ModeToggle />
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
            {wallet ? (
              <Link href="/wallet">
                <Button
                  variant="outline"
                  className="font-mono"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {truncateAddress(wallet.address)}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={connectWallet}
                disabled={loading}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;