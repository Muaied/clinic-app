import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await login(username, password);
        setIsLoading(false);
        if (res.success) {
            toast.success('تم تسجيل الدخول بنجاح');
            navigate('/');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base p-4">
            <div className="bento-card w-full max-w-md p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/20 blur-[50px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-purple/20 blur-[50px] rounded-full" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                        <Activity className="w-8 h-8 text-accent1" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 font-sans">نظام إدارة العيادات</h1>
                    <p className="text-slate-400 mb-8 text-sm">أدخل بيانات الاعتماد للمتابعة</p>

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">اسم المستخدم</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent1 focus:ring-1 focus:ring-accent1/50 transition-all"
                                placeholder="admin"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">كلمة المرور</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent1 focus:ring-1 focus:ring-accent1/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-accent1/80 to-accent2/80 hover:from-accent1 hover:to-accent2 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] flex justify-center items-center gap-2"
                        >
                            {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
