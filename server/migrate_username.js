const db = require('./config/db');

async function migrate() {
    try {
        console.log('Migrating email to username...');
        await db.execute('ALTER TABLE users CHANGE email username VARCHAR(255) NOT NULL UNIQUE');
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
