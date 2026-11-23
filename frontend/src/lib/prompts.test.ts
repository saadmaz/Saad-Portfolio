import { describe, expect, it } from "vitest";
import {
  copyAllText,
  fillVariables,
  groupByStage,
  promptsFileName,
  promptsMarkdown,
  promptsText,
  promptVariables,
  withoutPromptHeadings,
  type ArticlePrompt,
} from "./prompts";

const prompt = (over: Partial<ArticlePrompt>): ArticlePrompt => ({
  id: "prompt-01",
  number: 1,
  title: "Prompt",
  stage: "",
  language: "",
  text: "",
  description: "",
  usage: "",
  note: "",
  variables: [],
  ...over,
});

describe("promptVariables (same vectors as the admin)", () => {
  it.each([
    ["Build [PROJECT IDEA] with [TECH STACK] then [PROJECT IDEA] again", ["PROJECT IDEA", "TECH STACK"]],
    [
      "Fix [ERROR MESSAGE] in [TASK / FEATURE] using [API NAME]",
      ["ERROR MESSAGE", "TASK / FEATURE", "API NAME"],
    ],
    ["- [ ] todo, - [x] done, [link](https://x.y), [lowercase], [A]", []],
  ])("%s", (text, vars) => expect(promptVariables(text)).toEqual(vars));
});

describe("fillVariables", () => {
  it("replaces filled values everywhere and keeps blanks as placeholders", () => {
    expect(
      fillVariables("Build [PROJECT IDEA] on [TECH STACK]. Again: [PROJECT IDEA].", {
        "PROJECT IDEA": "  a todo app ",
        "TECH STACK": "   ",
      }),
    ).toBe("Build a todo app on [TECH STACK]. Again: a todo app.");
  });

  it("leaves checkboxes and links alone", () => {
    const text = "- [ ] step [link](https://x.y) [NAME]";
    expect(fillVariables(text, { NAME: "Sam" })).toBe("- [ ] step [link](https://x.y) Sam");
  });
});

const prompts = [
  prompt({
    id: "a",
    number: 1,
    title: "PRD Creation",
    stage: "Stage 1: Planning",
    text: "Write a PRD for [IDEA].\n\n  - keep it short",
  }),
  prompt({
    id: "b",
    number: 2,
    title: "Tech Spec",
    stage: "Stage 1: Planning",
    text: "Spec it.",
    description: "From the PRD",
    usage: "Paste after prompt 01",
    note: "Review",
  }),
  prompt({
    id: "c",
    number: 10,
    title: "Ship",
    stage: "Stage 2: Build",
    text: "```bash\nnpm run build\n```",
    language: "markdown",
  }),
];

describe("groupByStage", () => {
  it("groups consecutive prompts by stage in order", () => {
    expect(groupByStage(prompts).map((g) => [g.stage, g.items.length])).toEqual([
      ["Stage 1: Planning", 2],
      ["Stage 2: Build", 1],
    ]);
  });
});

describe("copyAllText", () => {
  it("uses the stage / numbered prompt / separator format", () => {
    expect(copyAllText(prompts)).toBe(
      [
        "# Stage 1: Planning",
        "## Prompt 01: PRD Creation",
        "Write a PRD for [IDEA].\n\n  - keep it short",
        "---",
        "## Prompt 02: Tech Spec",
        "Spec it.",
        "---",
        "# Stage 2: Build",
        "## Prompt 10: Ship",
        "```bash\nnpm run build\n```",
        "---",
      ].join("\n\n") + "\n",
    );
  });

  it("omits stage headings for prompts without a stage", () => {
    expect(copyAllText([prompt({ title: "Solo", text: "x" })])).toBe("## Prompt 01: Solo\n\nx\n\n---\n");
  });
});

describe("promptsMarkdown", () => {
  const md = promptsMarkdown({ title: "Ship faster", author: "Saad", url: "https://x.y/blog/a" }, prompts);

  it("starts with title and author", () => {
    expect(md.startsWith("# Ship faster\n\nBy Saad · <https://x.y/blog/a>\n\n## Stage 1: Planning")).toBe(
      true,
    );
  });

  it("keeps prompt text verbatim inside a fence longer than any inner backticks", () => {
    expect(md).toContain("````markdown\n```bash\nnpm run build\n```\n````");
    expect(md).toContain("```\nWrite a PRD for [IDEA].\n\n  - keep it short\n```");
  });

  it("includes description, usage and notes", () => {
    expect(md).toContain(
      "### Prompt 02: Tech Spec\n\nFrom the PRD\n\n```\nSpec it.\n```\n\n**How to use:** Paste after prompt 01\n\n**Note:** Review",
    );
  });
});

describe("promptsText", () => {
  it("is plain text with stages, numbering and the original indentation", () => {
    const txt = promptsText({ title: "Ship faster", author: "Saad" }, prompts);
    expect(txt.startsWith("SHIP FASTER\n\nBy Saad\n\n")).toBe(true);
    expect(txt).toContain("STAGE 1: PLANNING");
    expect(txt).toContain(
      "PROMPT 01: PRD Creation\n-----------------------\n\nWrite a PRD for [IDEA].\n\n  - keep it short",
    );
    expect(txt).not.toContain("**");
  });
});

describe("promptsFileName", () => {
  it.each([
    ["Ship Faster: Part 2!", "md", "ship-faster-part-2-prompts.md"],
    ["Café prompts", "txt", "cafe-prompts-prompts.txt"],
    ["!!!", "md", "article-prompts.md"],
  ] as const)("%s", (title, ext, name) => expect(promptsFileName(title, ext)).toBe(name));
});

describe("withoutPromptHeadings", () => {
  const prompts = [{ title: "Product Requirements Document (PRD)" }, { title: "Database Design" }];
  it("drops headings that just repeat a prompt title, keeps the rest", () => {
    const headings = [
      { text: "STAGE 1: PRODUCT PLANNING" },
      { text: "Prompt 01: Product Requirements Document (PRD)" },
      { text: "Prompt 04 – Database Design" },
      { text: "Database Design principles explained" },
      { text: "Final thoughts" },
    ];
    expect(withoutPromptHeadings(headings, prompts).map((h) => h.text)).toEqual([
      "STAGE 1: PRODUCT PLANNING",
      "Database Design principles explained",
      "Final thoughts",
    ]);
  });

  it("changes nothing without prompts", () => {
    const headings = [{ text: "Prompt 01: X" }];
    expect(withoutPromptHeadings(headings, [])).toBe(headings);
  });
});
