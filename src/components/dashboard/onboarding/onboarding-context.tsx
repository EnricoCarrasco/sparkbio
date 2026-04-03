"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type OnboardingStep =
  | "add-button"
  | "whatsapp-hint"
  | "smart-input-hint"
  | "share-nudge"
  | null;

interface OnboardingContextValue {
  step: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  dismiss: () => void;
  isActive: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  step: null,
  setStep: () => {},
  dismiss: () => {},
  isActive: false,
});

export function OnboardingProvider({
  initialStep,
  children,
}: {
  initialStep: OnboardingStep;
  children: React.ReactNode;
}) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);

  const dismiss = useCallback(() => setStep(null), []);

  return (
    <OnboardingContext.Provider
      value={{ step, setStep, dismiss, isActive: step !== null }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
