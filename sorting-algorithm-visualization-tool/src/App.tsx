import { useCallback, useEffect, useRef, useState } from "react";
import sortingLab from "./projects/sorting-lab.html?raw";
import syntaxDetective from "./projects/syntax-detective.html?raw";

type TabId = "sorting" | "syntax";

const TABS: { id: TabId; label: string; blurb: string; html: string; accent: string }[] = [
  {
    id: "sorting",
    label: "Sorting Lab",
    blurb: "Watch bubble, selection and insertion sort",
    html: sortingLab,
    accent: "#FFD66B",
  },
  {
    id: "syntax",
    label: "Syntax Error Detective",
    blurb: "Fix Python errors by dragging pieces",
    html: syntaxDetective,
    accent: "#FFD23F",
  },
];

const fromHash = (): TabId => (window.location.hash === "#syntax" ? "syntax" : "sorting");

function Project({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  const attach = useCallback(() => {
    const frame = ref.current;
    const doc = frame?.contentDocument;
    if (!frame || !doc?.body) return;
    const measure = () => setHeight(Math.ceil(doc.body.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(doc.body);
    // fonts and late layout can change the height after load
    doc.fonts?.ready.then(measure);
    frame.addEventListener("unload", () => ro.disconnect(), { once: true });
  }, []);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={html}
      onLoad={attach}
      scrolling="no"
      className="block w-full border-0"
      style={{ height }}
    />
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>(fromHash);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const choose = (id: TabId) => {
    window.history.replaceState(null, "", id === "syntax" ? "#syntax" : "#sorting");
    setTab(id);
    window.scrollTo({ top: 0 });
  };

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen bg-[#0B1F33]">
      <nav
        className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1F33]/95 backdrop-blur"
        aria-label="Projects"
      >
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
          <span className="text-sm font-extrabold tracking-tight text-white">
            Python, interactively
          </span>
          <div role="tablist" className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => choose(t.id)}
                  className={
                    "rounded-full border px-4 py-1.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 " +
                    (active
                      ? "border-transparent text-[#0B1F33]"
                      : "border-white/25 text-white/80 hover:border-white/60 hover:text-white")
                  }
                  style={active ? { background: t.accent } : undefined}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <span className="hidden text-sm text-white/55 md:inline">{current.blurb}</span>
        </div>
      </nav>
      <main>
        <Project key={tab} html={current.html} title={current.label} />
      </main>
    </div>
  );
}
