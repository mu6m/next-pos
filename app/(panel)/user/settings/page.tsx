"use server";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditForm } from "./EditForm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export default async function Comp() {
	const cookie = cookies().get("user");
	const token: any = await verifyAccessToken(cookie?.value);
	const [data] = await db.select().from(user).where(eq(user.id, token.id));
	return (
		<div className="w-2/3 space-y-6">
			<h1 className="text-4xl font-bold">Settings</h1>
			<EditForm
				mutate={async () => {
					"use server";
					revalidatePath("/user/settings");
				}}
				value={data.username}
				name={"username"}
				type={"text"}
			/>
			<EditForm
				mutate={async () => {
					"use server";
					revalidatePath("/user/settings");
				}}
				value={data.name[0]}
				name={"name"}
				type={"text"}
			/>

			<Button>
				<Link href="/auth/forget">Reset Password</Link>
			</Button>
		</div>
	);
}
