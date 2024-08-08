import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export const fileRouter = {
	imageUploader: f({ image: { maxFileSize: "5MB" } })
		.middleware(async ({}) => {
			const cookie = cookies().get("user");
			const token: any = await verifyAccessToken(cookie?.value);
			if (token === false || !token) {
				throw new UploadThingError("Unauthorized");
			}
			return;
		})
		.onUploadComplete(async ({ metadata, file }: any) => {}),
} satisfies FileRouter;
