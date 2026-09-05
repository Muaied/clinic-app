const db = require('../config/db');

exports.getStats = async (req, res, next) => {
    try {
        const { id: user_id, role } = req.user;
        let doctor_id = null;

        if (role === 'Doctor') {
            const [doc] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user_id]);
            if (doc.length > 0) {
                doctor_id = doc[0].id;
            }
        }

        let totalPatients = 0;
        let totalDoctors = 0;
        let todayAppointments = 0;
        let totalRevenue = 0;

        if (doctor_id) {
            const [[tp]] = await db.execute('SELECT COUNT(DISTINCT patient_id) as totalPatients FROM appointments WHERE doctor_id = ?', [doctor_id]);
            totalPatients = tp.totalPatients;
            
            const [[ta]] = await db.execute('SELECT COUNT(*) as todayAppointments FROM appointments WHERE appointment_date = CURDATE() AND doctor_id = ?', [doctor_id]);
            todayAppointments = ta.todayAppointments;
        } else {
            const [[tp]] = await db.execute('SELECT COUNT(*) as totalPatients FROM patients');
            totalPatients = tp.totalPatients;

            const [[td]] = await db.execute('SELECT COUNT(*) as totalDoctors FROM doctors');
            totalDoctors = td.totalDoctors;

            const [[ta]] = await db.execute('SELECT COUNT(*) as todayAppointments FROM appointments WHERE appointment_date = CURDATE()');
            todayAppointments = ta.todayAppointments;

            const [[tr]] = await db.execute('SELECT SUM(amount) as totalRevenue FROM invoices WHERE status = "Paid"');
            totalRevenue = tr.totalRevenue || 0;
        }
        
        let recentPatientsQuery = 'SELECT * FROM patients ORDER BY created_at DESC LIMIT 5';
        let recentPatientsParams = [];
        if (doctor_id) {
            recentPatientsQuery = `
                SELECT DISTINCT p.* 
                FROM patients p
                JOIN appointments a ON p.id = a.patient_id
                WHERE a.doctor_id = ?
                ORDER BY p.created_at DESC LIMIT 5
            `;
            recentPatientsParams.push(doctor_id);
        }
        const [recentPatients] = await db.execute(recentPatientsQuery, recentPatientsParams);

        let appointmentsQuery = `
            SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name 
            FROM appointments a 
            JOIN patients p ON a.patient_id = p.id 
            JOIN doctors d ON a.doctor_id = d.id 
            JOIN users u ON d.user_id = u.id 
            WHERE a.appointment_date = CURDATE()
        `;
        let appointmentsParams = [];
        if (doctor_id) {
            appointmentsQuery += ' AND a.doctor_id = ? ';
            appointmentsParams.push(doctor_id);
        }
        appointmentsQuery += ' ORDER BY a.appointment_time ASC';
        
        const [todayAppointmentsList] = await db.execute(appointmentsQuery, appointmentsParams);
        
        let chartQuery = `
            SELECT 
                DATE(appointment_date) as date,
                DAYNAME(appointment_date) as day_name,
                COUNT(*) as patients
            FROM appointments
            WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        `;
        let chartParams = [];
        if (doctor_id) {
            chartQuery += ' AND doctor_id = ? ';
            chartParams.push(doctor_id);
        }
        chartQuery += `
            GROUP BY DATE(appointment_date), DAYNAME(appointment_date)
            ORDER BY DATE(appointment_date) ASC
        `;

        const [chartDataRows] = await db.execute(chartQuery, chartParams);

        // Translate days to Arabic
        const dayTranslation = {
            'Saturday': 'السبت',
            'Sunday': 'الأحد',
            'Monday': 'الإثنين',
            'Tuesday': 'الثلاثاء',
            'Wednesday': 'الأربعاء',
            'Thursday': 'الخميس',
            'Friday': 'الجمعة'
        };

        const chartData = chartDataRows.map(row => ({
            name: dayTranslation[row.day_name] || row.day_name,
            patients: row.patients
        }));
        
        res.json({
            stats: {
                totalPatients,
                totalDoctors,
                todayAppointments,
                totalRevenue
            },
            recentPatients,
            todayAppointmentsList,
            chartData
        });
    } catch (err) {
        next(err);
    }
};
