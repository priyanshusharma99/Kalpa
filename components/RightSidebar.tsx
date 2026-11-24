"use client";

import * as fabric from "fabric";

import { alignmentOptions, directionOptions, fontFamilyOptions, fontSizeOptions, fontWeightOptions } from "@/constants";
import { bringElement, modifyShape } from "@/lib/shapes";
import { exportToPdf, exportToPng } from "@/lib/utils";
import type { Attributes } from "@/types/type";

type Props = {
  elementAttributes: Attributes;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  activeObjectRef: React.RefObject<fabric.FabricObject | null>;
  isEditingRef: React.MutableRefObject<boolean>;
  syncShapeInStorage: (object: fabric.FabricObject) => void;
};

export default function RightSidebar({ elementAttributes, setElementAttributes, fabricRef, activeObjectRef, isEditingRef, syncShapeInStorage }: Props) {
  const update = (property: string, value: string) => {
    setElementAttributes((current) => ({ ...current, [property]: value }));
    const canvas = fabricRef.current;
    if (!canvas) return;
    isEditingRef.current = true;
    modifyShape({ canvas, property, value, activeObjectRef, syncShapeInStorage });
  };

  return (
    <aside className="hidden h-full w-64 shrink-0 overflow-y-auto border-l border-primary-grey-100 bg-primary-black text-primary-grey-300 lg:block">
      <h2 className="border-b border-primary-grey-100 px-5 py-4 text-xs uppercase tracking-wider">Design</h2>
      <p className="px-5 py-3 text-xs">Select an object to edit its properties.</p>

      <section className="space-y-3 border-t border-primary-grey-100 p-5">
        <h3 className="text-[10px] uppercase tracking-wider">Dimensions</h3>
        <div className="grid grid-cols-2 gap-2">
          {(["width", "height"] as const).map((property) => (
            <label key={property} className="space-y-1 text-xs">
              <span>{property === "width" ? "W" : "H"}</span>
              <input className="w-full rounded border border-primary-grey-100 bg-primary-grey-200 px-2 py-2 text-white outline-none focus:border-primary-green" type="number" min="1" value={elementAttributes[property]} onChange={(event) => update(property, event.target.value)} onBlur={() => { isEditingRef.current = false; }} />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3 border-t border-primary-grey-100 p-5">
        <h3 className="text-[10px] uppercase tracking-wider">Text</h3>
        <label className="block space-y-1 text-xs"><span>Font family</span><select className="w-full rounded border border-primary-grey-100 bg-primary-grey-200 px-2 py-2 text-white" value={elementAttributes.fontFamily} onChange={(event) => update("fontFamily", event.target.value)}>{fontFamilyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-xs"><span>Size</span><select className="w-full rounded border border-primary-grey-100 bg-primary-grey-200 px-2 py-2 text-white" value={elementAttributes.fontSize} onChange={(event) => update("fontSize", event.target.value)}><option value="">—</option>{fontSizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="space-y-1 text-xs"><span>Weight</span><select className="w-full rounded border border-primary-grey-100 bg-primary-grey-200 px-2 py-2 text-white" value={elementAttributes.fontWeight} onChange={(event) => update("fontWeight", event.target.value)}>{fontWeightOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </div>
      </section>

      <section className="space-y-3 border-t border-primary-grey-100 p-5">
        <h3 className="text-[10px] uppercase tracking-wider">Appearance</h3>
        {(["fill", "stroke"] as const).map((property) => (
          <label key={property} className="flex items-center justify-between gap-3 text-xs capitalize">
            {property}
            <input type="color" value={/^#[\da-f]{6}$/i.test(elementAttributes[property]) ? elementAttributes[property] : "#aabbcc"} onChange={(event) => update(property, event.target.value)} />
          </label>
        ))}
      </section>

      <section className="space-y-3 border-t border-primary-grey-100 p-5">
        <h3 className="text-[10px] uppercase tracking-wider">Arrange</h3>
        {directionOptions.map((option) => <button key={option.value} type="button" onClick={() => { if (fabricRef.current) bringElement({ canvas: fabricRef.current, direction: option.value, syncShapeInStorage }); }} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-primary-grey-100"><img src={option.icon} alt="" className="h-4 w-4" />{option.label}</button>)}
        <div className="grid grid-cols-2 gap-2">
          {alignmentOptions.map((option) => <button key={option.value} type="button" onClick={() => { const object = fabricRef.current?.getActiveObject(); const canvas = fabricRef.current; if (!object || !canvas) return; const bounds = canvas.getObjects().filter((item) => item !== object).reduce((acc, item) => ({ left: Math.min(acc.left, item.left ?? 0), top: Math.min(acc.top, item.top ?? 0), right: Math.max(acc.right, (item.left ?? 0) + (item.getScaledWidth() || 0)), bottom: Math.max(acc.bottom, (item.top ?? 0) + (item.getScaledHeight() || 0)) }), { left: 0, top: 0, right: canvas.width ?? 0, bottom: canvas.height ?? 0 }); const width = object.getScaledWidth() || 0; const height = object.getScaledHeight() || 0; const positions: Record<string, { left?: number; top?: number }> = { left: { left: bounds.left }, horizontalCenter: { left: (bounds.left + bounds.right - width) / 2 }, right: { left: bounds.right - width }, top: { top: bounds.top }, verticalCenter: { top: (bounds.top + bounds.bottom - height) / 2 }, bottom: { top: bounds.bottom - height } }; object.set(positions[option.value]); object.setCoords(); canvas.requestRenderAll(); syncShapeInStorage(object); }} className="rounded border border-primary-grey-100 px-2 py-2 text-xs hover:border-primary-green" title={option.label}>{option.label}</button>)}
        </div>
      </section>

      <section className="border-t border-primary-grey-100 p-5">
        <h3 className="mb-3 text-[10px] uppercase tracking-wider">Export</h3>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={exportToPng} className="w-full rounded border border-primary-grey-100 px-3 py-2 text-sm text-white hover:border-primary-green hover:text-primary-green">Export to PNG</button>
          <button type="button" onClick={exportToPdf} className="w-full rounded border border-primary-grey-100 px-3 py-2 text-sm text-white hover:border-primary-green hover:text-primary-green">Export to PDF</button>
        </div>
      </section>
    </aside>
  );
}
