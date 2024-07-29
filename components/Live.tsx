import React, { useCallback, useEffect, useState } from "react";
import LiveCursors from "./cursor/LiveCursors";
import {
    useBroadcastEvent,
    useEventListener,
    useMyPresence,
    useOthers,
} from "@liveblocks/react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    } from "@/components/ui/context-menu"

import useInterval from "@/hooks/useInterval";
import { shortcuts } from "@/constants";
type Props = {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    undo:()=>void;
    redo:()=>void;

};
const Live = ({ canvasRef, undo, redo }: Props) => {
    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    });
    const others = useOthers(); // to show other users
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const broadcast = useBroadcastEvent();
    //to clear the emojis
    useInterval(() => {
        setReaction((reaction) =>
            reaction.filter((r) => r.timestamp > Date.now() - 4000)
        );
    }, 1000);

    useInterval(() => {
        if (
            cursorState.mode === CursorMode.Reaction &&
            cursorState.isPressed &&
            cursor
        ) {
            setReaction((reactions) =>
                reactions.concat([
                    {
                        point: { x: cursor.x, y: cursor.y },
                        value: cursorState.reaction,
                        timestamp: Date.now(),
                    },
                ])
            );
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 30);
    //to show the emoji on the other persons screen
    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReaction((reactions) =>
            reactions.concat([
                {
                    point: { x: event.x, y: event.y },
                    value: event.value,
                    timestamp: Date.now(),
                },
            ])
        );
    });
    const [reaction, setReaction] = useState<Reaction[]>([]);

    const handlePointerMove = useCallback(
        (event: React.PointerEvent) => {
            event.preventDefault();
            if (
                cursor == null ||
                cursorState.mode !== CursorMode.ReactionSelector
            ) {
                const x =
                    event.clientX -
                    event.currentTarget.getBoundingClientRect().x; // subtracting the position of the cursor wrt the window
                const y =
                    event.clientY -
                    event.currentTarget.getBoundingClientRect().y; // subtracting the position of the cursor wrt the window
                updateMyPresence({ cursor: { x, y } });
            }
        },
        [updateMyPresence]
    );
    const handlePointerLeave = useCallback(
        (event: React.PointerEvent) => {
            setCursorState({ mode: CursorMode.Hidden });
            updateMyPresence({ cursor: null, message: null });
        },
        [updateMyPresence]
    );
    const handlePointerUp = useCallback(
        (event: React.PointerEvent) => {
            setCursorState((state: CursorState) =>
                cursorState.mode === CursorMode.Reaction
                    ? { ...state, isPressed: true }
                    : state
            );
        },
        [cursorState.mode, setCursorState]
    );

    const handlePointerDown = useCallback(
        (event: React.PointerEvent) => {
            const x =
                event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y =
                event.clientY - event.currentTarget.getBoundingClientRect().y;
            updateMyPresence({ cursor: { x, y } });
            setCursorState((state: CursorState) =>
                cursorState.mode === CursorMode.Reaction
                    ? { ...state, isPressed: true }
                    : state
            );
        },
        [cursorState.mode, setCursorState]
    );
    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "/") {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: "",
                });
            } else if (e.key === "Escape") {
                updateMyPresence({ message: "" });
                setCursorState({ mode: CursorMode.Hidden });
            } else if (e.key === "e") {
                setCursorState({
                    mode: CursorMode.ReactionSelector,
                });
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/") {
                e.preventDefault();
            }
        };
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [updateMyPresence]);
    const setReactions = useCallback((reaction: string) => {
        setCursorState({
            mode: CursorMode.Reaction,
            reaction,
            isPressed: false,
        });
    }, []);
    const handleContextMenuClick = useCallback ((key: string)=>{
        switch (key){
            case 'Chat':
                setCursorState({mode: CursorMode.Chat, previousMessage: null, message:''})
                break;
            case 'Undo':
                undo();
                break;
            case 'Redo':
                redo()
                break;
            case 'Reactions':
                setCursorState({mode:CursorMode.ReactionSelector})
                break;
            default: 
                break;
        }
    },[])
    return (
        <ContextMenu>

        <ContextMenuTrigger
            id="canvas"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="h-[100vh] w-full flex justify-center items-center text-center"
        >
            <canvas ref={canvasRef} />
            {reaction.map((reaction) => (
                <FlyingReaction
                    key={reaction.timestamp.toString()}
                    x={reaction.point.x}
                    y={reaction.point.y}
                    timestamp={reaction.timestamp}
                    value={reaction.value}
                />
            ))}
            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector setReaction={setReactions} />
            )}
            <LiveCursors others={others} />
        </ContextMenuTrigger>
        <ContextMenuContent className="right-menu-content">
            {shortcuts.map((item)=>(<ContextMenuItem key={item.key} onClick={()=>handleContextMenuClick(item.name)} className="right-menu-item">
                <p>{item.name}</p>
                <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
            </ContextMenuItem>))}
        </ContextMenuContent>
        </ContextMenu>
    );
};

export default Live;