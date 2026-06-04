import express from 'express'
import {
    createRequestController,
    getAllRequestsController,
    getMyRequestsController,
    getPendingRequestsController,
    getApprovedRequestsController
} from '../controllers/requestController.js'
import { authenticateToken, checkRole } from '../middleware/authMiddle.js'
const requestRouter = express.Router()

//Requester
requestRouter.post('/', authenticateToken, checkRole('Requester'), createRequestController)
requestRouter.get('/my-requests', authenticateToken, checkRole('Requester'), getAllRequestsController)

//Approver
requestRouter.get('/pending', authenticateToken, checkRole('Approver'), getPendingRequestsController)
requestRouter.get('/approved', authenticateToken, checkRole('Approver'), getApprovedRequestsController)

export default requestRouter