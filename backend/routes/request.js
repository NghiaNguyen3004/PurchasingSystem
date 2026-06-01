import express from 'express'
import {authenticateToken} from '../middleware/authMiddle.js'
import {submitRequest, getUserRequests} from '../controllers/requestController.js'

const requestRouter = express.Router()

requestRouter.post('/', authenticateToken, submitRequest)
requestRouter.get('/mine', authenticateToken, getUserRequests)
export default requestRouter