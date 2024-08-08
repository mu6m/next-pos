import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "./lib/jwt";
export async function middleware(request: NextRequest) {
	const cookie = cookies().get("user");
	const token = await verifyAccessToken(cookie?.value);
	const url_arr = request.nextUrl.pathname.split("/");
	if (url_arr[1] == "user") {
		if (token === false || !token || token.type != "ADMIN") {
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}
	} else {
		if (token === false || !token || token.type != "EMPLOYEE") {
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}
	}
}

export const config = {
	matcher: ["/user/:path*", "/pos/:path*"],
};
