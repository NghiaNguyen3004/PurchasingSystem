import { pgTable, serial, text, numeric, integer, timestamp, check, date} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

//Roles
export const roles = pgTable('roles',{
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique()
})

//Users
export const users = pgTable('users', {
    id:serial('id').primaryKey(),
    role_id: integer('role_id').notNull().references(() => roles.id),
    username: text('username').notNull(),
    password: text('password').notNull(),
    department: text('department').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    }
)

//Requests types
export const request_types = pgTable('request_types', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique()
})
//Suppliers
export const suppliers = pgTable('suppliers', {
    id: serial('id').primaryKey(),
    request_type_id: integer('request_type_id').notNull().references(() => request_types.id),
    name: text('name').notNull().unique(),
})

//Suppliers items
export const supplier_items = pgTable('supplier_items', {
    id: serial('id').primaryKey(),
    supplier_id: integer('supplier_id').notNull().references(() => suppliers.id),
    item_code: text('item_code').notNull().unique(),
    name: text('name').notNull(),
    unit: text('unit').notNull(),
    price_per_unit: numeric('price_per_unit',{ precision: 10, scale: 2 }),
},
    // Constraint
    (supplier_items) => [
        check('price_check', sql`${supplier_items.price_per_unit} >= 0`),
    ]
)
//Purchase Requests
export const purchase_requests = pgTable('purchase_requests', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    supplier_id: integer('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'restrict' }),
    request_type_id: integer('request_type_id').notNull().references(() => request_types.id),
    department: text('department').notNull(),
    budget_code: text('budget_code').notNull(),
    reason: text('reason').notNull(),
    status: text('status').notNull().default('Pending'),
    created_at: date('timestamp', { mode: 'date' }).defaultNow(),
    expected_delivery: date('expected_delivery', { mode: 'date' }).notNull(),
},
    // Constraint
    (purchase_requests) => [
        check('status_check', sql`${purchase_requests.status} in ('Pending', 'Approved','Processing', 'Completed', 'Rejected')`),
        
    ]
)

//Request items
export const request_items = pgTable('request_items', {
    id: serial('id').primaryKey(),
    request_id: integer('request_id').notNull().references(() => purchase_requests.id, { onDelete: 'cascade' }).unique(),
    item_code: text('item_code').notNull().references(() => supplier_items.item_code),
    supplier_item_id: integer('supplier_item_id').notNull().references(() => supplier_items.id).unique(),
    quantity: integer('quantity').notNull(),
    unit_price_snapshot: numeric('unit_price_snapshot', { precision: 10, scale: 2 })
},
    // Constraint
    (request_items) => [
        check('quantity_check', sql`${request_items.quantity} > 0`),
        check('unit_price_check', sql`${request_items.unit_price_snapshot} >= 0`),
    ]
)
