import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Catégories du catalogue, telles que définies dans le cahier des charges.
export type ProductCategory =
  | 'huiles'
  | 'riz'
  | 'semoules'
  | 'farines'
  | 'sucre'
  | 'autres';

export type StockStatus = 'disponible' | 'rupture';

export type ReservationStatus = 'en_attente' | 'retiree' | 'expiree' | 'annulee';

export type CouponType = 'percentage' | 'amount';
export type CouponScope = 'all' | 'categories' | 'products';
export type OrderStatus = 'pending' | 'invoiced' | 'paid';
export type OrderSource = 'reservation' | 'proforma';
export type InvoiceStatus = 'issued' | 'paid';

export type SettingsKey = 'promotion_active' | 'promotion_message';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').$type<ProductCategory>().notNull(),
  format: text('format'),
  // Prix en Francs CFA, stocké sous forme de nombre entier.
  priceFc: integer('price_fc').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  stockStatus: text('stock_status').$type<StockStatus>().notNull().default('disponible'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  // Code à six caractères, généré lors de la réservation.
  code: text('code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  comment: text('comment'),
  // amounts are frozen when the reservation is created, after coupon discounts.
  subtotalFc: integer('subtotal_fc').notNull().default(0),
  discountFc: integer('discount_fc').notNull().default(0),
  totalFc: integer('total_fc').notNull(),
  coupons: text('coupons')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  status: text('status').$type<ReservationStatus>().notNull().default('en_attente'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const reservationItems = pgTable(
  'reservation_items',
  {
    id: serial('id').primaryKey(),
    reservationId: integer('reservation_id').references(() => reservations.id, {
      onDelete: 'cascade',
    }),
    productId: integer('product_id').references(() => products.id),
    // Le nom et le prix sont copiés pour préserver l’historique exact.
    productName: text('product_name').notNull(),
    unitPriceFc: integer('unit_price_fc').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    check('reservation_items_quantity_positive', sql`${table.quantity} > 0`),
  ],
);

// Categories created from the admin; a product can belong to several.
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const productCategories = pgTable(
  'product_categories',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.productId, table.categoryId] })],
)

// Discount codes defined by the admin and applied in the cart.
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').$type<CouponType>().notNull(),
  value: integer('value').notNull(),
  scope: text('scope').$type<CouponScope>().notNull().default('all'),
  targets: text('targets')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  isActive: boolean('is_active').notNull().default(true),
  maxUsages: integer('max_usages'),
  usages: integer('usages').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Sales orders are distinct from reservations; the admin can adjust their prices.
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  reservationId: integer('reservation_id').references(() => reservations.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  customerCompany: text('customer_company'),
  source: text('source').$type<OrderSource>().notNull().default('reservation'),
  status: text('status').$type<OrderStatus>().notNull().default('pending'),
  subtotalFc: integer('subtotal_fc').notNull(),
  discountFc: integer('discount_fc').notNull().default(0),
  totalFc: integer('total_fc').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  unitPriceFc: integer('unit_price_fc').notNull(),
  quantity: integer('quantity').notNull(),
})

// An invoice is only considered paid after an admin validates the payment.
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  number: text('number').notNull().unique(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id)
    .unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  customerCompany: text('customer_company'),
  subtotalFc: integer('subtotal_fc').notNull(),
  discountFc: integer('discount_fc').notNull().default(0),
  totalFc: integer('total_fc').notNull(),
  status: text('status').$type<InvoiceStatus>().notNull().default('issued'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
})

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact: text('contact').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Sessions serveur : permet d'invalider une session à la déconnexion.
export const adminSessions = pgTable('admin_sessions', {
  id: serial('id').primaryKey(),
  tokenHash: text('token_hash').notNull().unique(),
  adminId: integer('admin_id')
    .notNull()
    .references(() => admins.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Paramètres modifiables depuis l'administration (promotion, message associé).
export const siteSettings = pgTable('site_settings', {
  key: text('key').$type<SettingsKey>().primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Membres de l'équipe dirigeante, saisis depuis l'administration.
export const equipeMembres = pgTable('equipe_membres', {
  id: serial('id').primaryKey(),
  nom: text('nom').notNull(),
  fonction: text('fonction').notNull(),
  biographie: text('biographie'),
  photoUrl: text('photo_url'),
  ordre: integer('ordre').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Limitation du nombre de tentatives de connexion par adresse IP hachée.
export const loginAttempts = pgTable('login_attempts', {
  ipHash: text('ip_hash').primaryKey(),
  attempts: integer('attempts').notNull().default(1),
  firstAttempt: timestamp('first_attempt', { withTimezone: true }).notNull(),
  lastAttempt: timestamp('last_attempt', { withTimezone: true }).notNull(),
});

// Types inférés pour les couches supérieures (routes, validations, composants).
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
export type ReservationItem = typeof reservationItems.$inferSelect;
export type NewReservationItem = typeof reservationItems.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect
export type EquipeMembre = typeof equipeMembres.$inferSelect
export type NouvelEquipeMembre = typeof equipeMembres.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
