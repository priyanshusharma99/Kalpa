"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type RoomEntry = {
  id: string;
  name: string;
  createdAt: number;
};

const STORAGE_KEY = "kalpa-rooms";

function loadRooms(): RoomEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRooms(rooms: RoomEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

export default function HomePage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomEntry[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setRooms(loadRooms());
  }, []);

  const createRoom = () => {
    const name = newName.trim() || "Untitled design";
    const entry: RoomEntry = { id: uuidv4(), name, createdAt: Date.now() };
    const updated = [entry, ...rooms];
    saveRooms(updated);
    setRooms(updated);
    setNewName("");
    router.push(`/room/${entry.id}`);
  };

  const deleteRoom = (id: string) => {
    const updated = rooms.filter((r) => r.id !== id);
    saveRooms(updated);
    setRooms(updated);
  };

  return (
    <main className="flex min-h-screen flex-col bg-primary-grey-200 text-white">
      <header className="flex items-center justify-between border-b border-primary-grey-100 px-6 py-4">
        <span className="text-2xl font-bold tracking-tight text-primary-green">
          Kalpa
        </span>
        <span className="text-xs text-primary-grey-300">
          Collaborative Design Tool
        </span>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        {/* naya room create karne ke liye */}
        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-semibold">Create a new room</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createRoom();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Room name (optional)"
              className="flex-1 rounded-md border border-primary-grey-100 bg-primary-black px-4 py-2 text-sm text-white placeholder-primary-grey-300 outline-none focus:border-primary-green"
            />
            <button
              type="submit"
              className="rounded-md bg-primary-green px-5 py-2 text-sm font-semibold text-primary-black transition hover:opacity-90"
            >
              + New Room
            </button>
          </form>
        </div>

        {/* saved rooms ki list */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Your rooms</h2>
          {rooms.length === 0 ? (
            <p className="rounded-md border border-dashed border-primary-grey-100 px-6 py-10 text-center text-sm text-primary-grey-300">
              No rooms yet — create one above to get started.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="group flex items-center justify-between rounded-md border border-primary-grey-100 bg-primary-black px-4 py-3 transition hover:border-primary-green/40"
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/room/${room.id}`)}
                    className="flex flex-1 flex-col items-start gap-0.5 text-left"
                  >
                    <span className="text-sm font-medium">{room.name}</span>
                    <span className="text-xs text-primary-grey-300">
                      {new Date(room.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                  <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/room/${room.id}`,
                        );
                      }}
                      className="rounded px-2 py-1 text-xs text-primary-grey-300 hover:bg-primary-grey-100 hover:text-white"
                      title="Copy link"
                    >
                      Copy Link
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRoom(room.id)}
                      className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-900/30"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
