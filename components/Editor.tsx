"use client";

import * as fabric from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";

import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { defaultNavElement } from "@/constants";
import { handleCanvasMouseDown, handleCanvaseMouseMove, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectMoving, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasZoom, handlePathCreated, handleResize, initializeFabric, renderCanvas } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import type { ActiveElement, Attributes } from "@/types/type";

type CanvasObject = fabric.FabricObject & { objectId?: string };

const initialAttributes: Attributes = { width: "", height: "", fontSize: "", fontFamily: "", fontWeight: "400", fill: "#aabbcc", stroke: "#aabbcc" };

export default function Editor() {
  const undo = useUndo();
  const redo = useRedo();
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<CanvasObject | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<CanvasObject | null>(null);
  const isEditingRef = useRef(false);
  const [activeElement, setActiveElement] = useState<ActiveElement>(defaultNavElement);
  const [elementAttributes, setElementAttributes] = useState<Attributes>(initialAttributes);

  const syncShapeInStorage = useMutation(({ storage }, object: fabric.FabricObject) => {
    const shape = object as CanvasObject;
    if (!shape.objectId) shape.objectId = crypto.randomUUID();
    const serialized = shape.toObject(["objectId"]);
    serialized.objectId = shape.objectId;
    storage.get("canvasObjects").set(shape.objectId, serialized);
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, id: string) => {
    storage.get("canvasObjects").delete(id);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const objects = storage.get("canvasObjects");
    Array.from(objects.keys()).forEach((id) => objects.delete(id));
  }, []);

  const handleActiveElement = useCallback((element: ActiveElement) => {
    if (!element) return;
    setActiveElement(element);
    if (element.value === "reset") {
      if (!window.confirm("Are you sure you want to clear the canvas? This cannot be undone.")) {
        setActiveElement(defaultNavElement);
        return;
      }
      deleteAllShapes();
      fabricRef.current?.clear();
      setActiveElement(defaultNavElement);
      selectedShapeRef.current = "select";
      return;
    }
    if (element.value === "delete") {
      if (fabricRef.current) handleDelete(fabricRef.current, deleteShapeFromStorage);
      setActiveElement(defaultNavElement);
      selectedShapeRef.current = "select";
      return;
    }
    if (element.value === "image") {
      selectedShapeRef.current = null;
      if (fabricRef.current) fabricRef.current.isDrawingMode = false;
      return;
    }
    selectedShapeRef.current = element.value === "select" || element.value === "comments" ? null : element.value;
    if (fabricRef.current) fabricRef.current.isDrawingMode = element.value === "freeform";
  }, [deleteAllShapes, deleteShapeFromStorage]);

  const onImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const canvas = fabricRef.current;
    if (file && canvas) {
      handleImageUpload({ file, canvas: { current: canvas }, shapeRef, syncShapeInStorage });
    }
    event.target.value = "";
  }, [syncShapeInStorage]);

  const selectLayer = useCallback((id: string) => {
    const canvas = fabricRef.current;
    const object = canvas?.getObjects().find((item) => (item as CanvasObject).objectId === id);
    if (!canvas || !object) return;
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    activeObjectRef.current = object as CanvasObject;
    handleCanvasSelectionCreated({ options: { selected: [object] }, isEditingRef, setElementAttributes });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = initializeFabric({ canvasRef, fabricRef });
    canvas.selection = true;
    canvas.isDrawingMode = false;

    const onMouseDown = (options: any) => handleCanvasMouseDown({ options, canvas, selectedShapeRef, isDrawing, shapeRef });
    const onMouseMove = (options: any) => handleCanvaseMouseMove({ options, canvas, isDrawing, selectedShapeRef, shapeRef, syncShapeInStorage });
    const onMouseUp = () => handleCanvasMouseUp({ canvas, isDrawing, shapeRef, activeObjectRef, selectedShapeRef, syncShapeInStorage, setActiveElement });
    const onPathCreated = (options: any) => handlePathCreated({ options, syncShapeInStorage });
    const onModified = (options: any) => handleCanvasObjectModified({ options, syncShapeInStorage });
    const onMoving = (options: any) => handleCanvasObjectMoving({ options });
    const onSelection = (options: any) => {
      const object = options.selected?.[0] as CanvasObject | undefined;
      if (!object) return;
      activeObjectRef.current = object;
      handleCanvasSelectionCreated({ options, isEditingRef, setElementAttributes });
    };
    const onScaling = (options: any) => handleCanvasObjectScaling({ options, setElementAttributes });
    const onWheel = (options: any) => handleCanvasZoom({ options, canvas });
    const onResize = () => handleResize({ canvas });

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    canvas.on("path:created", onPathCreated);
    canvas.on("object:modified", onModified);
    canvas.on("object:moving", onMoving);
    canvas.on("selection:created", onSelection);
    canvas.on("selection:updated", onSelection);
    canvas.on("object:scaling", onScaling);
    canvas.on("mouse:wheel", onWheel);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [syncShapeInStorage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement)?.tagName ?? "")) return;
      if (fabricRef.current) handleKeyDown({ e: event, canvas: fabricRef.current, undo, redo, syncShapeInStorage, deleteShapeFromStorage });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteShapeFromStorage, redo, syncShapeInStorage, undo]);

  useEffect(() => {
    if (!fabricRef.current) return;
    renderCanvas({ fabricRef, canvasObjects: Object.entries(canvasObjects ?? {}), activeObjectRef });
  }, [canvasObjects]);

  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-primary-grey-200">
      <Navbar activeElement={activeElement} imageInputRef={imageInputRef} handleImageUpload={onImageChange} handleActiveElement={handleActiveElement} undo={undo} redo={redo} />
      <section className="flex min-h-0 flex-1">
        <LeftSidebar allShapes={Object.entries(canvasObjects ?? {})} onSelect={selectLayer} />
        <Live canvasRef={canvasRef} activeElement={activeElement} undo={undo} redo={redo} />
        <RightSidebar elementAttributes={elementAttributes} setElementAttributes={setElementAttributes} fabricRef={fabricRef} activeObjectRef={activeObjectRef} isEditingRef={isEditingRef} syncShapeInStorage={syncShapeInStorage} />
      </section>
    </main>
  );
}
