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
import { validate } from "../create/action";

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
				.update(productTable)
				.set({
					title: parse.data.title,
					images: [blob.downloadUrl],
					content: parse.data.content,
					limit: parse.data.limit,
					price: parse.data.price,
					published: parse.data.publish,
					sku: parse.data.sku,
					categoryId: parse.data.category,
				})
				.where(eq(productTable.id, prevState.edit))
				.returning();
			await tx
				.delete(productFeaturesTable)
				.where(eq(productTable.id, prevState.edit));
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
