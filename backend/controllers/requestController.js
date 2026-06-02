import {createRequest, getRequestsByUserId, approveRequest, rejectRequest} from '../models/requestModel.js'

export const submitRequest = async (req, res) => {
    const {item_name, quantity, price_per_unit, budget_code, reason} = req.body
    const userId = req.user.userId
    const requested_by = req.user.username
    try {
        await createRequest({ user_id: userId, item_name, quantity, price_per_unit, budget_code, reason, requested_by })
        res.status(201).json({ message: 'Request submitted successfully' })
    } catch (error) {
        console.log('Request submission error:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const getUserRequests = async (req, res) => {
    const userId = req.user.userId
    try {
        const userRequests = await getRequestsByUserId(userId)
        res.status(200).json(userRequests)
    } catch (error) {
        console.error('Error fetching user requests:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const approveRequestController = async (req, res) => {
    const { requestId } = req.params
    try {
        const updatedRequest = await approveRequest(requestId)
        res.status(200).json(updatedRequest)
    } catch (error) {
        console.error('Error approving request:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const rejectRequestController = async (req, res) => {
    const { requestId } = req.params
    try {
        const updatedRequest = await rejectRequest(requestId)
        res.status(200).json(updatedRequest)
    } catch (error) {
        console.error('Error rejecting request:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}