"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";
import {
  X,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface TourStep {
  target?: string;
  title: string;
  content: string;
  icon?: LucideIcon;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export interface PageTourConfig {
  pageId: string;
  title: string;
  steps: TourStep[];
}

interface PageTourContextType {
  startTour: (config: PageTourConfig) => void;
  endTour: () => void;
  isActive: boolean;
  currentPageId: string | null;
  hasSeenTour: (pageId: string) => boolean;
  resetTour: (pageId: string) => void;
  resetAllTours: () => void;
}

const PageTourContext = createContext<PageTourContextType | null>(null);

export function usePageTour() {
  const context = useContext(PageTourContext);
  return context;
}

export function PageTourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<PageTourConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [seenTours, setSeenTours] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("vibebuff_page_tours_seen");
    if (stored) {
      try {
        setSeenTours(new Set(JSON.parse(stored)));
      } catch {
        setSeenTours(new Set());
      }
    }
    setIsInitialized(true);
  }, []);

  const markTourSeen = useCallback((pageId: string) => {
    setSeenTours((prev) => {
      const next = new Set(prev);
      next.add(pageId);
      localStorage.setItem("vibebuff_page_tours_seen", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const startTour = useCallback((config: PageTourConfig) => {
    setActiveTour(config);
    setCurrentStep(0);
  }, []);

  const endTour = useCallback(() => {
    if (activeTour) {
      markTourSeen(activeTour.pageId);
    }
    setActiveTour(null);
    setCurrentStep(0);
  }, [activeTour, markTourSeen]);

  const hasSeenTour = useCallback(
    (pageId: string) => {
      return seenTours.has(pageId);
    },
    [seenTours]
  );

  const resetTour = useCallback((pageId: string) => {
    setSeenTours((prev) => {
      const next = new Set(prev);
      next.delete(pageId);
      localStorage.setItem("vibebuff_page_tours_seen", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const resetAllTours = useCallback(() => {
    setSeenTours(new Set());
    localStorage.removeItem("vibebuff_page_tours_seen");
  }, []);

  const handleNext = () => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    endTour();
  };

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <PageTourContext.Provider
      value={{
        startTour,
        endTour,
        isActive: !!activeTour,
        currentPageId: activeTour?.pageId ?? null,
        hasSeenTour,
        resetTour,
        resetAllTours,
      }}
    >
      {children}
      <AnimatePresence>
        {activeTour && (
          <TourOverlay
            tour={activeTour}
            currentStep={currentStep}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
          />
        )}
      </AnimatePresence>
    </PageTourContext.Provider>
  );
}

interface TourOverlayProps {
  tour: PageTourConfig;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function TourOverlay({ tour, currentStep, onNext, onPrev, onSkip }: TourOverlayProps) {
  const step = tour.steps[currentStep];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const isLastStep = currentStep === tour.steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step.target, currentStep]);

  const getTooltipPosition = () => {
    if (!targetRect || step.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step.position || "bottom") {
      case "top":
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        };
    }
  };

  const StepIcon = step.icon || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onSkip} />

      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
            border: "2px solid var(--primary)",
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute z-[101] w-[320px] max-w-[calc(100vw-32px)]"
        style={getTooltipPosition()}
      >
        <PixelCard className="p-4 relative">
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-1 mb-4">
            {tour.steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-primary" : "bg-card"
                }`}
              />
            ))}
          </div>

          <div className="mb-4">
            <div className="w-10 h-10 mb-3 border-2 border-primary bg-primary/10 rounded-lg flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-primary text-sm font-bold mb-1">{step.title}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {step.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={isFirstStep}
              className={isFirstStep ? "opacity-0 pointer-events-none" : ""}
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              BACK
            </PixelButton>

            <span className="text-muted-foreground text-xs">
              {currentStep + 1} / {tour.steps.length}
            </span>

            <PixelButton size="sm" onClick={onNext}>
              {isLastStep ? "DONE" : "NEXT"}
              {!isLastStep && <ChevronRight className="w-3 h-3 ml-1" />}
            </PixelButton>
          </div>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

interface TourTriggerProps {
  tourConfig: PageTourConfig;
  autoStart?: boolean;
  className?: string;
}

export function TourTrigger({ tourConfig, autoStart = true, className }: TourTriggerProps) {
  const context = usePageTour();
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  useEffect(() => {
    if (!context) return;
    
    if (autoStart && !context.hasSeenTour(tourConfig.pageId) && !context.isActive && !hasAutoStarted) {
      const timer = setTimeout(() => {
        context.startTour(tourConfig);
        setHasAutoStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, context, tourConfig, hasAutoStarted]);

  if (!context) {
    return null;
  }

  return (
    <button
      onClick={() => context.startTour(tourConfig)}
      className={`p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-all group ${className || ""}`}
      title="Show page tour"
    >
      <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}
