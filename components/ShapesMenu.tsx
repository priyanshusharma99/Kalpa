"use client";

import Image from "next/image";

import { shapeElements } from "@/constants";
import type { ActiveElement } from "@/types/type";

type ShapesMenuProps = {
  activeElement: ActiveElement;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleActiveElement: (element: ActiveElement) => void;
};

export default function ShapesMenu({ activeElement, imageInputRef, handleActiveElement }: ShapesMenuProps) {
  const activeShape = shapeElements.find((shape) => shape.value === activeElement?.value);

  return (
    <div className="group relative">
      <button
        type="button"
        className={`relative flex h-10 w-10 items-center justify-center rounded-md ${activeShape ? "bg-primary-green" : "hover:bg-primary-grey-100"}`}
        aria-label="Shapes"
        title="Shapes"
      >
        <Image src={activeShape?.icon ?? "/assets/rectangle.svg"} alt="" width={20} height={20} className={activeShape ? "invert" : ""} />
      </button>
      <div className="invisible absolute left-0 top-full z-30 mt-1 min-w-48 rounded-md border border-primary-grey-100 bg-primary-black p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {shapeElements.map((shape) => (
          <button
            key={shape.value}
            type="button"
            onClick={() => {
              if (shape.value === "image") imageInputRef.current?.click();
              handleActiveElement(shape);
            }}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-primary-grey-100 ${activeElement?.value === shape.value ? "text-primary-green" : "text-white"}`}
          >
            <Image src={shape.icon} alt="" width={18} height={18} />
            {shape.name}
          </button>
        ))}
      </div>
    </div>
  );
}
