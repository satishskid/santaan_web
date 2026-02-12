"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useJourneySignal } from '@/hooks/useJourneySignal';

type SignalType = 'green' | 'yellow' | 'red' | null;

interface JourneyState {
    signal: SignalType;
    setSignal: (signal: SignalType) => void;
    hasAssessment: boolean;
}

const JourneyContext = createContext<JourneyState | undefined>(undefined);

export function JourneyProvider({ children }: { children: ReactNode }) {
    const journey = useJourneySignal();

    return (
        <JourneyContext.Provider value={journey}>
            {children}
        </JourneyContext.Provider>
    );
}

export function useJourney() {
    const context = useContext(JourneyContext);
    if (context === undefined) {
        throw new Error('useJourney must be used within a JourneyProvider');
    }
    return context;
}