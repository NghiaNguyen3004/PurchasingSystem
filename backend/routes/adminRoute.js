import express from 'express'
import {authenticateToken, checkRole} from '../middleware/authMiddle.js'
import {register} from '../controllers/register.js'
const adminControllers = await import('../controllers/adminController.js')

const adminRouter = express.Router()

adminRouter.use(authenticateToken, checkRole("Admin"))

adminRouter.get('/users', adminControllers.getAllUsersController)
adminRouter.post('/register', register)
adminRouter.patch('/users/:id/role', adminControllers.updateUserRoleController)
adminRouter.delete('/users/:id', adminControllers.deleteUserController)


export default adminRouter