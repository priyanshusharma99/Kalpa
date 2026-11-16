import React, { useCallback, useEffect, useState } from "react";
import { useBroadcastEvent, useCreateThread, useEventListener, useMyPresence, useOthers, useThreads } from "@liveblocks/react";
import { Thread } from "@liveblocks/react-ui";

import CursorChat from "@/components/cursor/CursorChat";
import LiveCursors from "@/components/cursor/LiveCursors";
import FlyingReaction from "@/components/reaction/FlyingReaction";
import ReactionSelector from "@/components/reaction/ReactionButton";
import useInterval from "@/hooks/useInterval";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import type { ActiveElement } from "@/types/type";

type LiveProps = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  activeElement: ActiveElement;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, activeElement, undo, redo }: LiveProps) => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const createThread = useCreateThread();
  const threadResult = useThreads();
  const threads = threadResult.threads ?? [];
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [commentPoint, setCommentPoint] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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
    const x = event.clientX - rect.x;
    const y = event.clientY - rect.y;
    updateMyPresence({ cursor: { x, y } });
    if (activeElement?.value === "comments") {
      setCommentPoint({ x, y });
      setCommentText("");
      return;
    }
    setCursorState((state) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state);
  }, [activeElement?.value, cursorState.mode, updateMyPresence]);

  const handlePointerUp = useCallback(() => {
    setCursorState((state) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state);
  }, [cursorState.mode]);

  const submitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentPoint || !commentText.trim()) return;
    createThread({
      body: { version: 1, content: [{ type: "paragraph", children: [{ text: commentText.trim() }] }] },
      metadata: { x: commentPoint.x, y: commentPoint.y, resolved: false, zIndex: Date.now() },
    });
    setCommentPoint(null);
    setCommentText("");
  };

  const chooseContextAction = (action: string) => {
    setContextMenu(null);
    if (action === "Chat") setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
    if (action === "Reactions") setCursorState({ mode: CursorMode.ReactionSelector });
    if (action === "Undo") undo();
    if (action === "Redo") redo();
  };

  return (
    <div
      id="canvas"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY });
      }}
      onClick={() => contextMenu && setContextMenu(null)}
      className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#1b1f27]"
      style={{ cursor: cursorState.mode === CursorMode.Chat ? "none" : activeElement?.value === "comments" ? "crosshair" : "auto" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
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
      {threads.filter((thread) => !thread.metadata.resolved).map((thread) => (
        <div key={thread.id} className="absolute z-20 w-72" style={{ left: thread.metadata.x, top: thread.metadata.y, zIndex: thread.metadata.zIndex }}>
          <Thread thread={thread} />
        </div>
      ))}
      {commentPoint && (
        <form onSubmit={submitComment} className="absolute z-40 w-64 rounded-lg border border-primary-grey-100 bg-primary-black p-3 shadow-xl" style={{ left: Math.min(commentPoint.x, Math.max(0, (typeof window === "undefined" ? 0 : window.innerWidth) - 300)), top: commentPoint.y }} onPointerDown={(event) => event.stopPropagation()}>
          <label className="mb-2 block text-xs text-primary-grey-300" htmlFor="new-comment">Add a comment</label>
          <textarea id="new-comment" autoFocus value={commentText} onChange={(event) => setCommentText(event.target.value)} className="min-h-20 w-full resize-none rounded border border-primary-grey-100 bg-primary-grey-200 p-2 text-sm text-white outline-none focus:border-primary-green" placeholder="Write a comment…" />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCommentPoint(null)} className="rounded px-2 py-1 text-xs text-primary-grey-300 hover:bg-primary-grey-100">Cancel</button>
            <button type="submit" className="rounded bg-primary-green px-3 py-1 text-xs font-semibold text-primary-black">Send</button>
          </div>
        </form>
      )}
      {contextMenu && (
        <div className="fixed z-50 min-w-40 rounded-md border border-primary-grey-100 bg-primary-black p-1 shadow-xl" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}>
          {["Chat", "Reactions", "Undo", "Redo"].map((action) => <button key={action} type="button" onClick={() => chooseContextAction(action)} className="block w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-primary-grey-100">{action}</button>)}
        </div>
      )}
    </div>
  );
}

export default Live;
