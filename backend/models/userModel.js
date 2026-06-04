import db from '../models/db/index.js'
import {users, roles} from '../models/db/schema.js'
import {eq} from 'drizzle-orm'

export const getUserByUsername = async (username) => {
  try{
        const [user] = await db
            .select({
                id:         users.id,
                username:   users.username,
                password:   users.password,
                department: users.department,
                role_id:    users.role_id,
                roleName:   roles.name,
            })
            .from(users)
            .innerJoin(roles, eq(users.role_id, roles.id))
            .where(eq(users.username, username))

    return user
  } catch(error){
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