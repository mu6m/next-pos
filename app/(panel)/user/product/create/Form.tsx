"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Feature } from "./Feature";
import { FormProvider, useForm } from "react-hook-form";

export function Form({
	view = false,
	edit_data = {
		feature: [],
	},
	form,
	init_state,
	mutate = null,
	category,
}: any) {
	const methods = useForm({ defaultValues: edit_data });
	const { toast } = useToast();

	const [feat, setFeat] = useState(edit_data?.feature.length || 0);
	const [loading, setLoading] = useState(false);
	const [state, formAction]: any = useActionState(form, init_state);

	useEffect(() => {
		if (state.message != "") {
			toast({
				variant: state.success ? "default" : "destructive",
				title: state.message,
			});
		}
		setLoading(false);
	}, [state]);
	if (state.success && mutate) {
		mutate();
	}
	return (
		<FormProvider {...methods}>
			<form
				className={`space-y-4 md:space-y-6 ${
					view ? "opacity-70 pointer-events-none" : ""
				}`}
				onSubmit={methods.handleSubmit((data) => {
					setLoading(true);
					if (data.category == "") {
						data.category = null;
					}
					data.feature.length = feat;
					for (let item of data.feature) {
						if (item?.option?.length && item?.priceAddOptions?.length) {
							item.option.length = item.priceAddOptions.length =
								item.optionCount;
						}
					}
					formAction(data);
				})}
			>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>Title</Label>
					<Input {...methods.register("title")} />
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>Content</Label>
					<Textarea rows={5} {...methods.register("content")} />
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>image</Label>
					<Input type="file" accept={".png"} {...methods.register("image")} />
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>sku</Label>
					<Input {...methods.register("sku")} />
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>limit (-1 for unlimited)</Label>
					<Input
						{...methods.register("limit", { valueAsNumber: true })}
						type="number"
						min={-1}
					/>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>price</Label>
					<Input
						type="number"
						{...methods.register("price", { valueAsNumber: true })}
						min={0}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<input
						{...methods.register("published")}
						type="checkbox"
						value=""
						className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<label className="ms-2 text-sm font-medium text-gray-900 ">
						publish
					</label>
				</div>

				<div className="flex flex-col space-x-2">
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
						Select an category
					</label>
					<select
						{...methods.register("category")}
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
					>
						<option value={""} selected>
							no category
						</option>
						{category &&
							category.map((item: any) => {
								return (
									<option value={item.id} key={item.id}>
										{item.name}
									</option>
								);
							})}
					</select>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>features</Label>
					<Input
						type="number"
						min={0}
						value={feat}
						onChange={(e) => {
							setFeat(Number(e.target.value));
						}}
					/>
				</div>
				<div className="border rounded-sm p-4 flex flex-col gap-4">
					{[...Array(feat)].map((e, i) => (
						<div key={i} className="grid w-full max-w-sm items-center gap-1.5">
							<Feature index={i} />
						</div>
					))}
				</div>
				<Button type="submit" disabled={loading}>
					{loading ? (
						<>
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
							Please wait
						</>
					) : (
						<>Submit</>
					)}
				</Button>
			</form>
		</FormProvider>
	);
}
