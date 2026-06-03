import express from 'express'
const loginControllers = await import('../controllers/login.js')
const  registerControllers = await import('../controllers/register.js')

const authRouter = express.Router()

authRouter.post('/login', loginControllers.login)
authRouter.post('/register', registerControllers.register)

export default authRouter