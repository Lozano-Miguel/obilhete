import Image from "next/image";
import Link from "next/link";

// Real analyzed profile shown as a live example on the landing page.
const SAMPLE = {
  username: "mikasss",
  displayName: ":3",
  avatarUrl:
    "https://a.ltrbxd.com/resized/avatar/upload/1/3/5/1/3/9/0/7/shard/avtr-0-220-0-220-crop.jpg?v=2cf096e94c",
  personalityTag: "Cinéfilo em descoberta",
  totalFilms: 219,
  topDirector: "Yorgos Lanthimos",
  topGenre: "Drama",
};

export function ProfilePreview() {
  return (
    <div className="w-full max-w-md">
      <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111111] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <div className="flex items-center gap-3">
            <Image
              src={SAMPLE.avatarUrl}
              alt={`Avatar de ${SAMPLE.displayName}`}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-[#ffffff]">
                {SAMPLE.displayName}
              </p>
              <p className="text-xs text-[#888888]">
                {SAMPLE.totalFilms.toLocaleString("pt-PT")} filmes vistos
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[rgba(232,197,71,0.4)] px-3 py-1 text-[11px] font-medium text-[#e8c547]">
            {SAMPLE.personalityTag}
          </span>
        </div>

        {/* Perforation: dashed line with side notches, like a torn ticket stub */}
        <div className="relative" aria-hidden>
          <div className="mx-5 border-t border-dashed border-[rgba(255,255,255,0.15)]" />
          <div className="absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-r border-[rgba(255,255,255,0.08)] bg-[#0a0a0a]" />
          <div className="absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-l border-[rgba(255,255,255,0.08)] bg-[#0a0a0a]" />
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5 text-left">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#888888]">
              Realizador favorito
            </p>
            <p className="mt-1 text-sm font-medium text-[#ffffff]">
              {SAMPLE.topDirector}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#888888]">
              Género favorito
            </p>
            <p className="mt-1 text-sm font-medium text-[#ffffff]">
              {SAMPLE.topGenre}
            </p>
          </div>
        </div>

        <Link
          href={`/${SAMPLE.username}`}
          className="block rounded-b-2xl border-t border-[rgba(255,255,255,0.08)] px-6 py-3 text-center text-xs font-medium text-[#e8c547] transition-colors hover:bg-[rgba(232,197,71,0.06)]"
        >
          Vê o perfil completo →
        </Link>
      </div>
      <p className="mt-3 text-center text-[11px] text-[#888888]">
        Exemplo real: o perfil do criador
      </p>
    </div>
  );
}
