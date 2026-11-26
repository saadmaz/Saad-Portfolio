interface PostLike {
  category?: string;
  tags?: string[];
}

export function authorTopics(posts: PostLike[], limit?: number): string[];
export function authorFaq(
  author: { name?: string; bio?: string } | null | undefined,
  posts: PostLike[],
  opts?: { expertise?: string[] },
): { question: string; answer: string }[];
