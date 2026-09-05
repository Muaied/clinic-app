const db = require('../config/db');

exports.getAppointments = async (req, res, next) => {
    try {
        const { id: user_id, role } = req.user;
        const search = req.query.search || '';
        const date = req.query.date || '';
        const time = req.query.time || '';

        let query = `
            SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            JOIN doctors d ON a.doctor_id = d.id 
            JOIN users u ON d.user_id = u.id 
            WHERE p.full_name LIKE ?
        `;
        let params = [`%${search}%`];

        if (date) {
            query += ' AND a.appointment_date = ? ';
            params.push(date);
        }

        if (time) {
            query += ' AND a.appointment_time LIKE ? ';
            params.push(`${time}%`);
        }

        if (role === 'Doctor') {
            const [doc] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user_id]);
            if (doc.length > 0) {
                query += ' AND a.doctor_id = ? ';
                params.push(doc[0].id);
            }
        }
        
        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
        const [appointments] = await db.execute(query, params);
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

exports.updateAppointment = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes } = req.body;
        await db.execute(
            'UPDATE appointments SET patient_id=?, doctor_id=?, appointment_date=?, appointment_time=?, reason=?, status=?, notes=? WHERE id=?',
            [patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes || null, req.params.id]
        );
        res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        await db.execute('DELETE FROM appointments WHERE id=?', [req.params.id]);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        next(err);
    }
};
