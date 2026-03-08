import { useState, useEffect } from "react";
import { useLocation, Outlet, Link } from "react-router-dom";
import { ChevronRight, Menu, Flame } from "lucide-react";
import Sidebar from "./Sidebar";
import { useProfile, useProfileStore } from "@/stores/profile";
import { useProfileData } from "@/features/profile/query";

const getPathName = (pathname: string): string => {
    const pathMap: Record<string, string> = {
        "/": "Bảng điều khiển",
        "/practice": "Luyện tập",
        "/history": "Lịch sử",
        "/rankings": "Bảng xếp hạng",
        "/profile": "Hồ sơ",
        "/login": "Đăng nhập",
        "/register": "Đăng ký",
    };
    return pathMap[pathname] || pathname.replace("/", "");
};

const navItems = [
    { label: "Bảng điều khiển", to: "/" },
    { label: "Luyện tập", to: "/practice" },
    { label: "Lịch sử", to: "/history" },
    { label: "Bảng xếp hạng", to: "/rankings" },
];

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { profile } = useProfile();
    const { setProfile } = useProfileStore();
    const { data: profileData } = useProfileData();

    useEffect(() => {
        if (profileData) setProfile(profileData);
    }, [profileData, setProfile]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (to: string) => {
        if (to === "/") return location.pathname === "/";
        if (to === "/practice") return location.pathname.startsWith("/practice") || location.pathname.startsWith("/session");
        return location.pathname.startsWith(to);
    };

    return (
        <main className="flex h-screen overflow-hidden bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
                        <Sidebar
                            activePath={location.pathname}
                            onClose={() => setIsMobileMenuOpen(false)}
                        />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3 md:gap-8 self-stretch">
                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Mobile: Fluento + breadcrumb */}
                        <div className="flex items-center gap-2 text-slate-500 text-sm md:hidden">
                            <span className="font-medium text-slate-900">Fluento</span>
                            <ChevronRight size={16} />
                            <span className="capitalize font-medium text-slate-900">
                                {getPathName(location.pathname)}
                            </span>
                        </div>

                        {/* Desktop: Fluento + horizontal nav */}
                        <div className="hidden md:flex items-center gap-1 h-full">
                            <span className="font-bold text-xl text-slate-800 mr-6">Fluento</span>
                            <nav className="flex items-end gap-6 h-full">
                                {navItems.map(({ label, to }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`px-1 pb-4 pt-2 text-sm font-medium transition-colors border-b-2 ${isActive(to)
                                            ? "text-blue-600 border-blue-600"
                                            : "text-slate-600 border-transparent hover:text-slate-900"
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden lg:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 text-orange-600">
                            <span className="text-sm font-bold">Chuỗi {profile?.currentStreak || 0} ngày</span>
                            <Flame size={16} fill="currentColor" />
                        </div>
                        <Link to="/profile">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800">
                                        {profile?.fullName}
                                    </p>
                                    <p className="text-xs text-slate-500">Trung cấp</p>
                                </div>
                                <img
                                    src={profile?.urlAvatar}
                                    alt={profile?.fullName}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-100 shadow-sm"
                                />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </main>
    );
};

export default Layout;
