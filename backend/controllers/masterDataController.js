import {
    getAllRequestTypes,
  getSuppliersByType,
  getItemsBySupplier
} from '../models/requestModel.js'

export const getAllRequestTypesController = async (req, res) => {
    try {
        const types = await getAllRequestTypes()
        res.json(types)
    } catch (error) {
        console.error('Error fetching request types:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getAllSuppliersController = async (req, res) => {
    const { requestTypeId } = req.params
    try {
        const suppliers = await getSuppliersByType(requestTypeId)
        res.json(suppliers)
    }
    catch (error) {
        console.error('Error fetching suppliers:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getItemsBySupplierController = async (req, res) => {
    const { supplierId } = req.params
    try {
        const items = await getItemsBySupplier(supplierId)
        res.json(items)
    }
    catch (error) {
        console.error('Error fetching items:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}