"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap } from "@liveblocks/client";

export function Room({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          cursorColor: "#56FFA6",
          message: null,
          editingText: null,
        }}
        initialStorage={{ canvasObjects: new LiveMap() }}
      >
        <ClientSideSuspense fallback={<RoomLoading />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function RoomLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-primary-grey-200">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-green border-t-transparent" />
        <p className="text-sm text-primary-grey-300">Loading room…</p>
      </div>
    </div>
  );
}

