const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite - no setup required!
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'hrms.db'),
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database connection established successfully.');
    console.log('📁 Database file: hrms.db');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };