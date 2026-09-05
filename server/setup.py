import os

files = {
    'routes/patientRoutes.js': """const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getPatients).post(createPatient);
router.route('/:id').get(getPatientById).put(updatePatient).delete(deletePatient);

module.exports = router;
""",
    'controllers/doctorController.js': """const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getDoctors = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const query = `
            SELECT d.*, u.full_name, u.email, u.phone, u.status 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE u.full_name LIKE ? OR d.specialization LIKE ?
        `;
        const [doctors] = await db.execute(query, [f"%{search}%", f"%{search}%"]);
        res.json(doctors);
    } catch (err) {
        next(err);
    }
};

exports.createDoctor = async (req, res, next) => {
    try {
        const { full_name, email, password, phone, specialization, license_number, consultation_fee, experience_years, bio } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (full_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
                [full_name, email, hashedPassword, 'Doctor', phone]
            );
            
            const user_id = userResult.insertId;
            
            await connection.execute(
                'INSERT INTO doctors (user_id, specialization, license_number, consultation_fee, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, specialization, license_number, consultation_fee, experience_years || 0, bio || null]
            );
            
            await connection.commit();
            res.status(201).json({ message: 'Doctor created successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (err) {
        next(err);
    }
};
""",
    'routes/doctorRoutes.js': """const express = require('express');
const router = express.Router();
const { getDoctors, createDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getDoctors).post(authorize('Admin'), createDoctor);

module.exports = router;
""",
    'controllers/appointmentController.js': """const db = require('../config/db');

exports.getAppointments = async (req, res, next) => {
    try {
        const query = `
            SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            JOIN doctors d ON a.doctor_id = d.id 
            JOIN users u ON d.user_id = u.id 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `;
        const [appointments] = await db.execute(query);
        res.json(appointments);
    } catch (err) {
        next(err);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time, reason, notes } = req.body;
        
        const [existing] = await db.execute(
            'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "Cancelled"',
            [doctor_id, appointment_date, appointment_time]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Doctor is already booked at this time' });
        }
        
        await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, reason, notes || null]
        );
        res.status(201).json({ message: 'Appointment created successfully' });
    } catch (err) {
        next(err);
    }
};

exports.updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        await db.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        next(err);
    }
};
""",
    'routes/appointmentRoutes.js': """const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAppointments).post(createAppointment);
router.route('/:id/status').patch(updateAppointmentStatus);

module.exports = router;
""",
    'controllers/recordController.js': """const db = require('../config/db');

exports.getMedicalRecords = async (req, res, next) => {
    try {
        const [records] = await db.execute(`
            SELECT m.*, p.full_name as patient_name, u.full_name as doctor_name
            FROM medical_records m
            JOIN patients p ON m.patient_id = p.id
            JOIN doctors d ON m.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
        `);
        res.json(records);
    } catch (err) {
        next(err);
    }
};

exports.createMedicalRecord = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment, notes } = req.body;
        await db.execute(
            'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_id || null, symptoms, diagnosis, treatment, notes || null]
        );
        res.status(201).json({ message: 'Medical record created' });
    } catch (err) {
        next(err);
    }
};
""",
    'routes/recordRoutes.js': """const express = require('express');
const router = express.Router();
const { getMedicalRecords, createMedicalRecord } = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getMedicalRecords).post(createMedicalRecord);

module.exports = router;
""",
    'controllers/invoiceController.js': """const db = require('../config/db');

exports.getInvoices = async (req, res, next) => {
    try {
        const [invoices] = await db.execute(`
            SELECT i.*, p.full_name as patient_name 
            FROM invoices i 
            JOIN patients p ON i.patient_id = p.id
        `);
        res.json(invoices);
    } catch (err) {
        next(err);
    }
};

exports.createInvoice = async (req, res, next) => {
    try {
        const { patient_id, appointment_id, amount } = req.body;
        const invoice_number = 'INV-' + Date.now();
        await db.execute(
            'INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount) VALUES (?, ?, ?, ?)',
            [patient_id, appointment_id || null, invoice_number, amount]
        );
        res.status(201).json({ message: 'Invoice created', invoice_number });
    } catch (err) {
        next(err);
    }
};

exports.payInvoice = async (req, res, next) => {
    try {
        const { payment_method } = req.body;
        await db.execute(
            'UPDATE invoices SET status = "Paid", payment_method = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
            [payment_method, req.params.id]
        );
        res.json({ message: 'Invoice marked as paid' });
    } catch (err) {
        next(err);
    }
};
""",
    'routes/invoiceRoutes.js': """const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, payInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id/pay').patch(payInvoice);

module.exports = router;
""",
    'controllers/dashboardController.js': """const db = require('../config/db');

exports.getStats = async (req, res, next) => {
    try {
        const [[{ totalPatients }]] = await db.execute('SELECT COUNT(*) as totalPatients FROM patients');
        const [[{ totalDoctors }]] = await db.execute('SELECT COUNT(*) as totalDoctors FROM doctors');
        const [[{ todayAppointments }]] = await db.execute('SELECT COUNT(*) as todayAppointments FROM appointments WHERE appointment_date = CURDATE()');
        const [[{ totalRevenue }]] = await db.execute('SELECT SUM(amount) as totalRevenue FROM invoices WHERE status = "Paid"');
        
        const [recentPatients] = await db.execute('SELECT * FROM patients ORDER BY created_at DESC LIMIT 5');
        const [todayAppointmentsList] = await db.execute(`
            SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            JOIN doctors d ON a.doctor_id = d.id 
            JOIN users u ON d.user_id = u.id 
            WHERE a.appointment_date = CURDATE()
            ORDER BY a.appointment_time ASC
        `);
        
        res.json({
            stats: {
                totalPatients,
                totalDoctors,
                todayAppointments,
                totalRevenue: totalRevenue || 0
            },
            recentPatients,
            todayAppointmentsList
        });
    } catch (err) {
        next(err);
    }
};
""",
    'routes/dashboardRoutes.js': """const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/stats', getStats);

module.exports = router;
"""
}

for path, content in files.items():
    # Make sure we use raw % inside python strings if there's f-strings, 
    # wait, I used f"%{search}%" which python will try to format if the string is f-string.
    # but the string is just normal multiline string, so it will write literally f"%{search}%" which is invalid JS!
    # Ah I see `[f"%{search}%", f"%{search}%"]` in Javascript is invalid syntax. 
    # It should be \`%${search}%\`
    
    # I will replace f"%{search}%" with \`%${search}%\` inside the JS content just to be safe.
    content = content.replace('f"%{search}%"', '`%${search}%`')
    
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {path}")

