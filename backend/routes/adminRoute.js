import express from 'express'
import {authenticateToken, checkRole} from '../middleware/authMiddle.js'
const adminControllers = await import('../controllers/register.js')

const adminRouter = express.Router()

adminRouter.post('/register', authenticateToken, checkRole("Admin"), adminControllers.register)

export default adminRouter