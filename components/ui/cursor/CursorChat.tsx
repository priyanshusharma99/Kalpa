import React from "react";
import { CursorChatProps, CursorMode } from "@/types/type";
import CursorSVG from "@/public/assets/CursorSVG";

const CursorChat = ({
    cursor,
    cursorState,
    setCursorState,
    updateMyPresence,
}: CursorChatProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const message = event.target.value;
        updateMyPresence({ message });
        setCursorState({ mode: CursorMode.Chat, message, previousMessage: null });
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && cursorState.mode === CursorMode.Chat) {
            setCursorState({
                mode: CursorMode.Chat,
                message: "",
                previousMessage: cursorState.message,
            });
        }else if (event.key === "Escape") {
            setCursorState({ mode: CursorMode.Hidden});
        }
    };
    return (
        <div
        className="absolute top-0 left-0"
        style={{
            transform: `translatex(${cursor.x}px) translateY(${cursor.y}px)`,
        }}
        >
        {cursorState.mode === CursorMode.Chat && (
      <>
        <CursorSVG color="#000000" />
        <div className="absolute top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]">
          {cursorState.previousMessage && (
            <div>{cursorState.previousMessage}</div>
          )}
          <input
            className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none "
            autoFocus
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={cursorState.previousMessage || "Type a message..."}
            value={cursorState.message}
            maxLength={50}
          />
        </div>
      </>)}
    </div>
  );
};

export default CursorChat;
