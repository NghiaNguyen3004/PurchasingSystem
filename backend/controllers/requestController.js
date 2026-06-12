import {
    createPurchaseRequest,
    getAllRequestHeaderById,
    getRequestsWithItems,
    updateRequestStatus
} from '../models/requestModel.js'
import { eq } from 'drizzle-orm'
import { purchase_requests } from '../models/db/schema.js'
import 'dotenv/config'
import {sendWebhook} from '../models/webhook.js'

export const createRequestController = async (req, res) => {
    const { 
        supplier_id, 
        request_type_id, 
        department, 
        budget_code, 
        reason, 
        expected_delivery, 
        items } = req.body
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'At least one item is required' })
    }
    const header = {
        user_id: req.user.userId,
        supplier_id,
        request_type_id,
        department,
        budget_code,
        reason,
        expected_delivery,
        status: 'Pending',
    }
    try{
        const newRequest = await createPurchaseRequest(header, items)
        res.status(201).json(newRequest)
    } catch (error) {
        console.error('Error creating purchase request:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to fetch all requests (header only)
export const getAllRequestsController = async (req, res) => {
    try{
        const {userId} = req.user
        const data = await getAllRequestHeaderById(userId)
        res.status(200).json(data)
    }
    catch (error) {
        console.error('Error fetching requests:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to fetch all requests of logged in user
export const getMyRequestsController = async (req, res) =>{
    try{
        const {userId} = req.user
        const data = await getRequestsWithItems(
            eq(purchase_requests.user_id, userId)
        )
        res.status(200).json(data)

    } catch (error) {
        console.error('Error fetching requests:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to fetch pending requests
export const getPendingRequestsController = async (req, res) => {
    try{
        const data = await getRequestsWithItems(
            eq(purchase_requests.status, 'Pending')
        )
        res.status(200).json(data)
    } catch (error) {
        console.error('Error fetching pending requests:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to approve a request (For approver)
export const approveRequestController = async (req, res) => {
    const { requestId } = req.params
    try{
        const data = await updateRequestStatus(requestId, 'Approved')
        // Fire the webhook
        sendWebhook('request.approved', {
            request_id: data.id,
            approved_by: req.user.username,
            budget_code: data.budget_code
        })
        res.status(200).json(data)

    }
    catch (error) {
        console.error('Error approving request:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to reject a request (For approver)
export const rejectRequestController = async (req, res) => {
    const { requestId } = req.params
    try{
        const data = await updateRequestStatus(requestId, 'Rejected')
        // Fire the webhook
        res.status(200).json(data)
    }
    catch (error) {
        console.error('Error rejecting request:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to get approved requests (For Procure Manager)
export const getApprovedRequestsController = async (req, res) => {
    try{
        const data = await getRequestsWithItems(
            eq(purchase_requests.status, 'Approved')
        )
        res.status(200).json(data)
    } catch (error) {
        console.error('Error fetching approved requests:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

//Controller to process a request
export const processRequestController = async (req, res) => {
    const { requestId } = req.params
    const {status} = req.body
    try{
        const data = await updateRequestStatus(requestId, 'Processing')
        res.status(200).json(data)
    }
    catch (error) {
        console.error('Error processing request:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const completeRequestController = async (req, res) => {
    const { requestId } = req.params
    
    try{
        const data = await updateRequestStatus(requestId, 'Completed')
        res.status(200).json(data)
    }
    catch (error) {
        console.error('Error completing request:', error)
        res.status(500).json({ error: 'Internal server error' })
}
}



        