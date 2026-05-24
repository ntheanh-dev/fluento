import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { getLocalStorageBoolean, setLocalStorageBoolean } from "@/shared/storage/local-storage";

export default function PracticeTour() {
    const { t } = useTranslation();
    const { id } = useParams();

    const isDesktop = () => {
        return window.matchMedia("(min-width: 1024px)").matches;
    };

    useEffect(() => {
        if (!id || !isDesktop()) return;

        const storageKey = "practiceTourCompleted";
        const isCompleted = getLocalStorageBoolean(storageKey, false);

        if (isCompleted) return;

        let driverObj: any = null;


        const steps = [
            {
                popover: {
                    title: t("onboarding.simulatedTitle"),
                    description: t("onboarding.simulatedDesc"),
                },
            },
            {
                element: "#practice-title-section",
                popover: {
                    title: t("onboarding.practiceTopicTitle"),
                    description: t("onboarding.practiceTopicDesc"),
                    side: "bottom" as const,
                    align: "start" as const,
                },
            },
            {
                element: "#practice-lang",
                popover: {
                    title: t("onboarding.practiceLangTitle"),
                    description: t("onboarding.practiceLangDesc"),
                    side: "bottom" as const,
                    align: "center" as const,
                },
            },
            {
                element: "#practice-time",
                popover: {
                    title: t("onboarding.practiceTimeTitle"),
                    description: t("onboarding.practiceTimeDesc"),
                    side: "bottom" as const,
                    align: "center" as const,
                },
            },
            {
                element: "#practice-credits",
                popover: {
                    title: t("onboarding.practiceCreditsTitle"),
                    description: t("onboarding.practiceCreditsDesc"),
                    side: "bottom" as const,
                    align: "center" as const,
                },
            },
            {
                element: "#practice-coins",
                popover: {
                    title: t("onboarding.practiceCoinsTitle"),
                    description: t("onboarding.practiceCoinsDesc"),
                    side: "bottom" as const,
                    align: "center" as const,
                },
            },
            {
                element: "#practice-progress-section",
                popover: {
                    title: t("onboarding.practiceProgressTitle"),
                    description: t("onboarding.practiceProgressDesc"),
                    side: "bottom" as const,
                    align: "end" as const,
                },
            },
            {
                element: "main section > div:first-child",
                popover: {
                    title: t("onboarding.mockSourceTitle"),
                    description: t("onboarding.mockSourceDesc"),
                    side: "bottom" as const,
                    align: "center" as const,
                },
            },
            {
                element: "textarea",
                popover: {
                    title: t("onboarding.mockInputTitle"),
                    description: t("onboarding.mockInputDesc"),
                    side: "top" as const,
                    align: "center" as const,
                },
            },
            {
                element: "button:has(svg.size-4.shrink-0):not(:has(svg.animate-spin))",
                popover: {
                    title: t("onboarding.mockHintsTitle"),
                    description: t("onboarding.mockHintsDesc"),
                    side: "top" as const,
                    align: "start" as const,
                },
            },
            {
                element: "aside",
                popover: {
                    title: t("onboarding.mockFeedbackTitle"),
                    description: t("onboarding.mockFeedbackDesc"),
                    side: "left" as const,
                    align: "start" as const,
                },
            },
        ];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && driverObj) {
                e.preventDefault();

                const currentIndex = driverObj.getActiveIndex();
                const totalSteps = steps.length;

                if (currentIndex === totalSteps - 1) {
                    setLocalStorageBoolean(storageKey, true);
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
                onDestroyStarted: () => {
                    window.removeEventListener("keydown", handleKeyDown);
                    setLocalStorageBoolean(storageKey, true);
                    driverObj.destroy();
                },
            });

            window.addEventListener("keydown", handleKeyDown);
            driverObj.drive();
        }, 1400);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [id, t]);

    return null;
}