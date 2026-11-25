/**
 * Official homepages for skills and tools, shared by the /skills page and the
 * prerender (static HTML, JSON-LD, llms-full.txt). A `url` set on the skill in
 * the CMS always wins; this list only fills the gaps.
 */

/** "AWS (EC2, S3, IAM)" → "aws", "HTML5 & CSS3" → "html5css3", "React.js" → "reactjs". */
export const linkKey = (name = "") =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9+#]/g, "");

const LINKS = {
  anaconda: "https://www.anaconda.com",
  android: "https://developer.android.com",
  androidstudio: "https://developer.android.com/studio",
  angular: "https://angular.dev",
  angularjs: "https://angularjs.org",
  antigravity: "https://antigravity.google",
  apache: "https://httpd.apache.org",
  apify: "https://apify.com",
  aws: "https://aws.amazon.com",
  azure: "https://azure.microsoft.com",
  azuresqldatabase: "https://azure.microsoft.com/products/azure-sql/database",
  c: "https://en.wikipedia.org/wiki/C_(programming_language)",
  clarity: "https://clarity.microsoft.com",
  claude: "https://claude.ai",
  cloudflare: "https://www.cloudflare.com",
  codepen: "https://codepen.io",
  codex: "https://openai.com/codex",
  cpanel: "https://cpanel.net",
  css: "https://developer.mozilla.org/docs/Web/CSS",
  html5css3: "https://developer.mozilla.org/docs/Web/HTML",
  html: "https://developer.mozilla.org/docs/Web/HTML",
  cursor: "https://cursor.com",
  dart: "https://dart.dev",
  docker: "https://www.docker.com",
  emailjs: "https://www.emailjs.com",
  expo: "https://expo.dev",
  express: "https://expressjs.com",
  figma: "https://www.figma.com",
  firebase: "https://firebase.google.com",
  flask: "https://flask.palletsprojects.com",
  flutter: "https://flutter.dev",
  git: "https://git-scm.com",
  github: "https://github.com",
  gitlab: "https://about.gitlab.com",
  go: "https://go.dev",
  heroku: "https://www.heroku.com",
  huggingface: "https://huggingface.co",
  intellijidea: "https://www.jetbrains.com/idea",
  java: "https://dev.java",
  javascript: "https://developer.mozilla.org/docs/Web/JavaScript",
  jest: "https://jestjs.io",
  jira: "https://www.atlassian.com/software/jira",
  json: "https://www.json.org",
  jupyter: "https://jupyter.org",
  jwt: "https://jwt.io",
  k3os: "https://github.com/rancher/k3os",
  kalilinux: "https://www.kali.org",
  lovable: "https://lovable.dev",
  mongodb: "https://www.mongodb.com",
  mysql: "https://www.mysql.com",
  n8n: "https://n8n.io",
  neo4j: "https://neo4j.com",
  netbeans: "https://netbeans.apache.org",
  netlify: "https://www.netlify.com",
  next: "https://nextjs.org",
  nginx: "https://nginx.org",
  node: "https://nodejs.org",
  oauth: "https://oauth.net",
  ollama: "https://ollama.com",
  openapi: "https://www.openapis.org",
  opnsense: "https://opnsense.org",
  oracle: "https://www.oracle.com/database",
  playwright: "https://playwright.dev",
  postgresql: "https://www.postgresql.org",
  postman: "https://www.postman.com",
  python: "https://www.python.org",
  r: "https://www.r-project.org",
  railway: "https://railway.com",
  react: "https://react.dev",
  responsivewebdesign:
    "https://developer.mozilla.org/docs/Learn_web_development/Core/CSS_layout/Responsive_Design",
  restfulservices: "https://en.wikipedia.org/wiki/REST",
  rest: "https://en.wikipedia.org/wiki/REST",
  rust: "https://www.rust-lang.org",
  sanity: "https://www.sanity.io",
  slack: "https://slack.com",
  spring: "https://spring.io",
  supabase: "https://supabase.com",
  tailwindcss: "https://tailwindcss.com",
  typescript: "https://www.typescriptlang.org",
  ubuntu: "https://ubuntu.com",
  vercel: "https://vercel.com",
  visualstudio: "https://visualstudio.microsoft.com",
  vite: "https://vite.dev",
  vitest: "https://vitest.dev",
  vscode: "https://code.visualstudio.com",
  vue: "https://vuejs.org",
  web2py: "http://www.web2py.com",
  web3: "https://web3js.org",
  woocommerce: "https://woocommerce.com",
  yarn: "https://yarnpkg.com",
  datatables: "https://datatables.net",
};

/** The skill's own CMS link, else its known official homepage, else undefined. */
export function skillLink(skill) {
  const own = skill?.url?.trim();
  if (own && /^https?:\/\//i.test(own)) return own;
  const key = linkKey(skill?.name);
  // Exact key first so "AngularJS" is not folded into "Angular".
  return LINKS[key] ?? LINKS[key.replace(/js$/, "")];
}
