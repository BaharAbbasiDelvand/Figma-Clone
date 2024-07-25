"use client";
import Live from "@/components/Live";
import { Room } from "./Room";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import {
    handleCanvasMouseDown,
    handleResize,
    initializeFabric,
} from "@/lib/canvas";
import LeftSidebar from "@/components/LeftSideBar";
import { ActiveElement } from "@/types/type";

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null); //to perform operations on the canvas
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<String | null>("triangle");
    const isDrawing = useRef(false);
    const [activeElement, setActiveElement] = useState<ActiveElement>({
        name: "",
        value: "",
        icon: "",
    });
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
        window.addEventListener("resize", () => {
            handleResize({ fabricRef });
        });
    }, []);
    return (
        <main className="h-screen overflow-hidden">
            <Navbar activeElement={activeElement} handleActiveElement={handleActiveElement}/>
            <section className="flex h-full flex-row">
                <LeftSidebar />
                <Live canvasRef={canvasRef} />
                <RightSideBar />
            </section>
        </main>
    );
}
