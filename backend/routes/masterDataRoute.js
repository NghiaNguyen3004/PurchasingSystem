import express from 'express'
import { 
    getAllRequestTypesController,
    getAllSuppliersController, 
    getItemsBySupplierController 
} from '../controllers/masterDataController.js'
import { authenticateToken } from '../middleware/authMiddle.js'

const masterDataRouter = express.Router()

masterDataRouter.get('/request-types', authenticateToken, getAllRequestTypesController)
masterDataRouter.get('/suppliers/:requestTypeId', authenticateToken, getAllSuppliersController)
masterDataRouter.get('/items/:supplierId', authenticateToken, getItemsBySupplierController)

export default masterDataRouter