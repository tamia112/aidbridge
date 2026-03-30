const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get the header
  const authHeader = req.header('Authorization');
  
  // 2. Defensive check for the header string itself
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // 3. Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // 4. CRITICAL: Ensure this secret matches your login/register secret EXACTLY
    const secret = process.env.JWT_SECRET || 'aidbridge_super_secret_2024_tamia';
    
    const decoded = jwt.verify(token, secret);
    
    // 5. Attach user data to the request object
    // This allows req.user.id to be used in your M-Pesa and Campaign routes
    req.user = decoded; 
    
    next(); 
  } catch (err) {
    // 6. Provide clearer error feedback for debugging
    const message = err.name === 'TokenExpiredError' ? "Token expired" : "Invalid token";
    res.status(401).json({ error: message });
  }
};

module.exports = authMiddleware;