import { db } from "@/db";
import Form from "./Form";

export default async function Comp() {
	const product = await db.query.productTable.findMany();
	return (
		<div>
			<Form product={product} />
		</div>
	);
}
