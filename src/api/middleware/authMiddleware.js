// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'MiClaveSecreta';

exports.authenticateToken = (req, res, next) => {
  const bearerHeader = req.header('Authorization');
  if (!bearerHeader) {
    return res.status(403).json({ message: 'No autorizado: faltan credenciales' });
  }
  try {
    const token = bearerHeader.replace('Bearer ', '');
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
