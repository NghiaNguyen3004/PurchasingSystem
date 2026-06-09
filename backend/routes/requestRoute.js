import express from 'express'
import {
    createRequestController,
    getMyRequestsController,
    getPendingRequestsController,
    getApprovedRequestsController,
    approveRequestController,
    rejectRequestController
} from '../controllers/requestController.js'
import { authenticateToken, checkRole } from '../middleware/authMiddle.js'
const requestRouter = express.Router()

//Requester
requestRouter.post('/', authenticateToken, checkRole('Requester'), createRequestController)
requestRouter.get('/my-requests', authenticateToken, checkRole('Requester'), getMyRequestsController)

//Approver
requestRouter.get('/pending', authenticateToken, checkRole('Approver'), getPendingRequestsController)
requestRouter.patch('/:requestId/approve', authenticateToken, checkRole('Approver'), approveRequestController)
requestRouter.patch('/:requestId/reject', authenticateToken, checkRole('Approver'), rejectRequestController)

//Procure Manager
requestRouter.get('/approved', authenticateToken, checkRole('Procure Manager'), getApprovedRequestsController)


export default requestRouter