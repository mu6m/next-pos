import { db } from "@/db";
import { form } from "./action";
import { Form } from "../create/Form";
import { eq } from "drizzle-orm";
import { productTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

export default async function Comp({ searchParams, params }: any) {
	const view: boolean = Boolean(searchParams.view) || false;
	const category = await db.query.categoryTable.findMany();
	let product: any = await db.query.productTable.findFirst({
		where: eq(productTable.id, params.edit),
		with: {
			productFeatures: true,
		},
	});
	if (product) {
		product.feature = product.productFeatures;
		delete product.productFeatures;
	}
	return (
		<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
			<div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
				<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
						{view ? "View" : "Edit"}
					</h1>
					<Form
						view={view}
						form={form}
						init_state={{
							success: true,
							message: "",
							edit: params.edit,
						}}
						mutate={revalidatePath("/")}
						category={category}
						edit_data={product}
					/>
				</div>
			</div>
		</div>
	);
}
