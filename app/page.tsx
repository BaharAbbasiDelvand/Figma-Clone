"use client";
import Live from "@/components/Live";
import { Room } from "./Room";
import React, { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import {
    handleCanvasMouseDown,
    handleResize,
    initializeFabric,
} from "@/lib/canvas";

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null); //to perform operations on the canvas
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<String | null>("triangle");
    const isDrawing = useRef(false);
    
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
            
            handleResize({ fabricRef })
        })
    }, []);
    return (
        <main className="h-screen overflow-hidden">
            <Navbar />
            <section className="flex h-full flex-row">
                <LeftSideBar />
                <Live canvasRef={canvasRef} />
                <RightSideBar />
            </section>
        </main>
    );
}
