import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {getUserByUsername} from '../models/userModel.js'
import 'dotenv/config'

export const login = async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await getUserByUsername(username)
        if (!user) {
            return res.status(401).json({ message: 'Username not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong password' })
        }
        const token = jwt.sign({ userId: user.id, username: user.username, userType: user.user_type, department: user.department }, process.env.JWT_SECRET, { expiresIn: '2h' })
        res.json({ token }) 
    } catch (error) {
        console.log('Login error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
};