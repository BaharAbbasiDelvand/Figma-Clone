import React, { useCallback } from "react";
import LiveCursors from "./cursor/LiveCursors";
import { useMyPresence, useOther, useOthers } from "@liveblocks/react";

const Live = () => {
    const others = useOthers(); //to show other users
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const handlePointerMove = useCallback((event: React.PointerEvent) => { event.preventDefault();
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x; //subtracting the position of the cursor wrt the window
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y; //subtracting the position of the cursor wrt the window
        updateMyPresence({cursor:{x,y}});
    }, []);
    const handlePointerLeave = useCallback((event: React.PointerEvent) => { event.preventDefault();
        
        updateMyPresence({cursor:null, message: null});
    }, []);
    const handlePointerDown = useCallback((event: React.PointerEvent) => { 
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x; //subtracting the position of the cursor wrt the window
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y; //subtracting the position of the cursor wrt the window
        updateMyPresence({cursor:{x,y}});
    }, []);
    return (
        <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        className="h-[100vh] w-full flex justify-center items-center text-center">
            <h1 className="text-xl text-white">pishie mani o meow</h1>
            <LiveCursors others={others} />
        </div>
    );
};

export default Live;
