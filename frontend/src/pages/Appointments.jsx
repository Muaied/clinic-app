import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, X, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchTime, setSearchTime] = useState('');

    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        status: 'Scheduled',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appRes, patRes, docRes] = await Promise.all([
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/appointments', { 
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: { search: searchTerm, date: searchDate, time: searchTime }
                }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/patients', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/doctors', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setAppointments(appRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
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
    }, [user, searchTerm, searchDate, searchTime]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (appointment = null) => {
        if (appointment) {
            setEditingAppointment(appointment);
            setFormData({
                patient_id: appointment.patient_id,
                doctor_id: appointment.doctor_id,
                appointment_date: appointment.appointment_date.split('T')[0],
                appointment_time: appointment.appointment_time,
                reason: appointment.reason,
                status: appointment.status,
                notes: appointment.notes || ''
            });
        } else {
            setEditingAppointment(null);
            setFormData({
                patient_id: patients.length > 0 ? patients[0].id : '',
                doctor_id: doctors.length > 0 ? doctors[0].id : '',
                appointment_date: new Date().toISOString().split('T')[0],
                appointment_time: '10:00',
                reason: '',
                status: 'Scheduled',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAppointment) {
                await axios.put(`https://clinic-management-system-production-202f.up.railway.app/api/appointments/${editingAppointment.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم تحديث الموعد بنجاح');
            } else {
                await axios.post('https://clinic-management-system-production-202f.up.railway.app/api/appointments', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم حجز الموعد بنجاح');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://clinic-management-system-production-202f.up.railway.app/api/appointments/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('تم حذف الموعد بنجاح');
            setDeleteModal({ isOpen: false, id: null });
            fetchData();
        } catch (error) {
            toast.error('حدث خطأ أثناء عملية الحذف');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': 'text-blue-400 bg-blue-400/10',
            'Confirmed': 'text-emerald-400 bg-emerald-400/10',
            'Completed': 'text-slate-400 bg-slate-400/10',
            'Cancelled': 'text-red-400 bg-red-400/10',
            'No Show': 'text-orange-400 bg-orange-400/10'
        };
        return colors[status] || 'text-white bg-white/10';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">المواعيد</h2>
                    <p className="text-slate-400 text-sm">إدارة حجوزات العيادة</p>
                </div>
                <button onClick={() => openModal()} className="btn-cyber-primary px-4 py-2 gap-2 flex items-center">
                    <Plus className="w-5 h-5" />
                    <span>حجز موعد</span>
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
                <div className="flex-1">
                    <input 
                        type="time" 
                        value={searchTime}
                        onChange={(e) => setSearchTime(e.target.value)}
                        className="input-neon w-full px-4 py-2 text-slate-300"
                    />
                </div>
            </div>

            <div className="bento-card p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-theme text-slate-400 text-sm">
                                <th className="py-3 px-4 font-medium">اسم المريض</th>
                                <th className="py-3 px-4 font-medium">الطبيب المعالج</th>
                                <th className="py-3 px-4 font-medium">تاريخ الموعد</th>
                                <th className="py-3 px-4 font-medium">الوقت</th>
                                <th className="py-3 px-4 font-medium">الحالة</th>
                                <th className="py-3 px-4 font-medium">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="py-8 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan="6" className="py-8 text-center text-slate-400">لا يوجد مواعيد حالياً</td></tr>
                            ) : (
                                appointments.map((appointment) => (
                                    <tr key={appointment.id} className="border-b border-theme/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 text-white font-medium">{appointment.patient_name}</td>
                                        <td className="py-3 px-4 text-cyan-400">{appointment.doctor_name}</td>
                                        <td className="py-3 px-4 text-slate-300">
                                            {new Date(appointment.appointment_date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                                        </td>
                                        <td className="py-3 px-4 text-slate-300 font-mono">{appointment.appointment_time.slice(0, 5)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(appointment)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteModal({ isOpen: true, id: appointment.id })} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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
                                {editingAppointment ? 'تعديل بيانات الموعد' : 'حجز موعد جديد'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="appointmentForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">المريض *</label>
                                    <select required name="patient_id" value={formData.patient_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="">-- اختر المريض --</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">الطبيب *</label>
                                    <select required name="doctor_id" value={formData.doctor_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="">-- اختر الطبيب --</option>
                                        {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">تاريخ الموعد *</label>
                                    <input required type="date" name="appointment_date" value={formData.appointment_date} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">وقت الموعد *</label>
                                    <input required type="time" name="appointment_time" value={formData.appointment_time} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">سبب الزيارة *</label>
                                    <textarea required name="reason" value={formData.reason} onChange={handleInputChange} className="input-neon w-full px-4 py-2 h-20 resize-none"></textarea>
                                </div>
                                {editingAppointment && (
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">حالة الموعد</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                            <option value="Scheduled">مجدول (Scheduled)</option>
                                            <option value="Confirmed">مؤكد (Confirmed)</option>
                                            <option value="Completed">مكتمل (Completed)</option>
                                            <option value="Cancelled">ملغي (Cancelled)</option>
                                            <option value="No Show">لم يحضر (No Show)</option>
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-slate-400">ملاحظات إضافية</label>
                                    <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} className="input-neon w-full px-4 py-2" />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-theme flex justify-end gap-3 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">إلغاء</button>
                            <button type="submit" form="appointmentForm" className="btn-cyber-primary px-6 py-2">حفظ الموعد</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal 
                isOpen={deleteModal.isOpen} 
                onClose={() => setDeleteModal({ isOpen: false, id: null })} 
                onConfirm={() => handleDelete(deleteModal.id)} 
                message="هل أنت متأكد من إلغاء وحذف هذا الموعد؟"
            />
        </div>
    );
};

export default Appointments;
