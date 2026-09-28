"use client";

import React, { useContext } from "react";
import { TokenContext } from "@/Helper/Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUsd, unrealizedPnl } from "@/lib/portfolio";
import { accountSummary } from "@/lib/coach";

const Performance = () => {
  const {
    stats,
    equity,
    cash,
    positions,
    tokens,
    INITIAL_CASH,
    wallet,
    resetAccount,
  } = useContext(TokenContext);

  if (!wallet) return null;

  const pnl = equity - INITIAL_CASH;
  const priceOf = (symbol) =>
    tokens.find((t) => t.symbol === symbol)?.price ?? 0;
  const open = Object.values(positions).filter((p) => p.quantity > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Track record</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetAccount}>
            Reset account
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric
              label="Equity"
              value={`$${equity.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`}
            />
            <Metric
              label="Total P&L"
              value={formatUsd(pnl)}
              tone={pnl > 0 ? "up" : pnl < 0 ? "down" : null}
            />
            <Metric
              label="Cash"
              value={`$${cash.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`}
            />
            <Metric
              label="Win rate"
              value={stats.closedCount ? `${stats.winRate.toFixed(0)}%` : "—"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
            <Metric label="Closed trades" value={stats.closedCount} />
            <Metric
              label="Avg win"
              value={stats.avgWin ? formatUsd(stats.avgWin) : "—"}
            />
            <Metric
              label="Avg loss"
              value={stats.avgLoss ? formatUsd(-stats.avgLoss) : "—"}
            />
            <Metric
              label="Profit factor"
              value={
                stats.closedCount === 0
                  ? "—"
                  : stats.profitFactor === Infinity
                  ? "∞"
                  : stats.profitFactor.toFixed(2)
              }
              tone={
                stats.closedCount === 0
                  ? null
                  : stats.profitFactor >= 1
                  ? "up"
                  : "down"
              }
            />
          </div>

          <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {accountSummary({ stats, equity, startingEquity: INITIAL_CASH })}
          </p>
        </CardContent>
      </Card>

      {open.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Open positions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {open.map((p) => {
              const price = priceOf(p.symbol);
              const pl = unrealizedPnl(p, price);
              return (
                <div
                  key={p.symbol}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{p.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {p.quantity.toFixed(4)} @ avg ${p.avgCost.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${(p.quantity * price).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div
                      className={`text-sm ${
                        pl >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {formatUsd(pl)}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function Metric({ label, value, tone }) {
  const color =
    tone === "up" ? "text-green-500" : tone === "down" ? "text-red-500" : "";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

export default Performance;
