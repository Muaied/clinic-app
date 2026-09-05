import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserRound, CalendarCheck, CircleDollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bento-card p-6 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 ${colorClass}`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('clinic_user'))?.token;
                const { data } = await axios.get('https://clinic-management-system-production-202f.up.railway.app/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const intervalId = setInterval(fetchStats, 60000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin text-accent1"><Activity className="w-10 h-10" /></div>
            </div>
        );
    }

    const chartData = stats?.chartData || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={user?.role === 'Doctor' ? "مرضاي" : "إجمالي المرضى"} 
                    value={stats?.stats?.totalPatients || 0} 
                    icon={Users} 
                    colorClass="text-accent1 shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
                />
                {user?.role !== 'Doctor' && (
                    <StatCard 
                        title="إجمالي الأطباء" 
                        value={stats?.stats?.totalDoctors || 0} 
                        icon={UserRound} 
                        colorClass="text-accent2 shadow-[0_0_15px_rgba(176,38,255,0.2)]" 
                    />
                )}
                <StatCard 
                    title="مواعيد اليوم" 
                    value={stats?.stats?.todayAppointments || 0} 
                    icon={CalendarCheck} 
                    colorClass="text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]" 
                />
                {user?.role !== 'Doctor' && (
                    <StatCard 
                        title="الإيرادات" 
                        value={`${stats?.stats?.totalRevenue || 0} ج.س`} 
                        icon={CircleDollarSign} 
                        colorClass="text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bento-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6">معدل زيارات المرضى</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F2942" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#131B2F', borderColor: '#1F2942', borderRadius: '0.75rem', color: '#fff' }}
                                    itemStyle={{ color: '#00F0FF' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="patients" fill="url(#colorNeon)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorNeon" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#B026FF" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Today's Appointments List */}
                <div className="bento-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6">مواعيد اليوم</h3>
                    <div className="space-y-4">
                        {stats?.todayAppointmentsList?.length > 0 ? (
                            stats.todayAppointmentsList.map(apt => (
                                <div key={apt.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-white">{apt.patient_name}</p>
                                        <span className="text-xs px-2 py-1 rounded-md bg-accent1/20 text-accent1">{apt.appointment_time}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">د. {apt.doctor_name}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-8">لا يوجد مواعيد اليوم</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
