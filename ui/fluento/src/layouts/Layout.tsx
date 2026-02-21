import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Drawer, Button, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
    LayoutDashboard,
    PenTool,
    History,
    Trophy,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

const { Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/practice', label: 'Practice', icon: <PenTool size={20} /> },
        { path: '/history', label: 'History', icon: <History size={20} /> },
        { path: '/rankings', label: 'Rankings', icon: <Trophy size={20} /> },
    ];

    const userMenu: MenuProps['items'] = [
        {
            key: 'profile',
            label: <Link to="/profile">Profile</Link>,
            icon: <Settings size={14} />
        },
        { key: 'logout', label: 'Logout', icon: <LogOut size={14} />, danger: true },
    ];

    const SidebarContent = ({ isCollapsed }: { isCollapsed: boolean }) => (
        <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className={`flex items-center gap-3 p-6 border-b border-slate-100 h-[80px] ${isCollapsed ? 'justify-center px-2' : ''}`}>
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">E</div>
                {!isCollapsed && <span className="font-bold text-xl tracking-tight text-primary transition-opacity duration-300">EngLearnVN</span>}
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    const LinkContent = (
                        <NavLink
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-50 text-primary font-medium'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                        </NavLink>
                    );

                    return isCollapsed ? (
                        <Tooltip key={item.path} title={item.label} placement="right">
                            {LinkContent}
                        </Tooltip>
                    ) : (
                        <div key={item.path}>{LinkContent}</div>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-100 mt-auto">
                <Dropdown menu={{ items: userMenu }} placement={isCollapsed ? "topRight" : "top"} trigger={['click']}>
                    <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                        <Avatar src="https://picsum.photos/200" size={isCollapsed ? "default" : "large"} className="shrink-0" />
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate text-slate-900">Minh Nguyen</p>
                                    <p className="text-xs text-slate-500 truncate">Intermediate B1</p>
                                </div>
                                <Settings size={18} className="text-slate-400 hover:text-primary shrink-0" />
                            </>
                        )}
                    </div>
                </Dropdown>
            </div>
        </div>
    );

    return (
        <Layout className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        type="text"
                        icon={<Menu size={24} />}
                        onClick={() => setMobileOpen(true)}
                        className="flex items-center justify-center"
                    />
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-bold text-sm">E</div>
                        <span className="font-bold text-lg text-primary">EngLearnVN</span>
                    </div>
                </div>
                <Avatar src="https://picsum.photos/200" size="default" />
            </div>

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                onClose={() => setMobileOpen(false)}
                open={mobileOpen}
                styles={{ body: { padding: 0 } }}
                width={280}
                closeIcon={<X size={20} />}
                title={<span className="font-bold text-primary">Menu</span>}
            >
                <SidebarContent isCollapsed={false} />
            </Drawer>

            {/* Desktop Sider */}
            <Sider
                width={260}
                collapsedWidth={80}
                collapsed={collapsed}
                theme="light"
                className="border-r border-slate-200 hidden md:block transition-all duration-300"
                style={{ position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, zIndex: 20 }}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors shadow-sm z-30 cursor-pointer"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <SidebarContent isCollapsed={collapsed} />
            </Sider>

            {/* Main Layout Area */}
            <Layout
                className="bg-background transition-all duration-300 ease-in-out"
                style={{ marginLeft: 0 }} // Reset default inline style
            >
                <div className={`transition-all duration-300 ${collapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'}`}>
                    <Content className="p-4 md:p-8 max-w-[1440px] mx-auto w-full min-h-[calc(100vh-64px)] md:min-h-screen">
                        <Outlet />
                    </Content>
                </div>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;