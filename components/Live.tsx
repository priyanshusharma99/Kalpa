import React, { useCallback, useEffect, useState } from "react";
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@liveblocks/react";

import CursorChat from "@/components/cursor/CursorChat";
import LiveCursors from "@/components/cursor/LiveCursors";
import FlyingReaction from "@/components/reaction/FlyingReaction";
import ReactionSelector from "@/components/reaction/ReactionButton";
import useInterval from "@/hooks/useInterval";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";

const Live = () => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const broadcast = useBroadcastEvent();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });

  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  useInterval(() => {
    setReactions((current) => current.filter((reaction) => reaction.timestamp > Date.now() - 4000));
  }, 1000);

  useInterval(() => {
    if (cursorState.mode !== CursorMode.Reaction || !cursorState.isPressed || !cursor) return;

    const reaction: Reaction = {
      point: { x: cursor.x, y: cursor.y },
      value: cursorState.reaction,
      timestamp: Date.now(),
    };
    setReactions((current) => [...current, reaction]);
    broadcast({ x: cursor.x, y: cursor.y, value: cursorState.reaction });
  }, 100);

  useEventListener(({ event }) => {
    const reactionEvent = event as ReactionEvent;
    setReactions((current) => [
      ...current,
      {
        point: { x: reactionEvent.x, y: reactionEvent.y },
        value: reactionEvent.value,
        timestamp: Date.now(),
      },
    ]);
  });

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "/") {
        setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
      } else if (event.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (event.key.toLowerCase() === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") event.preventDefault();
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    if (cursorState.mode !== CursorMode.ReactionSelector) {
      const rect = event.currentTarget.getBoundingClientRect();
      updateMyPresence({ cursor: { x: event.clientX - rect.x, y: event.clientY - rect.y } });
    }
  }, [cursorState.mode, updateMyPresence]);

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    updateMyPresence({ cursor: { x: event.clientX - rect.x, y: event.clientY - rect.y } });
    setCursorState((state) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state);
  }, [cursorState.mode, updateMyPresence]);

  const handlePointerUp = useCallback(() => {
    setCursorState((state) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state);
  }, [cursorState.mode]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative flex h-screen w-full items-center justify-center border-2 border-green-50 text-center"
      style={{ cursor: cursorState.mode === CursorMode.Chat ? "none" : "auto" }}
    >
      <h1 className="text-xl text-white">Hello World!!</h1>
      {reactions.map((reaction) => (
        <FlyingReaction
          key={reaction.timestamp}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}
      {cursorState.mode === CursorMode.ReactionSelector && <ReactionSelector setReaction={setReaction} />}
      <LiveCursors others={others} />
    </div>
  );
}

export default Live;
