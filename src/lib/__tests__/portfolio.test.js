import { describe, it, expect } from "vitest";
import {
  equity,
  formatUsd,
  performanceStats,
  positionSizePct,
  positionsValue,
  replayTrades,
  unrealizedPnl,
} from "../portfolio";

const t = (type, token, amount, price, timestamp) => ({
  type, token, amount, price, timestamp,
});

describe("replayTrades", () => {
  it("builds an average cost basis across multiple buys", () => {
    const { positions } = replayTrades([
      t("buy", "BTC", 1, 100, 1),
      t("buy", "BTC", 1, 200, 2),
    ]);
    expect(positions.BTC.quantity).toBe(2);
    expect(positions.BTC.avgCost).toBe(150);
  });

  it("sorts newest-first input before replaying", () => {
    // The UI stores trades newest-first; cost basis must still be correct.
    const { positions } = replayTrades([
      t("buy", "BTC", 1, 200, 2),
      t("buy", "BTC", 1, 100, 1),
    ]);
    expect(positions.BTC.avgCost).toBe(150);
  });

  it("realizes profit on a sell above average cost", () => {
    const { realizedPnl, closed } = replayTrades([
      t("buy", "BTC", 2, 100, 1),
      t("sell", "BTC", 1, 150, 2),
    ]);
    expect(realizedPnl).toBe(50);
    expect(closed).toHaveLength(1);
    expect(closed[0].pnlPct).toBeCloseTo(50, 5);
  });

  it("realizes a loss on a sell below average cost", () => {
    const { realizedPnl } = replayTrades([
      t("buy", "ETH", 1, 100, 1),
      t("sell", "ETH", 1, 60, 2),
    ]);
    expect(realizedPnl).toBe(-40);
  });

  it("leaves average cost unchanged by a partial sale", () => {
    const { positions } = replayTrades([
      t("buy", "BTC", 2, 100, 1),
      t("sell", "BTC", 1, 500, 2),
    ]);
    expect(positions.BTC.quantity).toBe(1);
    expect(positions.BTC.avgCost).toBe(100);
  });

  it("resets cost basis once the position is flat", () => {
    const { positions } = replayTrades([
      t("buy", "BTC", 1, 100, 1),
      t("sell", "BTC", 1, 120, 2),
    ]);
    expect(positions.BTC.quantity).toBe(0);
    expect(positions.BTC.avgCost).toBe(0);
  });

  it("ignores a sell with no holding rather than inventing basis", () => {
    const { realizedPnl, closed } = replayTrades([t("sell", "BTC", 1, 100, 1)]);
    expect(realizedPnl).toBe(0);
    expect(closed).toHaveLength(0);
  });

  it("caps an oversized sell at the quantity actually held", () => {
    const { positions, closed } = replayTrades([
      t("buy", "BTC", 1, 100, 1),
      t("sell", "BTC", 5, 200, 2),
    ]);
    expect(closed[0].quantity).toBe(1);
    expect(positions.BTC.quantity).toBe(0);
  });

  it("tracks multiple symbols independently", () => {
    const { positions } = replayTrades([
      t("buy", "BTC", 1, 100, 1),
      t("buy", "ETH", 2, 50, 2),
    ]);
    expect(positions.BTC.quantity).toBe(1);
    expect(positions.ETH.quantity).toBe(2);
  });

  it("skips malformed trades", () => {
    const { positions } = replayTrades([
      { type: "buy", token: "BTC", amount: NaN, price: 10, timestamp: 1 },
      t("buy", "BTC", 1, 100, 2),
    ]);
    expect(positions.BTC.quantity).toBe(1);
  });

  it("handles an empty log", () => {
    const { positions, realizedPnl, closed } = replayTrades([]);
    expect(positions).toEqual({});
    expect(realizedPnl).toBe(0);
    expect(closed).toEqual([]);
  });
});

describe("valuation", () => {
  it("computes unrealized P&L and ignores flat positions", () => {
    expect(unrealizedPnl({ quantity: 2, avgCost: 100 }, 150)).toBe(100);
    expect(unrealizedPnl({ quantity: 0, avgCost: 100 }, 150)).toBe(0);
    expect(unrealizedPnl(null, 150)).toBe(0);
  });

  it("values positions and total equity", () => {
    const positions = { BTC: { symbol: "BTC", quantity: 2, avgCost: 100 } };
    expect(positionsValue(positions, { BTC: 150 })).toBe(300);
    expect(equity(1000, positions, { BTC: 150 })).toBe(1300);
  });

  it("ignores symbols with no known price", () => {
    const positions = { DOGE: { symbol: "DOGE", quantity: 5, avgCost: 1 } };
    expect(positionsValue(positions, {})).toBe(0);
  });
});

describe("performanceStats", () => {
  const closed = [
    { pnl: 100, pnlPct: 10, timestamp: 1 },
    { pnl: -50, pnlPct: -5, timestamp: 2 },
    { pnl: 200, pnlPct: 20, timestamp: 3 },
  ];

  it("summarises wins, losses and win rate", () => {
    const s = performanceStats(closed);
    expect(s.closedCount).toBe(3);
    expect(s.wins).toBe(2);
    expect(s.losses).toBe(1);
    expect(s.winRate).toBeCloseTo(66.67, 1);
  });

  it("computes realized P&L, averages and profit factor", () => {
    const s = performanceStats(closed);
    expect(s.realizedPnl).toBe(250);
    expect(s.avgWin).toBe(150);
    expect(s.avgLoss).toBe(50);
    expect(s.profitFactor).toBeCloseTo(6, 5);
  });

  it("reports best and worst trades", () => {
    const s = performanceStats(closed);
    expect(s.bestTrade.pnl).toBe(200);
    expect(s.worstTrade.pnl).toBe(-50);
  });

  it("returns Infinity profit factor when there are no losses", () => {
    expect(performanceStats([{ pnl: 10, timestamp: 1 }]).profitFactor).toBe(Infinity);
  });

  it("is safe on an empty track record", () => {
    const s = performanceStats([]);
    expect(s).toMatchObject({ closedCount: 0, winRate: 0, profitFactor: 0 });
    expect(s.bestTrade).toBeNull();
  });
});

describe("helpers", () => {
  it("expresses order size as a percent of equity", () => {
    expect(positionSizePct(250, 1000)).toBe(25);
    expect(positionSizePct(250, 0)).toBe(0);
  });

  it("formats signed USD", () => {
    expect(formatUsd(1234.5)).toBe("+$1,234.50");
    expect(formatUsd(-99)).toBe("-$99.00");
    expect(formatUsd(0)).toBe("$0.00");
  });
});
