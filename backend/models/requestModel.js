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


