const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getDoctors = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const query = `
            SELECT d.*, u.full_name, u.username, u.phone, u.status 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE u.full_name LIKE ? OR d.specialization LIKE ?
        `;
        const [doctors] = await db.execute(query, [`%${search}%`, `%${search}%`]);
        res.json(doctors);
    } catch (err) {
        next(err);
    }
};

exports.createDoctor = async (req, res, next) => {
    try {
        const { full_name, username, password, phone, specialization, license_number, consultation_fee, experience_years, bio } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (full_name, username, password, role, phone) VALUES (?, ?, ?, ?, ?)',
                [full_name, username, hashedPassword, 'Doctor', phone]
            );
            
            const user_id = userResult.insertId;
            
            await connection.execute(
                'INSERT INTO doctors (user_id, specialization, license_number, consultation_fee, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, specialization, license_number, parseFloat(consultation_fee) || 0, experience_years ? parseInt(experience_years) : 0, bio || null]
            );
            
            await connection.commit();
            res.status(201).json({ message: 'Doctor created successfully' });
        } catch (error) {
            await connection.rollback();
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'اسم المستخدم أو رقم الترخيص مسجل مسبقاً' });
            }
            throw error;
        } finally {
            connection.release();
        }
    } catch (err) {
        next(err);
    }
};

exports.updateDoctor = async (req, res, next) => {
    try {
        const { full_name, username, phone, specialization, license_number, consultation_fee, experience_years, bio } = req.body;
        const doctorId = req.params.id;

        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const [doctor] = await connection.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
            if (doctor.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Doctor not found' });
            }
            const userId = doctor[0].user_id;

            await connection.execute(
                'UPDATE users SET full_name=?, username=?, phone=? WHERE id=?',
                [full_name, username, phone, userId]
            );

            await connection.execute(
                'UPDATE doctors SET specialization=?, license_number=?, consultation_fee=?, experience_years=?, bio=? WHERE id=?',
                [specialization, license_number, parseFloat(consultation_fee) || 0, experience_years ? parseInt(experience_years) : 0, bio || null, doctorId]
            );

            await connection.commit();
            res.json({ message: 'Doctor updated successfully' });
        } catch (error) {
            await connection.rollback();
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'اسم المستخدم أو رقم الترخيص مسجل مسبقاً لطبيب آخر' });
            }
            throw error;
        } finally {
            connection.release();
        }
    } catch (err) {
        next(err);
    }
};

exports.deleteDoctor = async (req, res, next) => {
    try {
        const doctorId = req.params.id;
        const [doctor] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
        
        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Deleting the user will cascade and delete the doctor record
        await db.execute('DELETE FROM users WHERE id = ?', [doctor[0].user_id]);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        next(err);
    }
};
