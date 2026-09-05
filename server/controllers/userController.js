const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        // Fetch all users and left join with doctors table to get doctor-specific fields if available
        const query = `
            SELECT u.id, u.full_name, u.username, u.role, u.phone, u.status, u.created_at,
                   d.id as doctor_id, d.specialization, d.license_number, d.consultation_fee, d.experience_years, d.bio
            FROM users u 
            LEFT JOIN doctors d ON u.id = d.user_id 
            WHERE u.full_name LIKE ? OR u.username LIKE ?
            ORDER BY u.role, u.created_at DESC
        `;
        const [users] = await db.execute(query, [`%${search}%`, `%${search}%`]);
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        // Only Admin can create users (Receptionists cannot create)
        if (req.user.role === 'Receptionist') {
            return res.status(403).json({ message: 'غير مصرح لك بإضافة مستخدمين' });
        }

        const { full_name, username, password, role, phone, specialization, license_number, consultation_fee, experience_years, bio } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (full_name, username, password, role, phone) VALUES (?, ?, ?, ?, ?)',
                [full_name, username, hashedPassword, role, phone]
            );
            
            const user_id = userResult.insertId;
            
            if (role === 'Doctor') {
                await connection.execute(
                    'INSERT INTO doctors (user_id, specialization, license_number, consultation_fee, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
                    [user_id, specialization || 'عام', license_number || `DOC-${Date.now()}`, parseFloat(consultation_fee) || 0, experience_years ? parseInt(experience_years) : 0, bio || null]
                );
            }
            
            await connection.commit();
            res.status(201).json({ message: 'تم إضافة المستخدم بنجاح' });
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

exports.updateUser = async (req, res, next) => {
    try {
        if (req.user.role === 'Receptionist') {
            return res.status(403).json({ message: 'غير مصرح لك بتعديل المستخدمين' });
        }

        const userId = parseInt(req.params.id);
        if (userId === 1 || req.body.username === 'admin') {
            return res.status(403).json({ message: 'لا يمكن تعديل بيانات المدير الأساسي' });
        }

        const { full_name, username, role, phone, status, password, specialization, license_number, consultation_fee, experience_years, bio } = req.body;
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            let updateQuery = 'UPDATE users SET full_name=?, username=?, role=?, phone=?, status=?';
            let params = [full_name, username, role, phone, status || 'Active'];

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateQuery += ', password=?';
                params.push(hashedPassword);
            }

            updateQuery += ' WHERE id=?';
            params.push(userId);

            await connection.execute(updateQuery, params);

            // Handle Doctor specific fields
            if (role === 'Doctor') {
                const [docExists] = await connection.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
                if (docExists.length > 0) {
                    await connection.execute(
                        'UPDATE doctors SET specialization=?, license_number=?, consultation_fee=?, experience_years=?, bio=? WHERE user_id=?',
                        [specialization, license_number, parseFloat(consultation_fee) || 0, experience_years ? parseInt(experience_years) : 0, bio || null, userId]
                    );
                } else {
                    // In case role was changed to Doctor from something else
                    await connection.execute(
                        'INSERT INTO doctors (user_id, specialization, license_number, consultation_fee, experience_years, bio) VALUES (?, ?, ?, ?, ?, ?)',
                        [userId, specialization || 'عام', license_number || `DOC-${Date.now()}`, parseFloat(consultation_fee) || 0, experience_years ? parseInt(experience_years) : 0, bio || null]
                    );
                }
            } else {
                // If role was changed from Doctor to something else, remove doctor record
                await connection.execute('DELETE FROM doctors WHERE user_id=?', [userId]);
            }

            await connection.commit();
            res.json({ message: 'تم تحديث المستخدم بنجاح' });
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

exports.deleteUser = async (req, res, next) => {
    try {
        if (req.user.role === 'Receptionist') {
            return res.status(403).json({ message: 'غير مصرح لك بحذف المستخدمين' });
        }

        const userId = parseInt(req.params.id);
        
        // Prevent deleting original admin
        if (userId === 1) {
            return res.status(403).json({ message: 'لا يمكن حذف المدير الأساسي للنظام' });
        }

        await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (err) {
        next(err);
    }
};
