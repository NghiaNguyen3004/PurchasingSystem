import db from '../models/db/index.js'
import {requests} from '../models/db/schema.js'
import {eq} from 'drizzle-orm'
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

export const approveRequest = async (requestId) => {
    try {
        const updatedRequest = await db.update(requests).set({status: "Approved"}).where(eq(requests.id, requestId)).returning()
        return updatedRequest
    } catch (error) {
        console.error('Error approving request:', error)
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