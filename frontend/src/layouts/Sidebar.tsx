import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Pencil,
  History,
  Trophy,
  LibraryBig,
  Shield,
  User,
  X,
  ChevronDown,
  Columns3Cog,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { useLogoutMutation } from "@/features/auth/mutation";
import Cookies from "js-cookie";
import logo from "../assets/image/logo3.png";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/stores/profile";

const ADMIN_ROLE = "ADMIN";

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  active,
  compact = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  to: string;
  active: boolean;
  compact?: boolean;
}) => (
  <Link
    to={to}
    className={`flex items-center transition-all duration-200 ${compact ? "gap-2.5 px-3 py-2 rounded-lg text-sm" : "gap-3 px-4 py-3 rounded-xl"
      } ${active
        ? compact
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      }`}
  >
    <Icon size={compact ? 18 : 20} strokeWidth={active ? 2.3 : 2} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({
  activePath,
  onClose,
}: {
  activePath: string;
  onClose?: () => void;
}) => {
  const { t } = useTranslation();
  const [isPracticeExpanded, setIsPracticeExpanded] = useState(
    activePath.startsWith("/paragraphs") || activePath.startsWith("/practice"),
  );
  const { profile } = useProfile();
  const isAdmin = (profile?.roles ?? []).some((r) => r.name === ADMIN_ROLE);
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();
  const handleLogout = async () => {
    await logout(Cookies.get("accessToken") || "");
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            <img src={logo} alt="logo" />
          </div>
          <span className="font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">
            {t("common.brand")}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
        <SidebarItem
          icon={LayoutDashboard}
          label={t("nav.dashboard")}
          to="/home"
          active={activePath === "/home"}
        />
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsPracticeExpanded((prev) => !prev)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${activePath.startsWith("/paragraphs") || activePath.startsWith("/practice")
              ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
          >
            <span className="inline-flex items-center gap-3">
              <BookOpen size={20} strokeWidth={2} />
              <span className="font-medium">{t("nav.practice")}</span>
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${isPracticeExpanded ? "rotate-180" : ""}`}
            />
          </button>
          {isPracticeExpanded && (
            <div className="ml-4 mt-1 pl-3 border-l border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <SidebarItem
                icon={FileText}
                label={t("practice.setup.modeParagraphCardTitle")}
                to="/paragraphs"
                active={activePath.startsWith("/paragraphs")}
                compact
              />
              <SidebarItem
                icon={Pencil}
                label={t("practice.setup.modeSentenceCardTitle")}
                to="/practice/single-sentence"
                active={activePath.startsWith("/practice/single-sentence")}
                compact
              />
              <SidebarItem
                icon={Columns3Cog}
                label={t("practice.setup.modeCustomCardTitle")}
                to="/practice/custom"
                active={activePath.startsWith("/practice/custom")}
                compact
              />
            </div>
          )}
        </div>
        <SidebarItem
          icon={History}
          label={t("nav.history")}
          to="/history"
          active={activePath === "/history"}
        />
        <SidebarItem
          icon={LibraryBig}
          label={t("nav.decks")}
          to="/decks"
          active={activePath.startsWith("/decks")}
        />
        <SidebarItem
          icon={Trophy}
          label={t("nav.rankings")}
          to="/rankings"
          active={activePath === "/rankings"}
        />
        {isAdmin && (
          <SidebarItem
            icon={Shield}
            label={t("nav.admin")}
            to="/admin"
            active={activePath.startsWith("/admin")}
          />
        )}
        <SidebarItem
          icon={User}
          label={t("nav.profile")}
          to="/profile"
          active={activePath.startsWith("/profile")}
        />
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 w-full transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          <LogOut size={20} />
          <span className="font-medium">{t("profile.logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
