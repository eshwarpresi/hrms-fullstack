const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://hrms-fullstack.vercel.app',
    'https://hrms-fullstack-git-master-eshwarpresis-projects.vercel.app',
    'https://hrms-fullstack-*.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HRMS API is running', 
    timestamp: new Date().toISOString() 
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await testConnection();
    res.json({ 
      success: true, 
      message: 'Database connection successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working!',
    data: {
      server: 'HRMS Backend',
      status: 'Running',
      database: 'SQLite Connected'
    }
  });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { organisationName, adminName, email, password } = req.body;
    
    console.log('Registration attempt:', { organisationName, adminName, email });
    
    // Simple validation
    if (!organisationName || !adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    // For now, just return success without database operations
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        token: 'test_jwt_token',
        user: {
          id: 1,
          name: adminName,
          email: email
        },
        organisation: {
          id: 1,
          name: organisationName
        }
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // For now, accept any login
    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        token: 'test_jwt_token',
        user: {
          id: 1,
          name: 'Test User',
          email: email
        },
        organisation: {
          id: 1,
          name: 'Test Organisation'
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
});

// Employees endpoints
app.get('/api/employees', async (req, res) => {
  try {
    // Return sample employee data
    const sampleEmployees = [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        position: 'Software Developer',
        teams: [],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
        position: 'Project Manager',
        teams: [],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: sampleEmployees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees'
    });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, position } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }
    
    // For now, return success with sample data
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        id: Date.now(), // Temporary ID
        first_name,
        last_name,
        email,
        phone: phone || '',
        position: position || '',
        teams: [],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employee'
    });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, position } = req.body;
    
    // For now, return success
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        id: parseInt(req.params.id),
        first_name,
        last_name,
        email,
        phone: phone || '',
        position: position || '',
        teams: [],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee'
    });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    // For now, return success
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee'
    });
  }
});

// Teams endpoints
app.get('/api/teams', async (req, res) => {
  try {
    // Return sample team data
    const sampleTeams = [
      {
        id: 1,
        name: 'Development Team',
        description: 'Software development team',
        employees: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          }
        ],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Management Team',
        description: 'Project management team',
        employees: [
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
          }
        ],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: sampleTeams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams'
    });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { name, description, employee_ids } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: {
        id: Date.now(),
        name,
        description: description || '',
        employees: [],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating team'
    });
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const { name, description, employee_ids } = req.body;
    
    res.json({
      success: true,
      message: 'Team updated successfully',
      data: {
        id: parseInt(req.params.id),
        name,
        description: description || '',
        employees: [],
        organisation_id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team'
    });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting team'
    });
  }
});

// Logs endpoint
app.get('/api/logs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Sample log data
    const sampleLogs = [
      {
        id: 1,
        action: 'user_login',
        details: 'User logged in successfully',
        User: {
          name: 'Test User',
          email: 'test@example.com'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        action: 'organisation_created',
        details: 'New organisation registered',
        User: {
          name: 'Test User',
          email: 'test@example.com'
        },
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: {
        logs: sampleLogs,
        total: sampleLogs.length,
        page: parseInt(page),
        totalPages: 1
      }
    });
    
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await testConnection();
    
    // Sync database (in development)
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: https://hrms-fullstack-gd0z.onrender.com/api/health`);
      console.log('\n📋 Available API Routes:');
      console.log('POST /api/auth/register - Register organisation');
      console.log('POST /api/auth/login - User login');
      console.log('GET  /api/employees - Get employees');
      console.log('POST /api/employees - Create employee');
      console.log('GET  /api/teams - Get teams');
      console.log('POST /api/teams - Create team');
      console.log('GET  /api/logs - Get audit logs');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;