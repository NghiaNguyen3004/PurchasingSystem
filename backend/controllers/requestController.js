import {
    createPurchaseRequest,
    getRequestsWithItems,
    updatedRequestStatus
} from '../models/requestModel.js'

export const createRequestController = async (req, res) => {
    const { requestTypeId, supplierId, items } = req.body
    const userId = req.user.userId
    try {
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
        