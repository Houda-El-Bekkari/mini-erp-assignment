import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().default(`user_${Date.now()}`),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('client'), // admin, operator, client
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Leads table
export const leads = pgTable('leads', {
  id: text('id').primaryKey().default(`lead_${Date.now()}`),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').default('new'), // new, in_progress, converted
  assignedTo: text('assigned_to'), // user id
  comments: text('comments'),
  convertedToClientId: text('converted_to_client_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Clients table
// Clients table - déjà existante, mais vérifions
export const clients = pgTable('clients', {
  id: text('id').primaryKey().default(`client_${Date.now()}`),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  status: text('status').default('active'), // active, inactive, pending
  totalRevenue: integer('total_revenue').default(0),
  assignedProducts: integer('assigned_products').default(0),
  activeClaims: integer('active_claims').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  lastActivity: timestamp('last_activity').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey().default(`product_${Date.now()}`),
  name: text('name').notNull(),
  type: text('type').default('service'),
  price: integer('price').default(0),
  description: text('description'),
});

// Claims table
export const claims = pgTable('claims', {
  id: text('id').primaryKey().default(`claim_${Date.now()}`),
  clientId: text('client_id').references(() => clients.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('submitted'), // submitted, in_review, resolved
  fileUrl: text('file_url'),
  assignedTo: text('assigned_to'), // operator id
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  claims: many(claims),
}));