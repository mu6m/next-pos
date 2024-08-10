"use server";

import { put } from "@vercel/blob";
import { db } from "@/db";
import { categoryTable, productFeaturesTable, productTable } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { verifyAccessToken } from "@/lib/jwt";
import axios from "axios";
import { and, count, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { path } from "../config";
import { features } from "process";

export async function validate(formData: FormData) {
	enum types {
		OPTION = "OPTION",
		CHECKBOX = "CHECKBOX",
		TEXT = "TEXT",
	}
	const schema = z.object({
		title: z.string().min(1, "title is required"),
		content: z.string(),
		sku: z.string().min(1, "sku is required"),
		limit: z.number().min(-1, "limit is required"),
		price: z.number().min(0, "price is required"),
		publish: z.boolean(),
		category: z.string().nullable(),
		image: z.custom<File>().refine((file) => {
			if (file.size > 10 * 1024 * 1024) {
				return false;
			}
			return true;
		}, `File size should be less than 10mb.`),
		feature: z.array(
			z.object({
				name: z.string().min(1, "name is required"),
				priceAdd: z.number().min(0, "minumum is zero"),
				option: z.array(z.string()),
				priceAddOptions: z.array(z.number().min(0, "minumum is zero")),
				published: z.boolean().default(false),
				type: z.nativeEnum(types),
			})
		),
	});
	const parse = schema.safeParse({
		title: formData.get("title"),
		content: formData.get("content"),
		sku: formData.get("sku"),
		limit: Number(formData.get("limit")),
		price: Number(formData.get("price")),
		publish: Boolean(formData.get("publish")),
		category: formData.get("category") == "" ? null : formData.get("category"),
		image: formData.get("image"),
		feature: JSON.parse(formData.get("feature")?.toString() || "{}"),
	});

	return parse;
}

export async function form(prevState: any, formData: FormData) {
	let parse = await validate(formData);
	if (!parse.success) {
		return {
			...prevState,
			success: false,
			message: `there is an error in your data ${parse.error.message}`,
		};
	}
	const cookie = cookies().get("user");
	const token: any = await verifyAccessToken(cookie?.value);
	if (token === false || !token) {
		return {
			success: false,
			message: `error in user token`,
		};
	}
	console.log(parse.data.feature);

	try {
		await db.transaction(async (tx) => {
			const blob = await put(parse.data.title, parse.data.image, {
				access: "public",
			});
			const [product] = await tx
				.insert(productTable)
				.values({
					title: parse.data.title,
					images: [blob.downloadUrl],
					content: parse.data.content,
					limit: parse.data.limit,
					price: parse.data.price,
					published: parse.data.publish,
					sku: parse.data.sku,
					categoryId: parse.data.category,
				})
				.returning();
			if (parse.data.feature.length > 0) {
				parse.data.feature.forEach((item: any) => {
					item.productId = product.id;
				});
				await tx.insert(productFeaturesTable).values(parse.data.feature as any);
			}
		});
	} catch (error) {
		console.log(error);
		return {
			...prevState,
			success: false,
			message: `error in db`,
		};
	}
	return {
		...prevState,

		success: true,
		message: `${path} "${parse.data.title}" is created`,
	};
}
