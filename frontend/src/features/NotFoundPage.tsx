import { useTranslation } from "react-i18next";

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8 text-center text-slate-600 dark:text-slate-300">
      {t("notFound.message")}
    </div>
  );
}

export default NotFoundPage;
