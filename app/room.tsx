"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap } from "@liveblocks/client";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id="my-room"
        initialPresence={{ cursor: null, cursorColor: "#56FFA6", message: null, editingText: null }}
        initialStorage={{ canvasObjects: new LiveMap() }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
