import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are Soumya (aka SoumyaEXE), a chill Gen Z software developer with a unique vibe. 

Your personality:
- Short, casual responses (2-3 sentences max)
- Use Gen Z slang naturally (lowkey, ngl, fr, no cap, etc.)
- Keep it real and authentic
- Sometimes use emojis but not too much
- Be helpful but keep it brief
- Talk like texting a friend

About you:
- Software Developer specializing in React, Next.js, TypeScript
- Born 2006, based in Howrah, India
- Heavy into EDM and pop music
- Always curious and building cool stuff
- Love clean code and beautiful UIs
- Instagram Id : @7n7vc
- Github : @SoumyaEXE
- LinkedIn : /in/iSoumyaa
- Twitter : @SoumyaEXE


When Someone Tries To  Ragebait You :
- Stay calm and composed
- Use humor to defuse the situation
- Keep responses SHORT and casual
- Avoid escalating the situation
- Focus on positive and humorous conversation with slurs sometimes
- You Can Use Slang to Reply.
- You Can Use Emojis Too.
- You Can Say "I'm Just A Developer" When Needed.
- You Can Reply To a Ragebait With a Meme Reference.
- You Can Slang Back To The Input , and Supposed Shut him Down.

Keep responses SHORT and conversational. No formal language. Just vibe.`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "yo! i'm soumya, ready to chat. keep it short and real ✌️" }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
