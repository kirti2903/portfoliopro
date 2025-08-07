@echo off
echo Resetting database with new asset data...
echo.

cd backend
node -e "
const { pool } = require('./config/database');
async function resetDB() {
  try {
    await pool.execute('DROP TABLE IF EXISTS predefined_assets');
    await pool.execute('DROP TABLE IF EXISTS assets');
    await pool.execute('DROP TABLE IF EXISTS transactions');
    await pool.execute('DROP TABLE IF EXISTS goals');
    console.log('Tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
resetDB();
"

echo Database reset complete. Restart the server to recreate tables with new data.
pause