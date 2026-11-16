// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      cursorColor: string;
      message: string | null;
      editingText: string | null;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      canvasObjects: import("@liveblocks/client").LiveMap<string, any>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        // Example properties, for useSelf, useUser, useOthers, etc.
        // name: string;
        name?: string;
        avatar?: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {
      x: number;
      y: number;
      value: string;
    };
      // Example has two events, using a union
      // | { type: "PLAY" } 
      // | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {
      x: number;
      y: number;
      resolved: boolean;
      zIndex: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string;
      // url: string;
    };
  }
}

export {};
