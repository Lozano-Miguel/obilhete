import { describe, expect, it } from "vitest";
import { isValidLetterboxdUsername } from "@/lib/validation";

describe("isValidLetterboxdUsername", () => {
  it("accepts a normal username", () => {
    expect(isValidLetterboxdUsername("miguel")).toBe(true);
  });

  it("accepts letters, digits and underscores within 2-15 chars", () => {
    expect(isValidLetterboxdUsername("a_b12")).toBe(true);
    expect(isValidLetterboxdUsername("ab")).toBe(true);
    expect(isValidLetterboxdUsername("fifteen_chars15")).toBe(true);
  });

  it("rejects a path traversal attempt", () => {
    expect(isValidLetterboxdUsername("../health")).toBe(false);
  });

  it("rejects a too-short (1 char) username", () => {
    expect(isValidLetterboxdUsername("a")).toBe(false);
  });

  it("rejects a username with special characters", () => {
    expect(isValidLetterboxdUsername("x?y")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidLetterboxdUsername("")).toBe(false);
  });

  it("rejects a username longer than 15 chars", () => {
    expect(isValidLetterboxdUsername("a".repeat(30))).toBe(false);
  });
});
