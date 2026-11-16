"use client";

import { useMemo } from "react";
import { useOthers, useSelf } from "@liveblocks/react";

import Avatar from "./Avatar";

export default function ActiveUsers() {
  const others = useOthers();
  const self = useSelf();
  const visibleOthers = others.slice(0, 2);

  const users = useMemo(
    () => [
      ...(self ? [{ id: self.connectionId, name: self.info?.name || "You", current: true }] : []),
      ...visibleOthers.map((user) => ({
        id: user.connectionId,
        name: user.info?.name || `Designer ${user.connectionId}`,
        current: false,
      })),
    ],
    [self, visibleOthers]
  );

  return (
    <div className="flex items-center justify-end gap-1" aria-label={`${others.length + (self ? 1 : 0)} active users`}>
      {users.map((user) => (
        <Avatar key={user.id} connectionId={user.id} name={user.name} highlighted={user.current} />
      ))}
      {others.length > 2 && (
        <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-grey-100 text-xs text-white">
          +{others.length - 2}
        </span>
      )}
    </div>
  );
}
