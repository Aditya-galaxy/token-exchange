/**
 * The curriculum: short lessons, each ending in a challenge that is checked
 * against what the learner actually did in the simulator.
 *
 * Reading about position sizing changes nothing; placing a correctly sized
 * order does. Every `challenge.check` therefore inspects real account state
 * ({ trades, closed, positions, stats, equity, startingEquity }) rather than
 * asking the learner to self-report.
 *
 * Checks must be pure and total: never throw, always return
 * { passed: boolean, detail: string }.
 */

import { OVERSIZED_PCT, HEALTHY_PCT } from "./coach";
import { positionSizePct } from "./portfolio";

export const LESSONS = [
  {
    id: "what-is-a-market",
    title: "What you're actually buying",
    minutes: 4,
    summary:
      "Price, liquidity, and why the number on the screen is only half the story.",
    sections: [
      {
        heading: "A price is just the last agreement",
        body: "The price you see is what one buyer and one seller most recently agreed on — not a fact about what something is worth. It updates constantly because new people keep disagreeing about value. When you place an order you are making a claim about where that agreement is heading next.",
      },
      {
        heading: "Every trade has someone on the other side",
        body: "When you buy, somebody is selling to you. They are not stupid, and neither are you — you simply have different time horizons, information, and goals. A useful habit is to ask: what does the person on the other side of this trade believe?",
      },
      {
        heading: "Volatility is the cost of opportunity",
        body: "Crypto moves far more than most assets. That movement is what creates opportunity, and it is also what destroys accounts. The same 5% swing that doubles a well-sized win can erase an oversized one.",
      },
    ],
    keyPoints: [
      "Price is the most recent agreement, not an objective value",
      "Someone takes the opposite side of every trade you make",
      "Volatility creates both the opportunity and the risk",
    ],
    quiz: [
      {
        question: "The market price of a token tells you…",
        options: [
          "What the token is objectively worth",
          "What a buyer and seller most recently agreed on",
          "What the token will be worth tomorrow",
        ],
        answer: 1,
        explanation:
          "Price is a record of the last transaction, not a valuation and certainly not a forecast.",
      },
    ],
    challenge: {
      id: "place-first-trade",
      prompt: "Connect your wallet and place your first buy order.",
      hint: "Any size will do — this one is just about getting comfortable with the order form.",
      check: ({ trades }) => {
        const buys = trades.filter((t) => t.type === "buy");
        return buys.length > 0
          ? { passed: true, detail: `You've placed ${buys.length} buy order(s).` }
          : { passed: false, detail: "No buy orders yet." };
      },
    },
  },

  {
    id: "position-sizing",
    title: "Position sizing is the whole game",
    minutes: 6,
    summary:
      "Why how much you bet matters more than what you bet on.",
    sections: [
      {
        heading: "Survival first",
        body: "A trader who is right 70% of the time but risks half the account on each trade will eventually go broke. A trader who is right 40% of the time but risks 2% will survive long enough for their edge to show up. Sizing is what converts a good idea into a good outcome.",
      },
      {
        heading: "The maths of a drawdown",
        body: "Losses are asymmetric. Lose 10% and you need 11% to get back to even. Lose 50% and you need 100%. Lose 80% and you need 400%. This is why avoiding large losses matters more than catching large gains.",
      },
      {
        heading: "A simple rule",
        body: `Keep any single position under about ${HEALTHY_PCT}% of your account while you're learning. Anything above ${OVERSIZED_PCT}% means one bad trade can undo months of good ones.`,
      },
    ],
    keyPoints: [
      "Sizing determines survival more than accuracy does",
      "Recovering from a loss takes a bigger gain than the loss itself",
      `Keep single positions under ~${HEALTHY_PCT}% of the account while learning`,
    ],
    quiz: [
      {
        question: "You lose 50% of your account. What gain gets you back to even?",
        options: ["50%", "75%", "100%"],
        answer: 2,
        explanation:
          "Going from 50 back to 100 is a 100% gain. This asymmetry is why big losses are so damaging.",
      },
    ],
    challenge: {
      id: "sized-trade",
      prompt: `Open a position worth less than ${HEALTHY_PCT}% of your account.`,
      hint: "Check the Total field against your equity before you buy.",
      check: ({ trades, equity }) => {
        const sized = trades.filter(
          (t) =>
            t.type === "buy" &&
            positionSizePct(t.amount * t.price, equity) > 0 &&
            positionSizePct(t.amount * t.price, equity) <= HEALTHY_PCT
        );
        return sized.length > 0
          ? {
              passed: true,
              detail: `You placed a buy worth about ${positionSizePct(
                sized[0].amount * sized[0].price,
                equity
              ).toFixed(1)}% of your account.`,
            }
          : {
              passed: false,
              detail: `No buy order under ${HEALTHY_PCT}% of equity yet.`,
            };
      },
    },
  },

  {
    id: "closing-trades",
    title: "Getting out is the hard part",
    minutes: 5,
    summary:
      "Entries are easy and optional. Exits decide whether you actually made money.",
    sections: [
      {
        heading: "Unrealized is not real",
        body: "A position showing a profit has made you nothing until you close it. Traders routinely watch a winner turn into a loser because they never decided in advance what would make them sell.",
      },
      {
        heading: "Decide the exit before you enter",
        body: "Before buying, write down two numbers: the price at which you admit you were wrong, and the price at which you'd be satisfied taking profit. Making that decision while you have no money on the line is far easier than making it mid-move.",
      },
      {
        heading: "Cutting losses is a skill, not a failure",
        body: "Closing a losing trade feels like accepting defeat, so beginners hold on and hope. Hoping is not a strategy. A small planned loss is a normal business expense; an unplanned large one is what ends accounts.",
      },
    ],
    keyPoints: [
      "Profit isn't real until the position is closed",
      "Decide your exit before you enter, not during",
      "A small planned loss is normal and healthy",
    ],
    quiz: [
      {
        question: "When is the best time to decide where you'll exit a trade?",
        options: [
          "Before you enter it",
          "Once it starts moving against you",
          "When you need the cash",
        ],
        answer: 0,
        explanation:
          "Deciding in advance removes emotion from the decision at the moment it's hardest to think clearly.",
      },
    ],
    challenge: {
      id: "close-a-position",
      prompt: "Close a position by selling something you hold.",
      hint: "Buy a token, then sell some of it. The result gets recorded in your track record.",
      check: ({ closed }) =>
        closed.length > 0
          ? {
              passed: true,
              detail: `You've closed ${closed.length} trade(s).`,
            }
          : { passed: false, detail: "No closed trades yet." },
    },
  },

  {
    id: "track-record",
    title: "Reading your own track record",
    minutes: 5,
    summary:
      "Win rate, average win vs average loss, and why profit factor is the honest number.",
    sections: [
      {
        heading: "Win rate alone is misleading",
        body: "You can win 90% of your trades and still lose money if the 10% that lose are enormous. You can win 35% and be highly profitable if the winners are far larger. Win rate is only meaningful alongside the size of wins and losses.",
      },
      {
        heading: "Profit factor",
        body: "Profit factor is gross profit divided by gross loss. Above 1.0 means the strategy makes money overall. It captures in one number what win rate alone hides.",
      },
      {
        heading: "Sample size",
        body: "Three trades tell you nothing — that's noise. Patterns in your results only become meaningful after dozens of trades. Beginners routinely abandon a sound approach after two losses, and stick with a reckless one after two lucky wins.",
      },
    ],
    keyPoints: [
      "Win rate is meaningless without average win vs average loss",
      "Profit factor above 1.0 means the process makes money",
      "A handful of trades is noise, not evidence",
    ],
    quiz: [
      {
        question: "A trader wins 30% of trades but is profitable. How?",
        options: [
          "They're getting lucky",
          "Their winners are much larger than their losers",
          "It's impossible",
        ],
        answer: 1,
        explanation:
          "With a high enough average win relative to average loss, a low win rate is perfectly profitable.",
      },
    ],
    challenge: {
      id: "build-sample",
      prompt: "Close three trades to build a starting track record.",
      hint: "Your stats appear on the Wallet page as soon as you close positions.",
      check: ({ closed }) =>
        closed.length >= 3
          ? { passed: true, detail: `${closed.length} closed trades recorded.` }
          : {
              passed: false,
              detail: `${closed.length} of 3 closed trades so far.`,
            },
    },
  },

  {
    id: "risk-of-ruin",
    title: "Staying in the game",
    minutes: 5,
    summary: "Concentration, cash buffers, and the habits that keep you solvent.",
    sections: [
      {
        heading: "Don't put it all in one thing",
        body: "Concentration magnifies both outcomes. Holding a single asset with your entire account means your results are entirely determined by that one bet, however good your reasoning was.",
      },
      {
        heading: "Cash is a position",
        body: "Holding cash feels like doing nothing, but it is what lets you act when an opportunity appears. Being fully invested at all times means every new idea requires selling something first.",
      },
      {
        heading: "Process over outcome",
        body: "Judge yourself on whether you followed your plan, not on whether the trade won. Good decisions sometimes lose and bad ones sometimes win; only the process is under your control.",
      },
    ],
    keyPoints: [
      "Concentration makes results depend on a single bet",
      "Cash preserves your ability to act",
      "Judge the decision, not the outcome",
    ],
    quiz: [
      {
        question: "A trade you took recklessly ends up profitable. What happened?",
        options: [
          "It was a good trade",
          "A bad process produced a good outcome this time",
          "Risk management doesn't matter",
        ],
        answer: 1,
        explanation:
          "Outcomes are noisy. Repeating a reckless process reliably ends badly even when it occasionally wins.",
      },
    ],
    challenge: {
      id: "diversify",
      prompt: "Hold positions in at least two different tokens at once.",
      hint: "Buy a second token while still holding the first.",
      check: ({ positions }) => {
        const held = Object.values(positions).filter((p) => p.quantity > 0);
        return held.length >= 2
          ? {
              passed: true,
              detail: `Holding ${held.map((p) => p.symbol).join(", ")}.`,
            }
          : {
              passed: false,
              detail: `Holding ${held.length} token(s); need 2.`,
            };
      },
    },
  },
];

/** Look up a lesson by id. */
export function getLesson(id) {
  return LESSONS.find((l) => l.id === id) ?? null;
}

/**
 * Evaluate every lesson's challenge against current account state.
 * @returns {Object} lessonId -> { passed, detail }
 */
export function evaluateChallenges(state) {
  const results = {};
  for (const lesson of LESSONS) {
    try {
      results[lesson.id] = lesson.challenge.check(state);
    } catch {
      // A broken check must never break the UI.
      results[lesson.id] = { passed: false, detail: "Could not evaluate yet." };
    }
  }
  return results;
}

/** Overall progress: a lesson counts as done when its challenge passes. */
export function courseProgress(results) {
  const total = LESSONS.length;
  const completed = LESSONS.filter((l) => results[l.id]?.passed).length;
  return { completed, total, pct: total ? (completed / total) * 100 : 0 };
}
