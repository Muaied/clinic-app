const db = require('../config/db');

exports.getInvoices = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const date = req.query.date || '';

        let query = `
            SELECT i.*, 
                   p.full_name as patient_name,
                   u.full_name as doctor_name 
            FROM invoices i 
            JOIN patients p ON i.patient_id = p.id
            LEFT JOIN appointments a ON i.appointment_id = a.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN users u ON d.user_id = u.id
            WHERE (p.full_name LIKE ? OR u.full_name LIKE ? OR i.invoice_number LIKE ?)
        `;
        let params = [`%${search}%`, `%${search}%`, `%${search}%`];

        if (date) {
            query += ' AND DATE(i.issued_at) = ? ';
            params.push(date);
        }

        query += ' ORDER BY i.issued_at DESC';

        const [invoices] = await db.execute(query, params);
        res.json(invoices);
    } catch (err) {
        next(err);
    }
};

exports.createInvoice = async (req, res, next) => {
    try {
        const { patient_id, appointment_id, amount, status, payment_method } = req.body;
        const invoice_number = 'INV-' + Date.now();
        await db.execute(
            'INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, status, payment_method, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                patient_id, 
                appointment_id || null, 
                invoice_number, 
                amount,
                status || 'Pending',
                payment_method || null,
                status === 'Paid' ? new Date() : null
            ]
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

exports.updateInvoice = async (req, res, next) => {
    try {
        const { amount, status, payment_method } = req.body;
        
        let query = 'UPDATE invoices SET amount = ?, status = ?, payment_method = ?';
        let params = [amount, status, payment_method];

        if (status === 'Paid') {
            query += ', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)';
        } else {
            query += ', paid_at = NULL';
        }
        
        query += ' WHERE id = ?';
        params.push(req.params.id);

        await db.execute(query, params);
        res.json({ message: 'Invoice updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteInvoice = async (req, res, next) => {
    try {
        await db.execute('DELETE FROM invoices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        next(err);
    }
};
