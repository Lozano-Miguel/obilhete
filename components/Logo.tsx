import Link from "next/link";

// Cinema ticket mark: rounded stub with side notches and a perforation line.
export function TicketMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <g transform="rotate(-10 16 16)">
        <path
          d="M6 8 H26 A3 3 0 0 1 29 11 V13.5 A2.5 2.5 0 0 0 29 18.5 V21 A3 3 0 0 1 26 24 H6 A3 3 0 0 1 3 21 V18.5 A2.5 2.5 0 0 0 3 13.5 V11 A3 3 0 0 1 6 8 Z"
          fill="#e8c547"
        />
        <path
          d="M21 11 V21"
          stroke="#0a0a0a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2.5"
        />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 text-[#ffffff] ${className ?? ""}`}
    >
      <TicketMark className="h-6 w-6" />
      <span className="text-[15px] font-semibold tracking-tight">
        O Bilhete
      </span>
    </Link>
  );
}
