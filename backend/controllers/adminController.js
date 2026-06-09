import {getAllUsers, deleteUserById, updateUserRole, getAllRoles} from '../models/adminModel.js'

export const getAllUsersController = async (req, res) => {
    try {
        const users = await getAllUsers()
        res.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const updateUserRoleController = async (req, res) => {
    const { id } = req.params
    const { role_id } = req.body
    if (Number(id) === req.user.userId) {
        return res.status(400).json({ message: "You can't change your own role" })
    }
    try {
        const [updated] = await updateUserRole(id, role_id)
        if (!updated) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json({ message: 'User role updated successfully', user: updated })
    } catch (error) {
        console.error(`Error updating user role for id ${id}:`, error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const deleteUserController = async (req, res) => {
    const { id } = req.params
    try {
        const deleted = await deleteUserById(id)
        if (deleted.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error(`Error deleting user with id ${id}:`, error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getAllRolesController = async (req, res) => {
    try {
        const roles = await getAllRoles()
        res.json(roles)
    } catch (error) {
        console.error('Error fetching roles:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}