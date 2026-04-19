"use client";

export function ShareCard({ username }: { username: string }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${encodeURIComponent(username)}`
      : `/${encodeURIComponent(username)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 text-sm font-medium">Partilhar</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 truncate rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/75">
          {url}
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Copiar link
        </button>
      </div>
    </div>
  );
}

