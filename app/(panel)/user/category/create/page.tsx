"use client";

import { useActionState, useEffect, useState } from "react";
import { form } from "./action";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import {
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { view } from "drizzle-orm/sqlite-core";
import { data } from "tailwindcss/defaultTheme";
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

export default function Comp() {
	const { toast } = useToast();
	const [state, formAction] = useActionState(form, {
		success: true,
		message: "",
	});
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (state.message != "") {
			toast({
				variant: state.success ? "default" : "destructive",
				title: state.message,
			});
		}
		setLoading(false);
	}, [state]);

	return (
		<section>
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
				<div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
							Create
						</h1>
						<form
							className="space-y-4 md:space-y-6"
							onSubmit={(e: any) => {
								e.preventDefault();
								setLoading(true);
								formAction(new FormData(e.target));
							}}
						>
							<div className="grid w-full max-w-sm items-center gap-1.5">
								<Label>Name</Label>
								<Input type="text" name="name" />
							</div>
							<SubmitButton loading={loading} />
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
