import {
	pgTable,
	uuid,
	text,
	varchar,
	boolean,
	integer,
	timestamp,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Enums
export const userTypeEnum = pgEnum("user_type", [
	"ADMIN",
	"EMPLOYEE",
	// "CUSTOMER",
]);

export const productFeatureTypeEnum = pgEnum("product_feature_type", [
	"CHECKBOX",
	"OPTION",
	"TEXT",
]);

// Tables
export const user = pgTable("user", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	username: varchar("username", { length: 255 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	name: text("name").array().notNull(),
	type: userTypeEnum("type").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const invoiceTable = pgTable("invoice", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const invoiceAndProductsTable = pgTable("invoice_and_products", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	productId: uuid("product_id").notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	count: integer("count").default(1).notNull(),
	refunded: boolean("refunded").default(false).notNull(),
});

export const categoryTable = pgTable("category", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
});

export const productTable = pgTable("product", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	title: varchar("title", { length: 255 }).notNull().unique(),
	content: text("content"),
	sku: varchar("sku", { length: 255 }),
	images: text("images").array().notNull(),
	limit: integer("limit"),
	price: integer("price").default(0).notNull(),
	published: boolean("published").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	categoryId: uuid("category_id"),
});

export const productFeaturesTable = pgTable("product_features", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	type: productFeatureTypeEnum("type").notNull(),
	priceAdd: integer("price_add").default(0),
	option: text("option")
		.array()
		.default(sql`ARRAY[]::text[]`),
	priceAddOptions: integer("price_add_options")
		.array()
		.default([])
		.default(sql`ARRAY[]::integer[]`),
	required: boolean("required").default(false).notNull(),
	productId: uuid("product_id").notNull(),
});

export const productFeatureInvoiceTable = pgTable("product_feature_invoice", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.notNull()
		.primaryKey(),
	checked: boolean("checked"),
	typed: text("typed"),
	option: text("option"),
	price: integer("price").notNull(),
	productFeaturesId: uuid("product_features_id").notNull(),
	invoiceAndProductsId: uuid("invoice_and_products_id").notNull(),
});

// Relations

export const invoiceRelations = relations(invoiceTable, ({ one, many }) => ({
	user: one(user, {
		fields: [invoiceTable.userId],
		references: [user.id],
	}),
	invoiceAndProducts: many(invoiceAndProductsTable),
}));

export const invoiceAndProductsRelations = relations(
	invoiceAndProductsTable,
	({ one, many }) => ({
		product: one(productTable, {
			fields: [invoiceAndProductsTable.productId],
			references: [productTable.id],
		}),
		invoice: one(invoiceTable, {
			fields: [invoiceAndProductsTable.invoiceId],
			references: [invoiceTable.id],
		}),
		productFeatureInvoices: many(productFeatureInvoiceTable),
	})
);

export const productRelations = relations(productTable, ({ one, many }) => ({
	category: one(categoryTable, {
		fields: [productTable.categoryId],
		references: [categoryTable.id],
	}),
	productFeatures: many(productFeaturesTable),
	invoiceAndProducts: many(invoiceAndProductsTable),
}));

export const productFeaturesRelations = relations(
	productFeaturesTable,
	({ one, many }) => ({
		product: one(productTable, {
			fields: [productFeaturesTable.productId],
			references: [productTable.id],
		}),
		productFeatureInvoices: many(productFeatureInvoiceTable),
	})
);

export const productFeatureInvoiceRelations = relations(
	productFeatureInvoiceTable,
	({ one }) => ({
		productFeature: one(productFeaturesTable, {
			fields: [productFeatureInvoiceTable.productFeaturesId],
			references: [productFeaturesTable.id],
		}),
		invoiceAndProducts: one(invoiceAndProductsTable, {
			fields: [productFeatureInvoiceTable.invoiceAndProductsId],
			references: [invoiceAndProductsTable.id],
		}),
	})
);
