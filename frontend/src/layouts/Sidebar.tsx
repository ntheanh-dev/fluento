import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, History, Trophy, User, X } from "lucide-react";
import { LogOut } from "lucide-react";
import { useLogoutMutation } from "../features/auth/mutation";
import Cookies from "js-cookie";

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className="font-medium">{label}</span>
    </Link>
);

const Sidebar = ({ activePath, onClose }: { activePath: string, onClose?: () => void }) => {
    const navigate = useNavigate();
    const { mutateAsync: logout } = useLogoutMutation();
    const handleLogout = async () => {
        await logout(Cookies.get("accessToken") || "");
        navigate('/login');
    };
    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                        F
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">Fluento</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                <SidebarItem icon={LayoutDashboard} label="Bảng điều khiển" to="/" active={activePath === '/'} />
                <SidebarItem icon={BookOpen} label="Luyện tập" to="/setup" active={activePath.startsWith('/setup') || activePath.startsWith('/session')} />
                <SidebarItem icon={History} label="Lịch sử" to="/history" active={activePath === '/history'} />
                <SidebarItem icon={Trophy} label="Bảng xếp hạng" to="/rankings" active={activePath === '/rankings'} />
                <SidebarItem icon={User} label="Hồ sơ" to="/profile" active={activePath === '/profile'} />
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 w-full transition-colors rounded-xl hover:bg-red-50"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Đăng xuất</span>
                </button>
            </div>
        </div>
    )
};

export default Sidebar;