"use client";

import { useState } from "react";

export function usePatientId() {
  const [patientId] = useState<string>(() => {
    // Generate a random patient ID on the client side to avoid hydration mismatch
    return `#SAN-${Math.floor(Math.random() * 10000)}`;
  });

  return patientId;
}