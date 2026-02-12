"use client";

import { useEffect, useState } from 'react';

type SignalType = 'green' | 'yellow' | 'red' | null;

export function useJourneySignal() {
  const [signal, setSignalState] = useState<SignalType>(() => {
    if (typeof window !== 'undefined') {
      const savedSignal = localStorage.getItem('santaan_signal') as SignalType;
      return savedSignal || null;
    }
    return null;
  });
  
  const [hasAssessment, setHasAssessment] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('santaan_signal');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSignal = localStorage.getItem('santaan_signal') as SignalType;
      if (savedSignal && savedSignal !== signal) {
        setSignalState(savedSignal);
        setHasAssessment(true);
      }
    }
  }, [signal]);

  const setSignal = (newSignal: SignalType) => {
    setSignalState(newSignal);
    setHasAssessment(!!newSignal);
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