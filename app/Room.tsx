"use client";
import React from "react";

import { ReactNode } from "react";
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from "@liveblocks/react";

export function Room({ children }: { children: ReactNode }) {
    return (
        <LiveblocksProvider
            publicApiKey={
                "pk_dev_s2upm8a4Fgxknp-ebVZ3Xqs179RH1tk4SAiT2YydfsJlzNqSdu6fqb8qnyqknHAz"
            }
        >
            <RoomProvider id="my-room">
                <ClientSideSuspense fallback={<div>Loading…</div>}>
                    {children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
