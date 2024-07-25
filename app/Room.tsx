"use client";
import React from "react";

import { ReactNode } from "react";
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import Loader from "@/components/Loader";

export function Room({ children }: { children: ReactNode }) {
    return (
        <LiveblocksProvider
            publicApiKey={
                "pk_dev_s2upm8a4Fgxknp-ebVZ3Xqs179RH1tk4SAiT2YydfsJlzNqSdu6fqb8qnyqknHAz"
            }
        >
            <RoomProvider id="my-room" initialPresence={{cursor: null, cursorColor: null, editingText:null}} initialStorage={{canvasObjects: new LiveMap()}}>
                <ClientSideSuspense fallback={<Loader/>}>
                    {()=>children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
