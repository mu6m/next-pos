"use client";

import {
	createContext,
	useActionState,
	useContext,
	useEffect,
	useState,
} from "react";
import { form } from "./action";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import useSWR from "swr";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

function SubmitButton({ loading }: any) {
	return (
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
	);
}

function Option({ index }: any) {
	const { feature, view }: any = useData();
	const [op, setOp] = useState(
		feature?.data[index]?.option?.length
			? feature?.data[index]?.option?.length
			: 0
	);

	return (
		<div className="flex flex-col gap-4 items-center space-x-2">
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label>options</Label>
				<Input
					disabled={view}
					type="number"
					min={0}
					value={op}
					onChange={(e) => {
						setOp(Number(e.target.value));
					}}
					required
				/>
			</div>
			{[...Array(op)].map((e, j) => (
				<div key={j} className="border rounded-sm p-4 flex flex-col gap-4">
					<div className="grid w-full max-w-sm items-center gap-1.5">
						<Label>option</Label>
						<Input
							defaultValue={feature?.data[index]?.option[j]}
							disabled={view}
							onChange={(event) => {
								feature.setData((prevState: any) => {
									let old = prevState[index]?.option || [];
									old[j] = event.target.value;
									return prevState.map((item: any, i: number) =>
										i === index ? { ...item, option: old } : item
									);
								});
							}}
							required
						/>
					</div>
					<div className="grid w-full max-w-sm items-center gap-1.5">
						<Label>price</Label>
						<Input
							type="number"
							defaultValue={Number(feature?.data[index]?.priceAddOptions[j])}
							disabled={view}
							onChange={(event) => {
								feature.setData((prevState: any) => {
									let old = prevState[index]?.priceAddOptions || [];
									old[j] = Number(event.target.value);
									console.log(prevState);
									return prevState.map((item: any, i: number) =>
										i === index ? { ...item, priceAddOptions: old } : item
									);
								});
							}}
							min={0}
							required
						/>
					</div>
				</div>
			))}
		</div>
	);
}

export function Feature({ index }: any) {
	const { view, edit_data, feature }: any = useData();
	console.log(feature.data);
	enum types {
		OPTION = "OPTION",
		CHECKBOX = "CHECKBOX",
		TEXT = "TEXT",
	}
	return (
		<div className="flex flex-col gap-4">
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label>name</Label>
				<Input
					onChange={(event) => {
						feature.setData((prevState: any) =>
							prevState.map((item: any, i: number) =>
								i === index ? { ...item, name: event.target.value } : item
							)
						);
					}}
					type="text"
					defaultValue={feature.data[index]?.name}
					disabled={view}
				/>
			</div>

			<div className="flex items-center space-x-2">
				<Checkbox
					defaultValue={feature[index]?.required}
					disabled={view}
					onCheckedChange={(checked) => {
						feature.setData((prevState: any) =>
							prevState.map((item: any, i: number) =>
								i === index ? { ...item, required: checked } : item
							)
						);
					}}
				/>
				<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					required
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<Select
					defaultValue={feature.data[index]?.type}
					disabled={view}
					name="type"
					onValueChange={(value) => {
						feature.setData((prevState: any) =>
							prevState.map((item: any, i: number) =>
								i === index ? { ...item, type: value } : item
							)
						);
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select a type" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Type</SelectLabel>
							{Object.values(types).map((t) => (
								<SelectItem key={t} value={t}>
									{t}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			{feature.data[index]?.type === "OPTION" ? (
				<Option index={index} />
			) : (
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>price add</Label>
					<Input
						defaultValue={feature.data[index]?.priceAdd}
						disabled={view}
						type="number"
						onChange={(event) => {
							feature.setData((prevState: any) =>
								prevState.map((item: any, i: number) =>
									i === index
										? { ...item, priceAdd: Number(event.target.value) }
										: item
								)
							);
						}}
						min={0}
					/>
				</div>
			)}
		</div>
	);
}

const DataContext: any = createContext(null);

const useData = () => {
	return useContext(DataContext);
};

export function Form({
	view = false,
	edit_data = null,
	form,
	init_state,
	mutate = null,
}: any) {
	const fetcher = (url: string) => fetch(url).then((r) => r.json());
	const { data, isLoading } = useSWR(`/user/category/read?all=true`, fetcher);
	const { toast } = useToast();

	const [fet, setFet] = useState(
		edit_data?.productFeatures ? edit_data.productFeatures : []
	);
	console.log(edit_data);
	const [loading, setLoading] = useState(false);
	const [state, formAction] = useActionState(form, init_state);

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
		<DataContext.Provider
			value={{ view, edit_data, feature: { data: fet, setData: setFet } }}
		>
			<form
				className="space-y-4 md:space-y-6"
				onSubmit={(e: any) => {
					e.preventDefault();
					setLoading(true);
					const form = e.target;
					const formData = new FormData(form);
					formData.append("feature", JSON.stringify(fet));
					formAction(formData);
				}}
			>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>Title</Label>
					<Input name="title" defaultValue={edit_data?.title} disabled={view} />
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>Content</Label>
					<Textarea
						name="content"
						rows={5}
						defaultValue={edit_data?.content}
						disabled={view}
					/>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>image</Label>
					<Input
						type="file"
						name="image"
						accept={".png"}
						defaultValue={edit_data?.image}
						disabled={view}
					/>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>sku</Label>
					<Input defaultValue={edit_data?.sku} disabled={view} name="sku" />
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>limit (-1 for unlimited)</Label>
					<Input
						defaultValue={edit_data?.limit}
						disabled={view}
						type="number"
						name="limit"
						min={-1}
					/>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>price</Label>
					<Input
						defaultValue={edit_data?.price}
						disabled={view}
						type="number"
						name="price"
						min={0}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						defaultValue={edit_data?.published}
						disabled={view}
						name="publish"
					/>
					<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						publish
					</label>
				</div>

				<div className="flex items-center space-x-2">
					<Select
						name="category"
						defaultValue={edit_data?.category}
						disabled={view}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Category</SelectLabel>
								{data &&
									data.map((item: any) => {
										return <SelectItem value={item.id}>{item.name}</SelectItem>;
									})}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label>features</Label>
					<Input
						type="number"
						name="features"
						min={0}
						disabled={view}
						value={fet.length}
						onChange={(e) => {
							const new_fet: any = Array.from(
								{ length: Number(e.target.value) },
								() => ({
									name: "",
									option: [],
									priceAddOptions: [],
									published: false,
									type: "TEXT",
								})
							);
							setFet(new_fet);
						}}
						required
					/>
				</div>
				<div className="border rounded-sm p-4 flex flex-col gap-4">
					{[...Array(fet.length)].map((e, i) => (
						<div key={i} className="grid w-full max-w-sm items-center gap-1.5">
							<Feature index={i} />
						</div>
					))}
				</div>
				<SubmitButton loading={loading} />
			</form>
		</DataContext.Provider>
	);
}

export default function Comp() {
	return (
		<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
			<div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
				<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
						Create
					</h1>
					<Form
						view={false}
						edit_data={null}
						form={form}
						init_state={{
							success: true,
							message: "",
						}}
						mutate={null}
					/>
				</div>
			</div>
		</div>
	);
}
