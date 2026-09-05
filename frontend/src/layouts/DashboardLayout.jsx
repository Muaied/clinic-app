import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, UserRound, Calendar, 
    FileText, FileCheck, Receipt, LogOut, Menu, X, Activity 
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const SidebarLink = ({ to, icon: Icon, children, onClick }) => (
    <NavLink 
        to={to} 
        onClick={onClick}
        className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-gradient-to-r from-accent1/20 to-transparent text-accent1 border-r-2 border-accent1' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
        }
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{children}</span>
    </NavLink>
);

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-base flex overflow-hidden">
            {/* Sidebar Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                no-print fixed lg:static inset-y-0 right-0 z-50 w-72 bg-surface border-l border-theme transform transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                flex flex-col h-full
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                            <Activity className="w-6 h-6 text-accent1" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">عيادتي</h2>
                            <p className="text-accent1 text-xs">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <SidebarLink to="/" onClick={toggleSidebar} icon={LayoutDashboard}>الرئيسية</SidebarLink>
                    <SidebarLink to="/patients" onClick={toggleSidebar} icon={Users}>المرضى</SidebarLink>
                    {(user?.role === 'Admin' || user?.role === 'Receptionist') && (
                        <SidebarLink to="/users" onClick={toggleSidebar} icon={UserRound}>المستخدمين</SidebarLink>
                    )}
                    <SidebarLink to="/appointments" onClick={toggleSidebar} icon={Calendar}>المواعيد</SidebarLink>
                    <SidebarLink to="/records" onClick={toggleSidebar} icon={FileText}>السجلات الطبية</SidebarLink>
                    {(user?.role === 'Admin' || user?.role === 'Receptionist') && (
                        <SidebarLink to="/invoices" onClick={toggleSidebar} icon={Receipt}>الفواتير</SidebarLink>
                    )}
                </div>

                <div className="p-4 border-t border-theme">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-accent1/20 flex items-center justify-center text-accent1 font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white font-medium truncate">{user?.full_name}</p>
                            <p className="text-slate-400 text-xs truncate">{user?.username}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="no-print h-20 bg-surface/80 backdrop-blur-md border-b border-theme flex items-center justify-between px-6 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleSidebar} className="lg:hidden text-slate-300 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-white hidden sm:block">مرحباً بعودتك، {user?.full_name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
