"use client";

import { AvatarStack, Cursors } from "@liveblocks/react-ui";

export function CollaborativeApp() {
  return (
    <div>
      <AvatarStack max={3} size={36} />
      <Cursors />
    </div>
  );
}