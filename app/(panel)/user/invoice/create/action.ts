"use server";

import { put } from "@vercel/blob";
import { db } from "@/db";
import { productFeaturesTable, productTable } from "@/db/schema";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { z } from "zod";
import { path } from "../config";

export async function validate(formData: any) {
	enum types {
		OPTION = "OPTION",
		CHECKBOX = "CHECKBOX",
		TEXT = "TEXT",
	}
	const schema = z.object({
		title: z.string().min(1, "title is required"),
		content: z.string(),
		sku: z.string(),
		limit: z.number().min(-1, "limit is required"),
		price: z.number().min(0, "price is required"),
		publish: z.boolean().default(false),
		category: z.string().nullable(),
		image: z.array(z.custom<File>()).refine((files: any) => {
			if (files.length === 0) {
				return true; // Allow the array to be empty
			}
			return files.every((file: File) => file.size <= 10 * 1024 * 1024);
		}, "Each file should be less than 10MB."),
		feature: z.array(
			z.object({
				name: z.string().min(1, "name is required"),
				priceAdd: z
					.number()
					.min(0, "minumum is zero")
					.default(0)
					.transform((value) => (value === null ? 0 : value)),
				required: z.boolean().default(false),
				type: z.nativeEnum(types),
				option: z.array(z.string()).default([]),
				priceAddOptions: z
					.array(z.number().min(0, "minumum is zero").default(0))
					.default([]),
			})
		),
	});
	const parse = schema.safeParse(formData);
	return parse;
}

export async function form(prevState: any, formData: any) {
	console.log(JSON.stringify(formData, null, 2));
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

	try {
		await db.transaction(async (tx) => {
			let upload = [];
			if (parse.data.image.length > 0) {
				const blob = await put(parse.data.title, parse.data.image[0], {
					access: "public",
				});
				upload.push(blob.downloadUrl);
			}
			const [product] = await tx
				.insert(productTable)
				.values({
					title: parse.data.title,
					images: upload,
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
