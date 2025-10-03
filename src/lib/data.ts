import type { MessageType, Blog } from "./types";
import { getFallbackBlogs } from "./blogService"; // Uses the client-safe service

export function generateInitialMessages(markdownBlogs?: Blog[]): MessageType[] {
  let blogsToDisplay: Blog[];

  if (markdownBlogs && markdownBlogs.length > 0) {
    blogsToDisplay = markdownBlogs;
  } else {
    console.warn("No markdown blogs provided or found. Using fallback blogs for initial messages.");
    blogsToDisplay = getFallbackBlogs();
  }

  return [
    {
      id: "1",
      content: "yo, soumya here.",
      type: "text",
      sender: "assistant",
    },
    {
      id:"1.1",
      content: "",
      photos: [
        {
          src: "/me.jpg",
          alt: "Soumya's photo",
          caption: "Giving a small talk"
          
        },
        // {
        //   src: "/me3.jpg",
        //   alt: "Soumya's second photo",
        //   caption: "Mirror selfie vibes",
        // },
      ],
      type: "photos",
      sender: "assistant",

    },
    {
      id: "1.2",
      content: "i make cool stuff & products.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "2",
      content: "big on open source.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "2.1",
      content: "ppl say i'm good at crafting interfaces",
      type: "text",
      sender: "assistant",
    },
    {
      id: "2.2",
      content: "also kinda obsessed w/ software, tech and Cybersecurity stuff tbh.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "3",
      content: "i drop some thoughts on my blog sometimes. check it:",
      type: "blog",
      blogs: blogsToDisplay,
      sender: "assistant",
    },
    {
      id: "4",
      content: "music's my vibe. heavy into edm, pop.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "4.1",
      content: "u might catch my spotify live if u check back later.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "4.2",
      content: "for now, here's a taste:",
      type: "text",
      sender: "assistant",
    },
    {
      id: "4.3",
      content: "",
      type: "music",
      sender: "assistant",
    },
    {
      id: "5",
      content: "based in india rn.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "5.1",
      content: "",
      type: "location",
      location: {
        city: "Howrah, WB, India",
      },
      sender: "assistant",
    },
    {
      id: "6",
      content: "find me on social media:",
      type: "text",
      sender: "assistant",
    },
    {
      id: "6.1",
      type: "social",
      content: "Check out my GitHub profile",
      preview: {
        url: "https://github.com/SoumyaEXE",
        title: "SoumyaEXE (@SoumyaEXE) • GitHub",
        siteName: "GitHub",
        favicon: "/favicon/github.svg"
      },
      sender: "assistant"
    },
    {
      id: "6.2",
      type: "social",
      content: "Connect with me on LinkedIn",
      preview: {
        url: "https://www.linkedin.com/in/isoumyadeyy",
        title: "Soumyadeep Dey (@isoumyadeyy) • LinkedIn",
        siteName: "LinkedIn",
        favicon: "/favicon/linkedin.svg"
      },
      sender: "assistant"
    },
    {
      id: "6.3",
      type: "social",
      content: "Follow me on Instagram",
      preview: {
        url: "https://instagram.com/7n7vc",
        title: "7n7vc (@7n7vc) • Instagram",
        siteName: "Instagram",
        favicon: "/favicon/instagram.svg"
      },
      sender: "assistant"
    },
    {
      id: "6.4",
      type: "text",
      content: "building some cool projects gng, will showcase soon to y'all chat haha!",
      sender: "assistant"
    },
    {
      id: "7",
      content: "hmu if u wanna connect.",
      type: "text",
      sender: "assistant",
    },
    {
      id: "7.1",
      content: "down to chat about new ideas or just whatever, fr.",
      type: "text",
      sender: "assistant",
    },
  ];
}