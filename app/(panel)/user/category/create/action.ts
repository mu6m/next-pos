"use server";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { verifyAccessToken } from "@/lib/jwt";
import axios from "axios";
import { and, count, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { path } from "../config";

export async function form(prevState: any, formData: FormData) {
	const schema = z.object({
		name: z.string().min(1, { message: "name is required" }),
	});
	const parse = schema.safeParse({
		name: formData.get("name"),
	});

	if (!parse.success) {
		return {
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
			await tx.insert(categoryTable).values({
				name: parse.data.name,
			});
		});
	} catch (error) {
		return {
			success: false,
			message: `error in db`,
		};
	}
	return {
		success: true,
		message: `${path} "${parse.data.name}" is created`,
	};
}
