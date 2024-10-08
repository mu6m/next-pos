import { db } from "@/db";
import { categoryTable, productFeaturesTable, productTable } from "@/db/schema";
import { verifyAccessToken } from "@/lib/jwt";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const DELETE = async (request: any, params: any) => {
	const searchParams = request.nextUrl.searchParams;
	const id: any = searchParams.get("id");
	if (!id) {
		return Response.json({
			success: false,
			message: `id is required`,
		});
	}

	const cookie = cookies().get("user");
	const token = await verifyAccessToken(cookie?.value);
	if (token === false || !token) {
		return Response.json(
			{
				success: false,
				message: `error in user token`,
			},
			{
				status: 400,
			}
		);
	}
	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(productFeaturesTable)
				.where(eq(productFeaturesTable.productId, id));
			await tx.delete(productTable).where(eq(productTable.id, id));
		});
	} catch (error) {
		return Response.json({
			success: false,
			message: `error in db`,
		});
	}
	return Response.json({
		success: true,
		message: `removed`,
	});
};
