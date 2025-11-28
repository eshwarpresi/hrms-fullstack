const jwt = require('jsonwebtoken');
const { User, Organisation } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Organisation,
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    req.user = user;
    req.organisation = user.Organisation;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

const loggingMiddleware = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      // Only log successful operations that modify data
      if (req.user && req.organisation && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const action = `${req.method} ${req.route?.path || req.originalUrl}`;
        const details = JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: Date.now() - start,
          body: req.body,
          params: req.params,
          query: req.query
        });

        await req.organisation.createLog({
          action,
          details,
          user_id: req.user.id,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        });
      }
    } catch (error) {
      console.error('Logging error:', error);
    }
  });

  next();
};

module.exports = { authMiddleware, loggingMiddleware };