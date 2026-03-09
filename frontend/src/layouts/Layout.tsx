import { useState, useEffect } from "react";
import { useLocation, Outlet, Link } from "react-router-dom";
import { ChevronRight, Menu, Flame } from "lucide-react";
import Sidebar from "./Sidebar";
import { useProfile, useProfileStore } from "@/stores/profile";
import { PROFILE_EMBED_API_KEY, useProfileData } from "@/features/profile/query";
import Cookies from "js-cookie";
import { Button } from "antd";

const getPathName = (pathname: string): string => {
    const pathMap: Record<string, string> = {
        "/dashboard": "Bảng điều khiển",
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
        queryParams: PROFILE_EMBED_API_KEY,
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
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-center px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center justify-between gap-1 h-full max-w-7xl w-full">
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
                            <div className="hidden md:flex items-center justify-between gap-1 h-full">
                                <Link to="/dashboard" className="flex items-center gap-2">
                                    <div className="text-[#137fec]">
                                        <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                                            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold tracking-tight font-display">Fluento</span>
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
                                            ? "text-blue-600"
                                            : "text-slate-600 hover:text-slate-900"
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
                <main className="flex-1 overflow-y-auto  p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </main>
    );
};

export default Layout;
