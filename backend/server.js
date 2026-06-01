import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
))
app.use(express.json())

app.use('/health', (req,res) =>{
    res.json({message: 'Server is healthy'})
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})