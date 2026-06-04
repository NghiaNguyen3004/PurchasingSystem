import  db  from '../db/index.js'
import { 
    request_types, suppliers, supplier_items,
    purchase_requests, request_items, users
 } from '../schema.js'
import { eq, inArray } from 'drizzle-orm'

//Model functions for requester actions
export const getAllRequestTypes = async () => {
    try{
        const types = await db.select().from(request_types)
        return types
    } catch (error) {
        console.error('Error fetching request types:', error)
        throw error
    }
}

export const getSuppliersByRequestType = async (requestTypeId) => {
    try {
        const suppliersList = await db.select().from(suppliers).where(eq(suppliers.request_type_id, requestTypeId))
        return suppliersList
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        throw error
    }
}

export const getItemsBySupplier = async (supplierId) => {

    try {
        const itemsList = await db.select().from(supplier_items).where(eq(supplier_items.supplier_id, supplierId))
        return itemsList
    } catch (error) {
        console.error('Error fetching items:', error)
        throw error
    }
}


