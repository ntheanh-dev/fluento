import { Target, FileText, CheckCircle, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import home from "../../assets/image/home.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation, Trans } from "react-i18next";
import { useMemo } from "react";

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = Cookies.get("accessToken") !== undefined;
  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100 font-display">
                <Trans
                  i18nKey="landing.heroTitle"
                  components={{ span: <span className="text-[#137fec]" /> }}
                />
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl font-display">
                {t("landing.heroSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#137fec] text-white font-bold rounded-lg shadow-xl shadow-[#137fec]/30 text-lg font-display"
                onClick={handleStart}
              >
                {t("landing.ctaStart")}
              </motion.button>
              <button
                type="button"
                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg font-display"
              >
                {t("landing.ctaIntro")}
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-display">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full border-2 border-white bg-slate-300"></div>
                <div className="size-8 rounded-full border-2 border-white bg-slate-400"></div>
                <div className="size-8 rounded-full border-2 border-white bg-slate-500"></div>
              </div>
              <span>{t("landing.trustedBy")}</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-tr from-[#137fec]/20 to-[#137fec]/5 absolute -inset-4 blur-2xl"></div>
            <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video shadow-2xl border border-slate-200 dark:border-slate-700">
              <img className="w-full h-full object-cover" src={home} alt="Dashboard" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-[#f6f7f8] dark:bg-slate-950" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-slate-900 dark:text-slate-100">
            {t("landing.featuresTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-display">
            {t("landing.featuresSubtitle")}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900/90 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="size-12 bg-[#137fec]/10 rounded-lg flex items-center justify-center mb-6">
              <Target className="text-[#137fec] w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-display text-slate-900 dark:text-slate-100">
              {t("landing.feature1Title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-display">
              {t("landing.feature1Desc")}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900/90 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="size-12 bg-[#137fec]/10 rounded-lg flex items-center justify-center mb-6">
              <FileText className="text-[#137fec] w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-display text-slate-900 dark:text-slate-100">
              {t("landing.feature2Title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-display">
              {t("landing.feature2Desc")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const AIFeedback = () => {
  const { t } = useTranslation();
  const bullets = useMemo(
    () => [
      t("landing.aiBullet1"),
      t("landing.aiBullet2"),
      t("landing.aiBullet3"),
    ],
    [t],
  );
  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 relative">
          <div className="flex-1 space-y-6 z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#137fec] text-white text-xs font-bold tracking-widest uppercase font-display">
              {t("landing.aiBadge")}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight font-display">
              {t("landing.aiTitle")}
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-display">
              {t("landing.aiBody")}
            </p>
            <ul className="space-y-4">
              {bullets.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-white font-display">
                  <CheckCircle className="text-[#137fec] w-5 h-5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors font-display"
            >
              {t("landing.aiCta")}
            </button>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-none relative">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl">
              <div className="space-y-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 italic text-sm mb-2 font-display">
                    {t("landing.demoDraft")}
                  </p>
                  <p className="text-white font-display">
                    The report was finish by the team yesterday.
                  </p>
                </div>
                <div className="flex justify-center">
                  <ArrowDown className="text-[#137fec] w-6 h-6" />
                </div>
                <div className="p-4 bg-[#137fec]/20 rounded-lg border border-[#137fec]/40">
                  <p className="text-[#137fec] font-bold text-sm mb-2 font-display">
                    {t("landing.demoAiLabel")}
                  </p>
                  <p className="text-white font-display">
                    The team{" "}
                    <span className="text-[#137fec] font-bold decoration-[#137fec] underline decoration-2">
                      finished
                    </span>{" "}
                    the report yesterday.
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 font-display">
                    {t("landing.demoNote")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = useMemo(
    () => [
      { id: 1, title: t("landing.step1Title"), desc: t("landing.step1Desc") },
      { id: 2, title: t("landing.step2Title"), desc: t("landing.step2Desc") },
      { id: 3, title: t("landing.step3Title"), desc: t("landing.step3Desc") },
      { id: 4, title: t("landing.step4Title"), desc: t("landing.step4Desc") },
    ],
    [t],
  );

  return (
    <section className="py-24 bg-[#f6f7f8] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight mb-4 font-display text-slate-900 dark:text-slate-100">
            {t("landing.howTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-display">
            {t("landing.howSubtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>
          {steps.map((step) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="size-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-4 border-[#f6f7f8] dark:border-slate-950 shadow-xl text-[#137fec] text-3xl font-bold group-hover:bg-[#137fec] group-hover:text-white transition-all duration-300 font-display">
                {step.id}
              </div>
              <h3 className="mt-6 text-xl font-bold font-display text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 font-display">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-display">
      <main>
        <Hero />
        <Features />
        <AIFeedback />
        <HowItWorks />
      </main>
    </div>
  );
}
