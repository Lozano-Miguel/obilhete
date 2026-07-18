import { afterEach, describe, expect, it, vi } from "vitest";
import { scrapeFilms, scrapeProfile } from "@/lib/letterboxd";

function mockFetchCapture() {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (url: string) => {
    calls.push(url);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        username: "x",
        displayName: "x",
        avatarUrl: null,
        totalFilms: 0,
        films: [],
        items: [],
      }),
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("scraper URL encoding", () => {
  it("encodes the username in the profile URL so it cannot alter the path", async () => {
    const calls = mockFetchCapture();
    await scrapeProfile("a/b");
    expect(calls[0]).toContain("/profile/a%2Fb");
    expect(calls[0]).not.toContain("/profile/a/b");
  });

  it("encodes the username in the films URL", async () => {
    const calls = mockFetchCapture();
    await scrapeFilms("a/b");
    expect(calls[0]).toContain("/films/a%2Fb");
  });
});
