import { BlogMetadata } from "../types/blog";

export const metadata: BlogMetadata = {
  title: "Getting Started with React: A Beginner's Guide",
  author: "Your Name",
  publishedDate: "2025-01-24",
  updatedDate: "2025-01-25",
  excerpt:
    "Learn the fundamentals of React and build your first interactive component.",
  coverImage:
    "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
  tags: ["React", "JavaScript", "Web Development"],
  slug: "getting-started-with-react",
};

export const content = (
  <>
    <h2>Introduction</h2>
    <p>
      React is a JavaScript library for building user interfaces with reusable
      components. In this guide, we'll explore the basics.
    </p>

    <h2>Why React?</h2>
    <p>React offers several advantages:</p>
    <ul>
      <li>Component reusability</li>
      <li>Easy state management</li>
      <li>Large community and ecosystem</li>
    </ul>

    <img
      src="https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600"
      alt="React concept"
      style={{ margin: "2rem 0", borderRadius: "8px" }}
    />

    <blockquote style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "1rem" }}>
      "React makes creating interactive UIs painless. Design simple views for each
      state in your application."
    </blockquote>

    <h2>Getting Started</h2>
    <p>
      To start with React, you'll need Node.js installed on your machine. Then,
      create a new project using Vite or Create React App.
    </p>

    <h3>Installation</h3>
    <pre>
      <code>npm create vite@latest my-app -- --template react</code>
    </pre>

    <h2>Conclusion</h2>
    <p>
      React is powerful and fun to learn. Start small and build amazing things!
    </p>
  </>
);