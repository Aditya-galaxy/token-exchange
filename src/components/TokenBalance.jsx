"use client"
import React from "react";
import { cn } from "@/lib/utils";

const TokenBalance = ({ token, className }) => {
  if (!token || typeof token.balance !== 'number' || typeof token.price !== 'number') {
    return null;
  }

  const totalValue = token.balance * token.price;

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      ≈ ${totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </div>
  );
};

export default TokenBalance;