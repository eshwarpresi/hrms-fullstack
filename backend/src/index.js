const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 10000;

// CORS configuration for PRODUCTION
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://hrms-fullstack.vercel.app',
    'https://hrms-fullstack-ten.vercel.app',
    'https://hrms-fullstack-*.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Use corsOptions
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, req.body || '');
  next();
});

// Rest of your code remains the same...
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API WORKING', timestamp: new Date().toISOString() });
});

// SIMPLE IN-MEMORY STORAGE - NO SAMPLE DATA
let employees = [];
let teams = [];
let nextId = 1;

// AUTH - ALWAYS WORKS
app.post('/api/auth/register', (req, res) => {
  const { organisationName, adminName, email, password } = req.body;
  console.log('REGISTER:', { organisationName, adminName, email });
  
  res.json({
    success: true,
    message: 'Registered!',
    data: {
      token: 'token_' + Date.now(),
      user: { id: 1, name: adminName, email },
      organisation: { id: 1, name: organisationName }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('LOGIN:', { email });
  
  res.json({
    success: true,
    message: 'Logged in!',
    data: {
      token: 'token_' + Date.now(),
      user: { id: 1, name: 'User', email },
      organisation: { id: 1, name: 'Org' }
    }
  });
});

// EMPLOYEES - REAL WORKING CRUD
app.get('/api/employees', (req, res) => {
  console.log('GET employees:', employees.length);
  res.json({ success: true, data: employees });
});

app.post('/api/employees', (req, res) => {
  const { first_name, last_name, email, phone, position } = req.body;
  console.log('CREATE employee:', { first_name, last_name, email });
  
  const newEmployee = {
    id: nextId++,
    first_name,
    last_name,
    email,
    phone: phone || '',
    position: position || '',
    teams: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  employees.push(newEmployee);
  console.log('Employee ADDED. Total:', employees.length);
  
  res.json({ success: true, message: 'Employee added!', data: newEmployee });
});

app.put('/api/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  console.log('UPDATE employee:', id, updates);
  
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  employees[index] = { ...employees[index], ...updates, updatedAt: new Date() };
  console.log('Employee UPDATED');
  
  res.json({ success: true, message: 'Employee updated!', data: employees[index] });
});

app.delete('/api/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log('DELETE employee:', id);
  
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  
  const deleted = employees.splice(index, 1)[0];
  console.log('Employee DELETED. Remaining:', employees.length);
  
  res.json({ success: true, message: 'Employee deleted!', data: deleted });
});

// TEAMS - REAL WORKING CRUD
app.get('/api/teams', (req, res) => {
  console.log('GET teams:', teams.length);
  res.json({ success: true, data: teams });
});

app.post('/api/teams', (req, res) => {
  const { name, description } = req.body;
  console.log('CREATE team:', { name, description });
  
  const newTeam = {
    id: nextId++,
    name,
    description: description || '',
    employees: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  teams.push(newTeam);
  console.log('Team ADDED. Total:', teams.length);
  
  res.json({ success: true, message: 'Team added!', data: newTeam });
});

// ADDED TEAM DELETE ENDPOINT
app.delete('/api/teams/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log('DELETE team:', id);
  
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }
  
  const deleted = teams.splice(index, 1)[0];
  console.log('Team DELETED. Remaining:', teams.length);
  
  res.json({ success: true, message: 'Team deleted!', data: deleted });
});

// LOGS
app.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    data: {
      logs: [{ id: 1, action: 'system_start', details: 'System started', createdAt: new Date() }],
      total: 1,
      page: 1,
      totalPages: 1
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 BACKEND RUNNING on port', PORT);
  console.log('✅ ALL APIS WORKING - NO SAMPLE DATA');
  console.log('📝 Employees start EMPTY');
  console.log('🔗 https://hrms-fullstack-1-lar5.onrender.com/api/health');
});