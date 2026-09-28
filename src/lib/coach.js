/**
 * The coach: converts a proposed or completed order into plain-English
 * feedback about *process*, not outcome.
 *
 * A beginner can make money on a reckless trade and lose money on a good one.
 * Judging results alone teaches the wrong lesson, so every rule here inspects
 * the decision (size, concentration, discipline) rather than the P&L.
 *
 * Severity: "danger" = will eventually blow up the account,
 *           "warn"   = worth reconsidering, "good" = reinforce the behaviour.
 */

import { positionSizePct } from "./portfolio";

/** Risking more than this share of equity in one position is reckless. */
export const OVERSIZED_PCT = 25;
/** Comfortable upper bound for a single position for a learner. */
export const HEALTHY_PCT = 10;

/**
 * Review an order in the context of the account.
 *
 * @returns {Array<{id: string, level: "danger"|"warn"|"good", message: string}>}
 */
export function reviewOrder({
  type,
  symbol,
  total,
  equity,
  cash,
  position,
  closed = [],
}) {
  const notes = [];
  const sizePct = positionSizePct(total, equity);

  if (type === "buy") {
    if (sizePct >= OVERSIZED_PCT) {
      notes.push({
        id: "oversized",
        level: "danger",
        message: `This order is ${sizePct.toFixed(
          0
        )}% of your account. Professionals rarely risk more than ${HEALTHY_PCT}% on one position — a single bad move here would be hard to recover from.`,
      });
    } else if (sizePct > HEALTHY_PCT) {
      notes.push({
        id: "large",
        level: "warn",
        message: `This order is ${sizePct.toFixed(
          0
        )}% of your account. That's on the large side; consider sizing down so one trade can't dominate your results.`,
      });
    } else if (sizePct > 0) {
      notes.push({
        id: "well-sized",
        level: "good",
        message: `Position size is ${sizePct.toFixed(
          1
        )}% of your account — a sensible amount to risk on a single idea.`,
      });
    }

    // Averaging down: buying more of something already underwater.
    if (position && position.quantity > 0 && position.avgCost > 0) {
      notes.push({
        id: "adding",
        level: "warn",
        message: `You already hold ${position.quantity.toFixed(
          4
        )} ${symbol} at an average cost of $${position.avgCost.toFixed(
          2
        )}. Adding to a position concentrates your risk — make sure this is a plan, not a reaction.`,
      });
    }

    if (cash - total < equity * 0.05) {
      notes.push({
        id: "no-dry-powder",
        level: "warn",
        message:
          "This would leave you almost fully invested with no cash buffer. Keeping some cash gives you options when the market moves.",
      });
    }
  }

  if (type === "sell" && position && position.avgCost > 0) {
    notes.push({
      id: "exit",
      level: "good",
      message: `Closing part of a position is how you lock in a result. Your average cost here is $${position.avgCost.toFixed(
        2
      )}.`,
    });
  }

  // Behavioural pattern: a losing streak usually means process, not luck.
  const recent = [...closed].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
  if (recent.length === 3 && recent.every((c) => c.pnl < 0)) {
    notes.push({
      id: "losing-streak",
      level: "warn",
      message:
        "Your last three closed trades were losses. Consider pausing to review what they had in common before sizing up again.",
    });
  }

  return notes;
}

/** A short, human summary of how the account is doing overall. */
export function accountSummary({ stats, equity, startingEquity }) {
  const change = equity - startingEquity;
  const changePct = startingEquity > 0 ? (change / startingEquity) * 100 : 0;

  if (stats.closedCount === 0) {
    return "No closed trades yet. Open a position and close it to start building a track record.";
  }
  if (stats.winRate >= 50 && stats.profitFactor >= 1) {
    return `You're up ${changePct.toFixed(1)}% with a ${stats.winRate.toFixed(
      0
    )}% win rate. Keep sizing consistent — that's what makes an edge compound.`;
  }
  if (stats.profitFactor >= 1) {
    return `Your win rate is ${stats.winRate.toFixed(
      0
    )}%, but your winners are bigger than your losers, so you're still profitable. Letting winners run is a real edge.`;
  }
  return `You're ${changePct.toFixed(
    1
  )}% on the account. Losses are part of trading — check whether your losers are larger than your winners, which is the most common beginner leak.`;
}
