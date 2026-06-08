import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {createUser, getUserByUsername} from '../models/userModel.js'
import 'dotenv/config'
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12

export const register = async (req, res) => {
    const { username, password, role_id, department } = req.body
    try {
        //Check the fields
        if (!username || !password || !role_id || !department) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        // Check whether the user is already exists
        const existing = await getUserByUsername(username)
        if (existing) {
            return res.status(409).json({ message: 'Username already taken' })
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const newUser = await createUser({ username, role_id: Number(role_id), password: hashedPassword, department })
        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username, role_id: newUser.role_id } })
    } catch (error) {
        console.log('Registration error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}