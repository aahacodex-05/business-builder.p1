import { describe, expect, it } from "vitest";
import { describeOffset, dueReminder } from "./reminders";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date("2026-10-07T12:00:00Z");
const inFuture = (ms: number) => new Date(now.getTime() + ms);

describe("dueReminder", () => {
  it("sends nothing when the deadline is more than 7 days away", () => {
    expect(dueReminder(inFuture(8 * DAY), now, [])).toBeNull();
  });

  it("sends the 7-day alert once the window opens", () => {
    expect(dueReminder(inFuture(7 * DAY - HOUR), now, [])).toEqual({
      offsetMinutes: 7 * 24 * 60,
      coveredOffsets: [7 * 24 * 60],
    });
  });

  it("does not resend an alert already sent", () => {
    expect(dueReminder(inFuture(3 * DAY), now, [7 * 24 * 60])).toBeNull();
  });

  it("sends the 1-day alert after the 7-day one", () => {
    expect(dueReminder(inFuture(20 * HOUR), now, [7 * 24 * 60])?.offsetMinutes).toBe(24 * 60);
  });

  it("collapses missed windows into the most urgent alert", () => {
    expect(dueReminder(inFuture(30 * 60 * 1000), now, [])).toEqual({
      offsetMinutes: 60,
      coveredOffsets: [7 * 24 * 60, 24 * 60, 60],
    });
  });

  it("sends nothing once the deadline has passed", () => {
    expect(dueReminder(inFuture(-HOUR), now, [])).toBeNull();
  });
});

describe("describeOffset", () => {
  it("formats days and hours", () => {
    expect(describeOffset(7 * 24 * 60)).toBe("7 days");
    expect(describeOffset(24 * 60)).toBe("1 day");
    expect(describeOffset(60)).toBe("1 hour");
  });
});
