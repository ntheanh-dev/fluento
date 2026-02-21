import { useState, useEffect } from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import {
    ChevronRight,
    Bell,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Flame
} from 'lucide-react';
import Sidebar from './Sidebar';
import { useProfile } from '../stores/profile';

const getPathName = (pathname: string): string => {
    const pathMap: Record<string, string> = {
        '/': 'Bảng điều khiển',
        '/practice': 'Luyện tập',
        '/history': 'Lịch sử',
        '/rankings': 'Bảng xếp hạng',
        '/profile': 'Hồ sơ',
        '/login': 'Đăng nhập',
        '/register': 'Đăng ký',
    };
    return pathMap[pathname] || pathname.replace('/', '');
};

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const { profile } = useProfile();
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-white border-slate-200 z-10 transition-all duration-300 ease-in-out overflow-hidden ${isDesktopSidebarOpen ? 'w-64 border-r' : 'w-0 border-none'
                    }`}
            >
                <div className="w-64 h-full">
                    <Sidebar activePath={location.pathname} />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
                        <Sidebar activePath={location.pathname} onClose={() => setIsMobileMenuOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Desktop Toggle */}
                        <button
                            className="hidden md:block p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                            title={isDesktopSidebarOpen ? "Đóng thanh bên" : "Mở thanh bên"}
                        >
                            {isDesktopSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </button>

                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <span className="font-medium text-slate-900 hidden sm:inline">Fluento</span>
                            <ChevronRight size={16} className="hidden sm:block" />
                            <span className="capitalize font-medium text-slate-900">{getPathName(location.pathname)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden md:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 text-orange-600">
                            <span className="text-sm font-bold">Chuỗi 12 ngày</span>
                            <Flame size={16} />
                        </div>
                        <Link to="/profile">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800">{profile?.fullName}</p>
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
        </div>
    );
};

export default Layout;
