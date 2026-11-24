import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// anon users ke liye random identity
const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];
const ADJECTIVES = [
  "Happy", "Creative", "Energetic", "Lively", "Dynamic",
  "Radiant", "Joyful", "Vibrant", "Cheerful", "Sunny",
];
const ANIMALS = [
  "Dolphin", "Tiger", "Elephant", "Penguin", "Kangaroo",
  "Panther", "Lion", "Cheetah", "Giraffe", "Panda",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: NextRequest) {
  try {
    // prod me yahan session check aayega, abhi dummy user bana rahe
    const userId = `user-${crypto.randomUUID()}`;
    const name = `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
    const color = pick(COLORS);

    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name,
        avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const { body: roomId } = await request.json().catch(() => ({ body: undefined })) as { body?: string };
    // filhal sabhi rooms ka access de rahe
    session.allow("*", session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
