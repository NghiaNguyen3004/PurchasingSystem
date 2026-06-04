import {createRequest, getRequestsByUserId, approveRequest, rejectRequest, checkExistingRequest, editRequest} from '../models/requestModel.js'


//Controller function for requester
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

export const editRequestController = async (req, res) => {
    const { id } = req.params
    const { item_name, quantity, price_per_unit, budget_code, department, reason } = req.body
    try {
        const existingRequest = await checkExistingRequest(id)
        if (!existingRequest) {
            return res.status(404).json({ message: 'Request not found' })
        }

        if (existingRequest.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending requests can be edited' })
        }

        if (existingRequest.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized to edit this request' })
        }
        
        const updatedRequest = await editRequest(id, { item_name, quantity, price_per_unit, budget_code, department, reason })
        res.status(200).json(updatedRequest)
    } catch (error) {
        console.error('Error editing request:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

//Controller functions for approver

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

export const getPendingRequestsController = async (req, res) => {
    try {
        const pendingRequests = await getPendingRequests()
        res.status(200).json(pendingRequests)
    }
    catch (error) {
        console.error('Error fetching pending requests:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}