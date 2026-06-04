import db from '../models/db/index.js'
import {users} from '../models/db/schema.js'
import {eq} from 'drizzle-orm'

export const getUserByUsername = async (username) => {
    try {
        const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
        return user;
    }
    catch (error) {
        console.error('Error fetching user by username:', error)
        throw error
    }
}
export const createUser = async (userData) => {
    try {
        const [newUser] = await db.insert(users).values(userData).returning()
        return newUser
    }
    catch (error) {
        console.error('Error creating user:', error)
        throw error
    }
}