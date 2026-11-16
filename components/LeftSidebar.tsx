"use client";

import Image from "next/image";

import { getShapeInfo } from "@/lib/utils";

type Props = {
  allShapes: Array<[string, any]>;
  onSelect: (id: string) => void;
};

export default function LeftSidebar({ allShapes, onSelect }: Props) {
  return (
    <aside className="hidden h-full w-56 shrink-0 overflow-y-auto border-r border-primary-grey-100 bg-primary-black text-primary-grey-300 md:block">
      <h2 className="border-b border-primary-grey-100 px-5 py-4 text-xs uppercase tracking-wider">Layers</h2>
      <div className="p-2">
        {allShapes.map(([id, shape]) => {
          const info = getShapeInfo(shape?.type);
          return (
            <button key={id} type="button" onClick={() => onSelect(id)} className="group flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-primary-grey-100 hover:text-white">
              <Image src={info.icon} alt="" width={16} height={16} />
              <span className="truncate text-sm capitalize">{info.name}</span>
            </button>
          );
        })}
        {allShapes.length === 0 && <p className="px-3 py-4 text-xs text-primary-grey-300">Your layers will appear here.</p>}
      </div>
    </aside>
  );
}
