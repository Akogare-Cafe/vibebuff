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
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const isLastStep = currentStep === tour.steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    const updateTargetRect = () => {
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    updateTargetRect();

    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        element.scrollIntoView({ behavior: "instant", block: "center" });
        requestAnimationFrame(() => {
          updateTargetRect();
        });
      }
    }
  }, [step.target, currentStep]);

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || step.position === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320;

    let top: number;
    let left: number;
    let transform = "";

    switch (step.position || "bottom") {
      case "top":
        top = targetRect.top - padding;
        left = targetRect.left + targetRect.width / 2;
        transform = "translate(-50%, -100%)";
        break;
      case "bottom":
        top = targetRect.top + targetRect.height + padding;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - padding;
        transform = "translate(-100%, -50%)";
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left + targetRect.width + padding;
        transform = "translateY(-50%)";
        break;
      default:
        top = targetRect.top + targetRect.height + padding;
        left = targetRect.left + targetRect.width / 2;
        transform = "translateX(-50%)";
    }

    if (left - tooltipWidth / 2 < 16) {
      left = 16;
      transform = transform.replace("translateX(-50%)", "").replace("translate(-50%,", "translate(0,");
    } else if (left + tooltipWidth / 2 > viewportWidth - 16) {
      left = viewportWidth - 16;
      transform = transform.replace("translateX(-50%)", "translateX(-100%)").replace("translate(-50%,", "translate(-100%,");
    }

    if (top < 16) {
      top = targetRect.top + targetRect.height + padding;
      transform = "translateX(-50%)";
    } else if (top > viewportHeight - 200) {
      top = targetRect.top - padding;
      transform = "translate(-50%, -100%)";
    }

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      transform,
    };
  };

  const StepIcon = step.icon || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[9999] pointer-events-none"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={onSkip}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tour-mask)"
        />
      </svg>

      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-lg border-2 border-primary"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 0 4px rgba(var(--primary-rgb), 0.3), 0 0 20px rgba(var(--primary-rgb), 0.2)",
          }}
        />
      )}

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, delay: 0.05 }}
        className="w-[320px] max-w-[calc(100vw-32px)] pointer-events-auto"
        style={getTooltipStyle()}
      >
        <PixelCard className="p-4 relative shadow-xl">
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
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
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
