import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";
import { eq, or, ilike, count, desc, and, sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

const perPage = 10;

export const GET = async (request: any, params: any) => {
	const searchParams = request.nextUrl.searchParams;
	const search: string = searchParams.get("q") || "";
	const currentPage: number = Number(searchParams.get("page")) || 1;

	const cookie = cookies().get("user");
	const token: any = await verifyAccessToken(cookie?.value);
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

	const offset = (currentPage - 1) * perPage;

	const items = await db.execute(sql`
	  SELECT *,
			 COUNT(*) OVER() AS total_count
	  FROM ${productTable}
	  WHERE ${productTable.title} ILIKE ${`%${search}%`}
	  ORDER BY ${productTable.createdAt} DESC
	  OFFSET ${offset}
	  LIMIT ${perPage}
	`);
	const totalItems = items.length > 0 ? Number(items[0].total_count) : 0;

	const pages = Math.ceil(totalItems / perPage);
	return Response.json({ items, pages });
};
