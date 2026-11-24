// Liveblocks types configuration
declare global {
  interface Liveblocks {
    // user presence (cursor, chat wagera)
    Presence: {
      cursor: { x: number; y: number } | null;
      cursorColor: string;
      message: string | null;
      editingText: string | null;
    };

    // room ka shared storage tree
    Storage: {
      canvasObjects: import("@liveblocks/client").LiveMap<string, any>;
    };

    // auth endpoint se aane wala user info
    UserMeta: {
      id: string;
      info: {
        name?: string;
        avatar?: string;
      };
    };

    // broadcast events (flying reactions ke liye)
    RoomEvent: {
      x: number;
      y: number;
      value: string;
    };

    // canvas comments ke spatial coords
    ThreadMetadata: {
      x: number;
      y: number;
      resolved: boolean;
      zIndex: number;
    };

    RoomInfo: {};
  }
}

export {};
