"use client";

import { useState } from 'react';

type SignalType = 'green' | 'yellow' | 'red' | null;

export function useJourneySignal() {
  const [signal, setSignalState] = useState<SignalType>(() => {
    if (typeof window !== 'undefined') {
      const savedSignal = localStorage.getItem('santaan_signal') as SignalType;
      return savedSignal || null;
    }
    return null;
  });
  const hasAssessment = signal !== null;

  const setSignal = (newSignal: SignalType) => {
    setSignalState(newSignal);
    if (typeof window !== 'undefined') {
      if (newSignal) {
        localStorage.setItem('santaan_signal', newSignal);
      } else {
        localStorage.removeItem('santaan_signal');
      }
    }
  };

  return { signal, setSignal, hasAssessment };
}
