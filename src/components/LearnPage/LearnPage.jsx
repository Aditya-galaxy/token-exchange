"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { TokenContext } from "@/Helper/Context";
import { LESSONS } from "@/lib/curriculum";
import { accountSummary } from "@/lib/coach";
import { formatUsd } from "@/lib/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";

const LearnPage = () => {
  const {
    challengeResults,
    progress,
    stats,
    equity,
    INITIAL_CASH,
    wallet,
    connectWallet,
    loading,
  } = useContext(TokenContext);

  const pnl = equity - INITIAL_CASH;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Learn to trade</h1>
        <p className="text-muted-foreground">
          Five short lessons, each ending in a challenge you complete by actually
          trading. Nothing here risks real money.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">
              {progress.completed}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / {progress.total} lessons
              </span>
            </span>
            <span className="text-sm text-muted-foreground">
              {progress.pct.toFixed(0)}% complete
            </span>
          </div>
          <ProgressBar value={progress.pct} />

          {wallet ? (
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              <Stat
                label="Equity"
                value={`$${equity.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`}
              />
              <Stat
                label="P&L"
                value={formatUsd(pnl)}
                tone={pnl > 0 ? "up" : pnl < 0 ? "down" : undefined}
              />
              <Stat label="Closed trades" value={stats.closedCount} />
              <Stat
                label="Win rate"
                value={stats.closedCount ? `${stats.winRate.toFixed(0)}%` : "—"}
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4">
              <p className="text-sm text-muted-foreground">
                Connect a practice wallet to start the course. You get $
                {INITIAL_CASH.toLocaleString()} in simulated cash.
              </p>
              <Button onClick={connectWallet} disabled={loading}>
                {loading ? "Connecting..." : "Start practising"}
              </Button>
            </div>
          )}

          {wallet && (
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {accountSummary({ stats, equity, startingEquity: INITIAL_CASH })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {LESSONS.map((lesson, i) => {
          const result = challengeResults[lesson.id];
          const done = result?.passed;
          return (
            <Link key={lesson.id} href={`/learn/${lesson.id}`} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Lesson {i + 1}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {lesson.minutes} min
                      </span>
                    </div>
                    <h2 className="mt-0.5 font-semibold">{lesson.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lesson.summary}
                    </p>
                    {result && (
                      <p
                        className={`mt-2 text-xs ${
                          done ? "text-green-500" : "text-muted-foreground"
                        }`}
                      >
                        Challenge: {result.detail}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

function Stat({ label, value, tone }) {
  const color =
    tone === "up" ? "text-green-500" : tone === "down" ? "text-red-500" : "";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

export default LearnPage;
