import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDirectorPhoto,
  getFilmDetails,
  searchFilm,
} from "@/lib/tmdb";

type FetchCall = { url: string; init?: RequestInit };

function mockFetch(responder: (url: string) => { ok?: boolean; status?: number; body: unknown }) {
  const calls: FetchCall[] = [];
  const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = input.toString();
    calls.push({ url, init });
    const r = responder(url);
    return {
      ok: r.ok ?? true,
      status: r.status ?? 200,
      json: async () => r.body,
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

beforeEach(() => {
  process.env.TMDB_API_KEY = "test-token";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchFilm", () => {
  it("calls /search/movie with query and year, returns the first result id", async () => {
    const calls = mockFetch(() => ({ body: { results: [{ id: 42 }] } }));
    const id = await searchFilm("Alien", 1979);
    expect(id).toBe(42);
    expect(calls[0].url).toContain("/search/movie");
    expect(calls[0].url).toContain("query=Alien");
    expect(calls[0].url).toContain("year=1979");
    expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-token",
    );
  });

  it("falls back to a no-year search when the year search is empty", async () => {
    const calls = mockFetch((url) =>
      url.includes("year=")
        ? { body: { results: [] } }
        : { body: { results: [{ id: 7 }] } },
    );
    const id = await searchFilm("Solaris", 1972);
    expect(id).toBe(7);
    expect(calls).toHaveLength(2);
  });

  it("returns null when TMDB fails (non-ok response)", async () => {
    mockFetch(() => ({ ok: false, status: 500, body: {} }));
    expect(await searchFilm("Whatever", 2000)).toBeNull();
  });

  it("returns null for an empty title without calling fetch", async () => {
    const calls = mockFetch(() => ({ body: {} }));
    expect(await searchFilm("   ", 2000)).toBeNull();
    expect(calls).toHaveLength(0);
  });
});

describe("getFilmDetails", () => {
  it("requests /movie/:id with credits and maps the fields", async () => {
    const calls = mockFetch(() => ({
      body: {
        id: 100,
        poster_path: "/poster.jpg",
        genres: [{ name: "Sci-Fi" }],
        production_countries: [{ name: "USA" }],
        spoken_languages: [{ english_name: "English" }],
        credits: {
          cast: [{ name: "A" }, { name: "B" }],
          crew: [{ job: "Director", name: "Ridley Scott" }],
        },
      },
    }));
    const details = await getFilmDetails(100);
    expect(calls[0].url).toContain("/movie/100");
    expect(calls[0].url).toContain("append_to_response=credits");
    expect(details).toMatchObject({
      tmdbId: 100,
      genres: ["Sci-Fi"],
      country: "USA",
      language: "English",
      director: "Ridley Scott",
      cast: ["A", "B"],
      posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
    });
  });

  it("returns just the id when the request fails", async () => {
    mockFetch(() => ({ ok: false, status: 404, body: {} }));
    expect(await getFilmDetails(55)).toEqual({ tmdbId: 55 });
  });
});

describe("getDirectorPhoto", () => {
  it("returns the profile image URL from the first person result", async () => {
    const calls = mockFetch(() => ({
      body: { results: [{ profile_path: "/face.jpg" }] },
    }));
    const url = await getDirectorPhoto("Ridley Scott");
    expect(calls[0].url).toContain("/search/person");
    expect(calls[0].url).toContain("query=Ridley");
    expect(url).toBe("https://image.tmdb.org/t/p/w185/face.jpg");
  });

  it("returns null when there is no profile path", async () => {
    mockFetch(() => ({ body: { results: [{}] } }));
    expect(await getDirectorPhoto("Nobody")).toBeNull();
  });
});
