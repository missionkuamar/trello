import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Verify Token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Token expired' 
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Authentication failed' 
    });
  }
};

// ✅ Check User Role (Single role)
export const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden - ${role} access required` 
      });
    }

    next();
  };
};

// ✅ Check Multiple Roles
export const checkRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden - Requires one of: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// // ✅ Admin Only
export const isAdmin = (req, res, next) => {
   // console.log('isAdmin', req.user)
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden - Admin access required' 
    });
  }
  next();
};

// ✅ Moderator or Admin
export const isModerator = (req, res, next) => {
 //   console.log("request ",req.user)
  if (!req.user || (req.user.role !== 'moderator' && req.user.role !== 'admin')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden - Moderator access required' 
    });
  }
  next();
};

// ✅ Check if user owns the resource
export const isOwner = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        });
      }

      // Check if user is owner or admin
      if (resource.user?.toString() === req.user.id || 
          resource.createdBy?.toString() === req.user.id ||
          req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden - You do not own this resource' 
      });
    } catch (error) {
      console.error('❌ Owner check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };
};

// ✅ Optional: Check if user is active
export const isActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account deactivated. Please contact support.' 
      });
    }

    next();
  } catch (error) {
    console.error('❌ Active check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// ✅ Combined auth middleware
export const auth = [verifyToken, isActive];

// ✅ Admin auth middleware
export const adminAuth = [verifyToken, isActive, isAdmin];

// ✅ Moderator auth middleware
export const moderatorAuth = [verifyToken, isActive, isModerator];