"use client";
import Live from "@/components/Live";
import { Room } from "./Room";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import {
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleCanvasObjectModified,
    handleCanvasObjectScaling,
    handleCanvasSelectionCreated,
    handleCanvaseMouseMove,
    handlePathCreated,
    handleResize,
    initializeFabric,
    renderCanvas,
} from "@/lib/canvas";
import LeftSidebar from "@/components/LeftSideBar";
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { defaultNavElement, fontFamilyOptions } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { Redo } from "lucide-react";

export default function Page() {
    const undo = useUndo();
    const redo = useRedo();
    const canvasObjects = useStorage((root) => root.canvasObjects);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null); // to perform operations on the canvas
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<String | null>(null);
    const isDrawing = useRef(false);
    const isEditingRef = useRef(false);
    const [elementAttributes, setElementAttributes] = useState<Attributes>({width:'', height:'', fontSize:'', fontFamily:'', fontWeight:'', fill: '#aabbcc', stroke:'#aabbcc'})
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [activeElement, setActiveElement] = useState<ActiveElement>({
        name: "",
        value: "",
        icon: "",
    });

    const deleteAllShapes = useMutation(({ storage }) => {
        const canvasObjects = storage.get("canvasObjects");
        if (!canvasObjects || canvasObjects.size === 0) return true;
        for (const [key, value] of canvasObjects.entries()) {
            canvasObjects.delete(key);
        }
        return canvasObjects.size === 0;
    }, []);
    const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
        const canvasObjects = storage.get("canvasObjects");
        canvasObjects.delete(objectId);
    }, []);
    const activeObjectRef = useRef<fabric.Object | null>(null);
    const syncShapeInStorage = useMutation(({ storage }, object) => {
        if (!object) return;
        const { objectId } = object;
        const shapeData = object.toJSON();
        shapeData.objectId = objectId;
        const canvasObjects = storage.get("canvasObjects");
        canvasObjects.set(objectId, shapeData);
    }, []);

    const handleActiveElement = (elm: ActiveElement) => {
        setActiveElement(elm);
        switch (elm?.value) {
            case "reset":
                deleteAllShapes();
                fabricRef.current?.clear();
                setActiveElement(defaultNavElement);
                break;
            case "delete":
                handleDelete(fabricRef.current as any, deleteShapeFromStorage);
                setActiveElement(defaultNavElement);
                break;
            case "image":
                imageInputRef.current?.click();
                isDrawing.current = false;
                if (fabricRef.current){
                    fabricRef.current.isDrawingMode = false;
                }
                break;
            default:
                break;
        }
        selectedShapeRef.current = elm?.value as string;
    };

    useEffect(() => {
        const canvas = initializeFabric({ canvasRef, fabricRef });
        canvas.on("mouse:down", (options: any) => {
            handleCanvasMouseDown({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
            });
        });
        canvas.on("mouse:move", (options: any) => {
            handleCanvaseMouseMove({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
            });
        });
        canvas.on("mouse:up", () => {
            handleCanvasMouseUp({
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
                setActiveElement,
                activeObjectRef,
            });
        });
        canvas.on("object:modified", (options: any) => {
            handleCanvasObjectModified({ options, syncShapeInStorage });
        });
        canvas.on("selection:created",(options:any)=>{
            handleCanvasSelectionCreated({
                options, isEditingRef, setElementAttributes,
            })
        })
        canvas.on("object:scaling", (options:any)=>{
            handleCanvasObjectScaling({options, setElementAttributes})
        })
        canvas.on("path:created",(options:any)=>{
            handlePathCreated({options, syncShapeInStorage})
        })
        window.addEventListener("resize", () => {
            handleResize({ fabricRef });
        });
        window.addEventListener("keydown", (e: any) => {
            handleKeyDown({
                e,
                canvas: fabricRef.current,
                undo,
                redo,
                syncShapeInStorage,
                deleteShapeFromStorage
            });
        });
        
        return () => {
            canvas.dispose();
        };
    }, []);

    useEffect(() => {
        if (canvasObjects)
            renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
    }, [canvasObjects]);

    return (
        <main className="h-screen overflow-hidden">
            <Navbar
                activeElement={activeElement}
                handleActiveElement={handleActiveElement}
                imageInputRef={imageInputRef}
                handleImageUpload={(e:any)=>{
                    e.stopPropagation(); 
                    handleImageUpload({file: e.target.files[0], canvas: fabricRef as any, shapeRef, syncShapeInStorage,})
                }}
            />
            <section className="flex h-full flex-row">
                <LeftSidebar
                    allShapes={canvasObjects ? Array.from(canvasObjects) : []}
                />
                <Live canvasRef={canvasRef} undo={undo} redo={redo}/>
                <RightSideBar elementAttributes={elementAttributes} setElementAttributes={setElementAttributes} fabricRef={fabricRef} isEditingRef={isEditingRef} activeObjectRef={activeObjectRef} syncShapeInStorage={syncShapeInStorage}/>
            </section>
        </main>
    );
}
