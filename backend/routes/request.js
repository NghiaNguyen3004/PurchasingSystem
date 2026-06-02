import express from 'express'
import {authenticateToken, checkRole} from '../middleware/authMiddle.js'
import {submitRequest, getUserRequests, approveRequestController, rejectRequestController} from '../controllers/requestController.js'

const requestRouter = express.Router()

requestRouter.post('/', authenticateToken, submitRequest)
requestRouter.get('/mine', authenticateToken, getUserRequests)
requestRouter.patch('/:requestId/approve', authenticateToken, checkRole, approveRequestController)
requestRouter.patch('/:requestId/reject', authenticateToken, checkRole, rejectRequestController)
export default requestRouter