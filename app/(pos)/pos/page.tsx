import { db } from "@/db";
import Form from "./Form";
import { revalidatePath } from "next/cache";

export default async function Comp() {
	const product = await db.query.productTable.findMany();
	return (
		<div>
			<Form
				product={product}
				mutate={async () => {
					"use server";
					await revalidatePath("/");
				}}
			/>
		</div>
	);
}
