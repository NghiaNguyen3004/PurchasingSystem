import db from '../models/db/index.js'
import {requests} from '../models/db/schema.js'
import {eq} from 'drizzle-orm'

//Model functions for requester actions
export const checkExistingRequest = async (requestId) => {
    try {
        const [existingRequest] = await db.select().from(requests).where(eq(requests.id, requestId))
        return existingRequest
    } catch (error) {
        console.error('Error checking existing request:', error)
        throw error
    }
}

export const createRequest = async (requestData) => {
    try {
        const [newRequest] = await db.insert(requests).values(requestData).returning()
        return newRequest
    } catch (error) {
        console.error('Error creating request:', error)
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