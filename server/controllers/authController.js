const db = require('../config/db');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE username = ? AND status = "Active"', [username]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        
        res.json({
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (err) {
        next(err);
    }
};

exports.registerInitialAdmin = async (req, res, next) => {
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE role = "Admin"');
        if (users.length > 0) return res.status(400).json({ message: 'Admin already exists' });
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.execute('INSERT INTO users (full_name, username, password, role) VALUES (?, ?, ?, ?)', 
            ['System Admin', 'admin', hashedPassword, 'Admin']);
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (err) {
        next(err);
    }
};
