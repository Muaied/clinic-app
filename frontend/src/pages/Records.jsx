import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Edit, Trash2, X, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Records = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_id: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [recRes, patRes, docRes, appRes] = await Promise.all([
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/medical-records', { 
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: { search: searchTerm, date: searchDate }
                }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/patients', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/doctors', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/appointments', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setRecords(recRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
            setAppointments(appRes.data);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            const delayDebounceFn = setTimeout(() => {
                fetchData();
            }, 500);
            const intervalId = setInterval(() => {
                fetchData();
            }, 60000);
            return () => {
                clearTimeout(delayDebounceFn);
                clearInterval(intervalId);
            };
        }
    }, [user, searchTerm, searchDate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Filter appointments based on selected patient and doctor to link them properly
    const filteredAppointments = useMemo(() => {
        if (!formData.patient_id || !formData.doctor_id) return [];
        return appointments.filter(a => 
            a.patient_id.toString() === formData.patient_id.toString() && 
            a.doctor_id.toString() === formData.doctor_id.toString()
        );
    }, [appointments, formData.patient_id, formData.doctor_id]);

    const openModal = (record = null) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                patient_id: record.patient_id,
                doctor_id: record.doctor_id,
                appointment_id: record.appointment_id || '',
                symptoms: record.symptoms || '',
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || '',
                notes: record.notes || ''
            });
        } else {
            setEditingRecord(null);
            setFormData({
                patient_id: patients.length > 0 ? patients[0].id : '',
                doctor_id: doctors.length > 0 ? doctors[0].id : '',
                appointment_id: '',
                symptoms: '',
                diagnosis: '',
                treatment: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRecord) {
                await axios.put(`https://clinic-management-system-production-202f.up.railway.app/api/medical-records/${editingRecord.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم تحديث السجل الطبي بنجاح');
            } else {
                await axios.post('https://clinic-management-system-production-202f.up.railway.app/api/medical-records', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم إضافة السجل الطبي بنجاح');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا السجل الطبي نهائياً؟')) {
            try {
                await axios.delete(`https://clinic-management-system-production-202f.up.railway.app/api/medical-records/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم حذف السجل بنجاح');
                fetchData();
            } catch (error) {
                toast.error('حدث خطأ أثناء عملية الحذف');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">السجلات الطبية</h2>
                    <p className="text-slate-400 text-sm">إدارة وتوثيق التشخيصات والعلاجات</p>
                </div>
                <button onClick={() => openModal()} className="btn-cyber-primary px-4 py-2 gap-2 flex items-center">
                    <Plus className="w-5 h-5" />
                    <span>إضافة سجل طبي</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="ابحث باسم المريض..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-neon w-full pr-10 pl-4 py-2"
                    />
                </div>
                <div className="flex-1">
                    <input 
                        type="date" 
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="input-neon w-full px-4 py-2 text-slate-300"
                    />
                </div>
            </div>

            <div className="bento-card p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-theme text-slate-400 text-sm">
                                <th className="py-3 px-4 font-medium">المريض</th>
                                <th className="py-3 px-4 font-medium">الطبيب المعالج</th>
                                <th className="py-3 px-4 font-medium">التشخيص (Diagnosis)</th>
                                <th className="py-3 px-4 font-medium">تاريخ السجل</th>
                                <th className="py-3 px-4 font-medium">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-400">لا يوجد سجلات طبية حالياً</td></tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record.id} className="border-b border-theme/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-white font-medium">{record.patient_name}</td>
                                        <td className="py-3 px-4 text-cyan-400">{record.doctor_name}</td>
                                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{record.diagnosis || 'لم يحدد'}</td>
                                        <td className="py-3 px-4 text-slate-400">{new Date(record.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(record)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(record.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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
                    <div className="bento-card w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-theme">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-cyan-400" />
                                {editingRecord ? 'تعديل السجل الطبي' : 'إنشاء سجل طبي جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="recordForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* الربط (Linking) */}
                                <div className="space-y-4 md:col-span-2 p-4 bg-slate-800/30 rounded-xl border border-theme/50">
                                    <h4 className="text-sm font-semibold text-cyan-400">معلومات الربط</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">المريض *</label>
                                            <select required name="patient_id" value={formData.patient_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                                <option value="">-- اختر المريض --</option>
                                                {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">الطبيب المعالج *</label>
                                            <select required name="doctor_id" value={formData.doctor_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                                <option value="">-- اختر الطبيب --</option>
                                                {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-400">الموعد المرتبط (اختياري)</label>
                                            <select name="appointment_id" value={formData.appointment_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                                <option value="">-- بدون موعد محدد --</option>
                                                {filteredAppointments.map(a => (
                                                    <option key={a.id} value={a.id}>
                                                        {new Date(a.appointment_date).toLocaleDateString('ar-EG')} - {a.appointment_time.slice(0, 5)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {formData.patient_id && formData.doctor_id && filteredAppointments.length === 0 && (
                                        <p className="text-xs text-orange-400 mt-2">لا توجد مواعيد مسجلة بين هذا المريض والطبيب.</p>
                                    )}
                                </div>

                                {/* التفاصيل الطبية */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">الأعراض (Symptoms)</label>
                                    <textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} className="input-neon w-full px-4 py-2 h-20 resize-none"></textarea>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">التشخيص (Diagnosis) *</label>
                                    <textarea required name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} className="input-neon w-full px-4 py-2 h-20 resize-none"></textarea>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">الوصفة الطبية / خطة العلاج (Prescription / Treatment)</label>
                                    <textarea name="treatment" value={formData.treatment} onChange={handleInputChange} className="input-neon w-full px-4 py-2 h-24 resize-none"></textarea>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">ملاحظات إضافية (Notes)</label>
                                    <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-theme flex justify-end gap-3 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">إلغاء</button>
                            <button type="submit" form="recordForm" className="btn-cyber-primary px-6 py-2">حفظ السجل</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Records;
