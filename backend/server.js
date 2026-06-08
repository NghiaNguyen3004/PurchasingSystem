import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import adminRouter from './routes/adminRoute.js'
import masterDataRouter from './routes/masterDataRoute.js'
import requestRouter from './routes/requestRoute.js'
import procureRouter from './routes/procureManageRoute.js'

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
))
app.use(express.json())
app.use('/auth', authRouter)
app.use('/request', requestRouter)
app.use('/admin', adminRouter)
app.use('/master', masterDataRouter)
app.use('/procure', procureRouter)
app.use('/health', (req,res) =>{
    res.json({message: 'Server is healthy'})
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})