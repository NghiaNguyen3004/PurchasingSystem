import { pgTable, serial, text, integer, smallint, timestamp, check} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'


//Users
export const users = pgTable('users', {
    id:serial('id').primaryKey(),
    username: text('username').notNull(),
    user_type: text('user_type').notNull(),
    password: text('password').notNull(),
    department: text('department').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    },
    // Constraint
    (users)=>[
        check('user_type_check', sql`${users.user_type} in ('Requester', 'Approver','Admin')`)
    ]
)

//Requests
export const requests = pgTable('requests', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(() => users.id),
    item_name: text('item_name').notNull(),
    quantity: integer('quantity').notNull(),
    price_per_unit: integer('price_per_unit').notNull(),
    budget_code: text('budget_code').notNull(),
    reason: text('reason').notNull(),
    requested_by: text('requested_by').notNull(),
    status: text('status').notNull().default('Pending'),
    created_at: timestamp('created_at').defaultNow(),
    },

    //Constraint
    (requests) => [
        check('quantity_check', sql`${requests.quantity} > 0`),
        check('price_check', sql`${requests.price_per_unit} > 0`),
        check('status_check', sql`${requests.status} in ('Pending', 'Approved', 'Rejected')`)
    ]
)

