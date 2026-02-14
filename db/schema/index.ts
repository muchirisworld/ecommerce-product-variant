import { uuid, integer, pgTable, varchar, jsonb, timestamp, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const productsTable = pgTable("products", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  options: jsonb().$type<{ name: string; values: string[] }[]>().notNull().default([]),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const productVariantsTable = pgTable("product_variants", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  productId: uuid()
    .references(() => productsTable.id, { onDelete: "cascade" })
    .notNull(),
  sku: varchar({ length: 255 }).unique().notNull(),
  price: integer().notNull(), // stored in cents
  stock: integer().notNull().default(0),
  attributes: jsonb().$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

