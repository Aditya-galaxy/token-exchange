/**
 * Portfolio accounting for the learning platform.
 *
 * Trades on their own teach nothing — a learner needs to know whether a
 * decision made or lost money and why. These pure functions replay a trade
 * log into positions (average cost basis), realized P&L, and the performance
 * statistics the coaching UI reports back.
 *
 * All functions are React-free and side-effect free so they can be tested
 * directly. Quantities are token units; prices and P&L are USD.
 */

/** A closed (sold) portion of a position, with the result of that decision. */
/**
 * Replay a trade log into positions and realized results.
 *
 * Trades may arrive newest-first (as the UI stores them); they are sorted
 * ascending before replay so cost basis accumulates correctly.
 *
 * Sells with no corresponding holding are ignored for P&L purposes rather
 * than producing nonsense basis — the order layer already blocks them.
 *
 * @returns {{positions: Object, realizedPnl: number, closed: Array}}
 */
export function replayTrades(trades = []) {
  const ordered = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  const positions = {}; // symbol -> { symbol, quantity, avgCost }
  const closed = [];
  let realizedPnl = 0;

  for (const trade of ordered) {
    const { token: symbol, type, amount, price } = trade;
    if (!symbol || !Number.isFinite(amount) || !Number.isFinite(price)) continue;

    const current = positions[symbol] ?? { symbol, quantity: 0, avgCost: 0 };

    if (type === "buy") {
      const totalCost = current.avgCost * current.quantity + price * amount;
      const quantity = current.quantity + amount;
      positions[symbol] = {
        symbol,
        quantity,
        avgCost: quantity > 0 ? totalCost / quantity : 0,
      };
// (sell handling below)
    } else if (type === "sell") {
      const sellable = Math.min(amount, current.quantity);
      if (sellable <= 0) continue;

      const pnl = (price - current.avgCost) * sellable;
      const cost = current.avgCost * sellable;
      realizedPnl += pnl;

      closed.push({
        symbol,
        quantity: sellable,
        entryPrice: current.avgCost,
        exitPrice: price,
        pnl,
        pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
        timestamp: trade.timestamp,
      });

      const quantity = current.quantity - sellable;
      positions[symbol] = {
        symbol,
        quantity,
        // Average cost is unchanged by a sale; reset once flat.
        avgCost: quantity > 0 ? current.avgCost : 0,
      };
    }
  }

  return { positions, realizedPnl, closed };
}

/** Unrealized P&L for one position at the current market price. */
export function unrealizedPnl(position, marketPrice) {
  if (!position || position.quantity <= 0) return 0;
  return (marketPrice - position.avgCost) * position.quantity;
}

/** Total market value of all open positions. */
export function positionsValue(positions, priceBySymbol) {
  return Object.values(positions).reduce((sum, p) => {
    const price = priceBySymbol[p.symbol];
    return sum + (Number.isFinite(price) ? price * p.quantity : 0);
  }, 0);
}

/** Cash + market value of holdings. The number a learner should watch. */
export function equity(cash, positions, priceBySymbol) {
  return cash + positionsValue(positions, priceBySymbol);
}

/**
 * Performance statistics over closed trades.
 * Win rate and profit factor are the two numbers that actually tell a
 * beginner whether their process works.
 */
export function performanceStats(closed = []) {
  const wins = closed.filter((c) => c.pnl > 0);
  const losses = closed.filter((c) => c.pnl < 0);

  const grossProfit = wins.reduce((s, c) => s + c.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, c) => s + c.pnl, 0));

  const best = closed.reduce(
    (b, c) => (b === null || c.pnl > b.pnl ? c : b),
    null
  );
  const worst = closed.reduce(
    (w, c) => (w === null || c.pnl < w.pnl ? c : w),
    null
  );

  return {
    closedCount: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
    realizedPnl: grossProfit - grossLoss,
    avgWin: wins.length ? grossProfit / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    // Infinity when there are wins but no losses yet; 0 when neither.
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    bestTrade: best,
    worstTrade: worst,
  };
}

/** What fraction of total equity a given order would commit, as a percent. */
export function positionSizePct(orderTotal, totalEquity) {
  if (!Number.isFinite(totalEquity) || totalEquity <= 0) return 0;
  return (orderTotal / totalEquity) * 100;
}

/** Format a signed USD amount for display: +$1,234.56 / -$99.00 */
export function formatUsd(value) {
  const sign = value < 0 ? "-" : value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
