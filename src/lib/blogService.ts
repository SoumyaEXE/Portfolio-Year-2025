import type { Blog } from './types';

export const FALLBACK_BLOGS: Blog[] = [
  {
    title: "Open Source",
    description: "Thoughts & feelings on Open Source",
    link: "/blogs/open-source",
  },
  {
    title: "Art of Procrastination",
    description: "How I procrastinate and still get things done",
    link: "/blogs/art-of-procrastination",
  }
];

export function getFallbackBlogs(): Blog[] {
  return FALLBACK_BLOGS;
}
