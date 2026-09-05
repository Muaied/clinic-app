import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, X, Download } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import * as XLSX from 'xlsx';

const Patients = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const [formData, setFormData] = useState({
        full_name: '',
        gender: 'Male',
        date_of_birth: '',
        phone: '',
        email: '',
        address: '',
        blood_type: '',
        emergency_contact: ''
    });

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`https://clinic-management-system-production-202f.up.railway.app/api/patients?search=${search}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setPatients(data);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب بيانات المرضى');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if(user) fetchPatients();
        }, 300);
        const intervalId = setInterval(() => {
            if(user) fetchPatients();
        }, 60000);
        return () => {
            clearTimeout(delayDebounceFn);
            clearInterval(intervalId);
        };
    }, [search, user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (patient = null) => {
        if (patient) {
            setEditingPatient(patient);
            setFormData({
                full_name: patient.full_name,
                gender: patient.gender,
                date_of_birth: patient.date_of_birth.split('T')[0],
                phone: patient.phone,
                email: patient.email || '',
                address: patient.address || '',
                blood_type: patient.blood_type || '',
                emergency_contact: patient.emergency_contact || ''
            });
        } else {
            setEditingPatient(null);
            setFormData({
                full_name: '', gender: 'Male', date_of_birth: '', phone: '',
                email: '', address: '', blood_type: '', emergency_contact: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPatient) {
                await axios.put(`https://clinic-management-system-production-202f.up.railway.app/api/patients/${editingPatient.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم تحديث بيانات المريض بنجاح');
            } else {
                await axios.post('https://clinic-management-system-production-202f.up.railway.app/api/patients', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تمت إضافة المريض بنجاح');
            }
            setIsModalOpen(false);
            fetchPatients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://clinic-management-system-production-202f.up.railway.app/api/patients/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('تم حذف المريض بنجاح');
            setDeleteModal({ isOpen: false, id: null });
            fetchPatients();
        } catch (error) {
            toast.error('حدث خطأ أثناء عملية الحذف');
        }
    };

    const exportToExcel = () => {
        const dataToExport = patients.map(p => ({
            'كود المريض': p.patient_code,
            'الاسم الكامل': p.full_name,
            'النوع': p.gender === 'Male' ? 'ذكر' : (p.gender === 'Female' ? 'أنثى' : 'آخر'),
            'تاريخ الميلاد': new Date(p.date_of_birth).toLocaleDateString('ar-EG'),
            'رقم الهاتف': p.phone,
            'البريد الإلكتروني': p.email || '-',
            'العنوان': p.address || '-',
            'تاريخ التسجيل': new Date(p.created_at).toLocaleDateString('ar-EG')
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
        XLSX.writeFile(workbook, 'Patients_Data.xlsx');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">المرضى</h2>
                    <p className="text-slate-400 text-sm">إدارة السجلات وبيانات المرضى</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportToExcel} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-2" title="تصدير إلى Excel">
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:block">تصدير</span>
                    </button>
                    <button onClick={() => openModal()} className="btn-cyber-primary px-4 py-2 gap-2 flex items-center">
                        <Plus className="w-5 h-5" />
                        <span>إضافة مريض</span>
                    </button>
                </div>
            </div>

            <div className="bento-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="البحث عن مريض..." 
                        className="input-neon px-4 py-2 w-full max-w-md"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-theme text-slate-400 text-sm">
                                <th className="py-3 px-4 font-medium">كود المريض</th>
                                <th className="py-3 px-4 font-medium">الاسم</th>
                                <th className="py-3 px-4 font-medium">رقم الهاتف</th>
                                <th className="py-3 px-4 font-medium">تاريخ التسجيل</th>
                                <th className="py-3 px-4 font-medium">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400">جاري تحميل البيانات...</td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400">لا يوجد مرضى حالياً</td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="border-b border-theme/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-mono text-cyan-400">{patient.patient_code}</td>
                                        <td className="py-3 px-4 text-white">{patient.full_name}</td>
                                        <td className="py-3 px-4 text-slate-300">{patient.phone}</td>
                                        <td className="py-3 px-4 text-slate-400">{new Date(patient.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(patient)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteModal({ isOpen: true, id: patient.id })} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
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
                            <h3 className="text-xl font-bold text-white">
                                {editingPatient ? 'تعديل بيانات مريض' : 'إضافة مريض جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="patientForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">الاسم الكامل *</label>
                                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">الجنس *</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="Male">ذكر</option>
                                        <option value="Female">أنثى</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">تاريخ الميلاد *</label>
                                    <input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">رقم الهاتف *</label>
                                    <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">البريد الإلكتروني</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">فصيلة الدم</label>
                                    <select name="blood_type" value={formData.blood_type} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="">غير محدد</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">العنوان</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">رقم الطوارئ</label>
                                    <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-theme flex justify-end gap-3 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                                إلغاء
                            </button>
                            <button type="submit" form="patientForm" className="btn-cyber-primary px-6 py-2">
                                حفظ البيانات
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmDeleteModal 
                isOpen={deleteModal.isOpen} 
                onClose={() => setDeleteModal({ isOpen: false, id: null })} 
                onConfirm={() => handleDelete(deleteModal.id)} 
                message="هل أنت متأكد من رغبتك في حذف ملف هذا المريض نهائياً؟"
            />
        </div>
    );
};

export default Patients;
