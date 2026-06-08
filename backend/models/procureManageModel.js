import db from "../models/db/index.js"
import {
    suppliers, supplier_items, 
    purchase_requests, request_items
} from '../models/db/schema.js'
import {eq, and} from 'drizzle-orm'

//Working with suppliers
export const createSupplier = async (name, requestTypeId) => {
        const [newSupplier] = await db
        .insert(suppliers)
        .values({name, request_type_id: requestTypeId})
        .returning()

        return newSupplier

}

export const updateSupplier = async (supplierId, data) => {
        const [updatedSupplier] = await db
        .update(suppliers)
        .set(data)
        .where(eq(suppliers.id, Number(supplierId)))
        .returning()

        return updatedSupplier
}

export const deleteSupplier = async (supplierId) => {
        await db.delete(suppliers).where(eq(suppliers.id, Number(supplierId)))
        return { message: 'Supplier deleted successfully' }
}

//Working with supplier items
export const createSupplierItem = async (supplierId, data) => {
        const [newSupplierItem] = await db
        .insert(supplier_items)
        .values({supplier_id: Number(supplierId), ...data})
        .returning()

        return newSupplierItem
}

export const updateSupplierItem = async (itemId, data) => {
        const [updatedItem] = await db
        .update(supplier_items)
        .set(data)
        .where(eq(supplier_items.id, Number(itemId)))
        .returning()
        return updatedItem
}

export const deleteSupplierItem = async (itemId) => {
        await db.delete(supplier_items).where(eq(supplier_items.id, Number(itemId)))
        return { message: 'Supplier item deleted successfully' }
}

//Working with price
export const updateItemPrice = async(supplierId, priceList) => {
    // priceList = [{supplier_item_id, unit_price}, ...]
        const updatedItems = await Promise.all(
            priceList.map(async({supplier_item_id, unit_price}) => {
                const [row] = await db.update(supplier_items)
                .set({price_per_unit: unit_price})
                .where(and(
                    eq(supplier_items.id, Number(supplier_item_id)),
                    eq(supplier_items.supplier_id, Number(supplierId))
                ))
                .returning()
                return row
            })
        )
        return updatedItems
}

export const updateRequestItemPrices = async(requestId, priceList) => {
    // priceList = [{request_item_id, unit_price_snapshot}, ...]
        const updatedItems = await Promise.all(
            priceList.map(async({request_item_id, unit_price_snapshot}) => {
                const [row] = await db.update(request_items)
                .set({unit_price_snapshot})
                .where(and(
                    eq(request_items.id, Number(request_item_id)),
                    eq(request_items.request_id, Number(requestId))
                ))
                .returning()
            return row
           })
        )
        return updatedItems
}