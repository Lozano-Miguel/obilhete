const steps = [
  {
    n: "01",
    title: "Introduz o teu perfil",
    description:
      "Cola o link do teu perfil do Letterboxd ou escreve o nome de utilizador.",
  },
  {
    n: "02",
    title: "Analisamos os teus filmes",
    description:
      "Lemos os filmes que viste: realizadores, géneros, décadas e países.",
  },
  {
    n: "03",
    title: "Descobre o teu gosto",
    description:
      "Recebes o teu retrato cinéfilo e sugestões do que ver a seguir.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-t border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] px-6 py-20 md:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <div className="relative flex flex-col gap-0 md:flex-row md:items-start md:justify-between md:gap-6">
          <div
            className="pointer-events-none absolute left-[14%] right-[14%] top-[3.25rem] hidden h-px bg-[#e8c547] md:block"
            aria-hidden
          />

          {steps.map((step, i) => (
            <div key={step.n} className="relative z-10 flex flex-1 flex-col items-center">
              {i > 0 ? (
                <div
                  className="my-6 h-10 w-px shrink-0 bg-[#e8c547] md:hidden"
                  aria-hidden
                />
              ) : null}

              <div className="relative flex w-full max-w-sm flex-col items-center px-2 text-center">
                <div className="relative flex min-h-[5.5rem] w-full items-center justify-center py-2">
                  <span
                    className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[5rem] font-extralight leading-none tracking-tight text-[#e8c547] opacity-30 md:text-[6rem]"
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <h2 className="relative z-10 max-w-[14rem] text-lg font-semibold leading-snug text-[#ffffff] md:max-w-none">
                    {step.title}
                  </h2>
                </div>
                <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-[#888888]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
