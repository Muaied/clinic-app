const db = require('../config/db');

exports.getPatients = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const { id: user_id, role } = req.user;
        let query = 'SELECT * FROM patients WHERE (full_name LIKE ? OR patient_code LIKE ?)';
        let params = [`%${search}%`, `%${search}%`];

        if (role === 'Doctor') {
            const [doc] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user_id]);
            if (doc.length > 0) {
                query = `
                    SELECT DISTINCT p.* 
                    FROM patients p 
                    JOIN appointments a ON p.id = a.patient_id 
                    WHERE (p.full_name LIKE ? OR p.patient_code LIKE ?) 
                    AND a.doctor_id = ?
                `;
                params.push(doc[0].id);
            }
        }
        
        query += ' ORDER BY created_at DESC';
        const [patients] = await db.execute(query, params);
        res.json(patients);
    } catch (err) {
        next(err);
    }
};

exports.getPatientById = async (req, res, next) => {
    try {
        const [patients] = await db.execute('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient not found' });
        res.json(patients[0]);
    } catch (err) {
        next(err);
    }
};

exports.createPatient = async (req, res, next) => {
    try {
        const { full_name, gender, date_of_birth, phone, email, address, blood_type, emergency_contact } = req.body;
        const patient_code = 'PT' + Math.floor(Math.random() * 1000000);
        
        const [result] = await db.execute(
            `INSERT INTO patients (patient_code, full_name, gender, date_of_birth, phone, email, address, blood_type, emergency_contact) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient_code, full_name, gender, date_of_birth, phone, email || null, address || null, blood_type || null, emergency_contact || null]
        );
        res.status(201).json({ message: 'Patient created', id: result.insertId, patient_code });
    } catch (err) {
        next(err);
    }
};

exports.updatePatient = async (req, res, next) => {
    try {
        const { full_name, phone, email, address, emergency_contact } = req.body;
        await db.execute(
            'UPDATE patients SET full_name=?, phone=?, email=?, address=?, emergency_contact=? WHERE id=?',
            [full_name, phone, email, address, emergency_contact, req.params.id]
        );
        res.json({ message: 'Patient updated' });
    } catch (err) {
        next(err);
    }
};

exports.deletePatient = async (req, res, next) => {
    try {
        await db.execute('DELETE FROM patients WHERE id=?', [req.params.id]);
        res.json({ message: 'Patient deleted' });
    } catch (err) {
        next(err);
    }
};
