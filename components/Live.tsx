import React, { useCallback, useEffect, useState } from "react";
import LiveCursors from "./cursor/LiveCursors";
import { useMyPresence, useOthers } from "@liveblocks/react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode } from "@/types/type";

const Live = () => {
    const [cursorState, setCursorState] = useState({ mode: CursorMode.Hidden });
    const others = useOthers(); // to show other users
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x; // subtracting the position of the cursor wrt the window
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y; // subtracting the position of the cursor wrt the window
        updateMyPresence({ cursor: { x, y } });
    }, [updateMyPresence]);

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({ mode: CursorMode.Hidden });
        updateMyPresence({ cursor: null, message: null });
    }, [updateMyPresence]);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x; // subtracting the position of the cursor wrt the window
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y; // subtracting the position of the cursor wrt the window
        updateMyPresence({ cursor: { x, y } });
    }, [updateMyPresence]);

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: '',
                });
            } else if (e.key === 'Escape') {
                updateMyPresence({ message: '' });
                setCursorState({ mode: CursorMode.Hidden });
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/') {
                e.preventDefault();
            }
        };
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [updateMyPresence]);

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            className="h-[100vh] w-full flex justify-center items-center text-center"
        >
            <h1 className="text-xl text-white">pishie mani o meow</h1>
            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}
            <LiveCursors others={others} />
        </div>
    );
};

export default Live;
