import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { LOCAL_STORAGE_KEYS } from "@/shared/storage/keys";
import { getLocalStorageBoolean, setLocalStorageBoolean } from "@/shared/storage/local-storage";

export default function OnboardingTour() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isHome = location.pathname === "/home";
  const isLibrary = location.pathname === "/paragraphs";

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = useMemo(() => {
    if (isLibrary) {
      return [
        {
          popover: {
            title: t("onboarding.libraryTitle"),
            description: t("onboarding.libraryDesc"),
          },
        },
        ...(isDesktop
          ? [
            {
              element: "#library-filters",
              popover: {
                title: t("onboarding.libraryFiltersTitle"),
                description: t("onboarding.libraryFiltersDesc"),
                side: "right" as const,
                align: "start" as const,
              },
            },
          ]
          : []),
        {
          element: "#library-first-card",
          popover: {
            title: t("onboarding.libraryCardTitle"),
            description: t("onboarding.libraryCardDesc"),
            side: "bottom" as const,
            align: "center" as const,
          },
        },
        {
          element: ".onboarding-lang-modal .ant-modal-content",
          popover: {
            title: t("onboarding.languageModalTitle"),
            description: t("onboarding.languageModalDesc"),
            side: "bottom" as const,
            align: "center" as const,
            className: "lang-modal-popover",
          },
        },
      ];
    }

    return [
      {
        element: "#onboarding-brand",
        popover: {
          title: t("onboarding.welcomeTitle"),
          description: t("onboarding.welcomeDesc"),
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#nav-practice",
        popover: {
          title: t("onboarding.practiceTitle"),
          description: t("onboarding.practiceDesc"),
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: "#nav-history",
        popover: {
          title: t("onboarding.historyTitle"),
          description: t("onboarding.historyDesc"),
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: "#nav-decks",
        popover: {
          title: t("onboarding.decksTitle"),
          description: t("onboarding.decksDesc"),
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: "#nav-rankings",
        popover: {
          title: t("onboarding.rankingsTitle"),
          description: t("onboarding.rankingsDesc"),
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: "#nav-profile",
        popover: {
          title: t("onboarding.profileTitle"),
          description: t("onboarding.profileDesc"),
          side: "bottom" as const,
          align: "end" as const,
        },
      },
    ];

  }, [isDesktop, isLibrary, t, i18n.language]);

  useEffect(() => {
    const storageKey = isLibrary ? "libraryTourCompleted" : LOCAL_STORAGE_KEYS.onboardingCompleted;
    const isCompleted = getLocalStorageBoolean(storageKey, false);

    if (isCompleted || (!isHome && !isLibrary) || !isDesktop) return;

    let driverObj: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && driverObj) {
        e.preventDefault();

        const currentIndex = driverObj.getActiveIndex();
        const totalSteps = steps.length;

        if (currentIndex === totalSteps - 1) {
          setLocalStorageBoolean(storageKey, true);

          const closeBtn = document.querySelector(".onboarding-lang-modal .ant-modal-close") as HTMLElement;
          if (closeBtn) closeBtn.click();

          setTimeout(() => {
            driverObj.destroy();
          }, 0);
        } else {
          const nextBtn = document.querySelector(".driver-popover-next-btn") as HTMLElement;
          if (nextBtn) {
            nextBtn.click();
          } else {
            driverObj.moveNext();
          }
        }
      }
    };
    const timer = setTimeout(() => {
      driverObj = driver({
        showProgress: true,
        allowClose: true,
        overlayColor: "rgba(2, 6, 23, 0.7)",
        nextBtnText: t("onboarding.nextBtn") || "Next",
        prevBtnText: t("onboarding.prevBtn") || "Back",
        doneBtnText: t("onboarding.doneBtn") || "Done",
        steps: steps,
        onHighlightStarted: async (element, step) => {
          if (step.element === ".onboarding-lang-modal .ant-modal-content") {
            const firstCard = document.getElementById("library-first-card") as HTMLElement;

            if (firstCard) {
              firstCard.click();

              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        },
        onDestroyStarted: () => {
          window.removeEventListener("keydown", handleKeyDown);
          setLocalStorageBoolean(storageKey, true);
          driverObj.destroy();

          const closeBtn = document.querySelector(".onboarding-lang-modal .ant-modal-close") as HTMLElement;
          if (closeBtn) closeBtn.click();
        },
      });

      window.addEventListener("keydown", handleKeyDown);
      driverObj.drive();
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHome, isLibrary, steps, t]);

  return null;
}