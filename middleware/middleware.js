const jwt = require('jsonwebtoken');
const secretKey = 'je8ndeo2ne2ije2';

module.exports.protectedMidd = (req, res, next) => {
    const token = req.headers.authorization.split(' ').pop();
    if (!token) {
      return res.status(401).json({ message: 'No estas autorizado' });
    }
    try {
      
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalido' });
    }
};