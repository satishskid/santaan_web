"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SignalType = 'green' | 'yellow' | 'red' | null;

interface JourneyState {
    signal: SignalType;
    setSignal: (signal: SignalType) => void;
    hasAssessment: boolean;
}

const JourneyContext = createContext<JourneyState | undefined>(undefined);

export function JourneyProvider({ children }: { children: ReactNode }) {
    const [signal, setSignalState] = useState<SignalType>(null);
    const [hasAssessment, setHasAssessment] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedSignal = localStorage.getItem('santaan_signal') as SignalType;
        if (savedSignal) {
            setSignalState(savedSignal);
            setHasAssessment(true);
        }
    }, []);

    const setSignal = (newSignal: SignalType) => {
        setSignalState(newSignal);
        setHasAssessment(!!newSignal);
        if (newSignal) {
            localStorage.setItem('santaan_signal', newSignal);
        } else {
            localStorage.removeItem('santaan_signal');
        }
    };

    return (
        <JourneyContext.Provider value={{ signal, setSignal, hasAssessment }}>
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
