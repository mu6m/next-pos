import { db } from "@/db";
import {
	categoryTable,
	invoiceAndProductsTable,
	invoiceTable,
	productTable,
} from "@/db/schema";
import {
	eq,
	or,
	ilike,
	count,
	desc,
	and,
	inArray,
	sql,
	SQL,
} from "drizzle-orm";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export const POST = async (request: any) => {
	let body: any = await request.json();
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
	//sum the products
	let merged: any = {};
	body.forEach((product: any) => {
		if (merged[product.id]) {
			merged[product.id].count += product.quantity;
			// for (const item of product.features) {
			// 	merged[product.id].features.add(item.product_featuresId);
			// }
		} else {
			merged[product.id] = {
				id: product.id,
				count: product.quantity,
				features: new Set(),
			};
			// for (const item of product.features) {
			// 	merged[product.id].features.add(item.product_featuresId);
			// }
		}
	});
	let db_pro: any = await db.query.productTable.findMany({
		where: inArray(productTable.id, Object.keys(merged)),
	});
	db_pro = db_pro.reduce((acc: any, obj: any) => {
		acc[obj.id] = obj;
		return acc;
	}, {});

	//simply check for limit and required
	for (const key in merged) {
		const item = merged[key];
		const pro = db_pro[key];
		if (pro.limit && item.count > pro.limit) {
			throw new Error("limit exceeded");
		}
		// for (const feat of pro.product_features) {
		// 	if (feat.required) {
		// 		if (!item.features.has(feat.id)) {
		// 			throw new Error("some features are required");
		// 		}
		// 	}
		// }
	}
	//format the features
	let inv_arr: any[] = [];
	for (let item of body) {
		// let fet_arr: any[] = [];
		// for (let feat of item.features) {
		// 	let op_feat: any = undefined;
		// 	for (const pro_feat of db_pro[item.id].product_features) {
		// 		if (pro_feat.id == feat.product_featuresId) {
		// 			op_feat = pro_feat;
		// 		}
		// 	}
		// 	if (feat.type == "OPTION") {
		// 		feat.option = op_feat.option[feat.option_index];
		// 		feat.price = op_feat.price_add_options[feat.option_index];
		// 	} else {
		// 		feat.price = op_feat.price_add;
		// 	}
		// 	delete feat.option_index;
		// 	fet_arr.push({
		// 		id: uuidv4(),
		// 		price: feat.price,
		// 		option: feat.option,
		// 		typed: feat.typed,
		// 		checked: feat.checked,
		// 		product_featuresId: feat.product_featuresId,
		// 	});
		// }
		inv_arr.push({
			product: item.id,
			count: item.count,
			// features: fet_arr,
		});
	}
	//update many
	await db.transaction(async (tx) => {
		const sqlChunks: SQL[] = [];

		// Start building the CASE statement
		sqlChunks.push(sql`(CASE`);

		// Add each WHEN condition for the CASE statement
		for (const { id, count } of Object.values(merged)) {
			sqlChunks.push(
				sql`WHEN ${productTable.id} = ${id} THEN ${productTable.limit} - ${count}`
			);
		}

		// Close the CASE statement
		sqlChunks.push(sql`END)`);

		// Join all SQL chunks into a final SQL statement
		const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

		// Execute the bulk update query
		await tx
			.update(productTable)
			.set({ limit: finalSql })
			.where(inArray(productTable.id, Object.keys(merged)));

		const [invoice] = await tx
			.insert(invoiceTable)
			.values({
				userId: token.id,
			})
			.returning();

		const invoiceAndProductRecords = inv_arr.map((item) => ({
			productId: item.product,
			invoiceId: invoice.id,
			count: item.count,
			refunded: false,
		}));

		await tx.insert(invoiceAndProductsTable).values(invoiceAndProductRecords);

		// let feat_values = inv_arr.map((item) => {
		// 	return item.features.map((feat: any) => {
		// 		return `('${feat.id}', ${feat.checked}, '${feat.typed}', '${feat.option}', '${feat.price}', '${feat.product_featuresId}', '${item.id}')`;
		// 	});
		// });
		// console.log(feat_values);
		// let feat_query = `INSERT INTO "product_feature_invoice" ("id", "checked", "typed", "option", "price", "product_featuresId", "invoiceAndProductsId") VALUES ${feat_values.join(
		// 	","
		// )}`;
		// await tx.$executeRawUnsafe(feat_query);
	});
	return Response.json({
		success: true,
		message: `invoice created`,
	});
};
