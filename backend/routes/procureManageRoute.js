import express from 'express'
import { authenticateToken, checkRole } from '../middleware/authMiddle.js'
import * as procureController from '../controllers/procureManageController.js'

const procureRouter = express.Router()

procureRouter.use(authenticateToken, checkRole('Procure Manager'))

//Suppliers
procureRouter.post('/suppliers', procureController.addSupplierController)
procureRouter.patch('/suppliers/:id', procureController.editSupplierController)
procureRouter.delete('/suppliers/:id', procureController.deleteSupplierController)

//Supplier Items
procureRouter.post('/suppliers/:id/items', procureController.addSupplierItemController)
procureRouter.patch('/supplier-items/:id', procureController.editSupplierItemController)
procureRouter.delete('/supplier-items/:id', procureController.deleteSupplierItemController)

//Pricing
procureRouter.patch('/suppliers/:id/prices', procureController.importPriceList)
procureRouter.patch('/requests/:id/price-items', procureController.priceRequestItemsController)

export default procureRouter