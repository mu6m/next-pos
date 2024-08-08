"use client";

import { useActionState, useEffect, useState } from "react";
import { form } from "./action";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { path } from "../config";
import {
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function Comp({ searchParams }: any) {
	const { toast } = useToast();
	const [state, formAction] = useActionState(form, {
		success: true,
		message: "",
	});
	const params = useParams<{ edit: string }>();
	const fetcher = (url: string) => fetch(url).then((r) => r.json());
	const { data, mutate, isLoading } = useSWR(
		`/user/${path}/read?id=${params.edit}`,
		fetcher
	);
	const view: boolean = Boolean(searchParams.view) || false;
	if (state.success) {
		mutate();
	}
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (state.message != "") {
			toast({
				variant: state.success ? "default" : "destructive",
				title: state.message,
			});
		}
		setLoading(false);
	}, [state, data]);
	return (
		<section>
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
				<div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
							{view ? "View" : "Edit"}
						</h1>
						{!isLoading ? (
							<form
								className="space-y-4 md:space-y-6"
								onSubmit={(e: any) => {
									e.preventDefault();
									setLoading(true);
									formAction(new FormData(e.target));
								}}
							>
								<input type="text" name="id" value={params.edit} hidden />
								<div className="grid w-full max-w-sm items-center gap-1.5">
									<Label>Name</Label>
									<Input
										type="text"
										name="name"
										defaultValue={data.item.name}
										disabled={view}
									/>
								</div>
								<SubmitButton loading={loading} />
							</form>
						) : (
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
