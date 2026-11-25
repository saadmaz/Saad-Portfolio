import { cn } from "@/lib/utils";

// Logos from Devicon (MIT), bundled locally so the strip never waits on a CDN.
const files = import.meta.glob<string>("@/assets/tools/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const LABELS: Record<string, string> = {
  amazonwebservices: "AWS",
  androidstudio: "Android Studio",
  cloudflare: "Cloudflare",
  css3: "CSS3",
  docker: "Docker",
  express: "Express",
  figma: "Figma",
  firebase: "Firebase",
  github: "GitHub",
  html5: "HTML5",
  intellij: "IntelliJ IDEA",
  java: "Java",
  javascript: "JavaScript",
  jest: "Jest",
  jupyter: "Jupyter",
  mongodb: "MongoDB",
  mysql: "MySQL",
  nextjs: "Next.js",
  nodejs: "Node.js",
  playwright: "Playwright",
  postgresql: "PostgreSQL",
  postman: "Postman",
  python: "Python",
  react: "React",
  rust: "Rust",
  supabase: "Supabase",
  tailwindcss: "Tailwind CSS",
  typescript: "TypeScript",
  vercel: "Vercel",
  vitejs: "Vite",
  vitest: "Vitest",
  vscode: "VS Code",
  vuejs: "Vue.js",
  web3js: "Web3.js",
};

const TOOLS = Object.entries(files)
  .map(([path, src]) => {
    const id = path.split("/").pop()!.split("-")[0].replace(".svg", "");
    return { id, src, label: LABELS[id] ?? id };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

function Row({ tools, reverse }: { tools: typeof TOOLS; reverse?: boolean }) {
  // Two copies so the -50% loop is seamless; the copy is hidden from assistive tech.
  const loop = [...tools, ...tools];
  return (
    <div className="group/row -my-4 overflow-hidden py-4 motion-reduce:overflow-x-auto">
      <ul
        className={cn(
          "flex w-max animate-marquee group-hover/row:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ animationDuration: `${tools.length * 4}s` }}
      >
        {loop.map((t, i) => {
          const copy = i >= tools.length;
          return (
            <li
              key={`${t.id}-${i}`}
              aria-hidden={copy || undefined}
              className={cn("shrink-0 pr-3 md:pr-4", copy && "motion-reduce:hidden")}
            >
              <div className="group flex h-[clamp(112px,14vw,148px)] w-[clamp(112px,14vw,148px)] flex-col items-center justify-center gap-3 rounded-[22px] border border-line-2 bg-surface/60 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-accent hover:bg-base hover:shadow-[0_18px_40px_-18px_rgb(255_95_0/0.45)]">
                <img
                  src={t.src}
                  alt=""
                  loading="lazy"
                  className="size-[clamp(36px,4.4vw,52px)] object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <span className="px-2 text-center text-[13px] font-medium leading-tight text-fg-2 group-hover:text-fg">
                  {t.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Two rows of tool logos drifting in opposite directions; each pauses on hover. */
export function ToolsMarquee() {
  const half = Math.ceil(TOOLS.length / 2);
  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <p className="sr-only">Tools I work with: {TOOLS.map((t) => t.label).join(", ")}.</p>
      <div aria-hidden className="flex flex-col gap-3 md:gap-4">
        <Row tools={TOOLS.slice(0, half)} />
        <Row tools={TOOLS.slice(half)} reverse />
      </div>
    </div>
  );
}
