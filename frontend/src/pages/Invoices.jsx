import React, { useState, useEffect, useMemo } from 'react';
import { Receipt, Plus, Edit, Trash2, X, CheckCircle, Printer, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Invoices = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [invoiceToPrint, setInvoiceToPrint] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const [formData, setFormData] = useState({
        patient_id: '',
        appointment_id: '',
        amount: '',
        status: 'Pending',
        payment_method: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invRes, patRes, docRes, appRes] = await Promise.all([
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/invoices', { 
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: { search: searchTerm, date: searchDate }
                }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/patients', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/doctors', { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get('https://clinic-management-system-production-202f.up.railway.app/api/appointments', { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setInvoices(invRes.data);
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

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-calculate amount when appointment changes
            if (name === 'appointment_id' && value) {
                const selectedApp = appointments.find(a => a.id.toString() === value.toString());
                if (selectedApp) {
                    const doc = doctors.find(d => d.id.toString() === selectedApp.doctor_id.toString());
                    if (doc) {
                        newData.amount = doc.consultation_fee;
                    }
                }
            }
            return newData;
        });
    };

    // Filter appointments for the selected patient
    const filteredAppointments = useMemo(() => {
        if (!formData.patient_id) return [];
        return appointments.filter(a => a.patient_id.toString() === formData.patient_id.toString());
    }, [appointments, formData.patient_id]);

    const openModal = (invoice = null) => {
        if (invoice) {
            setEditingInvoice(invoice);
            setFormData({
                patient_id: invoice.patient_id,
                appointment_id: invoice.appointment_id || '',
                amount: invoice.amount,
                status: invoice.status,
                payment_method: invoice.payment_method || ''
            });
        } else {
            setEditingInvoice(null);
            setFormData({
                patient_id: patients.length > 0 ? patients[0].id : '',
                appointment_id: '',
                amount: '',
                status: 'Pending',
                payment_method: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingInvoice) {
                await axios.put(`https://clinic-management-system-production-202f.up.railway.app/api/invoices/${editingInvoice.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم تحديث الفاتورة بنجاح');
            } else {
                await axios.post('https://clinic-management-system-production-202f.up.railway.app/api/invoices', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم إصدار الفاتورة بنجاح');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الفاتورة');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://clinic-management-system-production-202f.up.railway.app/api/invoices/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('تم حذف الفاتورة بنجاح');
            setDeleteModal({ isOpen: false, id: null });
            fetchData();
        } catch (error) {
            toast.error('حدث خطأ أثناء عملية الحذف');
        }
    };

    const handlePay = async (id) => {
        const paymentMethod = window.prompt("أدخل طريقة الدفع (مثال: نقدي، بطاقة):", "نقدي");
        if (paymentMethod !== null) {
            try {
                await axios.patch(`https://clinic-management-system-production-202f.up.railway.app/api/invoices/${id}/pay`, { payment_method: paymentMethod }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.success('تم سداد الفاتورة بنجاح');
                fetchData();
            } catch (error) {
                toast.error('حدث خطأ أثناء سداد الفاتورة');
            }
        }
    };

    useEffect(() => {
        if (invoiceToPrint) {
            const timer = setTimeout(() => {
                window.print();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [invoiceToPrint]);

    useEffect(() => {
        const handleAfterPrint = () => {
            setInvoiceToPrint(null);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    const handlePrint = (invoice) => {
        // Create a new reference to force re-render if it's the same invoice
        setInvoiceToPrint({ ...invoice });
    };

    const getStatusColor = (status) => {
        if (status === 'Paid') return 'text-emerald-400 bg-emerald-400/10';
        if (status === 'Cancelled') return 'text-red-400 bg-red-400/10';
        return 'text-orange-400 bg-orange-400/10'; // Pending
    };

    return (
        <>
        <div className="space-y-6 no-print">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">الفواتير</h2>
                    <p className="text-slate-400 text-sm">إدارة الإيرادات والمدفوعات</p>
                </div>
                <button onClick={() => openModal()} className="btn-cyber-primary px-4 py-2 gap-2 flex items-center">
                    <Plus className="w-5 h-5" />
                    <span>إصدار فاتورة</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="ابحث باسم المريض أو الطبيب أو رقم الفاتورة..." 
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
                                <th className="py-3 px-4 font-medium">رقم الفاتورة</th>
                                <th className="py-3 px-4 font-medium">المريض</th>
                                <th className="py-3 px-4 font-medium">الطبيب المعالج</th>
                                <th className="py-3 px-4 font-medium">المبلغ</th>
                                <th className="py-3 px-4 font-medium">الحالة</th>
                                <th className="py-3 px-4 font-medium">طريقة الدفع</th>
                                <th className="py-3 px-4 font-medium">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="py-8 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="7" className="py-8 text-center text-slate-400">لا يوجد فواتير حالياً</td></tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-theme/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-mono text-cyan-400">{invoice.invoice_number}</td>
                                        <td className="py-3 px-4 text-white font-medium">{invoice.patient_name}</td>
                                        <td className="py-3 px-4 text-slate-300">{invoice.doctor_name || 'غير محدد'}</td>
                                        <td className="py-3 px-4 text-white font-bold">{invoice.amount} ج.س</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                                                {invoice.status === 'Paid' ? 'مدفوعة' : invoice.status === 'Pending' ? 'معلقة' : 'ملغية'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{invoice.payment_method || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                {invoice.status === 'Pending' && (
                                                    <button onClick={() => handlePay(invoice.id)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="سداد الفاتورة">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrint(invoice)} className="p-2 text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="طباعة">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openModal(invoice)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="تعديل">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteModal({ isOpen: true, id: invoice.id })} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="حذف">
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
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Receipt className="w-6 h-6 text-cyan-400" />
                                {editingInvoice ? 'تعديل الفاتورة' : 'إصدار فاتورة جديدة'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="invoiceForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">المريض *</label>
                                    <select required name="patient_id" value={formData.patient_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="">-- اختر المريض --</option>
                                        {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">الموعد المرتبط بالفاتورة *</label>
                                    <select required name="appointment_id" value={formData.appointment_id} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="">-- اختر الموعد --</option>
                                        {filteredAppointments.map(a => {
                                            const docName = doctors.find(d => d.id === a.doctor_id)?.full_name || '';
                                            return (
                                                <option key={a.id} value={a.id}>
                                                    {new Date(a.appointment_date).toLocaleDateString('ar-EG')} - {docName}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    {formData.patient_id && filteredAppointments.length === 0 && (
                                        <p className="text-xs text-orange-400 mt-1">لا توجد مواعيد لهذا المريض.</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">المبلغ *</label>
                                    <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="input-neon w-full px-4 py-2" placeholder="أدخل المبلغ" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">حالة الفاتورة</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="input-neon w-full px-4 py-2">
                                        <option value="Pending">معلقة (Pending)</option>
                                        <option value="Paid">مدفوعة (Paid)</option>
                                        <option value="Cancelled">ملغية (Cancelled)</option>
                                    </select>
                                </div>
                                {formData.status === 'Paid' && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm text-slate-400">طريقة الدفع (اختياري)</label>
                                        <input type="text" name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="input-neon w-full px-4 py-2" placeholder="نقدي, بطاقة ائتمان, إلخ" />
                                    </div>
                                )}
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-theme flex justify-end gap-3 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">إلغاء</button>
                            <button type="submit" form="invoiceForm" className="btn-cyber-primary px-6 py-2">حفظ الفاتورة</button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmDeleteModal 
                isOpen={deleteModal.isOpen} 
                onClose={() => setDeleteModal({ isOpen: false, id: null })} 
                onConfirm={() => handleDelete(deleteModal.id)} 
                message="هل أنت متأكد من حذف هذه الفاتورة؟"
            />
        </div>

        {/* Printable Invoice Template */}
        {invoiceToPrint && (
            <div className="print-only text-black p-8 bg-white" dir="rtl">
                <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                    <h1 className="text-3xl font-bold mb-2">عيادتي للرعاية الصحية</h1>
                    <p className="text-slate-600">نظام إدارة العيادات الذكي</p>
                </div>
                
                <div className="flex justify-between mb-8">
                    <div>
                        <p className="font-bold mb-1">فاتورة رقم:</p>
                        <p className="text-slate-700">{invoiceToPrint.invoice_number}</p>
                    </div>
                    <div className="text-left">
                        <p className="font-bold mb-1">تاريخ الإصدار:</p>
                        <p className="text-slate-700">{new Date(invoiceToPrint.issued_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">اسم المريض:</p>
                            <p className="font-bold">{invoiceToPrint.patient_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">الطبيب المعالج:</p>
                            <p className="font-bold">{invoiceToPrint.doctor_name || 'غير محدد'}</p>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-8 text-right border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-800">
                            <th className="py-2">البيان</th>
                            <th className="py-2">المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-slate-200">
                            <td className="py-4">رسوم الكشف / خدمات طبية</td>
                            <td className="py-4 font-bold">{invoiceToPrint.amount} ج.س</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-between items-center mb-12">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">حالة الدفع:</p>
                        <p className="font-bold">
                            {invoiceToPrint.status === 'Paid' ? 'مدفوعة' : invoiceToPrint.status === 'Pending' ? 'معلقة' : 'ملغية'}
                        </p>
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-slate-500 mb-1">الإجمالي:</p>
                        <p className="text-2xl font-bold text-slate-900">{invoiceToPrint.amount} ج.س</p>
                    </div>
                </div>

                <div className="text-center mt-16 pt-8 border-t border-slate-200 text-slate-500">
                    <p className="mb-2">مع تمنياتنا لكم بدوام الصحة والعافية</p>
                    <p className="text-sm">الفواتير المدفوعة لا تُرد</p>
                </div>
            </div>
        )}
        </>
    );
};

export default Invoices;
