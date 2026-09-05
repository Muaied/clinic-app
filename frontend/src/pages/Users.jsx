import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, X, Search, Shield, Download } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import * as XLSX from 'xlsx';

const UsersPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        password: '',
        role: 'Receptionist',
        phone: '',
        status: 'Active',
        specialization: '',
        license_number: '',
        consultation_fee: '',
        experience_years: '',
        bio: ''
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`https://clinic-management-system-production-202f.up.railway.app/api/users?search=${search}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setUsers(data);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب بيانات المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if(user) fetchUsers();
        }, 300);
        const intervalId = setInterval(() => {
            if(user) fetchUsers();
        }, 60000);
        return () => {
            clearTimeout(delayDebounceFn);
            clearInterval(intervalId);
        };
    }, [search, user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (userData = null) => {
        if (userData) {
            setEditingUser(userData);
            setFormData({
                full_name: userData.full_name,
                username: userData.username,
                password: '',
                role: userData.role,
                phone: userData.phone || '',
                status: userData.status || 'Active',
                specialization: userData.specialization || '',
                license_number: userData.license_number || '',
                consultation_fee: userData.consultation_fee || '',
                experience_years: userData.experience_years || '',
                bio: userData.bio || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                full_name: '',
                username: '',
                password: '',
                role: 'Receptionist',
                phone: '',
                status: 'Active',
                specialization: '',
                license_number: '',
                consultation_fee: '',
                experience_years: '',
                bio: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(`https://clinic-management-system-production-202f.up.railway.app/api/users/${editingUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم تحديث المستخدم بنجاح');
            } else {
                await axios.post('https://clinic-management-system-production-202f.up.railway.app/api/users', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم إضافة المستخدم بنجاح');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://clinic-management-system-production-202f.up.railway.app/api/users/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('تم حذف المستخدم بنجاح');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء عملية الحذف');
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'Admin') return <span className="px-2 py-1 bg-red-400/10 text-red-400 rounded text-xs">مدير نظام</span>;
        if (role === 'Doctor') return <span className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded text-xs">طبيب</span>;
        return <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded text-xs">موظف استقبال</span>;
    };

    const exportToExcel = () => {
        const dataToExport = users.map(u => ({
            'الاسم': u.full_name,
            'اسم المستخدم': u.username,
            'الدور': u.role === 'Admin' ? 'مدير نظام' : (u.role === 'Doctor' ? 'طبيب' : 'موظف استقبال'),
            'رقم الهاتف': u.phone || '-',
            'الحالة': u.status === 'Active' ? 'نشط' : 'غير نشط',
            'التخصص': u.specialization || '-',
            'رقم الترخيص': u.license_number || '-'
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        XLSX.writeFile(workbook, 'Users_Data.xlsx');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">إدارة المستخدمين</h2>
                    <p className="text-slate-400 text-sm">إدارة طاقم العيادة وصلاحياتهم</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportToExcel} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-2" title="تصدير إلى Excel">
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:block">تصدير</span>
                    </button>
                    {user?.role === 'Admin' && (
                        <button onClick={() => openModal()} className="btn-cyber-primary px-4 py-2 gap-2 flex items-center">
                            <Plus className="w-5 h-5" />
                            <span>إضافة مستخدم</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="ابحث باسم المستخدم أو الهاتف..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-neon w-full md:w-1/3 pr-10 pl-4 py-2"
                />
            </div>

            <div className="bento-card p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-theme text-slate-400 text-sm">
                                <th className="py-3 px-4 font-medium">الاسم</th>
                                <th className="py-3 px-4 font-medium">اسم المستخدم</th>
                                <th className="py-3 px-4 font-medium">الدور</th>
                                <th className="py-3 px-4 font-medium">رقم الهاتف</th>
                                <th className="py-3 px-4 font-medium">الحالة</th>
                                {user?.role === 'Admin' && (
                                    <th className="py-3 px-4 font-medium">الإجراءات</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={user?.role === 'Admin' ? "6" : "5"} className="py-8 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={user?.role === 'Admin' ? "6" : "5"} className="py-8 text-center text-slate-400">لا يوجد مستخدمين لعرضهم</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-theme/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-white font-medium flex items-center gap-2">
                                            {u.role === 'Admin' && <Shield className="w-4 h-4 text-red-400" />}
                                            {u.full_name}
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">@{u.username}</td>
                                        <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                                        <td className="py-3 px-4 text-slate-300 font-mono">{u.phone || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs ${u.status === 'Active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {u.status === 'Active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        {user?.role === 'Admin' && (
                                            <td className="py-3 px-4">
                                                {/* Prevent editing or deleting original admin */}
                                                {(u.id === 1 || u.username === 'admin') ? (
                                                    <span className="text-xs text-slate-500">مدير أساسي (محمي)</span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openModal(u)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteModal({ isOpen: true, id: u.id })} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bento-card w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-theme">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-6 h-6 text-cyan-400" />
                                {editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="userForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">الدور / الصلاحية *</label>
                                    <select required name="role" value={formData.role} onChange={handleInputChange} className="input-neon w-full px-4 py-2 text-white">
                                        <option value="Receptionist">موظف استقبال (Receptionist)</option>
                                        <option value="Doctor">طبيب (Doctor)</option>
                                        <option value="Admin">مدير نظام (Admin)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">الاسم الكامل *</label>
                                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">اسم المستخدم (للدخول) *</label>
                                    <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className="input-neon w-full px-4 py-2 text-left" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">كلمة المرور {editingUser && '(اتركه فارغاً لعدم التغيير)'}</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingUser} className="input-neon w-full px-4 py-2 text-left" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">رقم الهاتف *</label>
                                    <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="input-neon w-full px-4 py-2 text-left" dir="ltr" />
                                </div>

                                {formData.role === 'Doctor' && (
                                    <>
                                        <div className="space-y-2 md:col-span-2 mt-4">
                                            <h4 className="text-cyan-400 font-bold border-b border-theme pb-2">بيانات الطبيب الإضافية</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">التخصص *</label>
                                            <input required={formData.role === 'Doctor'} type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">رقم الترخيص *</label>
                                            <input required={formData.role === 'Doctor'} type="text" name="license_number" value={formData.license_number} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">رسوم الكشف (ج.س) *</label>
                                            <input required={formData.role === 'Doctor'} type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">سنوات الخبرة</label>
                                            <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-theme flex justify-end gap-3 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">إلغاء</button>
                            <button type="submit" form="userForm" className="btn-cyber-primary px-6 py-2">حفظ المستخدم</button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmDeleteModal 
                isOpen={deleteModal.isOpen} 
                onClose={() => setDeleteModal({ isOpen: false, id: null })} 
                onConfirm={() => handleDelete(deleteModal.id)} 
                message="هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟"
            />
        </div>
    );
};

export default UsersPage;
