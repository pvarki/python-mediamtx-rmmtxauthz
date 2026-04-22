import { useState, useEffect, useCallback, useMemo } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Info, ImageOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { cn } from "@/lib/utils";
import { useMeta } from "@/lib/metadata";
import { PRODUCT_SHORTNAME } from "@/App";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image: (lang: string) => string;
}

const SUPPORTED_GUIDE_LANGS = ["en", "fi", "sv"] as const;

const guideImage = (lang: string) => {
  const match = SUPPORTED_GUIDE_LANGS.find((l) => lang.startsWith(l)) ?? "en";
  return `/ui/mtx/assets/onboarding/mtx_guide_${match}.webp`;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "onboarding.steps.welcome.title",
    description: "onboarding.steps.welcome.description",
    image: () => "/ui/mtx/assets/onboarding/mtx_welcome.webp",
  },
  {
    id: "walkthrough",
    title: "onboarding.steps.walkthrough.title",
    description: "onboarding.steps.walkthrough.description",
    image: guideImage,
  },
];

const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, "0").slice(0, 8);
};

export function OnboardingHandler() {
  const { t, i18n } = useTranslation(PRODUCT_SHORTNAME);
  const { deployment } = useHealthCheck();
  const isMobile = useIsMobile();
  const { callsign } = useMeta();

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const storageKeys = useMemo(() => {
    if (!callsign || !deployment) return null;
    const base = `${hashString(
      deployment,
    )}-${PRODUCT_SHORTNAME}-onboarding-${callsign}`;
    return { finished: `${base}-finished`, steps: `${base}-steps` };
  }, [deployment, callsign]);

  useEffect(() => {
    if (!storageKeys || initialized) return;

    const finished = localStorage.getItem(storageKeys.finished) === "true";
    const stepsRaw = localStorage.getItem(storageKeys.steps);

    let savedSteps = new Set<string>();
    if (stepsRaw) {
      try {
        savedSteps = new Set(JSON.parse(stepsRaw) as string[]);
      } catch (e) {
        console.error(e);
      }
    }
    setCompleted(savedSteps);

    const firstIncomplete = ONBOARDING_STEPS.findIndex(
      (s) => !savedSteps.has(s.id),
    );
    setCurrentStep(firstIncomplete === -1 ? 0 : firstIncomplete);

    if (!finished && firstIncomplete !== -1) {
      setOpen(true);
    }

    setInitialized(true);
  }, [storageKeys, initialized]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [i18n.language, currentStep]);

  useEffect(() => {
    setImageEnlarged(false);
  }, [isMobile]);

  const resetImageState = () => {
    setImageLoading(true);
    setImageError(false);
    setImageEnlarged(false);
  };

  const goToStep = (index: number) => {
    resetImageState();
    setCurrentStep(index);
  };

  const handleComplete = () => {
    const step = ONBOARDING_STEPS[currentStep];
    const nextCompleted = new Set(completed).add(step.id);
    setCompleted(nextCompleted);

    if (!storageKeys) return;

    localStorage.setItem(
      storageKeys.steps,
      JSON.stringify(Array.from(nextCompleted)),
    );

    if (currentStep === ONBOARDING_STEPS.length - 1) {
      localStorage.setItem(storageKeys.finished, "true");
      setOpen(false);
      toast.success(t("onboarding.completion"));
    } else {
      goToStep(currentStep + 1);
    }
  };

  const openOnboarding = () => {
    const firstIncomplete = ONBOARDING_STEPS.findIndex(
      (s) => !completed.has(s.id),
    );
    goToStep(firstIncomplete === -1 ? 0 : firstIncomplete);
    setOpen(true);
  };

  if (!initialized || !storageKeys) return null;

  const step = ONBOARDING_STEPS[currentStep];
  if (!step) return null;

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const imageClickable = !imageError && !imageLoading;
  const imageSrc = step.image(i18n.language);

  const content = (
    <div className="flex flex-col h-full max-h-[85vh] w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {t("onboarding.step")} {currentStep + 1} {t("onboarding.of")}{" "}
            {ONBOARDING_STEPS.length}
          </p>
          <h2 className="text-xl font-bold leading-tight">{t(step.title)}</h2>
        </div>

        <div
          className={cn(
            "relative rounded-xl overflow-hidden aspect-video w-full border border-border bg-muted/20 shrink-0",
            imageClickable && "cursor-pointer",
          )}
          onClick={() => imageClickable && setImageEnlarged(true)}
        >
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="w-8 h-8" />
              <span className="text-xs">{t("onboarding.imageMissing")}</span>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt=""
              className={cn(
                "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100",
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {t(step.description)}
        </p>
      </div>

      <div className="p-4 border-t bg-background flex gap-3 shrink-0 mt-auto">
        <Button
          variant="outline"
          onClick={() => currentStep > 0 && goToStep(currentStep - 1)}
          disabled={currentStep === 0}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> {t("onboarding.back")}
        </Button>
        <Button
          onClick={handleComplete}
          className="flex-1 bg-primary-light hover:bg-primary-light/90 text-white"
        >
          {currentStep === ONBOARDING_STEPS.length - 1
            ? t("onboarding.finish")
            : t("onboarding.next")}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="h-1.5 w-full bg-muted shrink-0">
        <div
          className="h-full bg-primary-light transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <>
      {!open && (
        <button
          onClick={openOnboarding}
          aria-label={t("onboarding.review")}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-primary-light text-white shadow-xl z-50 hover:scale-110 transition-transform active:scale-95"
        >
          <Info className="w-6 h-6" />
        </button>
      )}

      <Dialog open={imageEnlarged} onOpenChange={setImageEnlarged}>
        <DialogContent
          className="p-0 gap-0 bg-black/95 border-none shadow-none rounded-none flex items-center justify-center"
          style={{ width: "100vw", maxWidth: "100vw", height: "100vh" }}
          onClick={() => setImageEnlarged(false)}
        >
          <DialogTitle className="sr-only">{t(step.title)}</DialogTitle>
          <img
            src={imageSrc}
            alt=""
            className="max-w-full max-h-full object-contain cursor-zoom-out p-4"
          />
        </DialogContent>
      </Dialog>

      {isMobile ? (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent>
            <DrawerTitle className="sr-only">
              {t("onboarding.title")}
            </DrawerTitle>
            {content}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden outline-none">
            <DialogTitle className="sr-only">
              {t("onboarding.title")}
            </DialogTitle>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
