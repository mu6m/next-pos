"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import useSession from "@/hooks/useSession";
import { ReloadIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useRef, useState, useEffect } from "react";

export function EditForm({ mutate, name, type, value }: any) {
	const [loading, setLoading] = useState(false);
	const [edit, setEdit] = useState(true);
	const [initialValue, setInitialValue] = useState(value);
	const input: any = useRef(null);

	let user = useSession.getState().user;
	const setUser = useSession((state) => state.setUser);

	useEffect(() => {
		setInitialValue(value);
	}, [value]);

	return (
		<div className="flex w-full max-w-md items-end space-x-2">
			<div className="grid w-full max-w-md items-center gap-1.5">
				<Label htmlFor={name}>{name}</Label>
				<Input
					defaultValue={initialValue}
					type={type}
					id={name}
					placeholder={name}
					disabled={edit}
					ref={input}
					className="bg-white"
				/>
			</div>
			{!edit && (
				<Button
					type="submit"
					onClick={async () => {
						setLoading(true);
						const { data } = await axios.post(
							`/user/settings/update?type=${name}`,
							{
								[name]: input?.current?.value,
							},
							{
								validateStatus: () => true,
							}
						);
						if (data.success) {
							mutate();
							user[name] = input?.current?.value;
							setUser(user);
							setEdit(true);
							setInitialValue(input?.current?.value); // Update initial value to the new value after successful update
						}
						toast({
							variant: data.success ? "default" : "destructive",
							title: data.message,
						});
						setLoading(false);
					}}
					disabled={loading}
				>
					{loading ? (
						<>
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
							loading
						</>
					) : (
						<>Update</>
					)}
				</Button>
			)}
			<Button
				variant={"outline"}
				type="button"
				onClick={() => {
					if (!edit) {
						// Reset the input value to the initial value
						input.current.value = initialValue;
					}
					setEdit(!edit);
				}}
			>
				{edit ? "Edit" : "Undo"}
			</Button>
		</div>
	);
}
