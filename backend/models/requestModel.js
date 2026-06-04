import  db  from '../db/index.js'
import { 
    request_types, suppliers, supplier_items,
    purchase_requests, request_items, users
 } from '../schema.js'
import { eq, inArray } from 'drizzle-orm'

//Model functions for requester actions
export const getAllRequestTypes = async () => {
    try{
        const types = await db.select().from(request_types)
        return types
    } catch (error) {
        console.error('Error fetching request types:', error)
        throw error
    }
}

export const getSuppliersByRequestType = async (requestTypeId) => {
    try {
        const suppliersList = await db.select().from(suppliers).where(eq(suppliers.request_type_id, requestTypeId))
        return suppliersList
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        throw error
    }
}

export const getItemsBySupplier = async (supplierId) => {

    try {
        const itemsList = await db.select().from(supplier_items).where(eq(supplier_items.supplier_id, supplierId))
        return itemsList
    } catch (error) {
        console.error('Error fetching items:', error)
        throw error
    }
}

export const createPurchaseRequest = async (headers, items) => {
    try{
        return await db.transaction(async (trx) => {
            //Insert the header into purchase_requests
            const [newRequest] = await trx
            .insert(purchase_requests)
            .values(headers)
            .returning()

            //Insert the items into request_items linked to this request
            const itemRows = items.map(item => (
                {
                    request_id: newRequest.id,
                    supplier_item_id: item.supplier_item_id,
                    quantity: item.quantity,
                    unit_price_snapshot: null //This is set by PM
                }
            ))
            await trx.insert(request_items).values(itemRows)
            return newRequest
        })
    } catch (error) {
        console.error('Error creating purchase request:', error)
        throw error
    }
}

export const getRequestsWithItems = async (whereClause) => {
  const requests = await db.select({
    id:               purchase_requests.id,
    user_id:          purchase_requests.user_id,
    supplier_id:      purchase_requests.supplier_id,
    request_type_id:  purchase_requests.request_type_id,
    department:       purchase_requests.department,
    budget_code:      purchase_requests.budget_code,
    reason:           purchase_requests.reason,
    status:           purchase_requests.status,
    created_at:       purchase_requests.created_at,
    expected_delivery: purchase_requests.expected_delivery,
    requester:        users.username,
    supplier_name:    suppliers.name,
  })
  .from(purchase_requests)
  .innerJoin(users,     eq(purchase_requests.user_id,     users.id))
  .innerJoin(suppliers, eq(purchase_requests.supplier_id, suppliers.id))
  .where(whereClause)

  if (requests.length === 0) return []

  // fetch all items for these requests in one query
  const requestIds = requests.map(r => r.id)
  const items = await db.select({
    request_id:          request_items.request_id,
    supplier_item_id:    request_items.supplier_item_id,
    quantity:            request_items.quantity,
    unit_price_snapshot: request_items.unit_price_snapshot,
    item_code:           supplier_items.item_code,
    item_name:           supplier_items.name,
    unit:                supplier_items.unit,
  })
  .from(request_items)
  .innerJoin(supplier_items, eq(request_items.supplier_item_id, supplier_items.id))
  .where(inArray(request_items.request_id, requestIds))

  // attach items to their request
  return requests.map(r => ({
    ...r,
    items: items.filter(i => i.request_id === r.id)
  }))
}

//Update request status
export const updateRequestStatus = async (id, status) => {
  const [updated] = await db
    .update(purchase_requests)
    .set({ status })
    .where(eq(purchase_requests.id, Number(id)))
    .returning()
  return updated
}
