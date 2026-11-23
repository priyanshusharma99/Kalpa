"use client";

import { use } from "react";
import Editor from "@/components/Editor";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  return <Editor roomId={roomId} />;
}
