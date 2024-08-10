"use server";

import { put } from "@vercel/blob";
import { db } from "@/db";
import { productFeaturesTable, productTable } from "@/db/schema";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { path } from "../config";
import { validate } from "../create/action";
import { eq } from "drizzle-orm";

export async function form(prevState: any, formData: any) {
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
			await tx
				.delete(productFeaturesTable)
				.where(eq(productFeaturesTable.productId, prevState.edit));
			let upload = [];
			if (parse.data.image.length > 0) {
				const blob = await put(parse.data.title, parse.data.image[0], {
					access: "public",
				});
				upload.push(blob.downloadUrl);
			}
			const [product] = await tx
				.update(productTable)
				.set({
					title: parse.data.title,
					images: upload,
					content: parse.data.content,
					limit: parse.data.limit,
					price: parse.data.price,
					published: parse.data.publish,
					sku: parse.data.sku,
					categoryId: parse.data.category,
				})
				.where(eq(productTable.id, prevState.edit))
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
		message: `${path} "${parse.data.title}" is updated`,
	};
}
