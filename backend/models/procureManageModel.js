import db from "../models/db/index.js"
import {
    suppliers, supplier_items, 
    purchase_requests, request_items
} from '../models/db/schema.js'
import {eq, and} from 'drizzle-orm'

//Working with suppliers
export const createSupplier = async (name, requestTypeId) => {
    try{
        const [newSupplier] = await db
        .insert(suppliers)
        .values({name, request_type_id: requestTypeId})
        .returning()

        return newSupplier

    } catch (error) {
        console.error('Error creating supplier:', error)
        throw error
    }
}

export const updateSupplier = async (supplierId, data) => {
    try{
        const [updatedSupplier] = await db
        .update(suppliers)
        .set(data)
        .where(eq(suppliers.id, Number(supplierId)))
        .returning()

        return updatedSupplier
    } catch (error) {
        console.error('Error updating supplier:', error)
        throw error
    }
}

export const deleteSupplier = async (supplierId) => {
    try{
        await db.delete(suppliers).where(eq(suppliers.id, Number(supplierId)))
        return { message: 'Supplier deleted successfully' }
    }
    catch (error) {
        console.error('Error deleting supplier:', error)
        throw error
    }
}

//Working with supplier items
export const createSupplierItem = async (supplierId, data) => {
    try{
        const [newSupplierItem] = await db
        .insert(supplier_items)
        .values({supplier_id: Number(supplierId), ...data})
        .returning()

        return newSupplierItem
    } catch (error) {
        console.error('Error creating supplier item:', error)
        throw error
    }
}

export const updateSupplierItem = async (itemId, data) => {
    try{
        const [updatedItem] = await db
        .update(supplier_items)
        .set(data)
        .where(eq(supplier_items.id, Number(itemId)))
        .returning()
        return updatedItem
    } catch (error) {
        console.error('Error updating supplier item:', error)
        throw error
    }
}

export const deleteSupplierItem = async (itemId) => {
    try{
        await db.delete(supplier_items).where(eq(supplier_items.id, Number(itemId)))
        return { message: 'Supplier item deleted successfully' }
    }
    catch (error) {
        console.error('Error deleting supplier item:', error)
        throw error
    }
}