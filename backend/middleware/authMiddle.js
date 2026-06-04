import jwt from 'jsonwebtoken'
import 'dotenv/config'
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

export const checkRole = (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.roleName)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    } 
    next();
}