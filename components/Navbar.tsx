"use client";

import Image from "next/image";

import { navElements } from "@/constants";
import type { ActiveElement } from "@/types/type";
import ActiveUsers from "@/components/users/ActiveUsers";
import ShapesMenu from "@/components/ShapesMenu";

type NavbarProps = {
  activeElement: ActiveElement;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleActiveElement: (element: ActiveElement) => void;
  undo: () => void;
  redo: () => void;
};

export default function Navbar({ activeElement, imageInputRef, handleImageUpload, handleActiveElement, undo, redo }: NavbarProps) {
  return (
    <header className="relative z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 bg-primary-black px-4 py-2 text-white sm:px-6">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight text-primary-green">Kalpa</span>
        <a href="/" className="hidden text-xs text-primary-grey-300 hover:text-white md:inline">← Back to rooms</a>
      </div>

      <nav className="flex items-center gap-1" aria-label="Editor tools">
        {navElements.map((item) => {
          if (Array.isArray(item.value)) {
            return <ShapesMenu key={item.name} activeElement={activeElement} imageInputRef={imageInputRef} handleActiveElement={handleActiveElement} />;
          }
          const selected = activeElement?.value === item.value;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleActiveElement(item as ActiveElement)}
              className={`flex h-10 w-10 items-center justify-center rounded-md transition ${selected ? "bg-primary-green" : "hover:bg-primary-grey-100"}`}
              aria-label={item.name}
              title={item.name}
            >
              <Image src={item.icon} alt="" width={20} height={20} className={selected ? "invert" : ""} />
            </button>
          );
        })}
        <span className="mx-1 h-7 border-l border-primary-grey-100" />
        <button type="button" onClick={undo} className="rounded px-2 py-2 text-sm hover:bg-primary-grey-100" aria-label="Undo" title="Undo (⌘/Ctrl+Z)">↶</button>
        <button type="button" onClick={redo} className="rounded px-2 py-2 text-sm hover:bg-primary-grey-100" aria-label="Redo" title="Redo (⌘/Ctrl+Y)">↷</button>
      </nav>

      <div className="ml-auto"><ActiveUsers /></div>
      <input ref={imageInputRef} className="hidden" type="file" accept="image/*" onChange={handleImageUpload} aria-label="Upload image" />
    </header>
  );
}
