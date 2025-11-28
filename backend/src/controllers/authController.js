const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Organisation, User, Log } = require('../models');

const generateToken = (userId, organisationId) => {
  return jwt.sign(
    { userId, organisationId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

exports.registerOrganisation = async (req, res) => {
  try {
    const { organisationName, adminName, email, password } = req.body;

    // Validate input
    if (!organisationName || !adminName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create organisation and user
    const organisation = await Organisation.create({ name: organisationName });
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      name: adminName,
      email,
      password_hash: hashedPassword,
      organisation_id: organisation.id
    });

    // Log the action
    await Log.create({
      action: 'organisation_created',
      details: JSON.stringify({ organisationId: organisation.id, adminEmail: email }),
      organisation_id: organisation.id,
      user_id: user.id
    });

    const token = generateToken(user.id, organisation.id);

    res.status(201).json({
      success: true,
      message: 'Organisation created successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        organisation: {
          id: organisation.id,
          name: organisation.name
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      where: { email },
      include: [Organisation]
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Log login action
    await Log.create({
      action: 'user_login',
      details: JSON.stringify({ loginTime: new Date().toISOString() }),
      organisation_id: user.organisation_id,
      user_id: user.id
    });

    const token = generateToken(user.id, user.organisation_id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        organisation: {
          id: user.Organisation.id,
          name: user.Organisation.name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        organisation: {
          id: req.organisation.id,
          name: req.organisation.name
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};