import { describe, it, expect } from "vitest";
import {
  LESSONS,
  courseProgress,
  evaluateChallenges,
  getLesson,
} from "../curriculum";
import { reviewOrder, accountSummary, OVERSIZED_PCT } from "../coach";
import { performanceStats } from "../portfolio";

const emptyState = {
  trades: [], closed: [], positions: {}, equity: 100000, startingEquity: 100000,
};

describe("curriculum shape", () => {
  it("every lesson is well formed", () => {
    for (const l of LESSONS) {
      expect(l.id).toBeTruthy();
      expect(l.title).toBeTruthy();
      expect(l.sections.length).toBeGreaterThan(0);
      expect(l.keyPoints.length).toBeGreaterThan(0);
      expect(typeof l.challenge.check).toBe("function");
    }
  });

  it("lesson ids are unique", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every quiz answer indexes a real option", () => {
    for (const l of LESSONS) {
      for (const q of l.quiz) {
        expect(q.options[q.answer]).toBeDefined();
        expect(q.explanation).toBeTruthy();
      }
    }
  });

  it("looks lessons up by id", () => {
    expect(getLesson(LESSONS[0].id).title).toBe(LESSONS[0].title);
    expect(getLesson("nope")).toBeNull();
  });
});

describe("challenge evaluation", () => {
  it("nothing passes on a fresh account", () => {
    const results = evaluateChallenges(emptyState);
    expect(Object.values(results).every((r) => r.passed === false)).toBe(true);
  });

  it("never throws even on malformed state", () => {
    expect(() => evaluateChallenges({})).not.toThrow();
  });

  it("passes the first-trade challenge after a buy", () => {
    const results = evaluateChallenges({
      ...emptyState,
      trades: [{ type: "buy", token: "BTC", amount: 1, price: 100, timestamp: 1 }],
    });
    expect(results["what-is-a-market"].passed).toBe(true);
  });

  it("passes the sizing challenge only for a small enough order", () => {
    const big = evaluateChallenges({
      ...emptyState,
      trades: [{ type: "buy", token: "BTC", amount: 1, price: 50000, timestamp: 1 }],
    });
    expect(big["position-sizing"].passed).toBe(false);

    const small = evaluateChallenges({
      ...emptyState,
      trades: [{ type: "buy", token: "BTC", amount: 1, price: 5000, timestamp: 1 }],
    });
    expect(small["position-sizing"].passed).toBe(true);
  });

  it("requires three closed trades for the track-record challenge", () => {
    const two = evaluateChallenges({ ...emptyState, closed: [{}, {}] });
    expect(two["track-record"].passed).toBe(false);
    const three = evaluateChallenges({ ...emptyState, closed: [{}, {}, {}] });
    expect(three["track-record"].passed).toBe(true);
  });

  it("requires two held tokens to diversify", () => {
    const one = evaluateChallenges({
      ...emptyState, positions: { BTC: { symbol: "BTC", quantity: 1 } },
    });
    expect(one["risk-of-ruin"].passed).toBe(false);

    const two = evaluateChallenges({
      ...emptyState,
      positions: {
        BTC: { symbol: "BTC", quantity: 1 },
        ETH: { symbol: "ETH", quantity: 1 },
      },
    });
    expect(two["risk-of-ruin"].passed).toBe(true);
  });

  it("ignores sold-out positions when checking diversification", () => {
    const results = evaluateChallenges({
      ...emptyState,
      positions: {
        BTC: { symbol: "BTC", quantity: 1 },
        ETH: { symbol: "ETH", quantity: 0 },
      },
    });
    expect(results["risk-of-ruin"].passed).toBe(false);
  });
});

describe("courseProgress", () => {
  it("reports 0 and 100 percent correctly", () => {
    expect(courseProgress({})).toMatchObject({ completed: 0, pct: 0 });
    const all = Object.fromEntries(LESSONS.map((l) => [l.id, { passed: true }]));
    expect(courseProgress(all)).toMatchObject({
      completed: LESSONS.length, pct: 100,
    });
  });
});

describe("coach.reviewOrder", () => {
  it("flags an oversized position as dangerous", () => {
    const notes = reviewOrder({
      type: "buy", symbol: "BTC", total: 50000, equity: 100000, cash: 100000,
    });
    const n = notes.find((x) => x.id === "oversized");
    expect(n?.level).toBe("danger");
    expect(n.message).toMatch(/50%/);
  });

  it("praises a well-sized position", () => {
    const notes = reviewOrder({
      type: "buy", symbol: "BTC", total: 5000, equity: 100000, cash: 100000,
    });
    expect(notes.find((x) => x.id === "well-sized")?.level).toBe("good");
  });

  it("warns when adding to an existing position", () => {
    const notes = reviewOrder({
      type: "buy", symbol: "BTC", total: 1000, equity: 100000, cash: 100000,
      position: { quantity: 1, avgCost: 90000 },
    });
    expect(notes.some((x) => x.id === "adding")).toBe(true);
  });

  it("warns about leaving no cash buffer", () => {
    const notes = reviewOrder({
      type: "buy", symbol: "BTC", total: 9900, equity: 10000, cash: 10000,
    });
    expect(notes.some((x) => x.id === "no-dry-powder")).toBe(true);
  });

  it("detects a three-trade losing streak", () => {
    const closed = [
      { pnl: -1, timestamp: 3 }, { pnl: -2, timestamp: 2 }, { pnl: -3, timestamp: 1 },
    ];
    const notes = reviewOrder({
      type: "buy", symbol: "BTC", total: 100, equity: 100000, cash: 100000, closed,
    });
    expect(notes.some((x) => x.id === "losing-streak")).toBe(true);
  });

  it("uses the documented oversized threshold", () => {
    const below = reviewOrder({
      type: "buy", symbol: "BTC",
      total: (OVERSIZED_PCT - 1) * 1000, equity: 100000, cash: 100000,
    });
    expect(below.some((x) => x.id === "oversized")).toBe(false);
  });
});

describe("coach.accountSummary", () => {
  it("prompts a learner with no closed trades", () => {
    const s = accountSummary({
      stats: performanceStats([]), equity: 100000, startingEquity: 100000,
    });
    expect(s).toMatch(/no closed trades/i);
  });

  it("reports a profitable account", () => {
    const stats = performanceStats([{ pnl: 100, timestamp: 1 }, { pnl: 50, timestamp: 2 }]);
    const s = accountSummary({ stats, equity: 110000, startingEquity: 100000 });
    expect(s).toMatch(/10\.0%/);
  });
});
