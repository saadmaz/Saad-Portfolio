/**
 * "About the author" answers for an author page, built from the author
 * profile and their articles so they never go stale. Shown on the page and
 * marked up as FAQPage (same text in both). Shared by AuthorPage.tsx and
 * scripts/prerender.mjs.
 */

const listNames = (names) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** Categories (then top tags) an author writes about, most frequent first. */
export function authorTopics(posts, limit = 6) {
  const count = new Map();
  for (const p of posts) {
    if (p.category) count.set(p.category, (count.get(p.category) ?? 0) + 3);
    for (const t of p.tags ?? []) count.set(t.replace(/-/g, " "), (count.get(t.replace(/-/g, " ")) ?? 0) + 1);
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([t]) => t);
}

export function authorFaq(author, posts, { expertise = [] } = {}) {
  if (!author?.name) return [];
  const faq = [];
  if (author.bio) faq.push({ question: `Who is ${author.name}?`, answer: author.bio });
  const topics = expertise.length ? expertise : authorTopics(posts);
  if (topics.length)
    faq.push({
      question: `What does ${author.name} write about?`,
      answer: `${listNames(topics)}. ${posts.length} ${posts.length === 1 ? "article" : "articles"} so far, each from hands-on work.`,
    });
  faq.push({
    question: `How can I contact ${author.name}?`,
    answer:
      "Through the contact page on this site, or by subscribing to the newsletter to hear about new articles.",
  });
  return faq;
}
