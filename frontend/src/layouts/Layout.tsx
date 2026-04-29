import { useState, useEffect, useMemo } from "react";
import { useLocation, Outlet, Link, useNavigate } from "react-router-dom";
import {
    Menu,
    User,
    BookOpen,
    FileText,
    History,
    Trophy,
    LibraryBig,
    Shield,
    LogOut,
    Languages,
    Moon,
    Sun,
    Pencil,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useProfile, useProfileStore } from "@/stores/profile";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "@/features/profile/query";
import { useLogoutMutation } from "@/features/auth/mutation";
import Cookies from "js-cookie";
import { Avatar, Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import logo from "../assets/image/logo3.png";
import { getLevelLabel } from "@/i18n/labels";
import { useTranslation } from "react-i18next";
import LoginWithGoogleModal from "@/features/auth/ui/LoginWithGoogleModal";
import { useTheme } from "@/app/providers/ThemeProvider";

const ADMIN_ROLE = "ADMIN";
const PRACTICE_NAV_KEY = "practice-nav";
const Layout = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { profile } = useProfile();
    const isAdmin = useMemo(
        () => (profile?.roles ?? []).some((r) => r.name === ADMIN_ROLE),
        [profile?.roles],
    );
    const navItems = useMemo(
        () => {
            const base = [
                { key: PRACTICE_NAV_KEY, label: t("nav.practice"), to: "/paragraphs", icon: BookOpen },
                { label: t("nav.history"), to: "/history", icon: History },
                { label: t("nav.decks"), to: "/decks", icon: LibraryBig },
                { label: t("nav.rankings"), to: "/rankings", icon: Trophy },
            ];
            if (!isAdmin) return base;
            return [...base, { label: t("nav.admin"), to: "/admin", icon: Shield }];
        },
        [t, isAdmin],
    );
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { setProfile } = useProfileStore();
    const { mutateAsync: logout } = useLogoutMutation();
    const { data: profileData } = useProfileData({
        queryParams: PROFILE_EMBED_PRACTICESTATS,
    });
    const isAuthenticated = Cookies.get("accessToken") !== undefined;

    useEffect(() => {
        if (profileData) setProfile(profileData);
    }, [profileData, setProfile]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (to: string) => {
        if (to === "/home") return location.pathname === "/home";
        if (to === "/paragraphs") {
            return location.pathname.startsWith("/paragraphs") || location.pathname.startsWith("/practice");
        }
        if (to === "/admin") return location.pathname.startsWith("/admin");
        return location.pathname.startsWith(to);
    };
    const practiceMenuItems = useMemo<MenuProps["items"]>(
        () => [
            { key: "paragraph", label: t("practice.setup.modeParagraphCardTitle"), icon: <FileText size={16} /> },
            { key: "single-sentence", label: t("practice.setup.modeSentenceCardTitle"), icon: <Pencil size={16} /> },
        ],
        [t],
    );

    const handlePracticeMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "paragraph") {
            navigate("/paragraphs");
            return;
        }
        if (key === "single-sentence") {
            navigate("/practice/single-sentence");
        }
    };

    const userMenuItems = useMemo<MenuProps["items"]>(
        () => [
            { key: "profile", label: t("nav.profile"), icon: <User size={16} /> },
            {
                key: "history",
                label: i18n.language.startsWith("vi") ? "Bài đã luyện" : "Practiced lessons",
                icon: <History size={16} />,
            },
            { key: "logout", label: t("profile.logout"), danger: true, icon: <LogOut size={16} /> },
        ],
        [t, i18n.language],
    );

    const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "profile") {
            navigate("/profile");
            return;
        }

        if (key === "history") {
            navigate("/history");
            return;
        }

        if (key === "logout") {
            const accessToken = Cookies.get("accessToken") || "";
            Cookies.remove("accessToken");
            setProfile(null);
            navigate("/", { replace: true });
            void logout(accessToken).catch(() => {
                // Ignore logout API failures because user already signed out locally.
            });
        }
    };

    return (
        <main className="flex h-screen overflow-hidden bg-[#f6f7f8] dark:bg-slate-950">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && isAuthenticated && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="relative w-64 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
                        <Sidebar
                            activePath={location.pathname}
                            onClose={() => setIsMobileMenuOpen(false)}
                        />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                <header className="h-16 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-center px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center justify-between gap-1 h-full max-w-7xl w-full">
                        <div className="flex items-center gap-3 md:gap-8 self-stretch">
                            {/* Mobile Toggle */}
                            <button
                                className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu size={20} />
                            </button>

                            {/* Mobile: Luyenviet + breadcrumb */}
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm md:hidden">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{t("common.brand")}</span>
                            </div>

                            {/* Desktop: Luyenviet + horizontal nav */}
                            <div className="hidden md:flex items-center justify-between gap-1 h-full">
                                <Link to="/home" className="flex items-center gap-2">
                                    <img src={logo} alt="logo" className="w-10 h-10" />
                                    <span className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">{t("common.brand")}</span>
                                </Link>
                            </div>
                        </div>

                        {isAuthenticated && (
                            <nav className="hidden md:flex items-end items-center pt-2 gap-6 h-full">
                                {navItems.map(({ key, label, to, icon: Icon }) => {
                                    const itemClassName = `flex items-center gap-2 px-1 pb-4 pt-2 text-sm font-medium transition-colors ${isActive(to)
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                        }`;
                                    if (key === PRACTICE_NAV_KEY) {
                                        return (
                                            <Dropdown
                                                key={to}
                                                menu={{ items: practiceMenuItems, onClick: handlePracticeMenuClick }}
                                                trigger={["click"]}
                                                placement="bottom"
                                                overlayStyle={{ minWidth: 200 }}
                                            >
                                                <button type="button" className={itemClassName}>
                                                    <Icon
                                                        size={18}
                                                        strokeWidth={isActive(to) ? 2.25 : 2}
                                                        className="shrink-0 opacity-90"
                                                        aria-hidden
                                                    />
                                                    {label}
                                                </button>
                                            </Dropdown>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={itemClassName}
                                        >
                                            <Icon
                                                size={18}
                                                strokeWidth={isActive(to) ? 2.25 : 2}
                                                className="shrink-0 opacity-90"
                                                aria-hidden
                                            />
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}


                        <div className="flex items-center gap-3 md:gap-6">
                            {isAuthenticated ? (
                                <Dropdown
                                    menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                    overlayStyle={{ minWidth: 190 }}
                                >
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                {profile?.fullName}
                                            </p>
                                            <div className="flex items-center justify-end gap-1">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {getLevelLabel(profile?.embedded?.totalUserSentenceAnswers ?? 0, t)}
                                                </p>
                                            </div>
                                        </div>
                                        {profile?.urlAvatar ? (
                                            <img
                                                src={profile?.urlAvatar}
                                                alt={profile?.fullName}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                                            />
                                        ) : (
                                            <Avatar size={32} icon={<User size={16} />} />
                                        )}
                                    </button>
                                </Dropdown>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                                        title={theme === "dark" ? "Light mode" : "Dark mode"}
                                    >
                                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                                    </button>
                                    <Button
                                        type="default"
                                        className="inline-flex items-center gap-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                        onClick={() => void i18n.changeLanguage(i18n.language.startsWith("vi") ? "en" : "vi")}
                                    >
                                        <Languages size={14} />
                                        {i18n.language.startsWith("vi") ? "EN" : "VI"}
                                    </Button>
                                    <Button
                                        type="primary"
                                        className="inline-flex font-bold font-display"
                                        onClick={() => setIsLoginModalOpen(true)}
                                    >
                                        {t("layout.login")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto  h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
            <LoginWithGoogleModal open={isLoginModalOpen} onCancel={() => setIsLoginModalOpen(false)} />
        </main>
    );
};

export default Layout;
