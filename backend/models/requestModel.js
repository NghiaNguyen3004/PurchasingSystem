import  db  from '../db/index.js'
import { request_types, suppliers, supplier_items } from '../schema.js'
import { eq } from 'drizzle-orm'

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

export const getRequestsByUserId = async (userId) => {
    try {
        const userRequests = await db.select().from(requests).where(eq(requests.user_id, userId))
        return userRequests
    } catch (error) {
        console.error('Error fetching requests:', error)
        throw error
    }
}

export const editRequest = async (requestId, updatedData) => {
    try {
        const [updatedRequest] = await db.update(requests).set(updatedData).where(eq(requests.id, requestId)).returning()
        return updatedRequest
    } catch (error) {
        console.error('Error editing request:', error)
        throw error
    }
}


//Model functions for approver actions
export const approveRequest = async (requestId) => {
    try {
        const updatedRequest = await db.update(requests).set({status: "Approved"}).where(eq(requests.id, requestId)).returning()
        return updatedRequest
    } catch (error) {
        console.error('Error approving request:', error)
        throw error
    }
}

export const getPendingRequests = async()=>{
    try {
        const pendingRequests = await db.select().from(requests).where(eq(requests.status, "Pending"))
        return pendingRequests
    } catch (error) {
        console.error('Error fetching pending requests:', error)
        throw error
    }
}

export const rejectRequest = async (requestId) => {
    try {
        const updatedRequest = await db.update(requests).set({status: "Rejected"}).where(eq(requests.id, requestId)).returning()
        return updatedRequest
    } catch (error) {
        console.error('Error rejecting request:', error)
        throw error
    }
}