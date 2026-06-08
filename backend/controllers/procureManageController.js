import * as procureManager from '../models/procureManageModel.js'

export const addSupplierController = async(req, res) => {
    const {name, request_type_id} = req.body
    if (!name || !request_type_id){
        return res.status(400).json("Name and request_type are required!")
    }

    try{
        const supplier = await procureManager.createSupplier(name, request_type_id)
        res.status(201).json(supplier)
    } catch (err) {
        // unique constraint violation
        if (err.cause?.code === '23505') {
            return res.status(409).json({ message: 'Supplier already exists for this type' })
        }
        console.error('addSupplier error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const editSupplierController = async(req, res) =>{
    const {id} = req.params
    const{name, request_type_id} = req.body
    
    try{
        const supplier = await procureManager.updateSupplier(id, {name, request_type_id})
        if (!supplier) return res.status(404).json("Supplier not found")
        res.json(supplier)

    } catch(error){
        console.error('editSupplier error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const deleteSupplierController = async (req, res) =>{
    const {id} = req.params
    try{
        const supplier = await procureManager.deleteSupplier(id)
        if (!supplier) return res.status(404).json("Supplier not found")
        res.json({message: `Supplier "${supplier.name}" deleted`})
    } catch(error){
        // restrict violation — supplier has active requests
        if (err.cause?.code === '23503') {
            return res.status(409).json({ message: 'Cannot delete supplier with existing requests' })
        }
        console.error('removeSupplier error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

//Supplier Items
export const addSupplierItemController = async(req, res) => {
    const {id} = req.params
    const {item_code, name, unit, price_per_unit} = req.body
    if (!name || !item_code || !unit) {
        return res.status(400).json({message:"Fields are required"})
    }

    try{
        const item = await procureManager.createSupplierItem(id, 
            {item_code, name, unit, price_per_unit: price_per_unit ?? null})
        res.status(201).json(item)
    } catch(error){
        if (error.cause?.code === '23505') {
            return res.status(409).json({ message: 'Item code already exists for this supplier' })
        }
        console.error('addSupplierItem error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const editSupplierItemController = async(req, res) =>{
    const{id} = req.params
    const {item_code, name, unit, price_per_unit} = req.body
    try{
        const item = await procureManager.updateSupplierItem(id,
            {item_code, name, unit, price_per_unit: price_per_unit ?? null})
        if (!item) return res.status(404).json({message: "Item not found"})
        res.json(item)
    } catch (error){
        console.error('editSupplierItem error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const deleteSupplierItemController = async (req, res) =>{
    const {id} = req.params
    try{
        const item = await procureManager.deleteSupplierItem(id)
        if (!item) return res.status(404).json({ message: 'Item not found' })
        res.json({ message: `Item "${item.name}" deleted` })
    } catch (err) {
        if (err.cause?.code === '23503') {
        return res.status(409).json({ message: 'Cannot delete item referenced by existing requests' })
        }
        console.error('removeSupplierItem error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

//Price list
export const importPriceList = async(req, res) => {
    const {id: supplierId} = req.params
    const {prices} = req.body

    // prices = [{supplier_item_id, unit_price},...]
    if (!prices || prices.length === 0){
        return res.status(400).json({message: "Price array is required"})
    }
    try {
        const updated = await procureManager.updateItemPrice(supplierId, prices)
        res.json({ message: `${updated.length} prices updated`, items: updated })
    } catch(error){
        console.error('importPriceList error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const priceRequestItemsController = async (req, res) => {
    const { id: requestId } = req.params
    const { prices } = req.body
    // prices = [{ request_item_id, unit_price_snapshot }, ...]
    if (!prices || prices.length === 0) {
        return res.status(400).json({ message: 'prices array is required' })
    }
    try {
        const updated = await procureManager.updateRequestItemPrices(requestId, prices)
        res.json({ message: `${updated.length} item prices set`, items: updated })
    } catch (error) {
        console.error('priceRequestItems error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}