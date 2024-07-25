"use client";
import Live from "@/components/Live";
import { Room } from "./Room";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import {
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleCanvaseMouseMove,
    handleResize,
    initializeFabric,
} from "@/lib/canvas";
import LeftSidebar from "@/components/LeftSideBar";
import { ActiveElement } from "@/types/type";
import { useMutation, useStorage } from "@liveblocks/react";

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null); // to perform operations on the canvas
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<String | null>("triangle");
    const isDrawing = useRef(false);
    const [activeElement, setActiveElement] = useState<ActiveElement>({
        name: "",
        value: "",
        icon: "",
    });
    const canvasObjects = useStorage((root) => root.canvasObjects);
    const activeObjectRef = useRef <fabric.Object | null>(null);
    const syncShapeInStorage = useMutation(({ storage }, object) => {
        if (!object) return;
        const { objectId } = object;
        const shapeData = object.toJSON();
        shapeData.objectId = objectId;
        const canvasObjects = storage.get('canvasObjects');
        canvasObjects.set(objectId, shapeData);
    }, []);

    const handleActiveElement = (elm: ActiveElement) => {
        setActiveElement(elm);
        selectedShapeRef.current = elm?.value as string;
    };

    useEffect(() => {
        const canvas = initializeFabric({ canvasRef, fabricRef });
        canvas.on("mouse:down", (options) => {
            handleCanvasMouseDown({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
            });
        });
        canvas.on("mouse:move", (options) => {
            handleCanvaseMouseMove({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
            });
        });
        canvas.on("mouse:up", (options) => {
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
        window.addEventListener("resize", () => {
            handleResize({ fabricRef });
        });
    }, []);

    return (
        <main className="h-screen overflow-hidden">
            <Navbar activeElement={activeElement} handleActiveElement={handleActiveElement} />
            <section className="flex h-full flex-row">
                <LeftSidebar />
                <Live canvasRef={canvasRef} />
                <RightSideBar />
            </section>
        </main>
    );
}
