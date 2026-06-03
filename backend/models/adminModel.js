import db from '../models/db/index.js'
import {users} from '../models/db/schema.js'
import {eq} from 'drizzle-orm'

export const getAllUsers = async() =>{
    try {
        const allUsers = await db.select({
            id: users.id,
            username: users.username,
            user_type: users.user_type,
            department: users.department,
            created_at: users.created_at
        }).from(users)
        return allUsers;
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
}

export const updateUserRole = async (id, newRole) => {
    const validRoles = ['Requester', 'Approver', 'Admin']
    if (!validRoles.includes(newRole)) {
        throw new Error('Invalid user role')
    }
    try {
        const updated = await db.update(users).set({ user_type: newRole }).where(eq(users.id, id)).returning();
        return updated;
    } catch (error) {
        console.error(`Error updating user role for id ${id}:`, error);
        throw error;
    }
}

export const deleteUserById = async (id) => {
    try {
        const deleted = await db.delete(users).where(eq(users.id, id)).returning();
        return deleted;
    } catch (error) {
        console.error(`Error deleting user with id ${id}:`, error);
        throw error;
    }
}