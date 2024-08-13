import { db } from "@/db";
import { invoiceTable } from "@/db/schema";
import { eq, or, ilike, count, desc, and } from "drizzle-orm";
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
	const [page_count] = await db.select({ count: count() }).from(invoiceTable);
	// .where(ilike(invoiceTable.userId, `%${search}%`));
	const pages = Math.ceil(page_count.count / perPage);
	const items = await db.query.invoiceTable.findMany({
		orderBy: desc(invoiceTable.createdAt),
		offset: (currentPage - 1) * perPage,
		limit: perPage,
		with: {
			invoiceAndProducts: true,
		},
		// where: ilike(invoiceTable.userId, `%${search}%`),
	});
	return Response.json({ items, pages });
};
