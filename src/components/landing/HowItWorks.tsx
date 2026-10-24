import { cardClass } from "@/components/ui/styles";

const STEPS = [
  { n: "01", title: "Enter a username", body: "Any public GitHub account. No sign-in, no permissions, nothing to install." },
  { n: "02", title: "We scout your repos", body: "Commits, stars, pull requests, languages and reviews become six ratings and a position." },
  { n: "03", title: "Walk out and share", body: "Open your pack, get your card, and post it or drop it in your README." },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6">
      <p className="mono-label text-xs text-accent">How it works</p>
      <h2 className="display mt-3 text-5xl font-extrabold sm:text-6xl">From commits to caps</h2>
      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className={`${cardClass} p-6`}>
            <span className="mono-label text-xs text-accent">{s.n}</span>
            <h3 className="display mt-4 text-3xl font-bold">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
