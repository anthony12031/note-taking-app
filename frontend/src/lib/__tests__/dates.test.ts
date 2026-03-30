import { formatLastEdited, formatRelativeDate } from "@/lib/dates";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 29, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns \"today\" for today's date", () => {
    expect(
      formatRelativeDate(new Date(2026, 2, 29, 8, 30, 0).toISOString())
    ).toBe("today");
  });

  it('returns "yesterday" for yesterday', () => {
    expect(
      formatRelativeDate(new Date(2026, 2, 28, 18, 0, 0).toISOString())
    ).toBe("yesterday");
  });

  it("returns Month Day for older dates", () => {
    expect(
      formatRelativeDate(new Date(2026, 1, 1, 12, 0, 0).toISOString())
    ).toBe("February 1");
  });

  it("returns empty string for invalid input", () => {
    expect(formatRelativeDate("not-a-date")).toBe("");
  });
});

describe("formatLastEdited", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 29, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Last Edited: Month Day, Year at H:MMam/pm"', () => {
    expect(formatLastEdited(new Date(2026, 2, 15, 14, 5, 0).toISOString())).toBe(
      "Last Edited: March 15, 2026 at 2:05pm"
    );
  });

  it("returns empty string for invalid input", () => {
    expect(formatLastEdited("invalid")).toBe("");
  });
});
