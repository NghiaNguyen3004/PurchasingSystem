import db from '../models/db/index.js'
import {users, roles} from '../models/db/schema.js'
import {eq} from 'drizzle-orm'

export const getAllRoles = async() =>{
    return await db.select().from(roles)
}


export const getAllUsers = async () => {
  return await db.select({
    id:         users.id,
    username:   users.username,
    department: users.department,
    role_id:    users.role_id,
    roleName:   roles.name,
    created_at: users.created_at,
  })
  .from(users)
  .innerJoin(roles, eq(users.role_id, roles.id))
}

export const updateUserRole = async (id, role_id) => {
    
    try {
        const [role] = await db.select().from(roles).where(eq(roles.id, Number(role_id)))
        if (!role) throw new Error('Invalid role')

        const updated = await db.update(users)
        .set({ role_id: Number(role_id) })
        .where(eq(users.id, Number(id)))
        .returning({ id: users.id, username: users.username, role_id: users.role_id })
        return updated
    } catch (error) {
        console.error(`Error updating user role for id ${id}:`, error);
        throw error;
    }
}

export const deleteUserById = async (id) => {
    try {
        const deleted = await db.delete(users).where(eq(users.id, Number(id))).returning();
        return deleted;
    } catch (error) {
        console.error(`Error deleting user with id ${id}:`, error);
        throw error;
    }
}