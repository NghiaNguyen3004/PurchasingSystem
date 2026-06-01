import express from 'express'
import {authenticateToken} from '../middleware/authMiddle.js'
import {submitRequest} from '../controllers/requestController.js'

const requestRouter = express.Router()

requestRouter.post('/', authenticateToken, submitRequest)

export default requestRouter