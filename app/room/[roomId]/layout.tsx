"use client";

import { use, type ReactNode } from "react";
import { Room } from "@/components/Room";

export default function RoomLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  return <Room roomId={roomId}>{children}</Room>;
}

