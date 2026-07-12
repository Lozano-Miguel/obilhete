import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the shared postgres connection so the route can be exercised without a DB.
const sqlMock = vi.fn();
vi.mock("@/lib/db", () => ({ default: (...args: unknown[]) => sqlMock(...args) }));

async function loadGET() {
  const mod = await import("./route");
  return mod.GET;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

beforeEach(() => {
  sqlMock.mockReset();
});

describe("GET /api/health", () => {
  it("returns 200 and status ok when DB and scraper are reachable", async () => {
    sqlMock.mockResolvedValue([{ "?column?": 1 }]);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200 }) as unknown as Response),
    );

    const GET = await loadGET();
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.db).toBe("up");
    expect(body.scraper).toBe("up");
  });

  it("returns 503 and status error when the DB ping fails", async () => {
    sqlMock.mockRejectedValue(new Error("connection refused"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200 }) as unknown as Response),
    );

    const GET = await loadGET();
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.db).toBe("down");
  });

  it("stays 200 but reports scraper down when only the scraper is unreachable", async () => {
    sqlMock.mockResolvedValue([{ "?column?": 1 }]);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("scraper unreachable");
      }),
    );

    const GET = await loadGET();
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.scraper).toBe("down");
  });
});
