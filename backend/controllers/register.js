import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {createUser, getUserByUsername} from '../models/userModel.js'
import 'dotenv/config'
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12

export const register = async (req, res) => {
    const { username, password, user_type, department } = req.body
    try {
        //Check the fields
        if (!username || !password || !user_type || !department) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const validUserTypes = ['Requester', 'Approver', 'Admin']
        if (!validUserTypes.includes(user_type)) {
            return res.status(400).json({ message: 'Invalid user type' })
        }

        // Check whether the user is already exists
        const existing = await getUserByUsername(username)
        if (existing) {
            return res.status(409).json({ message: 'Username already taken' })
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const newUser = await createUser({ username, user_type, password: hashedPassword, department })
        const token = jwt.sign({userId: newUser.id, username: newUser.username, userType: newUser.user_type, department: newUser.department}, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.status(201).json({ message: 'User created successfully', token })
    } catch (error) {
        console.log('Registration error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}