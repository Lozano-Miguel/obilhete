import { describe, expect, it } from "vitest";
import { normalizeTitle } from "@/lib/groq";

describe("normalizeTitle", () => {
  it("is case-insensitive", () => {
    expect(normalizeTitle("Avatar")).toBe(normalizeTitle("avatar"));
  });

  it("does not strip a leading article that is part of the first word", () => {
    // 'Avatar' must NOT become 'vatar'
    expect(normalizeTitle("Avatar")).not.toBe(normalizeTitle("Vatar"));
    expect(normalizeTitle("American History X")).not.toBe(
      normalizeTitle("merican History X"),
    );
  });

  it("strips a leading article word so 'The Matrix' matches 'Matrix'", () => {
    expect(normalizeTitle("The Matrix")).toBe(normalizeTitle("Matrix"));
    expect(normalizeTitle("A Ghost Story")).toBe(normalizeTitle("Ghost Story"));
  });

  it("removes punctuation and whitespace", () => {
    expect(normalizeTitle("Blade Runner!")).toBe(normalizeTitle("bladerunner"));
  });
});
