import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

import { CustomFabricObject } from "@/types/type";

export const handleCopy = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    localStorage.setItem("clipboard", JSON.stringify(serializedObjects));
  }

  return activeObjects;
};

export const handlePaste = (
  canvas: fabric.Canvas,
  syncShapeInStorage: (shape: fabric.FabricObject) => void
) => {
  if (!canvas || !(canvas instanceof fabric.Canvas)) {
    console.error("Invalid canvas object. Aborting paste operation.");
    return;
  }

  const clipboardData = localStorage.getItem("clipboard");

  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      parsedObjects.forEach((objData: fabric.FabricObject) => {
        fabric.util.enlivenObjects([objData]).then((enlivenedObjects) => {
          enlivenedObjects.forEach((enlivenedObj) => {
            const obj = enlivenedObj as fabric.FabricObject & { objectId?: string };
            obj.set({
              left: (obj.left || 0) + 20,
              top: (obj.top || 0) + 20,
              // @ts-ignore
              objectId: uuidv4(),
              fill: "#aabbcc",
            });

            canvas.add(obj);
            syncShapeInStorage(obj);
          });
          canvas.renderAll();
        });
      });
    } catch (error) {
      console.error("Error parsing clipboard data:", error);
    }
  }
};

export const handleDelete = (
  canvas: fabric.Canvas,
  deleteShapeFromStorage: (id: string) => void
) => {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj: CustomFabricObject<any>) => {
      if (!obj.objectId) return;
      canvas.remove(obj);
      deleteShapeFromStorage(obj.objectId);
    });
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

// keyboard shortcuts handle karne ke liye
export const handleKeyDown = ({
  e,
  canvas,
  undo,
  redo,
  syncShapeInStorage,
  deleteShapeFromStorage,
}: {
  e: KeyboardEvent;
  canvas: fabric.Canvas | any;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: fabric.FabricObject) => void;
  deleteShapeFromStorage: (id: string) => void;
}) => {
  // copy
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 67) {
    handleCopy(canvas);
  }

  // paste
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 86) {
    handlePaste(canvas, syncShapeInStorage);
  }

  if ((e.key === "Backspace" || e.key === "Delete") && canvas.getActiveObjects().length > 0) {
    e.preventDefault();
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // cut
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // undo
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 90) {
    undo();
  }

  // redo
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 89) {
    redo();
  }

  if (e.keyCode === 191 && !e.shiftKey) {
    e.preventDefault();
  }
};
