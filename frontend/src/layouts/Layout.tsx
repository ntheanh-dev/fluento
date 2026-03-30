import { useState, useEffect } from "react";
import { useLocation, Outlet, Link } from "react-router-dom";
import { Menu, Flame, User } from "lucide-react";
import Sidebar from "./Sidebar";
import { useProfile, useProfileStore } from "@/stores/profile";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "@/features/profile/query";
import Cookies from "js-cookie";
import { Avatar, Button } from "antd";
import logo from "../assets/image/logo3.png";
import { getLevel } from "@/utils/utils";

const navItems = [
    { label: "Bảng điều khiển", to: "/dashboard" },
    { label: "Luyện tập", to: "/practice" },
    { label: "Lịch sử", to: "/history" },
    { label: "Bảng xếp hạng", to: "/rankings" },
];

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { profile } = useProfile();
    const { setProfile } = useProfileStore();
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
        if (to === "/dashboard") return location.pathname === "/dashboard";
        if (to === "/practice") return location.pathname.startsWith("/practice") || location.pathname.startsWith("/session");
        return location.pathname.startsWith(to);
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
                                <span className="font-medium text-slate-900 dark:text-slate-100">Luyenviet</span>
                            </div>

                            {/* Desktop: Luyenviet + horizontal nav */}
                            <div className="hidden md:flex items-center justify-between gap-1 h-full">
                                <Link to="/dashboard" className="flex items-center gap-2">
                                    <img src={logo} alt="logo" className="w-10 h-10" />
                                    <span className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">Luyenviet</span>
                                </Link>
                            </div>
                        </div>

                        {isAuthenticated && (
                            <nav className="hidden md:flex items-end items-center pt-2 gap-6 h-full">
                                {navItems.map(({ label, to }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`px-1 pb-4 pt-2 text-sm font-medium transition-colors ${isActive(to)
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        )}


                        <div className="flex items-center gap-3 md:gap-6">

                            {isAuthenticated ? (
                                <>
                                    <div className="hidden lg:flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400">
                                        <span className="text-sm font-bold">Chuỗi {profile?.currentStreak || 0} ngày</span>
                                        <Flame size={16} fill="currentColor" />
                                    </div>
                                    <Link to="/profile">
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                    {profile?.fullName}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{getLevel(profile?.embedded?.totalUserSentenceAnswers ?? 0)}</p>
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
                                        </div>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button type="text" className="hidden sm:inline-flex font-bold font-display">Đăng nhập</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button type="primary" className="bg-[#137fec] font-bold font-display h-9 shadow-md shadow-[#137fec]/20">Đăng ký</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto  h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
        </main>
    );
};

export default Layout;
