const db = require('../config/db');

exports.getMedicalRecords = async (req, res, next) => {
    try {
        const { id: user_id, role } = req.user;
        const search = req.query.search || '';
        const date = req.query.date || '';
        
        let query = `
            SELECT m.*, p.full_name as patient_name, u.full_name as doctor_name
            FROM medical_records m
            JOIN patients p ON m.patient_id = p.id
            JOIN doctors d ON m.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE p.full_name LIKE ?
        `;
        let params = [`%${search}%`];

        if (date) {
            query += ' AND DATE(m.created_at) = ? ';
            params.push(date);
        }

        if (role === 'Doctor') {
            const [doc] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user_id]);
            if (doc.length > 0) {
                query += ' AND m.doctor_id = ? ';
                params.push(doc[0].id);
            }
        }
        
        query += ' ORDER BY m.created_at DESC';
        const [records] = await db.execute(query, params);
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

exports.updateMedicalRecord = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment, notes } = req.body;
        await db.execute(
            'UPDATE medical_records SET patient_id=?, doctor_id=?, appointment_id=?, symptoms=?, diagnosis=?, treatment=?, notes=? WHERE id=?',
            [patient_id, doctor_id, appointment_id || null, symptoms, diagnosis, treatment, notes || null, req.params.id]
        );
        res.json({ message: 'Medical record updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteMedicalRecord = async (req, res, next) => {
    try {
        await db.execute('DELETE FROM medical_records WHERE id=?', [req.params.id]);
        res.json({ message: 'Medical record deleted successfully' });
    } catch (err) {
        next(err);
    }
};
