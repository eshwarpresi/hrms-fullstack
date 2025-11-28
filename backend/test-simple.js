const { Sequelize } = require('sequelize');
const path = require('path');

// Simple test with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'hrms.db'),
  logging: true,
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log('🎉 SUCCESS! Database is working!');
    console.log('📁 Database file created: hrms.db');
    
    // Create a simple table to test
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Test table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();