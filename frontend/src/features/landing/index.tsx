import { Target, FileText, CheckCircle, ArrowDown, ArrowUp, Languages, Check } from "lucide-react";
import { motion } from "motion/react";
import home from "../../assets/image/home.png";
import useAppVideo from "../../assets/video/use-app.mp4";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation, Trans } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCoverImage } from "@/shared/constants/practice-covers";
import { FlagIcon, type FlagCountryCode } from "@/shared/utilities/flag";
import LoginWithGoogleModal from "@/features/auth/ui/LoginWithGoogleModal";
import { getRuntimeEnv } from "@/shared/config/runtime-env";

const sectionRevealProps = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

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

  const handleScrollToIntro = () => {
    document.getElementById("use-app-showcase")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-white dark:bg-slate-950"
      {...sectionRevealProps}
    >
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
                onClick={handleScrollToIntro}
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
    </motion.section>
  );
};

const Features = () => {
  const { t } = useTranslation();
  return (
    <motion.section className="py-24 bg-[#f3f4f6] dark:bg-slate-950" id="features" {...sectionRevealProps}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-slate-900 dark:text-slate-100">
            {t("landing.featuresTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-display">
            {t("landing.featuresSubtitle")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900/90 p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="size-10 bg-[#137fec]/10 rounded-lg flex items-center justify-center mb-5">
              <Target className="text-[#137fec] w-5 h-5" />
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
            className="bg-white dark:bg-slate-900/90 p-7 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="size-10 bg-[#137fec]/10 rounded-lg flex items-center justify-center mb-5">
              <FileText className="text-[#137fec] w-5 h-5" />
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
    </motion.section>
  );
};

const UseAppShowcase = () => {
  const { t } = useTranslation();
  const bullets = useMemo(
    () => [t("landing.useAppBullet1"), t("landing.useAppBullet2"), t("landing.useAppBullet3")],
    [t],
  );

  return (
    <motion.section id="use-app-showcase" className="bg-slate-50 py-20 dark:bg-slate-950" {...sectionRevealProps}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-100 px-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">LuyenViet App</p>
              <div className="w-12" />
            </div>
            <div>
              <video
                className="block h-auto w-full"
                src={useAppVideo}
                autoPlay
                muted
                loop
                playsInline
                poster={home}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[32px] bg-gradient-to-r from-[#137fec]/20 via-sky-400/10 to-violet-500/20 blur-2xl" />
        </div>

        <div className="space-y-5">
          <p className="inline-flex w-fit rounded-md bg-[#137fec]/10 px-3 py-1 text-xs font-semibold text-[#137fec]">
            {t("landing.useAppBadge")}
          </p>
          <h3 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            {t("landing.useAppTitle")}
          </h3>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {t("landing.useAppDescription")}
          </p>
          <ul className="space-y-3 text-slate-700 dark:text-slate-200">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="inline-flex size-5 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <Check className="size-3" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("landing.useAppCaption")}</p>
        </div>
      </div>
    </motion.section>
  );
};

const MultilingualSpotlight = () => {
  const { t } = useTranslation();
  const languageCards = useMemo(
    () => [
      { countryCode: "US" as FlagCountryCode, label: t("profile.langEnglish") },
      { countryCode: "VN" as FlagCountryCode, label: t("profile.langVietnamese") },
      { countryCode: "KR" as FlagCountryCode, label: "Tiếng Hàn" },
      { countryCode: "CN" as FlagCountryCode, label: "Tiếng Trung" },
    ],
    [t],
  );

  const bullets = useMemo(() => [t("landing.multiBullet1"), t("landing.multiBullet2")], [t]);

  return (
    <motion.section className="py-24 bg-white dark:bg-slate-950" {...sectionRevealProps}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">

          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#137fec]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#137fec]">
              <Languages className="size-4" />
              {t("landing.multiBadge")}
            </p>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight text-slate-900 dark:text-slate-100">
              <span>{t("landing.multiTitlePrefix")}</span>
              <span className="text-[#137fec]">{t("landing.multiTitleAccent")}</span>
            </h3>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {t("landing.multiDescription")}
            </p>
            <ul className="space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Check className="size-4" />
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{bullet}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {languageCards.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900/70"
              >
                <FlagIcon countryCode={item.countryCode} className="mx-auto h-7 w-10 rounded-[3px]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </motion.section>
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
    <motion.section className="py-24 bg-white dark:bg-slate-950 overflow-hidden" {...sectionRevealProps}>
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
    </motion.section>
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
    <motion.section className="py-24 bg-[#f6f7f8] dark:bg-slate-950" {...sectionRevealProps}>
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
    </motion.section>
  );
};

const landingParagraphMockResult = {
  content: [
    {
      id: 1925,
      title: "Xu Hướng Thay Đổi Về Sử Dụng Phương Tiện Giao Thông Công Cộng tại Thành Phố X",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Báo cáo này phân tích sự thay đổi trong việc sử dụng phương tiện giao thông công cộng tại Thành phố X trong giai đoạn từ năm 2010 đến năm 2020.",
        "Mục đích chính là để xác định các xu hướng chính và các yếu tố tác động đến sự thay đổi này.",
        "Biểu đồ đường cho thấy số lượng hành khách sử dụng xe buýt đã giảm đáng kể từ 1,2 triệu lượt mỗi tháng năm 2010 xuống còn 800.000 lượt vào năm 2020.",
        "Ngược lại, số lượng hành khách sử dụng tàu điện ngầm (metro) lại tăng trưởng đều đặn, từ 500.000 lượt năm 2010 lên 1,5 triệu lượt năm 2020.",
        "Nguyên nhân chính của sự sụt giảm này có thể liên quan đến việc gia tăng số lượng phương tiện cá nhân, đặc biệt là ô tô và xe máy.",
        "Giá xăng dầu tương đối ổn định trong giai đoạn này cũng góp phần khuyến khích người dân sử dụng phương tiện riêng.",
        "Tuy nhiên, sự phát triển của hệ thống tàu điện ngầm với nhiều tuyến mới đã thu hút một lượng lớn hành khách.",
        "Việc mở rộng mạng lưới tàu điện ngầm đã cải thiện đáng kể khả năng tiếp cận và sự tiện lợi cho người dân.",
        "Ngoài ra, chính sách khuyến khích sử dụng phương tiện công cộng, như giảm giá vé, cũng có tác động tích cực.",
        "Số liệu cho thấy mức độ hài lòng của hành khách đối với dịch vụ tàu điện ngầm tăng lên đáng kể trong suốt giai đoạn này.",
        "Một yếu tố khác cần xem xét là sự gia tăng dân số của Thành phố X, dẫn đến áp lực lên hệ thống giao thông công cộng.",
        "Mặc dù số lượng hành khách xe buýt giảm, tổng số lượng hành khách sử dụng phương tiện công cộng vẫn tăng nhẹ nhờ sự tăng trưởng của tàu điện ngầm.",
        "Có thể thấy rằng, sự chuyển dịch từ xe buýt sang tàu điện ngầm là một xu hướng rõ rệt trong giai đoạn này.",
        "Việc đầu tư vào cơ sở hạ tầng giao thông công cộng, đặc biệt là tàu điện ngầm, tỏ ra hiệu quả trong việc thu hút người dân.",
        "Tuy nhiên, việc duy trì và nâng cấp hệ thống xe buýt cũng rất quan trọng để đảm bảo tính đa dạng và tiếp cận cho tất cả người dân.",
        "Một phân tích sâu hơn về các yếu tố kinh tế xã hội cũng cần được thực hiện để hiểu rõ hơn về xu hướng này.",
        "Có thể dự đoán rằng, nếu chính sách khuyến khích sử dụng phương tiện công cộng tiếp tục được triển khai, số lượng hành khách tàu điện ngầm sẽ tiếp tục tăng.",
        "Ngược lại, nếu không có các biện pháp can thiệp, số lượng hành khách xe buýt có thể tiếp tục giảm.",
        "Việc cải thiện chất lượng dịch vụ xe buýt, như tăng tần suất và nâng cao sự thoải mái, có thể giúp thu hút lại hành khách.",
        "Cần có sự phối hợp giữa các cơ quan quản lý giao thông và các nhà đầu tư để phát triển một hệ thống giao thông công cộng hiệu quả và bền vững.",
        "Nghiên cứu sâu hơn về thói quen đi lại của người dân cũng sẽ cung cấp những thông tin hữu ích cho việc lập kế hoạch giao thông.",
        "Việc sử dụng công nghệ thông tin trong quản lý và điều hành giao thông công cộng cũng là một yếu tố quan trọng cần được xem xét.",
        "Ví dụ, ứng dụng di động cung cấp thông tin về lịch trình và tình trạng giao thông có thể giúp người dân lựa chọn phương tiện phù hợp.",
        "Tóm lại, xu hướng thay đổi trong việc sử dụng phương tiện giao thông công cộng tại Thành phố X phản ánh sự phát triển kinh tế xã hội và sự thay đổi trong nhu cầu của người dân.",
        "Sự tăng trưởng của tàu điện ngầm cho thấy tiềm năng của việc đầu tư vào cơ sở hạ tầng giao thông công cộng.",
        "Tuy nhiên, việc duy trì và nâng cấp hệ thống xe buýt vẫn là cần thiết để đảm bảo tính toàn diện của hệ thống giao thông.",
        "Các nhà quản lý cần tiếp tục theo dõi và phân tích dữ liệu để đưa ra các quyết định phù hợp và hiệu quả.",
        "Việc khuyến khích sử dụng phương tiện công cộng là một phần quan trọng trong việc giảm thiểu ô nhiễm môi trường và cải thiện chất lượng cuộc sống.",
      ],
    },
    {
      id: 1921,
      title: "Sự Thay Đổi Trong Tỷ Lệ Dân Số Việt Nam: 1990-2020",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Báo cáo này trình bày sự thay đổi về tỷ lệ dân số Việt Nam theo độ tuổi, được phân loại thành ba nhóm chính: dưới 15 tuổi, từ 15 đến 64 tuổi, và trên 64 tuổi, trong giai đoạn từ năm 1990 đến năm 2020.",
        "Mục đích của báo cáo là phân tích xu hướng dân số và những tác động tiềm năng của nó đối với chính sách xã hội và kinh tế của đất nước.",
        "Nhìn chung, tỷ lệ dân số dưới 15 tuổi đã giảm đáng kể trong suốt giai đoạn này, từ 38% năm 1990 xuống còn 22% năm 2020, cho thấy sự thành công của các chương trình kế hoạch hóa gia đình.",
        "Ngược lại, tỷ lệ dân số trong độ tuổi lao động (15-64 tuổi) lại tăng mạnh mẽ, từ 52% năm 1990 lên 70% năm 2020, phản ánh sự cải thiện về điều kiện sống và y tế.",
        "Sự gia tăng này đóng góp vào lực lượng lao động lớn, thúc đẩy tăng trưởng kinh tế nhưng cũng tạo ra áp lực lên hệ thống giáo dục và việc làm.",
        "Tỷ lệ dân số trên 64 tuổi cũng tăng từ 10% năm 1990 lên 8% năm 2020, mặc dù với tốc độ chậm hơn so với nhóm tuổi lao động.",
        "Sự gia tăng dân số già đặt ra những thách thức liên quan đến hệ thống chăm sóc sức khỏe và an sinh xã hội.",
        "Năm 1995, tỷ lệ dân số dưới 15 tuổi là 35%, giảm 3% so với năm 1990, cho thấy xu hướng giảm dần bắt đầu từ giữa những năm 1990.",
        "Tỷ lệ dân số trong độ tuổi lao động tăng lên 55% vào năm 1995, cho thấy sự chuyển dịch dân số về phía lực lượng lao động.",
        "Đến năm 2000, tỷ lệ dân số dưới 15 tuổi tiếp tục giảm xuống 32%, trong khi tỷ lệ dân số lao động đạt 58%.",
        "Năm 2005 đánh dấu một bước ngoặt quan trọng, khi tỷ lệ dân số dưới 15 tuổi giảm xuống 28% và tỷ lệ dân số lao động vượt qua mốc 60%, đạt 62%.",
        "Từ năm 2010 đến năm 2015, xu hướng này tiếp tục diễn ra, với tỷ lệ dân số dưới 15 tuổi giảm xuống 25% và tỷ lệ dân số lao động tăng lên 68%.",
        "Năm 2015 cũng chứng kiến sự gia tăng nhẹ tỷ lệ dân số trên 64 tuổi, lên 9%, cho thấy sự bắt đầu của quá trình lão hóa dân số.",
        "Năm 2020, tỷ lệ dân số dưới 15 tuổi đã giảm xuống mức thấp nhất là 22%, trong khi tỷ lệ dân số lao động đạt đỉnh điểm là 70%.",
        "Tỷ lệ dân số trên 64 tuổi cũng tăng lên 8%, mặc dù vẫn thấp hơn so với nhiều quốc gia phát triển khác.",
        "Sự thay đổi về cấu trúc dân số này có những tác động đáng kể đến thị trường lao động, với nhu cầu về lao động có kỹ năng ngày càng tăng.",
        "Đồng thời, nó cũng tạo ra cơ hội cho sự phát triển của ngành công nghiệp dịch vụ, đặc biệt là trong lĩnh vực chăm sóc sức khỏe và an sinh xã hội.",
        "Để đối phó với những thách thức này, chính phủ cần đầu tư vào giáo dục và đào tạo, cũng như cải thiện hệ thống an sinh xã hội.",
        "Ngoài ra, việc khuyến khích sinh sản và hỗ trợ các gia đình trẻ cũng là những biện pháp quan trọng để duy trì sự cân bằng dân số.",
        "Về mặt kinh tế, sự gia tăng dân số lao động có thể thúc đẩy tăng trưởng GDP, nhưng cũng đòi hỏi sự đầu tư vào cơ sở hạ tầng và tạo việc làm.",
        "Về mặt xã hội, sự gia tăng dân số già có thể dẫn đến gánh nặng lớn hơn cho hệ thống y tế và an sinh xã hội.",
        "Do đó, việc lập kế hoạch dân số một cách hiệu quả là rất quan trọng để đảm bảo sự phát triển bền vững của đất nước.",
        "Việc phân tích dữ liệu dân số cũng cho thấy sự khác biệt về tỷ lệ sinh giữa các vùng miền, với các vùng nông thôn thường có tỷ lệ sinh cao hơn so với các vùng thành thị.",
        "Điều này có thể là do sự khác biệt về điều kiện kinh tế xã hội và tiếp cận với các dịch vụ y tế.",
        "Do đó, chính sách dân số cần được điều chỉnh để phù hợp với đặc điểm của từng vùng miền.",
        "Tóm lại, sự thay đổi về tỷ lệ dân số Việt Nam từ năm 1990 đến năm 2020 cho thấy một xu hướng rõ ràng là giảm tỷ lệ dân số trẻ và tăng tỷ lệ dân số lao động và dân số già.",
        "Xu hướng này có những tác động đáng kể đến cả kinh tế và xã hội của đất nước.",
        "Để ứng phó với những tác động này, chính phủ cần có những chính sách phù hợp và hiệu quả.",
        "Việc theo dõi và phân tích dữ liệu dân số một cách thường xuyên là rất quan trọng để đảm bảo rằng các chính sách này được điều chỉnh kịp thời và phù hợp với tình hình thực tế.",
      ],
    },
    {
      id: 1920,
      title: "Xu Hướng Thay Đổi Về Sử Dụng Thiết Bị Điện Tử Cá Nhân ở Việt Nam, 2010-2020",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Biểu đồ đường thể hiện sự thay đổi trong tỷ lệ phần trăm dân số Việt Nam sử dụng ba loại thiết bị điện tử cá nhân - điện thoại thông minh, máy tính bảng và máy tính xách tay - từ năm 2010 đến năm 2020.",
        "Tổng quan, có một xu hướng gia tăng đáng kể trong việc sử dụng cả ba loại thiết bị trong suốt giai đoạn này, mặc dù với tốc độ khác nhau.",
        "Năm 2010, tỷ lệ sở hữu điện thoại thông minh là thấp nhất, chỉ đạt 15%, trong khi máy tính xách tay được sử dụng bởi 25% dân số và máy tính bảng là 5%.",
        "Tuy nhiên, điện thoại thông minh đã trải qua sự tăng trưởng nhanh nhất, vượt qua máy tính xách tay vào năm 2015 và đạt mức cao nhất là 70% vào năm 2020.",
        "Sự phổ biến của máy tính xách tay cũng tăng đều đặn, từ 25% năm 2010 lên 40% vào năm 2020, cho thấy nhu cầu liên tục về thiết bị này cho công việc và học tập.",
        "Mặc dù có sự tăng trưởng ban đầu, việc sử dụng máy tính bảng đã chững lại sau năm 2016, đạt mức 30% vào năm 2020 - thấp hơn đáng kể so với điện thoại thông minh và máy tính xách tay.",
        "Nguyên nhân cho sự tăng trưởng vượt bậc của điện thoại thông minh có thể liên quan đến giá cả phải chăng hơn và sự phát triển của các ứng dụng di động đa dạng.",
        "Việc sử dụng máy tính xách tay tăng lên có thể được giải thích bởi sự gia tăng của các công việc từ xa và học trực tuyến, đặc biệt là trong giai đoạn đại dịch COVID-19.",
        "Sự chững lại của máy tính bảng có thể là do sự xuất hiện của các điện thoại thông minh màn hình lớn và máy tính xách tay mỏng nhẹ.",
        "Năm 2015 đánh dấu một bước ngoặt quan trọng, khi tỷ lệ sử dụng điện thoại thông minh vượt qua máy tính xách tay, cho thấy sự thay đổi trong thói quen sử dụng công nghệ của người dân.",
        "Một điều đáng chú ý là khoảng cách giữa tỷ lệ sử dụng điện thoại thông minh và máy tính xách tay ngày càng lớn hơn theo thời gian.",
        "Cụ thể, vào năm 2020, tỷ lệ sử dụng điện thoại thông minh gấp gần gấp đôi so với máy tính xách tay (70% so với 40%).",
        "Tóm lại, dữ liệu cho thấy sự chuyển dịch rõ rệt từ việc sử dụng máy tính xách tay sang điện thoại thông minh trong giai đoạn 2010-2020.",
        "Xu hướng này phản ánh sự thay đổi trong lối sống và nhu cầu công nghệ của người Việt Nam trong thời đại số.",
        "Dự kiến, điện thoại thông minh sẽ tiếp tục là thiết bị điện tử cá nhân được ưa chuộng nhất tại Việt Nam trong tương lai gần.",
      ],
    },
    {
      id: 1919,
      title: "Xu Hướng Dân Số và Tỷ Lệ Sinh ở Việt Nam (1990-2020)",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Báo cáo này trình bày sự thay đổi về dân số và tỷ lệ sinh ở Việt Nam trong giai đoạn từ năm 1990 đến năm 2020.",
        "Tổng dân số Việt Nam đã tăng đáng kể trong ba thập kỷ này, từ khoảng 65 triệu người năm 1990 lên hơn 97 triệu người vào năm 2020.",
        "Tuy nhiên, tốc độ tăng trưởng dân số đã chậm lại rõ rệt, đặc biệt là trong mười năm gần đây.",
        "Năm 1990, tỷ lệ sinh trung bình là 3,7 con trên một phụ nữ, một con số khá cao so với các nước trong khu vực.",
        "Con số này đã giảm xuống còn 2,1 con vào năm 2000, cho thấy sự thay đổi trong nhận thức về kế hoạch hóa gia đình.",
        "Đến năm 2020, tỷ lệ sinh đã giảm xuống mức 2,0 con, gần đạt đến mức thay thế là 2,1 con.",
        "Sự giảm sút này chủ yếu được thúc đẩy bởi sự gia tăng trình độ học vấn của phụ nữ và sự tham gia ngày càng nhiều của họ vào lực lượng lao động.",
        "Xu hướng đô thị hóa cũng đóng một vai trò quan trọng, khi các gia đình ở thành thị thường có ít con hơn so với các gia đình ở nông thôn.",
        "Các chính sách của chính phủ về kế hoạch hóa gia đình, bao gồm việc tiếp cận các biện pháp tránh thai, cũng đã góp phần vào sự thay đổi này.",
        "Tuy nhiên, tỷ lệ sinh thấp ở một số tỉnh thành phía Bắc đang gây ra lo ngại về vấn đề lão hóa dân số.",
        "Tỷ lệ người cao tuổi (trên 65 tuổi) đã tăng từ 8% năm 1990 lên 12% vào năm 2020.",
        "Điều này đặt ra những thách thức lớn cho hệ thống an sinh xã hội và chăm sóc sức khỏe.",
        "Mặt khác, tỷ lệ trẻ em (dưới 15 tuổi) đã giảm từ 38% năm 1990 xuống còn 25% vào năm 2020.",
        "Sự thay đổi này cho thấy Việt Nam đang trải qua quá trình chuyển đổi nhân khẩu học điển hình.",
        "Các chuyên gia dự đoán rằng tỷ lệ sinh sẽ tiếp tục giảm trong những năm tới, mặc dù với tốc độ chậm hơn.",
        "Điều này có thể dẫn đến một xã hội già hóa nhanh chóng, với những hệ lụy kinh tế và xã hội đáng kể.",
        "Việc tăng cường các chính sách hỗ trợ gia đình và khuyến khích sinh con có thể giúp giảm thiểu những tác động tiêu cực này.",
        "Đồng thời, cần nâng cao chất lượng giáo dục và đào tạo để đáp ứng nhu cầu của một lực lượng lao động đang ngày càng già hóa.",
        "Tóm lại, sự thay đổi về dân số và tỷ lệ sinh ở Việt Nam trong giai đoạn 1990-2020 là một quá trình phức tạp với nhiều yếu tố tác động lẫn nhau.",
        "Việc hiểu rõ những xu hướng này là rất quan trọng để xây dựng các chính sách phát triển bền vững và toàn diện.",
      ],
    },
    {
      id: 1917,
      title: "Sự Thay Đổi Trong Tỷ Lệ Dân Số Việt Nam và Các Thành Phố Lớn (2010-2020)",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Biểu đồ đường dưới đây cho thấy sự thay đổi về tỷ lệ dân số sống ở thành thị và nông thôn tại Việt Nam từ năm 2010 đến năm 2020.",
        "Nhìn chung, có một xu hướng đáng chú ý là dân số thành thị tăng lên đáng kể, trong khi dân số nông thôn giảm xuống trong suốt giai đoạn này.",
        "Cụ thể, năm 2010, tỷ lệ dân số sống ở nông thôn chiếm khoảng 70%, cao hơn đáng kể so với tỷ lệ dân số thành thị là 30%.",
        "Tuy nhiên, đến năm 2015, sự chênh lệch này bắt đầu thu hẹp lại, với dân số nông thôn giảm xuống còn 65% và dân số thành thị tăng lên 35%.",
        "Sự thay đổi này phản ánh quá trình đô thị hóa nhanh chóng đang diễn ra tại Việt Nam, đặc biệt là ở các thành phố lớn như Hà Nội và Thành phố Hồ Chí Minh.",
        "Năm 2020, tỷ lệ dân số thành thị vượt qua dân số nông thôn, đạt mức 52%, trong khi dân số nông thôn giảm xuống còn 48%.",
        "Sự gia tăng dân số thành thị chủ yếu là do dòng người di cư từ nông thôn ra thành phố tìm kiếm cơ hội việc làm và mức sống tốt hơn.",
        "Điều này cũng liên quan đến sự phát triển của các khu công nghiệp và dịch vụ tại các thành phố lớn, thu hút lực lượng lao động trẻ và có trình độ.",
        "Mặt khác, sự giảm sút dân số nông thôn có thể được giải thích bởi sự suy giảm của ngành nông nghiệp và tình trạng thiếu cơ hội việc làm tại các vùng nông thôn.",
        "Ngoài ra, việc tiếp cận các dịch vụ y tế, giáo dục và cơ sở hạ tầng tốt hơn tại các thành phố cũng là một yếu tố thúc đẩy quá trình di cư.",
        "Sự thay đổi này mang lại nhiều lợi ích kinh tế cho các thành phố, nhưng cũng đặt ra những thách thức về quản lý đô thị, giao thông và môi trường.",
        "Ví dụ, việc tăng dân số quá nhanh có thể gây ra tình trạng quá tải giao thông, thiếu nhà ở và ô nhiễm môi trường.",
        "Để giải quyết những thách thức này, cần có các chính sách phát triển đô thị bền vững và phân bố dân cư hợp lý hơn.",
        "Một giải pháp tiềm năng là đầu tư vào phát triển kinh tế nông thôn để tạo thêm cơ hội việc làm và cải thiện chất lượng cuộc sống ở các vùng nông thôn.",
        "Điều này có thể giúp giảm bớt áp lực lên các thành phố lớn và thúc đẩy sự phát triển cân bằng hơn giữa thành thị và nông thôn.",
        "Tóm lại, biểu đồ cho thấy một xu hướng rõ ràng là dân số Việt Nam đang chuyển dịch từ nông thôn sang thành thị.",
        "Sự thay đổi này phản ánh những biến động kinh tế - xã hội sâu sắc trong quá trình phát triển của đất nước.",
        "Việc hiểu rõ những xu hướng này là rất quan trọng để hoạch định các chính sách phát triển phù hợp.",
        "Do đó, các nhà hoạch định chính sách cần chú trọng đến việc xây dựng các thành phố thông minh và bền vững, đồng thời cải thiện đời sống của người dân ở cả thành thị và nông thôn.",
        "Xu hướng này dự kiến sẽ tiếp tục trong những năm tới, và cần có những biện pháp chủ động để đảm bảo sự phát triển bền vững và công bằng.",
      ],
    },
    {
      id: 1916,
      title: "Biểu đồ về Tỷ lệ Tham gia Giáo dục Đại học tại Việt Nam (2010-2020)",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Biểu đồ đường dưới đây trình bày tỷ lệ phần trăm dân số trong độ tuổi 18-24 tham gia giáo dục đại học tại Việt Nam từ năm 2010 đến năm 2020.",
        "Nhìn chung, tỷ lệ này có xu hướng tăng đáng kể trong suốt giai đoạn được đề cập, mặc dù có một số biến động nhỏ giữa các năm.",
        "Năm 2010, tỷ lệ tham gia giáo dục đại học là 15%, một con số tương đối thấp so với các quốc gia phát triển trong khu vực.",
        "Tuy nhiên, đến năm 2015, tỷ lệ này đã tăng lên 22%, cho thấy sự quan tâm ngày càng tăng của giới trẻ Việt Nam đối với việc học tập ở bậc đại học.",
        "Sự tăng trưởng này có thể được giải thích bởi sự cải thiện về điều kiện kinh tế và nhận thức về tầm quan trọng của giáo dục đối với sự nghiệp.",
        "Đặc biệt, năm 2017 chứng kiến mức tăng đột biến lên 28%, có lẽ do chính sách mở rộng các trường đại học và chương trình học bổng của chính phủ.",
        "Mặc dù có một sự sụt giảm nhẹ xuống 26% vào năm 2018, tỷ lệ tham gia vẫn tiếp tục tăng lên 30% vào năm 2020, đánh dấu mức cao nhất trong giai đoạn này.",
        "Điều này cho thấy sự bền bỉ của xu hướng tăng trưởng, bất chấp những thách thức kinh tế và xã hội.",
        "Có thể thấy, sự gia tăng tỷ lệ tham gia giáo dục đại học phản ánh sự phát triển kinh tế - xã hội của Việt Nam và sự đầu tư vào nguồn nhân lực chất lượng cao.",
        "Tóm lại, biểu đồ cho thấy một sự gia tăng rõ rệt trong tỷ lệ tham gia giáo dục đại học tại Việt Nam từ năm 2010 đến năm 2020, với một số biến động nhỏ nhưng xu hướng chung vẫn là tăng.",
      ],
    },
    {
      id: 1915,
      title: "Sự Thay Đổi Trong Tỷ Lệ Dân Số Việt Nam: 1990-2020",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Biểu đồ đường dưới đây mô tả sự thay đổi về tỷ lệ dân số theo độ tuổi của Việt Nam trong giai đoạn từ năm 1990 đến năm 2020, được chia thành ba nhóm tuổi chính: dưới 15 tuổi, từ 15 đến 64 tuổi, và trên 64 tuổi.",
        "Nhìn chung, tỷ lệ dân số dưới 15 tuổi đã giảm đáng kể trong suốt giai đoạn này, trong khi tỷ lệ dân số trong độ tuổi lao động lại có xu hướng tăng lên.",
        "Cụ thể, vào năm 1990, tỷ lệ dân số dưới 15 tuổi chiếm khoảng 35%, nhưng con số này đã giảm xuống chỉ còn khoảng 22% vào năm 2020.",
        "Ngược lại, tỷ lệ dân số từ 15 đến 64 tuổi đã tăng từ khoảng 55% năm 1990 lên 70% vào năm 2020, cho thấy lực lượng lao động ngày càng mở rộng.",
        "Tỷ lệ dân số trên 64 tuổi cũng có sự gia tăng, mặc dù với tốc độ chậm hơn, từ khoảng 10% năm 1990 lên 8% vào năm 2020.",
        "Sự thay đổi này phản ánh sự thành công của các chương trình kế hoạch hóa gia đình, dẫn đến giảm tỷ lệ sinh.",
        "Đồng thời, việc cải thiện điều kiện y tế và tăng tuổi thọ trung bình cũng góp phần làm tăng tỷ lệ dân số cao tuổi.",
        "Một yếu tố quan trọng khác là sự chuyển dịch cơ cấu kinh tế từ nông nghiệp sang công nghiệp và dịch vụ, tạo ra nhiều cơ hội việc làm hơn cho người trong độ tuổi lao động.",
        "Điều này khuyến khích người dân trì hoãn sinh con để tập trung vào sự nghiệp và nâng cao chất lượng cuộc sống.",
        "Tuy nhiên, sự gia tăng tỷ lệ dân số già cũng đặt ra những thách thức mới cho hệ thống an sinh xã hội, như vấn đề lương hưu và chăm sóc sức khỏe.",
        "Việc đảm bảo nguồn lực để hỗ trợ người cao tuổi sẽ là một ưu tiên quan trọng trong tương lai.",
        "Tóm lại, biểu đồ cho thấy một xu hướng rõ rệt trong cơ cấu dân số Việt Nam từ năm 1990 đến năm 2020: dân số trẻ em giảm, dân số trong độ tuổi lao động tăng, và dân số già tăng chậm.",
        "Những thay đổi này không chỉ phản ánh sự phát triển kinh tế - xã hội của đất nước mà còn đặt ra những yêu cầu mới trong việc hoạch định chính sách.",
        "Việc hiểu rõ những xu hướng này là rất quan trọng để xây dựng một tương lai bền vững cho Việt Nam.",
        "Do đó, chính phủ cần có những biện pháp phù hợp để tận dụng lợi thế của lực lượng lao động trẻ và đồng thời giải quyết những thách thức do dân số già hóa mang lại.",
      ],
    },
    {
      id: 1914,
      title: "Sự Thay Đổi Tỷ Lệ Dân Số Theo Độ Tuổi tại Việt Nam (2010-2020)",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Báo cáo này phân tích sự biến động về tỷ lệ dân số theo độ tuổi tại Việt Nam trong giai đoạn từ năm 2010 đến năm 2020.",
        "Năm 2010, nhóm dân số từ 0-14 tuổi chiếm tỷ lệ cao nhất, khoảng 28%, cho thấy một xã hội còn khá trẻ.",
        "Số liệu cho thấy nhóm dân số từ 15-64 tuổi chiếm khoảng 68% tổng dân số vào năm 2010, phản ánh lực lượng lao động dồi dào.",
        "Tuy nhiên, tỷ lệ dân số từ 65 tuổi trở lên chỉ chiếm khoảng 4% vào năm 2010, một con số tương đối thấp so với các quốc gia phát triển.",
        "Đến năm 2020, có sự dịch chuyển đáng kể trong cấu trúc dân số.",
        "Nhóm dân số 0-14 tuổi giảm xuống còn 23%, cho thấy xu hướng sinh giảm.",
        "Ngược lại, nhóm dân số từ 15-64 tuổi tăng lên thành 72%, tiếp tục khẳng định vị thế của lực lượng lao động.",
        "Đáng chú ý, tỷ lệ dân số từ 65 tuổi trở lên tăng đáng kể lên 6%, báo hiệu quá trình già hóa dân số đang diễn ra.",
        "Sự gia tăng này có thể được giải thích bởi sự cải thiện trong hệ thống y tế và tuổi thọ trung bình.",
        "So sánh với năm 2010, năm 2020 chứng kiến sự giảm sút của nhóm dân số trẻ và sự tăng trưởng của nhóm dân số cao tuổi.",
        "Xu hướng này đặt ra những thách thức mới cho hệ thống an sinh xã hội và chính sách lao động.",
        "Ví dụ, việc tăng số lượng người cao tuổi đòi hỏi sự đầu tư lớn hơn vào lĩnh vực y tế và chăm sóc người già.",
        "Bên cạnh đó, việc giảm số lượng người trong độ tuổi lao động có thể ảnh hưởng đến tăng trưởng kinh tế.",
        "Một yếu tố cần xem xét là sự phân bố dân số giữa các vùng miền.",
        "Các thành phố lớn như Hà Nội và Thành phố Hồ Chí Minh có tỷ lệ dân số già hóa cao hơn so với các vùng nông thôn.",
        "Điều này liên quan đến trình độ phát triển kinh tế và chất lượng cuộc sống cao hơn ở các thành phố.",
        "Ngoài ra, sự chênh lệch về tỷ lệ sinh giữa các vùng miền cũng góp phần vào sự khác biệt này.",
        "Các chính sách của chính phủ như khuyến khích sinh con và nâng cao chất lượng chăm sóc sức khỏe đang được triển khai để đối phó với tình trạng già hóa dân số.",
        "Tuy nhiên, hiệu quả của các chính sách này vẫn cần được đánh giá một cách toàn diện.",
        "Trong tương lai, dự kiến tỷ lệ dân số cao tuổi sẽ tiếp tục tăng, tạo ra những áp lực lớn hơn đối với hệ thống an sinh xã hội.",
        "Do đó, việc xây dựng các chính sách phù hợp và bền vững là vô cùng quan trọng.",
        "Nghiên cứu sâu hơn về các yếu tố ảnh hưởng đến cấu trúc dân số là cần thiết để đưa ra những quyết định chính sách chính xác.",
        "Việc phân tích dữ liệu theo giới tính và trình độ học vấn cũng sẽ cung cấp những thông tin hữu ích.",
        "Nhìn chung, sự thay đổi trong tỷ lệ dân số theo độ tuổi tại Việt Nam từ năm 2010 đến năm 2020 là một xu hướng đáng chú ý.",
        "Xu hướng này đòi hỏi sự điều chỉnh trong các chính sách kinh tế, xã hội và y tế.",
        "Kết luận, việc theo dõi và dự báo các xu hướng dân số là rất quan trọng để đảm bảo sự phát triển bền vững của đất nước.",
        "Những thay đổi này tạo ra cả cơ hội và thách thức cho Việt Nam trong những năm tới.",
      ],
    },
    {
      id: 1913,
      title: "Xu Hướng Thay Đổi Về Sử Dụng Phương Tiện Công Cộng Tại Thành Phố Hồ Chí Minh",
      type: "IELTS_TASK1",
      topic: "SOCIETY",
      sentences: [
        "Báo cáo này phân tích sự biến động trong việc sử dụng các phương tiện công cộng tại Thành phố Hồ Chí Minh từ năm 2010 đến năm 2024, dựa trên dữ liệu khảo sát và thống kê chính thức.",
        "Tổng quan cho thấy một sự gia tăng đáng kể trong việc sử dụng xe buýt và tàu điện ngầm, đồng thời có sự sụt giảm tương đối trong việc sử dụng xe máy cá nhân trong giai đoạn này.",
        "Cụ thể, năm 2010, xe máy chiếm khoảng 75% tổng số phương tiện giao thông được sử dụng, trong khi xe buýt và tàu điện ngầm chỉ chiếm 15% và 10% tương ứng.",
        "Tuy nhiên, đến năm 2024, tỷ lệ sử dụng xe máy đã giảm xuống còn 50%, trong khi xe buýt tăng lên 25% và tàu điện ngầm đạt 25%.",
        "Sự thay đổi này có thể được quy cho việc mở rộng mạng lưới tàu điện ngầm và các tuyến xe buýt mới, cũng như các chính sách khuyến khích sử dụng phương tiện công cộng của chính quyền thành phố.",
        "Ngoài ra, việc tăng cường các biện pháp kiểm soát ô nhiễm không khí và ùn tắc giao thông cũng góp phần thúc đẩy xu hướng này.",
        "Một yếu tố quan trọng khác là sự gia tăng nhận thức của người dân về lợi ích của việc sử dụng phương tiện công cộng, bao gồm giảm chi phí đi lại và bảo vệ môi trường.",
        "Các khảo sát cho thấy rằng phần lớn người dân, đặc biệt là giới trẻ, ngày càng quan tâm đến các giải pháp giao thông bền vững.",
        "Tuy nhiên, vẫn còn một số thách thức cần giải quyết, như việc cải thiện chất lượng dịch vụ và tăng cường sự kết nối giữa các tuyến phương tiện công cộng.",
        "Ví dụ, nhiều hành khách phàn nàn về tình trạng quá tải vào giờ cao điểm và sự thiếu chính xác về thời gian biểu.",
        "Thêm vào đó, việc thiếu các điểm đỗ xe buýt và trạm tàu điện ngầm ở các khu vực ngoại thành cũng gây khó khăn cho người sử dụng.",
        "Mặc dù có những thách thức này, xu hướng sử dụng phương tiện công cộng vẫn tiếp tục tăng trưởng ổn định trong những năm gần đây.",
        "Chính quyền thành phố đang triển khai các kế hoạch mở rộng mạng lưới giao thông công cộng và cải thiện cơ sở hạ tầng để đáp ứng nhu cầu ngày càng tăng của người dân.",
        "Dự kiến, trong vòng 5 năm tới, tỷ lệ sử dụng phương tiện công cộng sẽ tiếp tục tăng lên, đạt mức 40% vào năm 2029.",
        "Điều này sẽ góp phần giảm thiểu ùn tắc giao thông, ô nhiễm không khí và cải thiện chất lượng cuộc sống của người dân thành phố.",
        "Các nhà phân tích dự đoán rằng sự phát triển của các ứng dụng di động hỗ trợ giao thông công cộng cũng sẽ đóng vai trò quan trọng trong việc thúc đẩy xu hướng này.",
        "Ví dụ, các ứng dụng này cung cấp thông tin về thời gian biểu, lộ trình và tình trạng giao thông thực tế, giúp người dùng lên kế hoạch di chuyển một cách hiệu quả hơn.",
        "Tóm lại, sự thay đổi trong việc sử dụng phương tiện công cộng tại Thành phố Hồ Chí Minh là một xu hướng tích cực và bền vững, phản ánh sự phát triển kinh tế - xã hội và ý thức bảo vệ môi trường của người dân.",
        "Việc tiếp tục đầu tư vào cơ sở hạ tầng và cải thiện chất lượng dịch vụ là rất quan trọng để duy trì và thúc đẩy xu hướng này trong tương lai.",
      ],
    },
    {
      id: 2887,
      title: "Community in Modern Vietnam: Opportunities and Challenges",
      type: "IELTS_TASK2",
      topic: "SOCIETY",
      sentences: [
        "Trong xã hội hiện đại, vai trò của cộng đồng đang trải qua những biến đổi đáng kể do tác động của toàn cầu hóa và công nghệ.",
        "Ngày nay, sự phát triển của các phương tiện truyền thông xã hội đã tạo ra những cộng đồng ảo, nơi mọi người có thể kết nối dựa trên sở thích chung, bất kể khoảng cách địa lý.",
        "Tuy nhiên, điều này cũng đặt ra câu hỏi về tính bền vững và ý nghĩa thực sự của những mối quan hệ ảo này so với các cộng đồng truyền thống.",
        "Một số người cho rằng các cộng đồng ảo mang lại lợi ích về mặt kết nối và hỗ trợ tinh thần, đặc biệt là cho những người có ít cơ hội tương tác trực tiếp.",
        "Ngược lại, những người khác lại lo ngại rằng việc quá phụ thuộc vào các cộng đồng ảo có thể dẫn đến sự cô lập xã hội và giảm sút các kỹ năng giao tiếp thực tế.",
        "Bên cạnh đó, sự phát triển kinh tế nhanh chóng đã khiến nhiều người tập trung vào mục tiêu cá nhân, làm suy yếu các mối liên kết cộng đồng truyền thống như gia đình, làng xóm và các tổ chức xã hội.",
        "Sự di cư từ nông thôn ra thành thị cũng góp phần vào tình trạng này, khi mọi người rời bỏ quê hương để tìm kiếm cơ hội tốt hơn, dẫn đến sự tan rã của các cấu trúc cộng đồng.",
        "Tuy nhiên, vẫn có những nỗ lực để duy trì và phát huy vai trò của cộng đồng trong xã hội hiện đại.",
        "Ví dụ, các phong trào tình nguyện và các tổ chức phi chính phủ đang ngày càng phổ biến, thu hút sự tham gia của nhiều người trẻ tuổi.",
        "Những hoạt động này không chỉ giúp giải quyết các vấn đề xã hội mà còn tạo ra không gian để mọi người kết nối và đóng góp cho cộng đồng.",
        "Ngoài ra, chính phủ cũng đang khuyến khích sự phát triển của các mô hình cộng đồng tự quản, nhằm tăng cường sự tham gia của người dân vào quá trình ra quyết định.",
        "Một ví dụ điển hình là các mô hình hợp tác xã nông nghiệp, nơi nông dân có thể hợp tác với nhau để nâng cao năng suất và chất lượng sản phẩm.",
        "Tuy nhiên, việc xây dựng và duy trì các cộng đồng bền vững đòi hỏi sự nỗ lực của tất cả các bên liên quan, bao gồm cá nhân, gia đình, chính phủ và các tổ chức xã hội.",
        "Điều quan trọng là phải tạo ra một môi trường khuyến khích sự tin tưởng, tôn trọng và hợp tác giữa các thành viên trong cộng đồng.",
        "Đồng thời, cần phải có những chính sách hỗ trợ phù hợp để giúp các cộng đồng phát triển và giải quyết các vấn đề mà họ đang đối mặt.",
        "Trong bối cảnh toàn cầu hóa, việc bảo tồn bản sắc văn hóa cộng đồng cũng là một thách thức quan trọng.",
        "Việc mất đi các giá trị truyền thống và các phong tục tập quán có thể dẫn đến sự suy giảm bản sắc cộng đồng và làm xói mòn các mối liên kết xã hội.",
        "Do đó, cần phải có những biện pháp để bảo tồn và phát huy các giá trị văn hóa cộng đồng, đồng thời khuyến khích sự sáng tạo và đổi mới.",
        "Nhiều chuyên gia cho rằng giáo dục đóng vai trò quan trọng trong việc hình thành ý thức cộng đồng và các giá trị xã hội.",
        "Thông qua giáo dục, học sinh có thể được trang bị những kiến thức và kỹ năng cần thiết để tham gia vào các hoạt động cộng đồng và đóng góp vào sự phát triển của xã hội.",
        "Ngoài ra, việc khuyến khích các hoạt động ngoại khóa và các dự án cộng đồng cũng có thể giúp học sinh phát triển ý thức trách nhiệm xã hội.",
        "Tuy nhiên, giáo dục không phải là giải pháp duy nhất.",
        "Cần phải có sự phối hợp chặt chẽ giữa các trường học, gia đình và các tổ chức xã hội để tạo ra một môi trường hỗ trợ cho sự phát triển toàn diện của học sinh.",
        "Trong tương lai, vai trò của cộng đồng có thể sẽ tiếp tục thay đổi do tác động của các xu hướng mới như trí tuệ nhân tạo và tự động hóa.",
        "Việc ứng dụng công nghệ có thể giúp tăng cường kết nối và hợp tác trong cộng đồng, nhưng cũng có thể tạo ra những thách thức mới về mặt an ninh và quyền riêng tư.",
        "Do đó, cần phải có những quy định và chính sách phù hợp để đảm bảo rằng công nghệ được sử dụng một cách có trách nhiệm và phục vụ lợi ích của cộng đồng.",
        "Kết luận lại, việc duy trì và phát huy vai trò của cộng đồng trong xã hội hiện đại là một nhiệm vụ quan trọng và cấp bách.",
        "Cần phải có sự nỗ lực của tất cả các bên liên quan để xây dựng các cộng đồng bền vững, đoàn kết và thịnh vượng.",
      ],
    },
    {
      id: 2881,
      title: "Community Bonds in Vietnam Under Globalization",
      type: "IELTS_TASK2",
      topic: "SOCIETY",
      sentences: [
        "Trong bối cảnh toàn cầu hóa và sự phát triển kinh tế nhanh chóng, vai trò của cộng đồng trong xã hội Việt Nam hiện đại đang trải qua những biến đổi đáng kể.",
        "Nhiều ý kiến cho rằng sự gắn kết cộng đồng đang suy yếu do sự gia tăng của chủ nghĩa cá nhân và lối sống thực dụng.",
        "Tuy nhiên, một số khác lại lập luận rằng cộng đồng vẫn đóng vai trò thiết yếu trong việc duy trì bản sắc văn hóa và hỗ trợ xã hội.",
        "Bài luận này sẽ phân tích những thay đổi này, đồng thời đánh giá tầm quan trọng liên tục của cộng đồng trong xã hội Việt Nam đương đại.",
        "Một trong những yếu tố chính góp phần vào sự thay đổi này là sự di cư từ nông thôn ra thành thị, dẫn đến sự phân mảnh các mối quan hệ gia đình và làng xã truyền thống.",
        "Quá trình đô thị hóa cũng tạo ra một môi trường cạnh tranh cao, khiến cá nhân tập trung hơn vào sự nghiệp và thành công cá nhân hơn là vào các hoạt động cộng đồng.",
        "Ví dụ, ở các thành phố lớn như Hà Nội và Thành phố Hồ Chí Minh, nhiều người không còn biết hàng xóm của mình, và các hoạt động cộng đồng như lễ hội truyền thống ít được tổ chức hơn.",
        "Mặc dù vậy, cộng đồng vẫn đóng một vai trò quan trọng trong việc cung cấp hỗ trợ xã hội và tinh thần cho các thành viên.",
        "Trong những thời điểm khó khăn, như thiên tai hoặc dịch bệnh, cộng đồng thường là nguồn lực đầu tiên mà người dân tìm đến.",
        "Ví dụ điển hình là sự chung tay giúp đỡ lẫn nhau trong đợt lũ lụt ở miền Trung Việt Nam năm 2020, khi người dân từ khắp cả nước đã quyên góp tiền bạc và hàng hóa.",
        "Hơn nữa, cộng đồng cũng đóng vai trò quan trọng trong việc bảo tồn và phát huy bản sắc văn hóa Việt Nam.",
        "Các hoạt động như các lớp học dạy tiếng Việt cho trẻ em Việt kiều, các câu lạc bộ văn hóa và các lễ hội truyền thống giúp duy trì các giá trị văn hóa và truyền thống của dân tộc.",
        "Sự tham gia tích cực của cộng đồng vào các hoạt động này góp phần củng cố ý thức tự hào dân tộc và tạo ra một cảm giác thuộc về.",
        "Tuy nhiên, cần thừa nhận rằng sự phát triển của công nghệ và mạng xã hội cũng đã thay đổi cách thức mọi người tương tác với cộng đồng.",
        "Ngày nay, nhiều người tham gia vào các cộng đồng trực tuyến, nơi họ có thể kết nối với những người có cùng sở thích và quan điểm.",
        "Điều này có thể dẫn đến sự hình thành các cộng đồng ảo, có thể không có cùng mức độ gắn kết và trách nhiệm như các cộng đồng truyền thống.",
        "Một thách thức khác đối với sự gắn kết cộng đồng là sự gia tăng của chủ nghĩa tiêu dùng và sự tập trung vào vật chất.",
        "Nhiều người trẻ tuổi hiện nay có xu hướng ưu tiên việc mua sắm và tiêu dùng hơn là tham gia vào các hoạt động cộng đồng.",
        "Điều này có thể dẫn đến sự suy giảm các giá trị truyền thống như tinh thần tương trợ và lòng vị tha.",
        "Tóm lại, vai trò của cộng đồng trong xã hội Việt Nam hiện đại đang trải qua những thay đổi phức tạp.",
        "Sự di cư, đô thị hóa, công nghệ và chủ nghĩa tiêu dùng đều góp phần vào sự thay đổi này.",
        "Tuy nhiên, cộng đồng vẫn đóng một vai trò quan trọng trong việc cung cấp hỗ trợ xã hội, bảo tồn văn hóa và tạo ra một cảm giác thuộc về.",
        "Để duy trì và phát huy vai trò của cộng đồng, cần có sự nỗ lực từ cả chính phủ, các tổ chức xã hội và mỗi cá nhân.",
        "Chính phủ cần tạo ra các chính sách khuyến khích sự tham gia của cộng đồng vào các hoạt động xã hội, đồng thời hỗ trợ các tổ chức xã hội phát triển.",
        "Các tổ chức xã hội cần tăng cường các hoạt động kết nối cộng đồng và tạo ra các không gian an toàn và thân thiện cho mọi người.",
        "Mỗi cá nhân cũng cần có ý thức trách nhiệm đối với cộng đồng và tích cực tham gia vào các hoạt động xã hội.",
        "Bằng cách làm như vậy, chúng ta có thể xây dựng một xã hội Việt Nam mạnh mẽ và gắn kết hơn, nơi mà mọi người đều cảm thấy được tôn trọng và được hỗ trợ.",
        "Việc cân bằng giữa sự phát triển cá nhân và trách nhiệm cộng đồng là chìa khóa cho sự thịnh vượng của xã hội Việt Nam trong tương lai.",
        "Trong một thế giới ngày càng kết nối, việc bảo tồn và phát triển các mối quan hệ cộng đồng vững chắc là điều vô cùng quan trọng.",
        "Sự tham gia tích cực vào các hoạt động cộng đồng không chỉ mang lại lợi ích cho bản thân mà còn góp phần vào sự phát triển bền vững của toàn xã hội.",
        "Việc xây dựng một cộng đồng mạnh mẽ đòi hỏi sự hợp tác và cam kết từ tất cả các thành viên.",
        "Sự đa dạng văn hóa trong cộng đồng là một nguồn tài nguyên quý giá cần được bảo tồn và phát huy.",
        "Những giá trị truyền thống như lòng nhân ái, tinh thần tương trợ và sự tôn trọng lẫn nhau cần được truyền lại cho các thế hệ sau.",
        "Sự phát triển kinh tế không nên đi kèm với việc đánh mất các mối liên kết cộng đồng.",
        "Cần có những giải pháp sáng tạo để kết nối các thế hệ trẻ với các hoạt động cộng đồng.",
        "Việc sử dụng công nghệ một cách hiệu quả có thể giúp tăng cường sự gắn kết cộng đồng.",
        "Sự minh bạch và trách nhiệm giải trình là yếu tố quan trọng để xây dựng lòng tin trong cộng đồng.",
        "Việc lắng nghe ý kiến của các thành viên trong cộng đồng là điều cần thiết để đưa ra các quyết định phù hợp.",
        "Một cộng đồng khỏe mạnh là nền tảng cho một xã hội phát triển và bền vững.",
        "Sự đoàn kết và hợp tác là chìa khóa để giải quyết các vấn đề xã hội.",
        "Việc tôn trọng sự khác biệt và đa dạng là yếu tố quan trọng để xây dựng một cộng đồng hòa nhập.",
        "Cộng đồng là nơi mỗi cá nhân có thể phát huy hết tiềm năng của mình.",
        "Sự gắn kết cộng đồng tạo ra một môi trường an toàn và thân thiện cho mọi người.",
        "Cộng đồng là nguồn lực to lớn để vượt qua khó khăn và thử thách.",
        "Việc đầu tư vào các hoạt động cộng đồng là đầu tư vào tương lai của xã hội.",
        "Sự tham gia của cộng đồng vào quá trình ra quyết định giúp đảm bảo tính dân chủ và công bằng.",
        "Cộng đồng là nơi lưu giữ và truyền lại các giá trị văn hóa truyền thống.",
        "Sự phát triển của cộng đồng cần đi đôi với việc bảo vệ môi trường.",
        "Việc tạo ra các không gian công cộng xanh và thân thiện là điều cần thiết để tăng cường sự gắn kết cộng đồng.",
      ],
    },
    {
      id: 2880,
      title: "Why Community Still Matters in Urban Vietnam",
      type: "IELTS_TASK2",
      topic: "SOCIETY",
      sentences: [
        "Trong xã hội hiện đại, vai trò của cộng đồng đang trải qua những biến đổi sâu sắc, đặc biệt tại Việt Nam.",
        "Một quan điểm cho rằng sự phát triển kinh tế và công nghệ đã làm suy yếu các mối liên kết cộng đồng truyền thống.",
        "Tuy nhiên, một số người lại tin rằng cộng đồng vẫn đóng một vai trò thiết yếu trong việc hình thành bản sắc cá nhân và cung cấp sự hỗ trợ xã hội.",
        "Bài luận này sẽ thảo luận về cả hai khía cạnh này, và đưa ra quan điểm rằng mặc dù có những thay đổi, cộng đồng vẫn duy trì tầm quan trọng của nó trong xã hội Việt Nam hiện đại.",
        "Trước hết, sự phát triển kinh tế đã tạo ra những cơ hội mới, nhưng đồng thời cũng dẫn đến sự cạnh tranh gay gắt và sự di chuyển dân cư.",
        "Điều này thường dẫn đến việc các mối quan hệ gia đình và hàng xóm trở nên lỏng lẻo hơn.",
        "Ví dụ, ở các thành phố lớn như Hà Nội và Thành phố Hồ Chí Minh, nhiều người trẻ tuổi rời quê hương để tìm kiếm việc làm và cơ hội học tập.",
        "Họ thường tập trung vào sự nghiệp cá nhân và có ít thời gian hơn để tham gia vào các hoạt động cộng đồng.",
        "Hơn nữa, sự phổ biến của internet và mạng xã hội đã thay đổi cách mọi người tương tác với nhau.",
        "Mặc dù các nền tảng trực tuyến có thể kết nối mọi người từ khắp nơi trên thế giới, nhưng chúng cũng có thể dẫn đến sự cô lập và thiếu kết nối thực sự.",
        "Tuy nhiên, không thể phủ nhận rằng cộng đồng vẫn đóng một vai trò quan trọng trong nhiều khía cạnh của cuộc sống Việt Nam.",
        "Trong những thời điểm khó khăn, như thiên tai hoặc dịch bệnh, cộng đồng thường đoàn kết để hỗ trợ lẫn nhau.",
        "Ví dụ, trong đợt lũ lụt năm 2020 ở miền Trung Việt Nam, người dân đã tự nguyện quyên góp tiền bạc và nhu yếu phẩm để giúp đỡ những người bị ảnh hưởng.",
        "Ngoài ra, các tổ chức cộng đồng địa phương vẫn đóng một vai trò quan trọng trong việc bảo tồn văn hóa truyền thống và thúc đẩy sự phát triển kinh tế.",
        "Các hợp tác xã nông nghiệp, chẳng hạn, giúp nông dân tiếp cận thị trường và cải thiện sinh kế của họ.",
        "Hơn nữa, các câu lạc bộ và hiệp hội văn hóa thường xuyên tổ chức các sự kiện để quảng bá di sản văn hóa Việt Nam.",
        "Một yếu tố quan trọng khác là vai trò của gia đình trong việc duy trì các giá trị cộng đồng.",
        "Trong văn hóa Việt Nam, gia đình được coi là nền tảng của xã hội.",
        "Các thành viên trong gia đình thường hỗ trợ lẫn nhau về mặt tài chính, tinh thần và xã hội.",
        "Sự gắn kết gia đình mạnh mẽ này giúp củng cố các mối quan hệ cộng đồng và tạo ra một cảm giác thuộc về.",
        "Tuy nhiên, cần phải thừa nhận rằng sự thay đổi trong cấu trúc gia đình, như số lượng gia đình hạt nhân tăng lên, có thể ảnh hưởng đến sức mạnh của các mối liên kết cộng đồng.",
        "Tóm lại, mặc dù sự phát triển kinh tế và công nghệ đã mang lại những thay đổi đáng kể cho xã hội Việt Nam, cộng đồng vẫn duy trì tầm quan trọng của nó.",
        "Sự đoàn kết cộng đồng trong những thời điểm khó khăn, vai trò của các tổ chức cộng đồng địa phương, và sự gắn kết gia đình mạnh mẽ đều là những yếu tố quan trọng góp phần vào điều này.",
        "Để duy trì và phát huy vai trò của cộng đồng trong tương lai, cần có những chính sách và chương trình khuyến khích sự tham gia của người dân vào các hoạt động cộng đồng.",
        "Điều này có thể bao gồm việc hỗ trợ tài chính cho các tổ chức cộng đồng, tạo ra các không gian công cộng để mọi người gặp gỡ và tương tác, và thúc đẩy các giá trị cộng đồng trong giáo dục.",
        "Việc nuôi dưỡng một tinh thần cộng đồng mạnh mẽ sẽ giúp Việt Nam xây dựng một xã hội bền vững và thịnh vượng hơn.",
        "Nỗ lực này đòi hỏi sự hợp tác giữa chính phủ, các tổ chức xã hội dân sự và mỗi cá nhân trong xã hội.",
      ],
    },
    {
      id: 2879,
      title: "Modernization and the New Shape of Community",
      type: "IELTS_TASK2",
      topic: "SOCIETY",
      sentences: [
        "Trong xã hội hiện đại, vai trò của cộng đồng đang trải qua những biến đổi đáng kể do ảnh hưởng của quá trình toàn cầu hóa và đô thị hóa.",
        "Nhiều ý kiến cho rằng sự phát triển cá nhân hiện nay đang làm suy yếu các mối liên kết cộng đồng truyền thống, dẫn đến sự cô lập và thiếu gắn kết xã hội.",
        "Tuy nhiên, một quan điểm khác khẳng định rằng cộng đồng vẫn duy trì và thậm chí phát triển dưới những hình thức mới, phù hợp với bối cảnh đương đại.",
        "Để làm rõ vấn đề này, bài luận sẽ phân tích những tác động của quá trình hiện đại hóa lên cộng đồng, đồng thời đánh giá tiềm năng của các hình thức cộng đồng mới nổi.",
        "Một trong những nguyên nhân chính dẫn đến sự thay đổi này là sự gia tăng tính cơ động về địa lý của người dân, đặc biệt là giới trẻ, khi họ tìm kiếm cơ hội việc làm và học tập ở các thành phố lớn hoặc nước ngoài.",
        "Điều này làm giảm sự gắn bó với quê hương và các mối quan hệ xã hội truyền thống.",
        "Thêm vào đó, sự phát triển của công nghệ thông tin và mạng xã hội cũng tạo ra những không gian giao tiếp ảo, phần nào thay thế các tương tác trực tiếp trong cộng đồng.",
        "Tuy nhiên, cần lưu ý rằng công nghệ cũng có thể được sử dụng để kết nối mọi người và tạo ra các cộng đồng trực tuyến dựa trên sở thích, nghề nghiệp hoặc mục tiêu chung.",
        "Ví dụ, các nhóm trên Facebook hoặc các diễn đàn trực tuyến đã trở thành nơi để người dân trao đổi thông tin, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau.",
        "Một minh chứng khác cho sự tồn tại của cộng đồng trong xã hội hiện đại là sự phát triển của các tổ chức phi chính phủ (NGO) và các nhóm tình nguyện viên.",
        "Những tổ chức này thường tập hợp những người có chung mối quan tâm về các vấn đề xã hội như bảo vệ môi trường, giúp đỡ người nghèo hoặc thúc đẩy quyền con người.",
        "Hoạt động của họ không chỉ giải quyết các vấn đề cụ thể mà còn góp phần củng cố tinh thần trách nhiệm cộng đồng và sự đoàn kết xã hội.",
        "Bên cạnh đó, các hoạt động văn hóa truyền thống như lễ hội, các câu lạc bộ văn hóa hoặc các lớp học nghệ thuật cũng đóng vai trò quan trọng trong việc duy trì và phát huy bản sắc cộng đồng.",
        "Những hoạt động này tạo cơ hội cho mọi người giao lưu, học hỏi và chia sẻ những giá trị văn hóa chung.",
        "Tuy nhiên, để các hình thức cộng đồng mới có thể phát huy hiệu quả, cần có sự hỗ trợ từ chính phủ, các tổ chức xã hội và chính bản thân người dân.",
        "Chính phủ cần tạo ra một môi trường pháp lý thuận lợi cho sự phát triển của các tổ chức cộng đồng và khuyến khích sự tham gia của người dân vào các hoạt động xã hội.",
        "Các tổ chức xã hội cần tăng cường năng lực và tính chuyên nghiệp để có thể đáp ứng tốt hơn nhu cầu của cộng đồng.",
        "Người dân cần ý thức được tầm quan trọng của việc tham gia vào các hoạt động cộng đồng và có trách nhiệm đóng góp vào sự phát triển của xã hội.",
        "Kết luận lại, mặc dù quá trình hiện đại hóa đã gây ra những thay đổi đáng kể cho cộng đồng, nhưng cộng đồng vẫn là một yếu tố quan trọng trong xã hội Việt Nam.",
        "Các hình thức cộng đồng mới đang xuất hiện và phát triển, và chúng có tiềm năng to lớn trong việc giải quyết các vấn đề xã hội và xây dựng một xã hội đoàn kết và phát triển.",
      ],
    },
    {
      id: 2877,
      title: "The Impact of Social Media on Interpersonal Relationships in Modern Society",
      type: "IELTS_TASK2",
      topic: "SOCIETY",
      sentences: [
        "Trong xã hội hiện đại, mạng xã hội đã trở thành một phần không thể thiếu trong cuộc sống của nhiều người, đặc biệt là giới trẻ.",
        "Tuy nhiên, sự gia tăng đáng kể về mức độ sử dụng mạng xã hội đã gây ra những tranh luận về tác động của nó đến các mối quan hệ cá nhân.",
        "Một số người cho rằng mạng xã hội giúp mọi người kết nối dễ dàng hơn và duy trì liên lạc với bạn bè và gia đình ở xa.",
        "Ví dụ, những người di cư có thể sử dụng các nền tảng này để giữ liên lạc thường xuyên với người thân ở quê nhà, giảm bớt cảm giác cô đơn và xa cách.",
        "Mặt khác, cũng có những lo ngại rằng mạng xã hội có thể dẫn đến sự suy giảm chất lượng của các mối quan hệ thực tế.",
        "Việc dành quá nhiều thời gian cho thế giới ảo có thể khiến con người ít quan tâm hơn đến việc tương tác trực tiếp với những người xung quanh.",
        "Nhiều nghiên cứu chỉ ra rằng việc thường xuyên so sánh bản thân với người khác trên mạng xã hội có thể gây ra cảm giác tự ti và bất mãn.",
        "Hơn nữa, sự thiếu vắng các tín hiệu phi ngôn ngữ trong giao tiếp trực tuyến đôi khi dẫn đến những hiểu lầm và xung đột không đáng có.",
        "Ví dụ, một bình luận được viết ra với ý tốt có thể bị hiểu sai nếu không có ngữ cảnh phù hợp hoặc biểu cảm khuôn mặt đi kèm.",
        "Một khía cạnh đáng chú ý khác là sự lan truyền của tin giả và thông tin sai lệch trên mạng xã hội, điều này có thể gây ảnh hưởng tiêu cực đến niềm tin và sự tin tưởng lẫn nhau.",
        "Do đó, việc phát triển kỹ năng đánh giá thông tin và tư duy phản biện trở nên vô cùng quan trọng trong thời đại kỹ thuật số.",
        "Để giảm thiểu những tác động tiêu cực, cần có sự cân bằng giữa việc sử dụng mạng xã hội và việc duy trì các mối quan hệ thực tế.",
        "Các cá nhân nên chủ động dành thời gian cho các hoạt động ngoại tuyến, như gặp gỡ bạn bè, tham gia các câu lạc bộ hoặc tình nguyện.",
        "Tóm lại, mặc dù mạng xã hội mang lại nhiều lợi ích, nhưng việc sử dụng nó một cách có trách nhiệm và ý thức là điều cần thiết để bảo vệ và củng cố các mối quan hệ cá nhân.",
        "Chính phủ và các tổ chức giáo dục cũng nên đóng vai trò quan trọng trong việc nâng cao nhận thức về những tác động của mạng xã hội đến xã hội.",
      ],
    },
    {
      id: 2876,
      title: "Building a Strong Community in the Digital Era",
      type: "IELTS_TASK2",
      topic: "SOCIETY",
      sentences: [
        "Trong xã hội hiện đại, vai trò của cộng đồng đang trải qua những biến đổi đáng kể, một hiện tượng cần được phân tích một cách toàn diện.",
        "Nhiều người cho rằng sự phát triển của công nghệ và sự cá nhân hóa đã làm suy yếu các mối liên kết cộng đồng truyền thống ở Việt Nam.",
        "Tuy nhiên, một quan điểm khác lại khẳng định rằng cộng đồng vẫn đóng một vai trò quan trọng, chỉ là biểu hiện của nó đã thay đổi theo thời gian.",
        "Một trong những tác động tích cực của cộng đồng là việc hỗ trợ lẫn nhau trong các tình huống khó khăn, đặc biệt là trong bối cảnh thiên tai hoặc khủng hoảng kinh tế.",
        "Ví dụ, trong đợt lũ lụt miền Trung năm 2020, các tổ chức cộng đồng đã đóng vai trò then chốt trong việc cung cấp nhu yếu phẩm và hỗ trợ người dân bị ảnh hưởng.",
        "Bên cạnh đó, cộng đồng cũng góp phần bảo tồn và phát huy các giá trị văn hóa truyền thống, như các lễ hội làng hoặc các hoạt động nghệ thuật dân gian.",
        "Ở các thành phố lớn, các câu lạc bộ và hội nhóm theo sở thích chung đang trở nên phổ biến, tạo ra không gian cho mọi người giao lưu và chia sẻ.",
        "Tuy nhiên, sự phát triển của các cộng đồng trực tuyến cũng đặt ra những thách thức mới, như vấn đề thông tin sai lệch và sự cô lập xã hội.",
        "Một số người dành quá nhiều thời gian cho các mạng xã hội, dẫn đến việc giảm tương tác trực tiếp với những người xung quanh.",
        "Điều này có thể gây ra cảm giác cô đơn và thiếu kết nối thực sự với cộng đồng.",
        "Để giải quyết những thách thức này, cần có sự phối hợp giữa nhà nước, các tổ chức xã hội và cá nhân để xây dựng một cộng đồng lành mạnh và bền vững.",
        "Việc thúc đẩy các hoạt động tình nguyện, khuyến khích sự tham gia của người dân vào các vấn đề cộng đồng là rất quan trọng.",
        "Ngoài ra, cần tăng cường giáo dục về trách nhiệm công dân và kỹ năng sống để giúp mọi người hiểu rõ hơn về vai trò của mình trong xã hội.",
        "Một yếu tố quan trọng khác là việc tạo ra những không gian công cộng thân thiện và an toàn, nơi mọi người có thể gặp gỡ và giao lưu.",
        "Ví dụ, các công viên, trung tâm văn hóa và thư viện có thể trở thành những điểm hẹn lý tưởng cho cộng đồng.",
        "Nhìn chung, mặc dù có những thay đổi và thách thức, cộng đồng vẫn là một phần không thể thiếu của xã hội Việt Nam.",
        "Nó không chỉ là nơi để mọi người tìm kiếm sự hỗ trợ và chia sẻ, mà còn là nền tảng để xây dựng một xã hội đoàn kết và phát triển.",
        "Cần có một cách tiếp cận toàn diện và sáng tạo để khai thác tối đa tiềm năng của cộng đồng trong thời đại mới.",
        "Trong tương lai, việc xây dựng một cộng đồng số mạnh mẽ và kết nối cũng là một hướng đi đầy hứa hẹn.",
        "Do đó, việc duy trì và phát triển vai trò của cộng đồng là một nhiệm vụ quan trọng, đòi hỏi sự nỗ lực của tất cả mọi người.",
      ],
    },
  ],
};

const LandingParagraphSections = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleViewMore = (type: string) => {
    const isAuthenticated = Cookies.get("accessToken") !== undefined;
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    navigate(`/paragraphs?type=${type}`);
  };

  const paragraphSections = useMemo(
    () =>
      Object.entries(
        landingParagraphMockResult.content.reduce<Record<string, typeof landingParagraphMockResult.content>>(
          (acc, item) => {
            if (!acc[item.type]) {
              acc[item.type] = [];
            }
            acc[item.type].push(item);
            return acc;
          },
          {},
        ),
      ).map(([type, items]) => ({
        key: type,
        title:
          type === "IELTS_TASK1"
            ? t("home.sections.ieltsTask1")
            : type === "IELTS_TASK2"
              ? t("home.sections.ieltsTask2")
              : type,
        items,
      })),
    [t],
  );

  return (
    <motion.section className="py-20 bg-[#f6f7f8] dark:bg-slate-950" {...sectionRevealProps}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {paragraphSections.map((section) => (
          <div key={section.key}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
                {section.title}
              </h2>
              <button
                type="button"
                onClick={() => handleViewMore(section.key)}
                className="text-sm font-semibold text-[#198de6] hover:underline"
              >
                {t("home.sections.viewMore")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {(() => {
                const displayedItems = section.items.slice(0, 4);
                const usedCovers = new Set<string>();
                const covers = displayedItems.map((item, index) => {
                  let selectedCover = "";
                  for (let attempt = 0; attempt < 12; attempt += 1) {
                    const candidate = getCoverImage(
                      item.topic,
                      item.type,
                      `${section.key}-${item.id}-${index}-${attempt}`,
                    );
                    if (!usedCovers.has(candidate) || attempt === 11) {
                      selectedCover = candidate;
                      break;
                    }
                  }
                  usedCovers.add(selectedCover);
                  return selectedCover;
                });

                return displayedItems.map((item, index) => {
                  const title = item.title || item.sentences?.[0] || t("home.common.untitled");
                  const preview = item.sentences?.slice(0, 2).join(" ").replace("\\n", " ") || "";
                  const cover = covers[index];

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
                    >
                      <img src={cover} alt={title} className="h-32 w-full object-cover" />
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                            {t("home.common.sentenceCount", { count: item.sentences?.length ?? 0 })}
                          </span>
                          <span className="line-clamp-1">{t(`common.topic.${item.topic}`)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewMore(section.key)}
                          className="line-clamp-2 w-full text-left text-lg font-semibold leading-tight text-slate-900 transition hover:text-[#198de6] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#198de6]/50 dark:text-slate-100 dark:hover:text-blue-300"
                        >
                          {title}
                        </button>
                        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{preview}</p>
                      </div>
                    </article>
                  );
                });
              })()}

              {section.items.length === 0 && (
                <article className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-4">
                  {t("home.sections.empty")}
                </article>
              )}
            </div>
          </div>
        ))}
      </div>
      <LoginWithGoogleModal open={isLoginModalOpen} onCancel={() => setIsLoginModalOpen(false)} />
    </motion.section>
  );
};

const ScrollToTopBubble = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const detectScrollElement = () =>
      (document.querySelector("main.flex-1.overflow-y-auto") as HTMLElement | null) ?? null;

    scrollElementRef.current = detectScrollElement();

    const handleScroll = () => {
      const currentScrollTop =
        scrollElementRef.current?.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
      setIsVisible(currentScrollTop > 320);
    };

    handleScroll();
    const scrollTarget = scrollElementRef.current ?? window;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      type="button"
      aria-label="Scroll to top"
      onClick={handleScrollTop}
      initial={false}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 12,
        scale: isVisible ? 1 : 0.96,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed right-5 bottom-5 z-50 inline-flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl shadow-slate-300/60 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137fec]/50 disabled:pointer-events-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/40 dark:hover:bg-slate-700"
      disabled={!isVisible}
    >
      <ArrowUp className="size-5" />
    </motion.button>
  );
};

export default function LandingPage() {
  const { t } = useTranslation();

  useEffect(() => {
    const title = "LuyenViet - Luyện viết đa ngôn ngữ thông minh cùng trí tuệ nhân tạo";
    const description =
      "LuyenViet giúp bạn luyện viết đa ngôn ngữ từ cơ bản đến nâng cao (Anh, Trung, Hàn) với chấm điểm tự động, góp ý sửa lỗi chi tiết và lộ trình học tập cá nhân hóa.";
    const keywords =
      "luyện viết đa ngôn ngữ, học viết tiếng Anh trực tuyến, học viết tiếng Trung, học viết tiếng Hàn, sửa lỗi ngữ pháp, luyện viết IELTS, trí tuệ nhân tạo chấm bài viết, LuyenViet";
    const runtimeSiteUrl = getRuntimeEnv().VITE_SITE_URL?.trim() || "";
    const origin = (runtimeSiteUrl || "https://luyenviet.online").replace(/\/+$/, "");
    const canonicalUrl = `${origin}/`;
    const ogImageUrl = `${origin}/og-image.svg`;

    const upsertMetaTag = (attribute: "name" | "property", value: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${value}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const upsertLinkTag = (rel: string, href: string, options?: { hreflang?: string }) => {
      const selector = options?.hreflang
        ? `link[rel="${rel}"][hreflang="${options.hreflang}"]`
        : `link[rel="${rel}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        if (options?.hreflang) {
          element.setAttribute("hreflang", options.hreflang);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    const upsertStructuredData = (id: string, data: object) => {
      let element = document.getElementById(id) as HTMLScriptElement | null;
      if (!element) {
        element = document.createElement("script");
        element.id = id;
        element.type = "application/ld+json";
        document.head.appendChild(element);
      }
      element.textContent = JSON.stringify(data);
    };

    document.title = title;
    upsertMetaTag("name", "robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMetaTag("name", "description", description);
    upsertMetaTag("name", "keywords", keywords);
    upsertMetaTag("name", "author", "LuyenViet");
    upsertMetaTag("property", "og:site_name", "LuyenViet");
    upsertMetaTag("property", "og:locale", "vi_VN");
    upsertMetaTag("property", "og:title", title);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:type", "website");
    upsertMetaTag("property", "og:url", canonicalUrl);
    upsertMetaTag("property", "og:image", ogImageUrl);
    upsertMetaTag("property", "og:image:alt", "LuyenViet - Nền tảng luyện viết đa ngôn ngữ Anh Trung Hàn cùng AI");
    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", title);
    upsertMetaTag("name", "twitter:description", description);
    upsertMetaTag("name", "twitter:image", ogImageUrl);
    upsertMetaTag("name", "twitter:image:alt", "LuyenViet - Nền tảng luyện viết đa ngôn ngữ Anh Trung Hàn cùng AI");
    upsertLinkTag("canonical", canonicalUrl);
    upsertLinkTag("alternate", canonicalUrl, { hreflang: "vi-VN" });
    upsertLinkTag("alternate", canonicalUrl, { hreflang: "x-default" });

    upsertStructuredData("seo-structured-data-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "LuyenViet",
      url: canonicalUrl,
      inLanguage: "vi-VN",
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${canonicalUrl}paragraphs?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    upsertStructuredData("seo-structured-data-software-app", {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "LuyenViet",
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
      inLanguage: "vi-VN",
      url: canonicalUrl,
      description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-display">
      <main className="flex-1">
        <Hero />
        <Features />
        <UseAppShowcase />
        <MultilingualSpotlight />
        <LandingParagraphSections />
        <AIFeedback />
        <HowItWorks />
      </main>
      <ScrollToTopBubble />
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:px-6 lg:px-8">
        {t("profile.subscriptionPage.footer.copyright", {
          year: new Date().getFullYear(),
          brand: t("common.brand"),
        })}
      </footer>
    </div>
  );
}
