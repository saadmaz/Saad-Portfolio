export interface BlogMetadata {
  title: string;
  author: string;
  publishedDate: string; // Format: YYYY-MM-DD
  updatedDate?: string;  // Format: YYYY-MM-DD (optional)
  excerpt: string;
  coverImage: string;    // URL or path to image
  tags?: string[];       // Optional: for categorization
  slug: string;          // URL-friendly slug
}

export interface BlogPost {
  metadata: BlogMetadata;
  content: React.ReactNode;
}

export interface BlogCardProps {
  metadata: BlogMetadata;
  slug: string;
}