import express from 'express'
import {
    createRequestController,
    getAllRequestsController,
    getMyRequestsController,
    getPendingRequestsController,
    getApprovedRequestsController
} from '../controllers/requestController.js'
import { authenticateToken } from '../middleware/authMiddle.js'
const requestRouter = express.Router()

//Requester
requestRouter.post('/', authenticateToken, createRequestController)
requestRouter.get('/my-requests', authenticateToken, getAllRequestsController)

//Approver
requestRouter.get('/pending', authenticateToken, getPendingRequestsController)
requestRouter.get('/approved', authenticateToken, getApprovedRequestsController)

export default requestRouter