import { db } from "@/db";
import { form } from "./action";
import { Form } from "./Form";

export default async function Comp() {
	const category = await db.query.categoryTable.findMany();
	return (
		<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
			<div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
				<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
						Create
					</h1>
					<Form
						view={false}
						form={form}
						init_state={{
							success: true,
							message: "",
						}}
						mutate={null}
						category={category}
					/>
				</div>
			</div>
		</div>
	);
}
